import { useEffect, useMemo, useRef, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, X, Clock } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { posts, products, users } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tab = "all" | "posts" | "users" | "products";
const RECENT_KEY = "sabai_recent_searches";

export function SearchSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("all");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setTab("all");
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const saveRecent = (term: string) => {
    const v = term.trim();
    if (!v) return;
    const next = [v, ...recent.filter((x) => x !== v)].slice(0, 8);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
  };

  const clearRecent = () => {
    setRecent([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch {}
  };

  const query = q.trim().toLowerCase();
  const matchedPosts = useMemo(
    () => (query ? posts.filter((p) => p.caption.toLowerCase().includes(query) || p.user.username.toLowerCase().includes(query)) : []),
    [query],
  );
  const matchedUsers = useMemo(
    () => (query ? users.filter((u) => u.name.toLowerCase().includes(query) || u.username.toLowerCase().includes(query)) : []),
    [query],
  );
  const matchedProducts = useMemo(
    () => (query ? products.filter((p) => p.title.toLowerCase().includes(query) || p.shop.toLowerCase().includes(query)) : []),
    [query],
  );

  const showPosts = tab === "all" || tab === "posts";
  const showUsers = tab === "all" || tab === "users";
  const showProducts = tab === "all" || tab === "products";
  const totalResults = matchedPosts.length + matchedUsers.length + matchedProducts.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        className="h-full w-full max-w-[440px] mx-auto p-0 bg-background flex flex-col [&>button]:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t("search.title")}</SheetTitle>
          <SheetDescription>{t("search.placeholder")}</SheetDescription>
        </SheetHeader>
        <div className="flex items-center gap-2 p-3 border-b border-border safe-top">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveRecent(q);
              }}
              placeholder={t("search.placeholder")}
              className="pl-9 pr-9 h-10"
              aria-label={t("search.title")}
            />
            {q && (
              <button
                onClick={() => setQ("")}
                aria-label={t("search.clear")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-sm font-medium text-primary px-2"
          >
            {t("search.cancel")}
          </button>
        </div>

        <div className="flex items-center gap-1 px-3 py-2 border-b border-border overflow-x-auto no-scrollbar">
          {(["all", "posts", "users", "products"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                "px-3 h-8 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
                tab === k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`search.tab.${k}`)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {!query ? (
            <div className="p-4">
              {recent.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-muted-foreground">{t("search.recent")}</h3>
                    <button onClick={clearRecent} className="text-xs text-primary font-medium">
                      {t("search.clear")}
                    </button>
                  </div>
                  <ul className="divide-y divide-border">
                    {recent.map((r) => (
                      <li key={r}>
                        <button
                          onClick={() => setQ(r)}
                          className="w-full flex items-center gap-3 py-2.5 text-left text-sm"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="flex-1 truncate">{r}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">{t("search.placeholder")}</p>
              )}
            </div>
          ) : totalResults === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">{t("search.empty")}</p>
          ) : (
            <div className="p-3 space-y-4">
              {showUsers && matchedUsers.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2 px-1">
                    {t("search.tab.users")}
                  </h3>
                  <ul className="space-y-1">
                    {matchedUsers.map((u) => (
                      <li key={u.id}>
                        <button
                          onClick={() => saveRecent(q)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left"
                        >
                          <Avatar name={u.name} gradient={u.avatar} size="md" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.username}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {showPosts && matchedPosts.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2 px-1">
                    {t("search.tab.posts")}
                  </h3>
                  <div className="grid grid-cols-3 gap-1">
                    {matchedPosts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => saveRecent(q)}
                        className="aspect-[3/4] relative rounded-md overflow-hidden bg-muted"
                      >
                        <img src={p.video} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        <span className="absolute bottom-1 left-1 right-1 text-[10px] text-white drop-shadow line-clamp-2 text-left">
                          {p.caption}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {showProducts && matchedProducts.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2 px-1">
                    {t("search.tab.products")}
                  </h3>
                  <ul className="space-y-2">
                    {matchedProducts.map((p) => (
                      <li key={p.id}>
                        <button
                          onClick={() => saveRecent(q)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left"
                        >
                          <img src={p.image} alt="" className="h-14 w-14 rounded-md object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2">{p.title}</p>
                            <p className="text-xs text-primary font-bold">฿{p.price.toLocaleString()}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
