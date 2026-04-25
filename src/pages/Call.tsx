import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { users } from "@/lib/mock-data";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Volume2, MessageCircle, UserPlus, FlipHorizontal2 } from "lucide-react";

export default function Call() {
  const { type = "video" } = useParams();
  const navigate = useNavigate();
  const isVideo = type === "video";
  const peer = users[0];
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cam, setCam] = useState(isVideo);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      {/* Background */}
      {isVideo ? (
        <div className="absolute inset-0 bg-gradient-to-br from-sky-700 via-blue-800 to-cyan-700">
          <div className={`absolute inset-0 bg-gradient-to-br ${peer.avatar} opacity-60`} />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-hero" />
      )}
      <div className="absolute inset-0 bg-black/30" />

      {/* PIP self camera */}
      {isVideo && cam && (
        <div className="absolute top-20 right-4 h-44 w-32 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 shadow-floating overflow-hidden ring-2 ring-white/20 z-10">
          <div className="h-full w-full flex items-center justify-center text-white/80 text-xs font-semibold">
            กล้องของคุณ
          </div>
        </div>
      )}

      {/* Top info */}
      <div className="relative z-20 safe-top px-6 pt-8 text-center">
        <p className="text-xs uppercase tracking-widest opacity-80">{isVideo ? "Video Call" : "Voice Call"}</p>
        <div className="mt-12 flex flex-col items-center">
          {!isVideo && (
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-white/30 animate-pulse-ring" />
              <Avatar name={peer.name} gradient={peer.avatar} size="2xl" />
            </div>
          )}
          <h1 className="mt-5 font-display text-3xl font-extrabold drop-shadow">{peer.name}</h1>
          <p className="mt-1 text-sm opacity-90 font-mono">{mm}:{ss}</p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 safe-bottom px-6 pb-8">
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: UserPlus, label: "เพิ่มคน" },
            { icon: MessageCircle, label: "แชท" },
            { icon: Volume2, label: "ลำโพง" },
            { icon: FlipHorizontal2, label: "พลิก" },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex flex-col items-center gap-1.5">
              <div className="h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] opacity-90">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setMuted((m) => !m)}
            className="h-14 w-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center"
          >
            {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="h-16 w-16 rounded-full bg-destructive flex items-center justify-center shadow-floating active:scale-95 transition-bounce"
          >
            <PhoneOff className="h-7 w-7" />
          </button>
          <button
            onClick={() => setCam((c) => !c)}
            className="h-14 w-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center"
          >
            {cam ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}
