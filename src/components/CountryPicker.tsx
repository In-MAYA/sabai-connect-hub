import { useMemo, useState } from "react";
import { Search, Check, X } from "lucide-react";
import { countries, countryName, useI18n, type Country } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (c: Country) => void;
  current: Country;
};

export function CountryPicker({ open, onClose, onSelect, current }: Props) {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return countries;
    return countries.filter((c) => {
      const name = countryName(lang, c.code).toLowerCase();
      return (
        name.includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.dial.includes(query.replace("+", ""))
      );
    });
  }, [q, lang]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-0 inset-x-0 bg-background rounded-t-3xl shadow-glow border-t border-border safe-bottom animate-slide-up max-h-[85vh] flex flex-col"
      >
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-3 shrink-0" />
        <div className="px-5 pb-3 shrink-0 flex items-center justify-between">
          <h3 className="text-base font-bold">{t("country.select")}</h3>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-muted flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 pb-3 shrink-0">
          <div className="flex items-center gap-2 rounded-2xl bg-muted/70 px-3 h-11">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("country.search")}
              className="flex-1 bg-transparent border-0 outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {list.map((c) => {
            const active = c.code === current.code;
            return (
              <button
                key={c.code}
                onClick={() => {
                  onSelect(c);
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors",
                  active ? "bg-primary/10" : "hover:bg-muted/60",
                )}
              >
                <span className="text-2xl">{c.flag}</span>
                <span className="flex-1 text-left text-sm font-semibold">
                  {countryName(lang, c.code)}
                </span>
                <span className="text-sm font-mono text-muted-foreground">{c.dial}</span>
                {active && <Check className="h-4 w-4 text-primary ml-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
