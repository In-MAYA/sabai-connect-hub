import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef, useMemo, KeyboardEvent } from "react";
import { Avatar } from "@/components/Avatar";
import { chats, messages as seedMessages, type Message } from "@/lib/mock-data";
import { ChevronLeft, Phone, Video, Plus, Smile, Mic, Send, Check, CheckCheck, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const formatTime = (d: Date) =>
  d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });

const autoReplies = [
  "โอเคเลย! 👍",
  "เดี๋ยวคุยกันต่อนะ 😊",
  "ฮะๆ จริงป่ะ 😆",
  "เห็นด้วยเลย",
  "แล้วจะส่งให้นะ ✨",
  "น่าสนใจมาก เล่าต่อสิ",
  "ขอเวลาคิดแป๊บนึง 🤔",
  "เยี่ยมเลย! 💙",
];

export default function Conversation() {
  const { id = "c1" } = useParams();
  const navigate = useNavigate();
  const chat = useMemo(() => chats.find((c) => c.id === id) ?? chats[0], [id]);

  const [msgs, setMsgs] = useState<Message[]>(() =>
    (seedMessages[chat.id] ?? seedMessages.c1).map((m) => ({ ...m })),
  );
  const [draft, setDraft] = useState("");
  const [theyTyping, setTheyTyping] = useState(false);
  const [iAmTyping, setIAmTyping] = useState(false); // shown as "กำลังพิมพ์..." in header (peer's view simulated locally)

  const scrollerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const replyTimeoutRef = useRef<number | null>(null);

  // Auto-scroll to bottom when messages or typing change
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, theyTyping]);

  // When entering chat: mark all my "delivered" -> "read" (simulate peer reading)
  useEffect(() => {
    const t = window.setTimeout(() => {
      setMsgs((prev) =>
        prev.map((m) => (m.senderId === "me" && m.status !== "read" ? { ...m, status: "read" } : m)),
      );
    }, 600);
    return () => clearTimeout(t);
  }, [chat.id]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    };
  }, []);

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (!iAmTyping && value.trim()) setIAmTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => setIAmTyping(false), 1500);
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;

    const id = `m_${Date.now()}`;
    const now = new Date();
    const newMsg: Message = {
      id,
      senderId: "me",
      text,
      time: formatTime(now),
      status: "sent",
    };
    setMsgs((prev) => [...prev, newMsg]);
    setDraft("");
    setIAmTyping(false);

    // sent -> delivered
    window.setTimeout(() => {
      setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, status: "delivered" } : m)));
    }, 500);

    // peer starts typing
    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
    window.setTimeout(() => setTheyTyping(true), 1100);

    // delivered -> read (peer opened)
    window.setTimeout(() => {
      setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, status: "read" } : m)));
    }, 1600);

    // peer replies
    replyTimeoutRef.current = window.setTimeout(() => {
      setTheyTyping(false);
      const reply: Message = {
        id: `m_${Date.now()}_r`,
        senderId: chat.user.id,
        text: autoReplies[Math.floor(Math.random() * autoReplies.length)],
        time: formatTime(new Date()),
      };
      setMsgs((prev) => [...prev, reply]);
    }, 2400 + Math.random() * 1200);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-sky">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border safe-top">
        <div className="flex items-center gap-2 px-3 h-14">
          <button onClick={() => navigate(-1)} className="h-10 w-10 -ml-1 rounded-full hover:bg-muted flex items-center justify-center">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <Avatar name={chat.user.name} gradient={chat.user.avatar} size="sm" online={chat.user.online} />
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-sm truncate">{chat.user.name}</h2>
            <p className="text-[11px] font-medium flex items-center gap-1">
              {theyTyping ? (
                <span className="text-primary flex items-center gap-1">
                  <span className="flex items-center gap-0.5">
                    <span className="h-1 w-1 rounded-full bg-primary animate-typing" style={{ animationDelay: "0ms" }} />
                    <span className="h-1 w-1 rounded-full bg-primary animate-typing" style={{ animationDelay: "150ms" }} />
                    <span className="h-1 w-1 rounded-full bg-primary animate-typing" style={{ animationDelay: "300ms" }} />
                  </span>
                  กำลังพิมพ์...
                </span>
              ) : chat.user.online ? (
                <span className="text-success flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />ออนไลน์
                </span>
              ) : (
                <span className="text-muted-foreground">ออนไลน์ล่าสุด 2 ชม.</span>
              )}
            </p>
          </div>
          <Link to="/call/voice" className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center text-primary">
            <Phone className="h-5 w-5" />
          </Link>
          <Link to="/call/video" className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center text-primary">
            <Video className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollerRef} className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        <div className="text-center">
          <span className="text-[11px] text-muted-foreground bg-background/60 px-3 py-1 rounded-full">วันนี้</span>
        </div>

        {msgs.map((m, idx) => {
          const me = m.senderId === "me";
          const next = msgs[idx + 1];
          const showTail = !next || next.senderId !== m.senderId;
          return (
            <div key={m.id} className={cn("flex items-end gap-2 animate-fade-in", me ? "justify-end" : "justify-start")}>
              {!me && showTail ? (
                <Avatar name={chat.user.name} gradient={chat.user.avatar} size="xs" />
              ) : !me ? (
                <span className="w-7" />
              ) : null}
              <div className={cn("max-w-[75%] flex flex-col", me ? "items-end" : "items-start")}>
                {m.voice ? (
                  <div
                    className={cn(
                      "px-4 py-3 flex items-center gap-3 min-w-[180px]",
                      me ? "bg-gradient-bubble text-bubble-me-foreground rounded-3xl rounded-br-md" : "bg-bubble-them text-bubble-them-foreground rounded-3xl rounded-bl-md shadow-soft",
                    )}
                  >
                    <button className={cn("h-8 w-8 rounded-full flex items-center justify-center", me ? "bg-white/25" : "bg-primary text-primary-foreground")}>▶</button>
                    <div className="flex-1 flex items-center gap-0.5 h-6">
                      {Array.from({ length: 18 }).map((_, i) => (
                        <span key={i} className={cn("w-0.5 rounded-full", me ? "bg-white/70" : "bg-primary/60")} style={{ height: `${20 + Math.sin(i) * 60}%` }} />
                      ))}
                    </div>
                    <span className="text-xs font-semibold">{m.voice.duration}</span>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "px-4 py-2.5 text-[15px] leading-snug break-words",
                      me
                        ? "bg-gradient-bubble text-bubble-me-foreground rounded-3xl rounded-br-md shadow-soft"
                        : "bg-bubble-them text-bubble-them-foreground rounded-3xl rounded-bl-md shadow-soft",
                    )}
                  >
                    {m.text}
                  </div>
                )}
                <div className={cn("flex items-center gap-1 mt-0.5 px-1", me ? "flex-row-reverse" : "")}>
                  <span className="text-[10px] text-muted-foreground">{m.time}</span>
                  {me && m.status === "sent" && <Check className="h-3 w-3 text-muted-foreground" />}
                  {me && m.status === "delivered" && <CheckCheck className="h-3 w-3 text-muted-foreground" />}
                  {me && m.status === "read" && <CheckCheck className="h-3 w-3 text-primary" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing bubble */}
        {theyTyping && (
          <div className="flex items-end gap-2 animate-fade-in">
            <Avatar name={chat.user.name} gradient={chat.user.avatar} size="xs" />
            <div className="bg-bubble-them rounded-3xl rounded-bl-md px-4 py-3 shadow-soft flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-typing" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="bg-background/95 backdrop-blur-xl border-t border-border px-3 py-2.5 safe-bottom">
        {iAmTyping && (
          <p className="text-[10px] text-muted-foreground px-2 pb-1">กำลังพิมพ์...</p>
        )}
        <div className="flex items-end gap-2">
          <button className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Plus className="h-5 w-5" />
          </button>
          <div className="flex-1 flex items-end gap-1 bg-muted/70 rounded-3xl px-3 py-1.5 min-h-[40px]">
            <Input
              value={draft}
              onChange={(e) => handleDraftChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="พิมพ์ข้อความ..."
              className="border-0 bg-transparent p-0 h-8 focus-visible:ring-0 text-base"
            />
            <button className="h-8 w-8 rounded-full hover:bg-background/60 flex items-center justify-center text-muted-foreground">
              <Smile className="h-5 w-5" />
            </button>
            <button className="h-8 w-8 rounded-full hover:bg-background/60 flex items-center justify-center text-muted-foreground">
              <Camera className="h-5 w-5" />
            </button>
          </div>
          {draft.trim() ? (
            <button
              onClick={sendMessage}
              aria-label="ส่งข้อความ"
              className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-glow active:scale-95 transition-transform"
            >
              <Send className="h-4 w-4" />
            </button>
          ) : (
            <button className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-glow">
              <Mic className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
