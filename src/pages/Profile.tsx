import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { currentUser, posts, products } from "@/lib/mock-data";
import { Settings, QrCode, Edit3, BadgeCheck, Grid3x3, Store, Bookmark, Wallet, Gift } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [tab, setTab] = useState<"posts" | "shop" | "saved">("posts");

  const myPosts = posts.slice(0, 3);
  const myProducts = products.slice(0, 4);

  return (
    <div>
      <PageHeader
        title={t("profile.title")}
        right={
          <>
            <button
              type="button"
              onClick={() => toast.info(t("profile.qr"), { description: currentUser.username })}
              aria-label={t("profile.qr")}
              className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center"
            >
              <QrCode className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/settings")}
              aria-label={t("settings.title")}
              className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center"
            >
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
              <button
                onClick={() => navigate("/setup-profile")}
                className="h-9 px-4 rounded-full bg-muted text-sm font-semibold flex items-center gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" /> {t("profile.edit")}
              </button>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <h2 className="font-display text-xl font-extrabold">{t("mock.user.me")}</h2>
              {currentUser.verified && <BadgeCheck className="h-5 w-5 text-primary fill-primary text-background" />}
            </div>
            <p className="text-sm text-muted-foreground">{currentUser.username}</p>
            <p className="text-sm mt-2 leading-snug">{t("profile.bio")}</p>

            <div className="mt-4 flex items-center gap-6">
              <div><span className="font-display font-bold text-base">128</span> <span className="text-xs text-muted-foreground">{t("profile.posts")}</span></div>
              <div><span className="font-display font-bold text-base">12.4K</span> <span className="text-xs text-muted-foreground">{t("profile.followers")}</span></div>
              <div><span className="font-display font-bold text-base">340</span> <span className="text-xs text-muted-foreground">{t("profile.following")}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-5 grid grid-cols-4 gap-2">
        {[
          { icon: Wallet, label: t("profile.wallet"), onClick: () => navigate("/wallet") },
          { icon: Store, label: t("profile.myShop"), onClick: () => navigate("/shop") },
          { icon: Gift, label: t("profile.rewards"), onClick: () => toast.info(t("profile.rewards"), { description: "+120 ⭐" }) },
          { icon: Bookmark, label: t("profile.saved"), onClick: () => setTab("saved") },
        ].map(({ icon: Icon, label, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-muted/50 hover:bg-muted active:scale-95 transition-smooth"
          >
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
            { key: "posts", icon: Grid3x3, label: t("profile.tab.posts") },
            { key: "shop", icon: Store, label: t("profile.tab.shop") },
            { key: "saved", icon: Bookmark, label: t("profile.tab.saved") },
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
        <div className="px-4 pt-8 text-center pb-10">
          <Bookmark className="h-10 w-10 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground mt-2">{t("profile.empty.saved")}</p>
        </div>
      )}

      {/* Open settings shortcut */}
      <div className="px-4 mt-6 mb-8">
        <button
          onClick={() => navigate("/settings")}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-muted/60 hover:bg-muted text-sm font-semibold transition-smooth"
        >
          <Settings className="h-4 w-4" /> {t("settings.title")}
        </button>
      </div>
    </div>
  );
}
