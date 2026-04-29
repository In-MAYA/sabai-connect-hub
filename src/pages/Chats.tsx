import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { chats, stories } from "@/lib/mock-data";
import { Search, Edit3, Pin, CheckCheck, Plus, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

export default function Chats() {
  const { t } = useI18n();
  return (
    <div>
      <PageHeader
        title="SABAI-CHAT"
        large
        right={
          <>
            <Link
              to="/contacts"
              aria-label={t("contacts.title")}
              className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-smooth"
            >
              <UserPlus className="h-5 w-5" />
            </Link>
            <button className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow">
              <Edit3 className="h-4 w-4" />
            </button>
          </>
        }
      />

      {/* Search */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-2 h-11 rounded-2xl bg-muted/70 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("chats.searchPlaceholder")} className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm" />
        </div>
      </div>

      {/* Stories */}
      <div className="mt-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 px-4 pb-3">
          {stories.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1.5 shrink-0 w-16">
              <div className="relative">
                {s.isYou ? (
                  <div className="h-16 w-16 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center">
                    <Avatar name={s.user.name} gradient={s.user.avatar} size="md" />
                    <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center ring-2 ring-background">
                      <Plus className="h-3 w-3" strokeWidth={3} />
                    </div>
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full p-0.5 bg-gradient-primary">
                    <div className="h-full w-full rounded-full bg-background p-0.5">
                      <Avatar name={s.user.name} gradient={s.user.avatar} size="md" className="!h-full !w-full" />
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[11px] font-medium truncate w-full text-center">
                {s.isYou ? t("chats.yourStory") : s.user.name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat list */}
      <div className="mt-1">
        {chats.map((c) => {
          const lastKey = `chats.last.${c.id}`;
          const lastMsg = t(lastKey) === lastKey ? c.lastMessage : t(lastKey);
          const timeMap: Record<string, string> = {
            "เมื่อวาน": t("chats.time.yesterday"),
            "จันทร์": t("chats.time.monday"),
            "อาทิตย์": t("chats.time.sunday"),
          };
          const time = timeMap[c.time] ?? c.time;
          const name = c.isGroup ? t("chats.group.team") : c.user.name;
          return (
            <Link
              key={c.id}
              to={`/chat/${c.id}`}
              className="flex items-center gap-3 px-4 py-3 active:bg-muted/60 transition-smooth"
            >
              <Avatar name={c.user.name} gradient={c.user.avatar} size="lg" online={c.user.online} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold truncate">{name}</h3>
                  {c.user.verified && (
                    <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">✓</span>
                  )}
                  {c.isGroup && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{c.members}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  {c.unread === 0 && <CheckCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
                  {lastMsg}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className={`text-[11px] ${c.unread ? "text-primary font-semibold" : "text-muted-foreground"}`}>{time}</span>
                {c.unread > 0 ? (
                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-gradient-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shadow-soft">
                    {c.unread}
                  </span>
                ) : c.pinned ? (
                  <Pin className="h-3.5 w-3.5 text-muted-foreground fill-current" />
                ) : (
                  <span className="h-5" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
