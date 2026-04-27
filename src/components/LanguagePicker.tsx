import { useState } from "react";
import { Check, Globe, X } from "lucide-react";
import { languages, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguagePicker() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const current = languages.find((l) => l.code === lang) ?? languages[0];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-background/80 backdrop-blur-md border border-border text-xs font-semibold shadow-soft active:scale-95 transition-transform"
        aria-label={t("auth.language")}
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span>{current.flag}</span>
        <span>{current.native}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 inset-x-0 bg-background rounded-t-3xl shadow-glow border-t border-border safe-bottom animate-slide-up p-5"
          >
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">{t("lang.select")}</h3>
              <button
                onClick={() => setOpen(false)}
                className="h-9 w-9 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {languages.map((l) => {
                const active = l.code === lang;
                return (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors",
                      active ? "bg-primary/10 border-2 border-primary" : "bg-muted/50 border-2 border-transparent hover:bg-muted",
                    )}
                  >
                    <span className="text-2xl">{l.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold">{l.native}</p>
                      <p className="text-[11px] text-muted-foreground">{l.label}</p>
                    </div>
                    {active && <Check className="h-5 w-5 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
