import { useParams, useNavigate, Link } from "react-router-dom";
import { products } from "@/lib/mock-data";
import { Avatar } from "@/components/Avatar";
import { ChevronLeft, Heart, Share2, Star, MessageCircle, ShoppingCart, Store, Truck, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function ProductDetail() {
  const { t } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id) ?? products[0];

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Floating header */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-30 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center shadow-soft">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center shadow-soft">
              <Share2 className="h-4 w-4" />
            </button>
            <Link to="/cart" className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center shadow-soft">
              <ShoppingCart className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square bg-muted relative">
        <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
      </div>

      {/* Info */}
      <div className="px-5 pt-5">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl font-extrabold text-primary">฿{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <>
              <span className="text-sm text-muted-foreground line-through">฿{product.originalPrice.toLocaleString()}</span>
              <span className="ml-auto text-xs font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-md">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            </>
          )}
        </div>
        <h1 className="mt-2 text-lg font-semibold leading-snug">{(() => { const k = `product.title.${product.id}`; const v = t(k); return v === k ? product.title : v; })()}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-warning text-warning" />
            <span className="font-semibold">{product.rating}</span>
          </span>
          <span className="text-muted-foreground">{t("product.soldUnits", { n: product.sold.toLocaleString() })}</span>
        </div>
      </div>

      {/* Shop card */}
      <div className="mx-5 mt-5 rounded-2xl bg-gradient-card border border-border p-4 flex items-center gap-3 shadow-soft">
        <Avatar name={product.shop} gradient={product.shopAvatar} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold truncate">{product.shop}</h3>
            <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">✓</span>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Store className="h-3 w-3" /> {t("product.popularShop")}</p>
        </div>
        <button className="h-9 px-4 rounded-full border-2 border-primary text-primary text-xs font-bold">{t("product.visitShop")}</button>
      </div>

      {/* Benefits */}
      <div className="mx-5 mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-primary/5 p-3 flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><Truck className="h-4 w-4" /></div>
          <div>
            <p className="text-xs font-semibold">{t("product.freeShipping")}</p>
            <p className="text-[10px] text-muted-foreground">{t("product.shipDays")}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-primary/5 p-3 flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><ShieldCheck className="h-4 w-4" /></div>
          <div>
            <p className="text-xs font-semibold">{t("product.warranty")}</p>
            <p className="text-[10px] text-muted-foreground">{t("product.return7")}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-5 mt-6">
        <h3 className="font-display font-bold text-base">{t("product.description")}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {t("product.descBody")}
        </p>
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-background/95 backdrop-blur-xl border-t border-border px-3 py-3 safe-bottom z-40">
        <div className="flex items-center gap-2">
          <button className="flex flex-col items-center gap-0.5 px-2">
            <Heart className="h-6 w-6" />
            <span className="text-[10px] font-semibold">{t("product.like")}</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 px-2">
            <MessageCircle className="h-6 w-6" />
            <span className="text-[10px] font-semibold">{t("product.chat")}</span>
          </button>
          <button className="flex-1 h-12 rounded-2xl border-2 border-primary text-primary font-bold text-sm">
            {t("product.addCart")}
          </button>
          <button className="flex-1 h-12 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-sm shadow-glow">
            {t("product.buyNow")}
          </button>
        </div>
      </div>
    </div>
  );
}
