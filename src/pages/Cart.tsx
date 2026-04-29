import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { products } from "@/lib/mock-data";
import { Avatar } from "@/components/Avatar";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const initial = [
  { ...products[0], qty: 1, selected: true },
  { ...products[1], qty: 2, selected: true },
  { ...products[2], qty: 1, selected: false },
];

export default function Cart() {
  const { t } = useI18n();
  const [items, setItems] = useState(initial);
  const total = items.filter((i) => i.selected).reduce((s, i) => s + i.price * i.qty, 0);

  const update = (id: string, fn: (it: (typeof initial)[number]) => (typeof initial)[number]) =>
    setItems((arr) => arr.map((i) => (i.id === id ? fn(i) : i)));

  return (
    <div>
      <PageHeader title={t("cart.title")} back subtitle={t("cart.items", { n: items.length })} />

      <div className="px-4 pt-3 space-y-3 pb-32">
        {items.map((it) => (
          <div key={it.id} className="bg-card rounded-2xl p-3 border border-border shadow-soft">
            <div className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                checked={it.selected}
                onChange={() => update(it.id, (x) => ({ ...x, selected: !x.selected }))}
                className="h-4 w-4 accent-primary"
              />
              <Avatar name={it.shop} gradient={it.shopAvatar} size="xs" />
              <span className="text-xs font-semibold">{it.shop}</span>
            </div>
            <div className="flex gap-3">
              <img src={it.image} alt={it.title} className="h-20 w-20 rounded-xl object-cover bg-muted" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium line-clamp-2">{(() => { const k = `product.title.${it.id}`; const v = t(k); return v === k ? it.title : v; })()}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-display font-bold text-primary">฿{it.price.toLocaleString()}</span>
                  <div className="flex items-center gap-1 bg-muted rounded-full p-1">
                    <button
                      onClick={() => update(it.id, (x) => ({ ...x, qty: Math.max(1, x.qty - 1) }))}
                      className="h-6 w-6 rounded-full bg-card flex items-center justify-center"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-bold w-6 text-center">{it.qty}</span>
                    <button
                      onClick={() => update(it.id, (x) => ({ ...x, qty: x.qty + 1 }))}
                      className="h-6 w-6 rounded-full bg-card flex items-center justify-center"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={() => setItems((a) => a.filter((x) => x.id !== it.id))} className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive flex items-center justify-center">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] bg-background/95 backdrop-blur-xl border-t border-border px-4 py-3 safe-bottom z-40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{t("cart.total")}</span>
          <span className="font-display text-2xl font-extrabold text-primary">฿{total.toLocaleString()}</span>
        </div>
        <Button className="w-full h-12 rounded-2xl bg-gradient-primary text-base font-semibold shadow-glow">
          {t("cart.checkout")} ({items.filter((i) => i.selected).length})
        </Button>
      </div>
    </div>
  );
}
