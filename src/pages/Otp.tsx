import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export default function Otp() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(45);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const phone =
    (typeof window !== "undefined" && sessionStorage.getItem("sabai_phone")) || "+856 20 12 345 678";

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handle = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = ch;
    setCode(next);
    if (ch && i < 5) refs.current[i + 1]?.focus();
  };

  const filled = code.every((c) => c.length === 1);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={t("otp.title")} back />
      <div className="px-6 pt-4">
        <div className="bg-primary/10 rounded-2xl p-4 text-sm">
          {t("otp.sentTo")} <span className="font-semibold text-primary font-mono">{phone}</span>
        </div>

        <div className="mt-8 grid grid-cols-6 gap-2">
          {code.map((d, i) => (
            <input
              key={i}
              ref={(el) => (refs.current[i] = el)}
              value={d}
              onChange={(e) => handle(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !code[i] && i > 0) refs.current[i - 1]?.focus();
              }}
              inputMode="numeric"
              maxLength={1}
              className="h-14 rounded-2xl bg-muted/60 border-2 border-input focus:border-primary focus:bg-card outline-none text-center text-xl font-bold transition-smooth"
            />
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {seconds > 0 ? (
            <>{t("otp.resendIn")} <span className="font-semibold text-foreground">{seconds}s</span></>
          ) : (
            <button className="text-primary font-semibold" onClick={() => setSeconds(45)}>{t("otp.resend")}</button>
          )}
        </div>

        <Button
          onClick={() => navigate("/setup-profile")}
          disabled={!filled}
          className="mt-8 w-full h-14 rounded-2xl bg-gradient-primary text-base font-semibold shadow-glow"
        >
          {t("otp.verify")}
        </Button>
      </div>
    </div>
  );
}
