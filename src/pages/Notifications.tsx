import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { notifications as rawNotifications } from "@/lib/mock-data";
import { Heart, MessageCircle, UserPlus, ShoppingBag, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

const iconMap = {
  like: { Icon: Heart, color: "bg-destructive/15 text-destructive" },
  comment: { Icon: MessageCircle, color: "bg-primary/15 text-primary" },
  follow: { Icon: UserPlus, color: "bg-success/15 text-success" },
  order: { Icon: ShoppingBag, color: "bg-warning/15 text-warning-foreground" },
  message: { Icon: Mail, color: "bg-accent/15 text-accent" },
};

// Map notification id -> i18n key for text + time
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

export default function Notifications() {
  const { t } = useI18n();
  const tabs = [
    t("notif.tab.all"),
    t("notif.tab.likes"),
    t("notif.tab.comments"),
    t("notif.tab.follows"),
    t("notif.tab.orders"),
  ];
  return (
    <div>
      <PageHeader title={t("notif.title")} large />
      <div className="px-4 pt-1 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-3">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={cn(
                "shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-smooth",
                i === 0 ? "bg-gradient-primary text-primary-foreground shadow-soft" : "bg-muted text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-2">
        {rawNotifications.map((n) => {
          const { Icon, color } = iconMap[n.type];
          const text = textKeyById[n.id] ? t(textKeyById[n.id]) : n.text;
          const tEntry = timeById[n.id];
          const time = tEntry ? t(tEntry.key, tEntry.n !== undefined ? { n: tEntry.n } : undefined) : n.time;
          return (
            <div
              key={n.id}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-2xl mx-1 transition-smooth active:bg-muted/60",
                !n.read && "bg-primary/5",
              )}
            >
              <div className="relative">
                <Avatar name={n.user.name} gradient={n.user.avatar} size="md" />
                <div className={cn("absolute -bottom-1 -right-1 h-6 w-6 rounded-full ring-2 ring-background flex items-center justify-center", color)}>
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
                <button className="h-8 px-3 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold shadow-soft">{t("notif.followBack")}</button>
              )}
              {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
