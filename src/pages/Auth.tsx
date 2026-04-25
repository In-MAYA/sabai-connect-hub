import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircleHeart, Phone, ShieldCheck } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [country] = useState("+66");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="relative bg-gradient-hero pt-16 pb-20 px-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-0 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 flex flex-col items-center text-center text-primary-foreground">
          <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-glow mb-4 animate-float-up">
            <MessageCircleHeart className="h-11 w-11" strokeWidth={2.2} />
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">SABAI-CHAT</h1>
          <p className="mt-2 text-sm text-primary-foreground/90 max-w-[280px]">
            แชท · โทร · โซเชียล · ช็อปปิ้ง — ครบจบในแอปเดียว 💙
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8 -mt-6 bg-background rounded-t-3xl shadow-card">
        <h2 className="font-display text-xl font-bold">เข้าสู่ระบบ</h2>
        <p className="text-sm text-muted-foreground mt-1">เราจะส่งรหัส OTP ไปยังเบอร์ของคุณ</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">เบอร์โทรศัพท์</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-2xl bg-muted/60 border border-input focus-within:border-primary focus-within:bg-card transition-smooth px-3 h-14">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold text-sm">{country}</span>
              <div className="h-6 w-px bg-border" />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="81 234 5678"
                inputMode="numeric"
                className="border-0 bg-transparent text-base font-semibold p-0 h-auto focus-visible:ring-0"
              />
            </div>
          </div>

          <Button
            onClick={() => navigate("/otp")}
            disabled={phone.length < 9}
            className="w-full h-14 rounded-2xl bg-gradient-primary text-base font-semibold shadow-glow hover:opacity-95 transition-smooth"
          >
            ส่งรหัส OTP
          </Button>

          <div className="flex items-center gap-3 py-2">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-muted-foreground">หรือ</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 rounded-2xl font-semibold" onClick={() => navigate("/setup-profile")}>
              <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35 11.1H12v3.2h5.35c-.23 1.5-1.7 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.74 4.31 14.6 3.4 12 3.4 7.03 3.4 3 7.43 3 12.4s4.03 9 9 9c5.2 0 8.64-3.65 8.64-8.79 0-.59-.07-1.05-.15-1.51z"/></svg>
              Google
            </Button>
            <Button variant="outline" className="h-12 rounded-2xl font-semibold" onClick={() => navigate("/setup-profile")}>
              <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-2.85 2.32-4.22 2.42-4.29-1.32-1.93-3.38-2.2-4.11-2.23-1.75-.18-3.42 1.03-4.31 1.03-.9 0-2.27-1-3.73-.97-1.92.03-3.69 1.12-4.68 2.83-2 3.46-.51 8.59 1.43 11.4.95 1.38 2.07 2.93 3.54 2.87 1.42-.06 1.96-.92 3.68-.92s2.21.92 3.72.89c1.54-.03 2.51-1.4 3.45-2.79 1.09-1.6 1.54-3.15 1.57-3.23-.03-.02-3.01-1.16-3.04-4.59zM14.1 4.05c.78-.95 1.31-2.27 1.16-3.58-1.13.05-2.49.75-3.3 1.7-.72.84-1.36 2.18-1.19 3.47 1.26.1 2.55-.64 3.33-1.59z"/></svg>
              Apple
            </Button>
          </div>

          <div className="flex items-start gap-2 mt-4 px-1">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              เราเข้ารหัสข้อความของคุณแบบ end-to-end เพื่อความเป็นส่วนตัว
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
