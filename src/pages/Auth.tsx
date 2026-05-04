import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircleHeart, Phone, ShieldCheck, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { useI18n, countryName } from "@/lib/i18n";
import { CountryPicker } from "@/components/CountryPicker";
import { LanguagePicker } from "@/components/LanguagePicker";
import { useOtpCooldown } from "@/hooks/use-otp-cooldown";

// Simulate sending an OTP. ~15% of attempts fail to demonstrate the
// error-handling + cooldown rollback flow until a real SMS provider is wired.
const sendOtp = (phone: string) =>
  new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      if (!phone || Math.random() < 0.15) {
        reject(new Error("network"));
      } else {
        resolve();
      }
    }, 600);
  });

export default function Auth() {
  const navigate = useNavigate();
  const { t, lang, country, setCountry } = useI18n();
  const [phone, setPhone] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const fullPhone = `${country.dial} ${phone}`;
  const cooldown = useOtpCooldown(phone ? fullPhone : null);

  const goOtp = async () => {
    if (sending || !cooldown.canResend) return;
    if (!cooldown.trigger()) return; // double-guard against spam
    setSending(true);
    setSendError(null);
    try {
      await sendOtp(fullPhone);
      sessionStorage.setItem("sabai_phone", fullPhone);
      setSending(false);
      navigate("/otp");
    } catch {
      // Refund the attempt so a failed delivery doesn't punish the user
      cooldown.rollback();
      setSending(false);
      setSendError(t("otp.error.network"));
    }
  };

  const phoneTooShort = phone.length < Math.min(8, country.maxLen);
  const disabled = sending || phoneTooShort || !cooldown.canResend;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <div className="relative bg-gradient-hero pt-12 pb-20 px-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-0 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex justify-end mb-2">
          <LanguagePicker />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center text-primary-foreground">
          <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-glow mb-4 animate-float-up">
            <MessageCircleHeart className="h-11 w-11" strokeWidth={2.2} />
          </div>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">SABAI-CHAT</h1>
          <p className="mt-2 text-sm text-primary-foreground/90 max-w-[280px]">
            {t("auth.tagline")}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8 -mt-6 bg-background rounded-t-3xl shadow-card">
        <h2 className="font-display text-xl font-bold">{t("auth.title")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("auth.subtitle")}</p>

        <div className="mt-6 space-y-4">
          {/* Country selector */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground">{t("auth.country")}</label>
            <button
              onClick={() => setPickerOpen(true)}
              className="mt-1.5 w-full flex items-center gap-3 rounded-2xl bg-muted/60 border border-input hover:border-primary transition-smooth px-3 h-14"
            >
              <span className="text-2xl">{country.flag}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">{countryName(lang, country.code)}</p>
                <p className="text-[11px] text-muted-foreground font-mono">{country.dial}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground">{t("auth.phone")}</label>
            <div className="mt-1.5 flex items-center gap-2 rounded-2xl bg-muted/60 border border-input focus-within:border-primary focus-within:bg-card transition-smooth px-3 h-14">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold text-sm font-mono">{country.dial}</span>
              <div className="h-6 w-px bg-border" />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, country.maxLen))}
                placeholder={country.example}
                inputMode="numeric"
                className="border-0 bg-transparent text-base font-semibold p-0 h-auto focus-visible:ring-0"
              />
            </div>
          </div>

          {sendError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 animate-slide-up"
            >
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-destructive">{t("otp.error.title")}</p>
                <p className="text-xs text-destructive/90 mt-0.5">{sendError}</p>
              </div>
            </div>
          )}

          <Button
            onClick={goOtp}
            disabled={disabled}
            aria-busy={sending}
            className="w-full h-14 rounded-2xl bg-gradient-primary text-base font-semibold shadow-glow hover:opacity-95 transition-smooth disabled:opacity-60"
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("otp.sending")}
              </span>
            ) : cooldown.locked ? (
              t("otp.locked")
            ) : !cooldown.canResend && phone ? (
              `${t("otp.resendIn")} ${cooldown.remainingSec}s`
            ) : sendError ? (
              t("otp.error.retry")
            ) : (
              t("auth.send")
            )}
          </Button>

          {cooldown.attempts > 0 && (
            <p className="text-[11px] text-center text-muted-foreground -mt-2">
              {t("otp.attempts", { n: cooldown.attempts, m: cooldown.maxAttempts })}
            </p>
          )}

          <div className="flex items-start gap-2 mt-4 px-1">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t("auth.privacy")}
            </p>
          </div>
        </div>
      </div>

      <CountryPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={setCountry}
        current={country}
      />
    </div>
  );
}
