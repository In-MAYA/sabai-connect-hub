import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { LanguagePicker } from "@/components/LanguagePicker";
import { useI18n } from "@/lib/i18n";
import { currentUser } from "@/lib/mock-data";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  ChevronRight,
  User,
  ShieldCheck,
  Bell,
  Lock,
  Palette,
  Languages,
  Database,
  HelpCircle,
  Info,
  LogOut,
  Trash2,
  Moon,
  QrCode,
  KeyRound,
  Smartphone,
  Eye,
  Volume2,
  MessageSquare,
  Phone,
  Heart,
  Download,
  FileText,
  Star,
  Mail,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Row = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  onClick?: () => void;
  control?: React.ReactNode;
  danger?: boolean;
  badge?: string;
  tone?: "primary" | "amber" | "rose" | "emerald" | "violet" | "slate";
};

const TONE: Record<NonNullable<Row["tone"]>, string> = {
  primary: "bg-primary/15 text-primary",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  slate: "bg-muted text-muted-foreground",
};

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      {title && (
        <p className="px-5 mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
      )}
      <div className="mx-4 rounded-2xl bg-card border border-border shadow-soft overflow-hidden divide-y divide-border">
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ row }: { row: Row }) {
  const Icon = row.icon;
  const tone = row.tone ?? "primary";
  return (
    <button
      type="button"
      onClick={row.onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-muted/60 transition-colors",
        row.danger && "active:bg-destructive/10",
      )}
    >
      <div
        className={cn(
          "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
          row.danger ? "bg-destructive/15 text-destructive" : TONE[tone],
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-semibold truncate", row.danger && "text-destructive")}>
          {row.label}
        </p>
        {row.hint && <p className="text-[11px] text-muted-foreground truncate mt-0.5">{row.hint}</p>}
      </div>
      {row.badge && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary">
          {row.badge}
        </span>
      )}
      {row.control ? row.control : !row.danger && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}

const THEME_KEY = "sabai_theme";

export default function Settings() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(THEME_KEY) === "dark";
  });
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifCalls, setNotifCalls] = useState(true);
  const [notifSocial, setNotifSocial] = useState(false);
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);
  const [autoDownload, setAutoDownload] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  const langLabel = ({ lo: "ລາວ", th: "ไทย", en: "English", zh: "中文" } as const)[lang];

  const stub = (label: string) => () =>
    toast({ title: label, description: t("settings.comingSoon") });

  const onLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("sabai_phone");
    }
    toast({ title: t("settings.loggedOut") });
    navigate("/auth", { replace: true });
  };

  const onDelete = () => {
    if (window.confirm(t("settings.deleteConfirm"))) {
      toast({ title: t("settings.deleteRequested"), description: t("settings.deleteHint") });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-10">
      <PageHeader
        title={t("settings.title")}
        back
        right={<LanguagePicker />}
      />

      {/* Profile card */}
      <div className="px-4 pt-3">
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-gradient-hero text-primary-foreground shadow-glow active:scale-[0.99] transition-transform"
        >
          <div className="ring-2 ring-white/40 rounded-full">
            <Avatar name={currentUser.name} gradient={currentUser.avatar} size="lg" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="font-display text-base font-extrabold truncate">{currentUser.name}</p>
            <p className="text-xs text-primary-foreground/85 truncate">{currentUser.username}</p>
            <p className="text-[11px] mt-1 text-primary-foreground/80 inline-flex items-center gap-1">
              <QrCode className="h-3 w-3" /> {t("settings.viewProfile")}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 opacity-80" />
        </button>
      </div>

      {/* Account */}
      <Section title={t("settings.section.account")}>
        <SettingsRow row={{ icon: User, label: t("settings.editProfile"), hint: t("settings.editProfileHint"), onClick: () => navigate("/setup-profile"), tone: "primary" }} />
        <SettingsRow row={{ icon: KeyRound, label: t("settings.security"), hint: t("settings.securityHint"), onClick: stub(t("settings.security")), tone: "emerald" }} />
        <SettingsRow row={{ icon: Smartphone, label: t("settings.linkedDevices"), hint: "iPhone 15, MacBook", onClick: stub(t("settings.linkedDevices")), tone: "violet", badge: "2" }} />
        <SettingsRow row={{ icon: ShieldCheck, label: t("settings.verification"), hint: t("settings.verificationHint"), onClick: stub(t("settings.verification")), tone: "primary" }} />
      </Section>

      {/* Notifications */}
      <Section title={t("settings.section.notifications")}>
        <SettingsRow row={{ icon: MessageSquare, label: t("settings.notif.messages"), tone: "primary", control: <Switch checked={notifMessages} onCheckedChange={setNotifMessages} /> }} />
        <SettingsRow row={{ icon: Phone, label: t("settings.notif.calls"), tone: "emerald", control: <Switch checked={notifCalls} onCheckedChange={setNotifCalls} /> }} />
        <SettingsRow row={{ icon: Heart, label: t("settings.notif.social"), tone: "rose", control: <Switch checked={notifSocial} onCheckedChange={setNotifSocial} /> }} />
        <SettingsRow row={{ icon: Volume2, label: t("settings.notif.sounds"), tone: "amber", control: <Switch checked={sounds} onCheckedChange={setSounds} /> }} />
      </Section>

      {/* Privacy */}
      <Section title={t("settings.section.privacy")}>
        <SettingsRow row={{ icon: Eye, label: t("settings.privacy.readReceipts"), hint: t("settings.privacy.readReceiptsHint"), tone: "primary", control: <Switch checked={readReceipts} onCheckedChange={setReadReceipts} /> }} />
        <SettingsRow row={{ icon: Eye, label: t("settings.privacy.lastSeen"), tone: "violet", control: <Switch checked={lastSeen} onCheckedChange={setLastSeen} /> }} />
        <SettingsRow row={{ icon: Lock, label: t("settings.privacy.blocked"), hint: "0", onClick: stub(t("settings.privacy.blocked")), tone: "rose" }} />
      </Section>

      {/* Appearance */}
      <Section title={t("settings.section.appearance")}>
        <SettingsRow row={{ icon: Moon, label: t("settings.appearance.dark"), hint: dark ? t("settings.on") : t("settings.off"), tone: "slate", control: <Switch checked={dark} onCheckedChange={setDark} /> }} />
        <SettingsRow row={{ icon: Palette, label: t("settings.appearance.theme"), hint: t("settings.appearance.skyBlue"), onClick: stub(t("settings.appearance.theme")), tone: "primary" }} />
        <SettingsRow row={{ icon: Languages, label: t("settings.appearance.language"), hint: langLabel, onClick: () => document.querySelector<HTMLButtonElement>("[aria-label='" + t("auth.language") + "']")?.click(), tone: "emerald" }} />
      </Section>

      {/* Data & storage */}
      <Section title={t("settings.section.data")}>
        <SettingsRow row={{ icon: Download, label: t("settings.data.autoDownload"), hint: t("settings.data.autoDownloadHint"), tone: "primary", control: <Switch checked={autoDownload} onCheckedChange={setAutoDownload} /> }} />
        <SettingsRow row={{ icon: Database, label: t("settings.data.storage"), hint: "248 MB", onClick: stub(t("settings.data.storage")), tone: "amber" }} />
      </Section>

      {/* Help */}
      <Section title={t("settings.section.support")}>
        <SettingsRow row={{ icon: HelpCircle, label: t("settings.help.center"), onClick: stub(t("settings.help.center")), tone: "primary" }} />
        <SettingsRow row={{ icon: Mail, label: t("settings.help.contact"), hint: "support@sabai-chat.app", onClick: stub(t("settings.help.contact")), tone: "violet" }} />
        <SettingsRow row={{ icon: Star, label: t("settings.help.rate"), onClick: stub(t("settings.help.rate")), tone: "amber" }} />
        <SettingsRow row={{ icon: FileText, label: t("settings.help.terms"), onClick: stub(t("settings.help.terms")), tone: "slate" }} />
        <SettingsRow row={{ icon: Info, label: t("settings.help.about"), hint: "v1.0.0", onClick: stub(t("settings.help.about")), tone: "primary" }} />
      </Section>

      {/* Danger zone */}
      <Section>
        <SettingsRow row={{ icon: LogOut, label: t("settings.logout"), onClick: onLogout, danger: true }} />
        <SettingsRow row={{ icon: Trash2, label: t("settings.deleteAccount"), onClick: onDelete, danger: true }} />
      </Section>

      <p className="text-center text-[11px] text-muted-foreground mt-6">
        SABAI-CHAT · v1.0.0 · Made with 💙
      </p>
    </div>
  );
}
