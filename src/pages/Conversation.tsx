import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef, useMemo, KeyboardEvent, ChangeEvent } from "react";
import { Avatar } from "@/components/Avatar";
import { chats, messages as seedMessages, type Message, type Attachment } from "@/lib/mock-data";
import {
  ChevronLeft, Phone, Video, Plus, Smile, Mic, Send, Check, CheckCheck, Camera,
  Image as ImageIcon, FileText, Film, X, Play, Download, File as FileIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const formatTime = (d: Date) =>
  d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });

const formatBytes = (bytes?: number) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const autoReplies = [
  "โอเคเลย! 👍", "เดี๋ยวคุยกันต่อนะ 😊", "ฮะๆ จริงป่ะ 😆", "เห็นด้วยเลย",
  "แล้วจะส่งให้นะ ✨", "น่าสนใจมาก เล่าต่อสิ", "ขอเวลาคิดแป๊บนึง 🤔", "เยี่ยมเลย! 💙",
];

type AttachKind = "image" | "video" | "file";

export default function Conversation() {
  const { id = "c1" } = useParams();
  const navigate = useNavigate();
  const chat = useMemo(() => chats.find((c) => c.id === id) ?? chats[0], [id]);

  const [msgs, setMsgs] = useState<Message[]>(() =>
    (seedMessages[chat.id] ?? seedMessages.c1).map((m) => ({ ...m })),
  );
  const [draft, setDraft] = useState("");
  const [theyTyping, setTheyTyping] = useState(false);
  const [iAmTyping, setIAmTyping] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const replyTimeoutRef = useRef<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, theyTyping]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setMsgs((prev) =>
        prev.map((m) => (m.senderId === "me" && m.status !== "read" ? { ...m, status: "read" } : m)),
      );
    }, 600);
    return () => clearTimeout(t);
  }, [chat.id]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const handleDraftChange = (value: string) => {
    setDraft(value);
    if (!iAmTyping && value.trim()) setIAmTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => setIAmTyping(false), 1500);
  };

  const triggerPeerReply = () => {
    window.setTimeout(() => setTheyTyping(true), 1100);
    if (replyTimeoutRef.current) clearTimeout(replyTimeoutRef.current);
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

  const advanceStatus = (id: string) => {
    window.setTimeout(() => {
      setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, status: "delivered" } : m)));
    }, 500);
    window.setTimeout(() => {
      setMsgs((prev) => prev.map((m) => (m.id === id ? { ...m, status: "read" } : m)));
    }, 1600);
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    const id = `m_${Date.now()}`;
    const newMsg: Message = { id, senderId: "me", text, time: formatTime(new Date()), status: "sent" };
    setMsgs((prev) => [...prev, newMsg]);
    setDraft("");
    setIAmTyping(false);
    advanceStatus(id);
    triggerPeerReply();
  };

  const sendAttachment = (file: File, kind: AttachKind) => {
    const id = `m_${Date.now()}_a`;
    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);

    const attachment: Attachment =
      kind === "image"
        ? { kind: "image", url, name: file.name, size: file.size }
        : kind === "video"
        ? { kind: "video", url, name: file.name, size: file.size }
        : { kind: "file", url, name: file.name, size: file.size, mime: file.type };

    const newMsg: Message = {
      id,
      senderId: "me",
      attachment,
      uploadProgress: 0,
      time: formatTime(new Date()),
      status: "sent",
    };
    setMsgs((prev) => [...prev, newMsg]);

    // Simulate upload progress
    let progress = 0;
    const tick = window.setInterval(() => {
      progress = Math.min(100, progress + 8 + Math.random() * 18);
      const done = progress >= 100;
      setMsgs((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, uploadProgress: done ? undefined : Math.round(progress) } : m,
        ),
      );
      if (done) {
        clearInterval(tick);
        advanceStatus(id);
        triggerPeerReply();
      }
    }, 220);
  };

  const onPickFiles = (e: ChangeEvent<HTMLInputElement>, kind: AttachKind) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((f) => sendAttachment(f, kind));
    e.target.value = "";
    setAttachOpen(false);
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
          const uploading = typeof m.uploadProgress === "number";
          return (
            <div key={m.id} className={cn("flex items-end gap-2 animate-fade-in", me ? "justify-end" : "justify-start")}>
              {!me && showTail ? (
                <Avatar name={chat.user.name} gradient={chat.user.avatar} size="xs" />
              ) : !me ? (
                <span className="w-7" />
              ) : null}
              <div className={cn("max-w-[78%] flex flex-col", me ? "items-end" : "items-start")}>
                {/* Image attachment */}
                {m.attachment?.kind === "image" && (
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-3xl shadow-soft bg-muted",
                      me ? "rounded-br-md" : "rounded-bl-md",
                    )}
                  >
                    <button
                      onClick={() => !uploading && setLightbox(m.attachment!.kind === "image" ? (m.attachment as { url: string }).url : null)}
                      className="block max-w-[260px]"
                    >
                      <img
                        src={m.attachment.url}
                        alt={m.attachment.name ?? "image"}
                        className={cn("w-full h-auto max-h-72 object-cover", uploading && "blur-sm scale-105")}
                      />
                    </button>
                    {uploading && (
                      <div className="absolute inset-0 bg-background/30 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                        <div className="h-12 w-12 rounded-full border-4 border-white/40 border-t-white animate-spin" />
                        <span className="text-xs font-semibold text-white drop-shadow">{m.uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Video attachment */}
                {m.attachment?.kind === "video" && (
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-3xl shadow-soft bg-black/80",
                      me ? "rounded-br-md" : "rounded-bl-md",
                    )}
                  >
                    <video
                      src={m.attachment.url}
                      controls={!uploading}
                      className="block max-w-[260px] max-h-72 w-full"
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                        <Play className="h-8 w-8 text-white/80" />
                        <div className="w-32 h-1.5 rounded-full bg-white/30 overflow-hidden">
                          <div className="h-full bg-white transition-all" style={{ width: `${m.uploadProgress}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-white">กำลังอัปโหลด {m.uploadProgress}%</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium flex items-center gap-1">
                      <Film className="h-3 w-3" />
                      {formatBytes(m.attachment.size)}
                    </div>
                  </div>
                )}

                {/* File attachment */}
                {m.attachment?.kind === "file" && (
                  <div
                    className={cn(
                      "px-3 py-3 flex items-center gap-3 min-w-[220px] max-w-[280px]",
                      me
                        ? "bg-gradient-bubble text-bubble-me-foreground rounded-3xl rounded-br-md shadow-soft"
                        : "bg-bubble-them text-bubble-them-foreground rounded-3xl rounded-bl-md shadow-soft",
                    )}
                  >
                    <div className={cn(
                      "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0",
                      me ? "bg-white/20" : "bg-primary/15 text-primary",
                    )}>
                      {uploading ? (
                        <div className={cn("h-5 w-5 rounded-full border-2 border-t-transparent animate-spin", me ? "border-white" : "border-primary")} />
                      ) : (
                        <FileIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{m.attachment.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn("text-[11px]", me ? "text-white/80" : "text-muted-foreground")}>
                          {formatBytes(m.attachment.size)}
                        </span>
                        {uploading && (
                          <div className={cn("flex-1 h-1 rounded-full overflow-hidden", me ? "bg-white/25" : "bg-primary/15")}>
                            <div
                              className={cn("h-full transition-all", me ? "bg-white" : "bg-primary")}
                              style={{ width: `${m.uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    {!uploading && (
                      <button
                        className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                          me ? "bg-white/20 hover:bg-white/30" : "bg-primary/15 hover:bg-primary/25 text-primary",
                        )}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                {/* Voice */}
                {m.voice && (
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
                )}

                {/* Text */}
                {m.text && !m.attachment && !m.voice && (
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
                  {me && uploading && (
                    <span className="text-[10px] text-muted-foreground">กำลังอัปโหลด...</span>
                  )}
                  {me && !uploading && m.status === "sent" && <Check className="h-3 w-3 text-muted-foreground" />}
                  {me && !uploading && m.status === "delivered" && <CheckCheck className="h-3 w-3 text-muted-foreground" />}
                  {me && !uploading && m.status === "read" && <CheckCheck className="h-3 w-3 text-primary" />}
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

      {/* Attachment sheet */}
      {attachOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm animate-fade-in"
          onClick={() => setAttachOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 inset-x-0 bg-background rounded-t-3xl shadow-glow border-t border-border p-5 safe-bottom animate-slide-up"
          >
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-center mb-4">แนบไฟล์</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-primary/10 hover:bg-primary/15 active:scale-95 transition-transform"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium">รูปภาพ</span>
              </button>
              <button
                onClick={() => videoInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-primary/10 hover:bg-primary/15 active:scale-95 transition-transform"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-soft">
                  <Film className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium">วิดีโอ</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-primary/10 hover:bg-primary/15 active:scale-95 transition-transform"
              >
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-soft">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium">ไฟล์</span>
              </button>
            </div>
            <button
              onClick={() => setAttachOpen(false)}
              className="mt-4 w-full h-11 rounded-2xl bg-muted text-foreground font-semibold text-sm"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center animate-fade-in"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/15 text-white flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
          <img src={lightbox} alt="preview" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onPickFiles(e, "image")}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => onPickFiles(e, "video")}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => onPickFiles(e, "file")}
      />

      {/* Input bar */}
      <div className="bg-background/95 backdrop-blur-xl border-t border-border px-3 py-2.5 safe-bottom">
        {iAmTyping && (
          <p className="text-[10px] text-muted-foreground px-2 pb-1">กำลังพิมพ์...</p>
        )}
        <div className="flex items-end gap-2">
          <button
            onClick={() => setAttachOpen(true)}
            aria-label="แนบไฟล์"
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95",
              attachOpen ? "bg-gradient-primary text-primary-foreground rotate-45" : "bg-primary/10 text-primary",
            )}
          >
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
            <button
              onClick={() => imageInputRef.current?.click()}
              className="h-8 w-8 rounded-full hover:bg-background/60 flex items-center justify-center text-muted-foreground"
            >
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
