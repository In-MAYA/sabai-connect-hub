import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { notifications as rawNotifications, chats, type Notification } from "@/lib/mock-data";
import { Heart, MessageCircle, UserPlus, ShoppingBag, Mail, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

const iconMap = {
  like: { Icon: Heart, color: "bg-destructive/15 text-destructive" },
  comment: { Icon: MessageCircle, color: "bg-primary/15 text-primary" },
  follow: { Icon: UserPlus, color: "bg-success/15 text-success" },
  order: { Icon: ShoppingBag, color: "bg-warning/15 text-warning-foreground" },
  message: { Icon: Mail, color: "bg-accent/15 text-accent" },
};

const textKeyById: Record<string, string> = {
  n1: "notif.text.like",
  n2: "notif.text.comment",
  n3: "notif.text.follow",
  n4: "notif.text.order",
  n5: "notif.text.message",
  n6: "notif.text.likeMore",
};
const timeById: Record<string, { key: string; n?: number }> = {
  n1: { key: "notif.time.minAgo", n: 2 },
  n2: { key: "notif.time.minAgo", n: 15 },
  n3: { key: "notif.time.hourAgo", n: 1 },
  n4: { key: "notif.time.hourAgo", n: 3 },
  n5: { key: "notif.time.yesterday" },
  n6: { key: "notif.time.yesterday" },
};

type TabKey = "all" | "like" | "comment" | "follow" | "order";

export default function Notifications() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [active, setActive] = useState<TabKey>("all");
  const [items, setItems] = useState<Notification[]>(rawNotifications);
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  const openNotification = (n: Notification) => {
    markRead(n.id);
    switch (n.type) {
      case "message": {
        const chat = chats.find((c) => c.user.id === n.user.id);
        navigate(chat ? `/chat/${chat.id}` : "/chats");
        return;
      }
      case "order":
        navigate("/shop");
        return;
      case "follow":
        navigate("/profile");
        return;
      case "like":
      case "comment":
      default:
        navigate("/feed");
        return;
    }
  };


  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: t("notif.tab.all") },
    { key: "like", label: t("notif.tab.likes") },
    { key: "comment", label: t("notif.tab.comments") },
    { key: "follow", label: t("notif.tab.follows") },
    { key: "order", label: t("notif.tab.orders") },
  ];

  const filtered = useMemo(
    () => (active === "all" ? items : items.filter((n) => n.type === active)),
    [active, items],
  );

  const markRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success(t("notif.allRead"));
  };

  const toggleFollow = (userId: string, name: string) => {
    setFollowing((prev) => {
      const next = { ...prev, [userId]: !prev[userId] };
      toast.success(`${name} · ${next[userId] ? t("notif.following") : t("feed.unfollowed")}`);
      return next;
    });
  };

  const hasUnread = items.some((n) => !n.read);

  return (
    <div>
      <PageHeader
        title={t("notif.title")}
        large
        right={
          hasUnread ? (
            <button
              type="button"
              onClick={markAllRead}
              aria-label={t("notif.markAllRead")}
              className="h-9 w-9 rounded-full bg-muted text-foreground flex items-center justify-center transition-smooth active:scale-95"
            >
              <CheckCheck className="h-4 w-4" />
            </button>
          ) : null
        }
      />
      <div className="px-4 pt-1 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-3">
          {tabs.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                aria-pressed={isActive}
                className={cn(
                  "shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-smooth active:scale-95",
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-foreground",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-2">
        {filtered.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-16">{t("notif.empty")}</div>
        ) : (
          filtered.map((n) => {
            const { Icon, color } = iconMap[n.type];
            const text = textKeyById[n.id] ? t(textKeyById[n.id]) : n.text;
            const tEntry = timeById[n.id];
            const time = tEntry
              ? t(tEntry.key, tEntry.n !== undefined ? { n: tEntry.n } : undefined)
              : n.time;
            const isFollowing = !!following[n.user.id];
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => openNotification(n)}
                className={cn(
                  "w-full text-left flex items-center gap-3 px-3 py-3 rounded-2xl mx-1 transition-smooth active:bg-muted/60",
                  !n.read && "bg-primary/5",
                )}
              >
                <div className="relative">
                  <Avatar name={n.user.name} gradient={n.user.avatar} size="md" />
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 h-6 w-6 rounded-full ring-2 ring-background flex items-center justify-center",
                      color,
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">
                    <span className="font-semibold">{n.user.name}</span>{" "}
                    <span className="text-muted-foreground">{text}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{time}</p>
                </div>
                {n.type === "follow" && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFollow(n.user.id, n.user.name);
                      markRead(n.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFollow(n.user.id, n.user.name);
                        markRead(n.id);
                      }
                    }}
                    className={cn(
                      "h-8 px-3 rounded-full text-xs font-bold shadow-soft transition-smooth active:scale-95 inline-flex items-center",
                      isFollowing
                        ? "bg-muted text-foreground"
                        : "bg-gradient-primary text-primary-foreground",
                    )}
                  >
                    {isFollowing ? t("notif.following") : t("notif.followBack")}
                  </span>
                )}
                {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
