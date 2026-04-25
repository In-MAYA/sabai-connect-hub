import { NavLink } from "@/components/NavLink";
import { MessageCircle, Compass, ShoppingBag, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/chats", icon: MessageCircle, label: "แชท", badge: 8 },
  { to: "/feed", icon: Compass, label: "ฟีด" },
  { to: "/shop", icon: ShoppingBag, label: "ร้านค้า" },
  { to: "/notifications", icon: Bell, label: "แจ้งเตือน", badge: 4 },
  { to: "/profile", icon: User, label: "ฉัน" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40 safe-bottom">
      <div className="mx-3 mb-2 rounded-3xl bg-card/95 backdrop-blur-xl border border-border shadow-floating">
        <div className="grid grid-cols-5 px-2 py-2">
          {tabs.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-smooth text-muted-foreground hover:text-foreground"
              activeClassName="text-primary"
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <div
                    className={cn(
                      "relative h-9 w-9 rounded-2xl flex items-center justify-center transition-bounce",
                      isActive && "bg-primary/10"
                    )}
                  >
                    <Icon
                      className={cn("h-5 w-5 transition-smooth", isActive && "scale-110")}
                      strokeWidth={isActive ? 2.4 : 2}
                    />
                    {badge ? (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    ) : null}
                  </div>
                  <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
