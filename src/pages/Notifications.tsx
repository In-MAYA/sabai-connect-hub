import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { notifications } from "@/lib/mock-data";
import { Heart, MessageCircle, UserPlus, ShoppingBag, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  like: { Icon: Heart, color: "bg-destructive/15 text-destructive" },
  comment: { Icon: MessageCircle, color: "bg-primary/15 text-primary" },
  follow: { Icon: UserPlus, color: "bg-success/15 text-success" },
  order: { Icon: ShoppingBag, color: "bg-warning/15 text-warning-foreground" },
  message: { Icon: Mail, color: "bg-accent/15 text-accent" },
};

const tabs = ["ทั้งหมด", "ไลก์", "คอมเมนต์", "ติดตาม", "คำสั่งซื้อ"];

export default function Notifications() {
  return (
    <div>
      <PageHeader title="แจ้งเตือน" large />
      <div className="px-4 pt-1 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-3">
          {tabs.map((t, i) => (
            <button
              key={t}
              className={cn(
                "shrink-0 h-8 px-3.5 rounded-full text-xs font-semibold transition-smooth",
                i === 0 ? "bg-gradient-primary text-primary-foreground shadow-soft" : "bg-muted text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-2">
        {notifications.map((n) => {
          const { Icon, color } = iconMap[n.type];
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
                  <span className="text-muted-foreground">{n.text}</span>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{n.time}</p>
              </div>
              {n.type === "follow" && (
                <button className="h-8 px-3 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold shadow-soft">ติดตามกลับ</button>
              )}
              {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
