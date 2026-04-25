import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { currentUser, posts, products } from "@/lib/mock-data";
import { Settings, QrCode, Edit3, BadgeCheck, Grid3x3, Store, Bookmark, Wallet, Gift, Moon, Sun, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function Profile() {
  const [tab, setTab] = useState<"posts" | "shop" | "saved">("posts");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const myPosts = posts.slice(0, 3);
  const myProducts = products.slice(0, 4);

  return (
    <div>
      <PageHeader
        title="โปรไฟล์"
        right={
          <>
            <button
              onClick={() => setDark((d) => !d)}
              className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center"
              aria-label="toggle theme"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center">
              <QrCode className="h-5 w-5" />
            </button>
            <button className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center">
              <Settings className="h-5 w-5" />
            </button>
          </>
        }
      />

      {/* Hero */}
      <div className="relative">
        <div className="h-32 bg-gradient-hero" />
        <div className="px-4 -mt-12">
          <div className="flex items-end gap-3">
            <div className="ring-4 ring-background rounded-full">
              <Avatar name={currentUser.name} gradient={currentUser.avatar} size="2xl" />
            </div>
            <div className="flex-1 pb-2 flex justify-end gap-2">
              <button className="h-9 px-4 rounded-full bg-muted text-sm font-semibold flex items-center gap-1.5">
                <Edit3 className="h-3.5 w-3.5" /> แก้ไข
              </button>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <h2 className="font-display text-xl font-extrabold">{currentUser.name}</h2>
              {currentUser.verified && <BadgeCheck className="h-5 w-5 text-primary fill-primary text-background" />}
            </div>
            <p className="text-sm text-muted-foreground">{currentUser.username}</p>
            <p className="text-sm mt-2 leading-snug">✨ ใช้ชีวิตให้สบายๆ · รักทะเล กาแฟ และโค้ด 💙</p>

            <div className="mt-4 flex items-center gap-6">
              <div><span className="font-display font-bold text-base">128</span> <span className="text-xs text-muted-foreground">โพสต์</span></div>
              <div><span className="font-display font-bold text-base">12.4K</span> <span className="text-xs text-muted-foreground">ผู้ติดตาม</span></div>
              <div><span className="font-display font-bold text-base">340</span> <span className="text-xs text-muted-foreground">กำลังติดตาม</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-5 grid grid-cols-4 gap-2">
        {[
          { icon: Wallet, label: "กระเป๋า" },
          { icon: Store, label: "ร้านของฉัน" },
          { icon: Gift, label: "ของรางวัล" },
          { icon: Bookmark, label: "บันทึก" },
        ].map(({ icon: Icon, label }) => (
          <button key={label} className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-muted/50 hover:bg-muted transition-smooth">
            <div className="h-10 w-10 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-soft">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[11px] font-semibold">{label}</span>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-4 mt-6 border-b border-border">
        <div className="grid grid-cols-3">
          {[
            { key: "posts", icon: Grid3x3, label: "โพสต์" },
            { key: "shop", icon: Store, label: "สินค้า" },
            { key: "saved", icon: Bookmark, label: "บันทึก" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key as typeof tab)}
              className={`flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-smooth border-b-2 ${
                tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === "posts" && (
        <div className="grid grid-cols-3 gap-0.5 mt-0.5">
          {[...myPosts, ...myPosts].slice(0, 6).map((p, i) => (
            <div key={i} className="aspect-square bg-muted relative">
              <img src={p.video} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {tab === "shop" && (
        <div className="px-4 pt-4 grid grid-cols-2 gap-3">
          {myProducts.map((p) => (
            <div key={p.id} className="rounded-2xl overflow-hidden bg-card border border-border shadow-soft">
              <div className="aspect-square bg-muted">
                <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs font-medium line-clamp-1">{p.title}</p>
                <p className="font-display font-bold text-primary text-sm mt-0.5">฿{p.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "saved" && (
        <div className="px-4 pt-8 text-center">
          <Bookmark className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mt-2">ยังไม่มีรายการที่บันทึก</p>
        </div>
      )}

      {/* Settings list */}
      <div className="px-4 mt-6 space-y-1">
        {["บัญชีและความปลอดภัย", "การแจ้งเตือน", "ความเป็นส่วนตัว", "ภาษา", "ช่วยเหลือ"].map((s) => (
          <button key={s} className="w-full flex items-center justify-between py-3.5 px-1 text-left">
            <span className="text-sm font-medium">{s}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
