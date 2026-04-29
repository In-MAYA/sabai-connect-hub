import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useOtpCooldown } from "@/hooks/use-otp-cooldown";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock resend — fails ~15% of the time so we can demo error + rollback.
const resendOtp = (phone: string) =>
  new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (!phone || Math.random() < 0.15) reject(new Error("network"));
      else resolve();
    }, 700);
  });

export default function Otp() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [code, setCode] = useState(["", "", "", "", ""]);
  const [resending, setResending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const phone =
    (typeof window !== "undefined" && sessionStorage.getItem("sabai_phone")) || "+856 20 12 345 678";

  const cooldown = useOtpCooldown(phone);

  const handle = (i: number, v: string) => {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = ch;
    setCode(next);
    if (ch && i < 4) refs.current[i + 1]?.focus();
  };

  const filled = code.every((c) => c.length === 1);

  const onResend = async () => {
    if (resending || !cooldown.canResend) return;
    if (!cooldown.trigger()) return;
    setResending(true);
    setSendError(null);
    setCode(["", "", "", "", ""]);
    refs.current[0]?.focus();
    try {
      await resendOtp(phone);
      setResending(false);
    } catch {
      // Refund the attempt — failed delivery shouldn't burn the cooldown
      cooldown.rollback();
      setResending(false);
      setSendError(t("otp.error.network"));
    }
  };

  // Keep focus management consistent after a resend completes
  useEffect(() => {
    if (!resending) return;
  }, [resending]);

  const onVerify = () => {
    if (!filled) return;
    cooldown.reset();
    navigate("/setup-profile");
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={t("otp.title")} back />
      <div className="px-6 pt-4">
        <div className="bg-primary/10 rounded-2xl p-4 text-sm">
          {t("otp.sentTo")} <span className="font-semibold text-primary font-mono">{phone}</span>
        </div>

        <div className="mt-8 grid grid-cols-5 gap-2">
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
              disabled={resending}
              className="h-14 rounded-2xl bg-muted/60 border-2 border-input focus:border-primary focus:bg-card outline-none text-center text-xl font-bold transition-smooth disabled:opacity-60"
            />
          ))}
        </div>

        {sendError && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 animate-slide-up"
          >
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-destructive">{t("otp.error.title")}</p>
              <p className="text-xs text-destructive/90 mt-0.5">{sendError}</p>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm">
          {cooldown.locked ? (
            <p className="text-destructive font-semibold">
              {t("otp.locked")} <span className="text-foreground">{cooldown.remainingSec}s</span>
            </p>
          ) : !cooldown.canResend ? (
            <p className="text-muted-foreground">
              {t("otp.resendIn")}{" "}
              <span className="font-semibold text-foreground tabular-nums">{cooldown.remainingSec}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={onResend}
              disabled={resending}
              aria-busy={resending}
              className={cn(
                "inline-flex items-center gap-1.5 font-semibold transition-opacity",
                resending ? "text-muted-foreground" : "text-primary hover:opacity-80",
              )}
            >
              {resending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {resending ? t("otp.sending") : t("otp.resend")}
            </button>
          )}

          {cooldown.attempts > 0 && (
            <p className="text-[11px] text-muted-foreground mt-1.5">
              {t("otp.attempts", { n: cooldown.attempts, m: cooldown.maxAttempts })}
            </p>
          )}
        </div>

        <Button
          onClick={onVerify}
          disabled={!filled || resending}
          className="mt-8 w-full h-14 rounded-2xl bg-gradient-primary text-base font-semibold shadow-glow"
        >
          {t("otp.verify")}
        </Button>
      </div>
    </div>
  );
}
