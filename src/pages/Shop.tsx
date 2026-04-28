import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { products } from "@/lib/mock-data";
import { Search, ShoppingCart, Heart, Star, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export default function Shop() {
  const { t } = useI18n();
  const categories = [
    t("shop.cat.all"),
    t("shop.cat.hot"),
    t("shop.cat.fashion"),
    t("shop.cat.electronics"),
    t("shop.cat.food"),
    t("shop.cat.travel"),
    t("shop.cat.collect"),
  ];
  return (
    <div>
      <PageHeader
        title="ร้านค้า"
        large
        right={
          <Link to="/cart" className="relative h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-warning text-warning-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-background">3</span>
          </Link>
        }
      />

      {/* Search + categories */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-2 h-11 rounded-2xl bg-muted/70 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="ค้นหาสินค้า, ร้านค้า..." className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm" />
        </div>
      </div>

      <div className="mt-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-4 pb-2">
          {categories.map((c, i) => (
            <button
              key={c}
              className={cn(
                "shrink-0 h-9 px-4 rounded-full text-sm font-semibold transition-smooth",
                i === 0 ? "bg-gradient-primary text-primary-foreground shadow-soft" : "bg-muted text-foreground hover:bg-muted/70",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Hero banner */}
      <div className="px-4 mt-2">
        <div className="relative rounded-3xl bg-gradient-hero p-5 overflow-hidden shadow-card">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
          <div className="relative z-10 text-primary-foreground">
            <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
              <Flame className="h-3 w-3" /> Flash Sale
            </div>
            <h2 className="font-display text-2xl font-extrabold mt-2 leading-tight">ลดสูงสุด 70%<br/>เฉพาะวันนี้!</h2>
            <p className="text-xs opacity-90 mt-1">เหลือเวลา 04 : 23 : 51</p>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="px-4 mt-5 grid grid-cols-2 gap-3">
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="group">
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-square">
              <img src={p.image} alt={p.title} className="h-full w-full object-cover group-active:scale-95 transition-bounce" />
              <button className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center">
                <Heart className={cn("h-4 w-4", p.liked && "fill-destructive text-destructive")} />
              </button>
              {p.originalPrice && (
                <div className="absolute bottom-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-md">
                  -{Math.round((1 - p.price / p.originalPrice) * 100)}%
                </div>
              )}
            </div>
            <div className="px-1 mt-2">
              <h3 className="text-sm font-medium line-clamp-2 leading-snug min-h-[2.5rem]">{p.title}</h3>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display text-base font-bold text-primary">฿{p.price.toLocaleString()}</span>
                {p.originalPrice && <span className="text-[11px] text-muted-foreground line-through">฿{p.originalPrice.toLocaleString()}</span>}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span className="font-semibold text-foreground">{p.rating}</span>
                </span>
                <span>ขายแล้ว {p.sold > 1000 ? `${(p.sold / 1000).toFixed(1)}K` : p.sold}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
