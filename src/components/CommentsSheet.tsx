import { useEffect, useMemo, useRef, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar } from "@/components/Avatar";
import { Heart, Send } from "lucide-react";
import { toast } from "sonner";
import { currentUser, users } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type CommentItem = {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  liked?: boolean;
};

const seedFor = (postId: string): CommentItem[] => [
  {
    id: `${postId}-c1`,
    userId: users[1].id,
    name: users[1].name,
    username: users[1].username,
    avatar: users[1].avatar,
    text: "สวยมากเลย! 😍",
    time: "2h",
    likes: 12,
  },
  {
    id: `${postId}-c2`,
    userId: users[3].id,
    name: users[3].name,
    username: users[3].username,
    avatar: users[3].avatar,
    text: "อยากไปบ้างจัง 🌊",
    time: "1h",
    likes: 4,
  },
];

const STORAGE_PREFIX = "sabai_comments_";

export function CommentsSheet({
  postId,
  open,
  onOpenChange,
  onCountChange,
}: {
  postId: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCountChange?: (postId: string, delta: number) => void;
}) {
  const { t } = useI18n();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const storageKey = useMemo(() => (postId ? STORAGE_PREFIX + postId : ""), [postId]);

  useEffect(() => {
    if (!open || !postId) return;
    setDraft("");
    let initial: CommentItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + postId);
      if (raw) initial = JSON.parse(raw);
      else initial = seedFor(postId);
    } catch {
      initial = seedFor(postId);
    }
    setComments(initial);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, postId]);

  const persist = (next: CommentItem[]) => {
    setComments(next);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
    }
  };

  const submit = () => {
    const text = draft.trim();
    if (!text || !postId) return;
    const item: CommentItem = {
      id: `local-${Date.now()}`,
      userId: currentUser.id,
      name: currentUser.name,
      username: currentUser.username,
      avatar: currentUser.avatar,
      text,
      time: t("comments.now"),
      likes: 0,
    };
    persist([...comments, item]);
    setDraft("");
    onCountChange?.(postId, 1);
    toast.success(t("comments.posted"));
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  };

  const toggleLike = (id: string) => {
    persist(
      comments.map((c) =>
        c.id === id ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) } : c,
      ),
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[80vh] w-full max-w-[440px] mx-auto p-0 bg-background flex flex-col rounded-t-2xl [&>button]:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>{t("comments.title")}</SheetTitle>
          <SheetDescription>{t("comments.placeholder")}</SheetDescription>
        </SheetHeader>
        <div className="relative px-4 py-3 border-b border-border">
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-1 w-10 rounded-full bg-muted" />
          <h2 className="text-center text-sm font-bold mt-1">
            {t("comments.title")} · {comments.length}
          </h2>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">{t("comments.empty")}</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="flex items-start gap-2.5">
                  <Avatar name={c.name} gradient={c.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-semibold truncate">{c.username}</span>
                      <span className="text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="text-sm leading-snug whitespace-pre-wrap break-words">{c.text}</p>
                  </div>
                  <button
                    onClick={() => toggleLike(c.id)}
                    aria-pressed={!!c.liked}
                    className="flex flex-col items-center gap-0.5 px-1"
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 transition-colors",
                        c.liked ? "fill-destructive text-destructive" : "text-muted-foreground",
                      )}
                    />
                    {c.likes > 0 && <span className="text-[10px] text-muted-foreground">{c.likes}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-2.5 flex items-center gap-2 safe-bottom">
          <Avatar name={currentUser.name} gradient={currentUser.avatar} size="sm" />
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={t("comments.placeholder")}
            aria-label={t("comments.placeholder")}
            className="flex-1 h-10 rounded-full bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={submit}
            disabled={!draft.trim()}
            aria-label={t("comments.send")}
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center transition-opacity",
              draft.trim()
                ? "bg-gradient-primary text-primary-foreground shadow-glow"
                : "bg-muted text-muted-foreground opacity-60",
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
