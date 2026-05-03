import { useState } from "react";
import { Avatar } from "@/components/Avatar";
import { posts } from "@/lib/mock-data";
import { Heart, MessageCircle, Share2, Music2, Search, Plus, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";

function formatN(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return n.toString();
}

export default function Feed() {
  const { t } = useI18n();
  const [liked, setLiked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(posts.map((p) => [p.id, !!p.liked])),
  );

  return (
    <div className="bg-black -mx-0">
      {/* Top tabs over feed */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-30 safe-top">
        <div className="flex items-center justify-between px-4 h-14">
          <button className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center">
            <Search className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-5 text-white">
            <button className="text-sm font-semibold opacity-60">{t("feed.following")}</button>
            <button className="text-base font-bold">{t("feed.foryou")}</button>
            <button className="text-sm font-semibold opacity-60">{t("feed.live")}</button>
          </div>
          <button className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="snap-y snap-mandatory overflow-y-auto h-[calc(100vh)] no-scrollbar">
        {posts.map((p) => (
          <div key={p.id} className="snap-start relative h-[calc(100vh)] w-full overflow-hidden">
            <img src={p.video} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

            {/* Right rail */}
            <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
              <div className="relative">
                <Avatar name={p.user.name} gradient={p.user.avatar} size="lg" className="ring-2 ring-white" />
                <button className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-glow">+</button>
              </div>

              <button
                onClick={() => setLiked((l) => ({ ...l, [p.id]: !l[p.id] }))}
                className="flex flex-col items-center gap-1 text-white"
              >
                <div className={cn("h-12 w-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center transition-bounce", liked[p.id] && "animate-heart-pop")}>
                  <Heart className={cn("h-6 w-6", liked[p.id] && "fill-destructive text-destructive")} />
                </div>
                <span className="text-xs font-bold drop-shadow">{formatN(p.likes + (liked[p.id] && !p.liked ? 1 : 0))}</span>
              </button>

              <button className="flex flex-col items-center gap-1 text-white">
                <div className="h-12 w-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold drop-shadow">{formatN(p.comments)}</span>
              </button>

              <button className="flex flex-col items-center gap-1 text-white">
                <div className="h-12 w-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <Bookmark className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold drop-shadow">{t("feed.save")}</span>
              </button>

              <button className="flex flex-col items-center gap-1 text-white">
                <div className="h-12 w-12 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <Share2 className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold drop-shadow">{formatN(p.shares)}</span>
              </button>

              <div className="h-11 w-11 rounded-xl border-2 border-white/80 overflow-hidden animate-spin" style={{ animationDuration: "6s" }}>
                <div className={cn("h-full w-full bg-gradient-to-br", p.user.avatar)} />
              </div>
            </div>

            {/* Bottom info */}
            <div className="absolute left-0 right-16 bottom-28 px-4 z-10 text-white">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base drop-shadow">{p.user.username}</h3>
                {p.user.verified && <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">✓</span>}
                <button className="ml-1 h-7 px-3 rounded-full border border-white/80 text-xs font-semibold backdrop-blur-md">{t("feed.follow")}</button>
              </div>
              <p className="mt-2 text-sm leading-snug drop-shadow">{(() => { const k = `feed.cap.${p.id}`; const v = t(k); return v === k ? p.caption : v; })()}</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <Music2 className="h-3.5 w-3.5" />
                <span className="font-medium truncate">{(() => { const k = `feed.music.${p.id}`; const v = t(k); return v === k ? p.music : v; })()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
