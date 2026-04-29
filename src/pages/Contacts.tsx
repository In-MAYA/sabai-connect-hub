import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Loader2,
  MessageCircle,
  Send,
  Users,
  Search,
  RefreshCw,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  buildInviteLink,
  getPermission,
  setPermission,
  syncContacts,
  type ContactPermission,
  type DeviceContact,
  type RegisteredContact,
} from "@/lib/contacts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Contacts() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [perm, setPermState] = useState<ContactPermission>("unknown");
  const [syncing, setSyncing] = useState(false);
  const [registered, setRegistered] = useState<RegisteredContact[]>([]);
  const [unregistered, setUnregistered] = useState<DeviceContact[]>([]);
  const [tab, setTab] = useState<"app" | "invite">("app");
  const [q, setQ] = useState("");
  const [groupMode, setGroupMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const current = getPermission();
    setPermState(current);
    if (current === "granted") void runSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSync = async () => {
    setSyncing(true);
    try {
      const { registered, unregistered } = await syncContacts();
      setRegistered(registered);
      setUnregistered(unregistered);
    } finally {
      setSyncing(false);
    }
  };

  const allow = async () => {
    setPermission("granted");
    setPermState("granted");
    await runSync();
  };

  const deny = () => {
    setPermission("denied");
    setPermState("denied");
  };

  const filteredReg = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return registered;
    return registered.filter(
      (c) => c.name.toLowerCase().includes(needle) || c.phone.includes(needle),
    );
  }, [registered, q]);

  const filteredUnreg = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return unregistered;
    return unregistered.filter(
      (c) => c.name.toLowerCase().includes(needle) || c.phone.includes(needle),
    );
  }, [unregistered, q]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createGroup = () => {
    const name = groupName.trim() || t("contacts.newGroup");
    toast.success(
      t("contacts.groupCreated", { name, n: selected.size }),
    );
    setGroupMode(false);
    setSelected(new Set());
    setGroupName("");
    navigate("/chats");
  };

  const invite = (c: DeviceContact) => {
    const url = buildInviteLink(c.phone, t("contacts.inviteSms"));
    window.location.href = url;
  };

  // ── Permission gate ────────────────────────────────────────────
  if (perm !== "granted") {
    return (
      <div>
        <PageHeader title={t("contacts.title")} back />
        <div className="px-6 pt-8 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-3xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow mb-5">
            <ShieldCheck className="h-10 w-10" strokeWidth={2.2} />
          </div>
          <h2 className="font-display text-xl font-bold">{t("contacts.permTitle")}</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
            {t("contacts.permDesc")}
          </p>

          <div className="mt-6 w-full rounded-2xl bg-primary/5 border border-primary/15 p-3 flex items-start gap-2.5 text-left">
            <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {t("contacts.privacy")}
            </p>
          </div>

          {perm === "denied" && (
            <p className="mt-4 text-xs font-semibold text-destructive">
              {t("contacts.permDenied")}
            </p>
          )}

          <div className="mt-6 w-full space-y-2">
            <Button
              onClick={allow}
              className="w-full h-13 rounded-2xl bg-gradient-primary text-base font-semibold shadow-glow"
            >
              {perm === "denied" ? t("contacts.permRetry") : t("contacts.permAllow")}
            </Button>
            {perm !== "denied" && (
              <Button
                onClick={deny}
                variant="ghost"
                className="w-full h-12 rounded-2xl font-semibold"
              >
                {t("contacts.permDeny")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Synced view ────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title={t("contacts.title")}
        back
        right={
          <button
            onClick={runSync}
            disabled={syncing}
            aria-label={t("contacts.resync")}
            className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-smooth"
          >
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
          </button>
        }
      />

      <div className="px-4 pt-2 space-y-3">
        {/* Search */}
        <div className="flex items-center gap-2 h-11 rounded-2xl bg-muted/70 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("contacts.title")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
          />
        </div>

        {/* New group entry */}
        {!groupMode ? (
          <button
            onClick={() => setGroupMode(true)}
            className="w-full flex items-center gap-3 rounded-2xl bg-primary/10 hover:bg-primary/15 transition-smooth px-3 py-3"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <span className="font-semibold text-sm text-primary">{t("contacts.newGroup")}</span>
          </button>
        ) : (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3 space-y-2">
            <Input
              placeholder={t("contacts.groupName")}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="h-11 rounded-xl"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {t("contacts.selectMembers", { n: selected.size })}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setGroupMode(false);
                    setSelected(new Set());
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  size="sm"
                  disabled={selected.size < 2}
                  onClick={createGroup}
                  className="bg-gradient-primary"
                >
                  {t("contacts.groupCreate")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-muted/60">
          {(["app", "invite"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                "flex-1 h-9 rounded-xl text-xs font-semibold transition-smooth",
                tab === k ? "bg-card shadow-soft text-foreground" : "text-muted-foreground",
              )}
            >
              {k === "app"
                ? `${t("contacts.tab.onApp")} · ${registered.length}`
                : `${t("contacts.tab.invite")} · ${unregistered.length}`}
            </button>
          ))}
        </div>

        {/* Privacy footnote */}
        <p className="text-[11px] text-muted-foreground px-1">{t("contacts.privacy")}</p>
      </div>

      {/* Loading state */}
      {syncing && registered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mb-2" />
          <p className="text-sm">{t("contacts.syncing")}</p>
        </div>
      )}

      {/* Registered list */}
      {tab === "app" && (
        <div className="mt-2">
          {filteredReg.length === 0 && !syncing ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              {t("contacts.empty")}
            </p>
          ) : (
            filteredReg.map((c) => {
              const isSelected = selected.has(c.id);
              const onRowClick = () => {
                if (groupMode) toggle(c.id);
                else navigate(`/chat/${c.user.id}`);
              };
              return (
                <button
                  key={c.id}
                  onClick={onRowClick}
                  className="w-full flex items-center gap-3 px-4 py-3 active:bg-muted/60 transition-smooth text-left"
                >
                  <Avatar
                    name={c.user.name}
                    gradient={c.user.avatar}
                    size="lg"
                    online={c.user.online}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold truncate">{c.name}</h3>
                      {c.user.verified && (
                        <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {c.user.online
                        ? t("contacts.online")
                        : t("contacts.lastSeen", { when: c.lastSeen })}
                    </p>
                  </div>
                  {groupMode ? (
                    <div
                      className={cn(
                        "h-7 w-7 rounded-full border-2 flex items-center justify-center transition-smooth",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/40",
                      )}
                    >
                      {isSelected && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                  ) : (
                    <Link
                      to={`/chat/${c.user.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center"
                      aria-label={t("contacts.message")}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Invite list */}
      {tab === "invite" && (
        <div className="mt-2">
          {filteredUnreg.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              {t("contacts.empty")}
            </p>
          ) : (
            filteredUnreg.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 px-4 py-3 active:bg-muted/60 transition-smooth"
              >
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-semibold text-muted-foreground">
                  {c.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{c.name}</h3>
                  <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                    {c.phone}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => invite(c)}
                  className="rounded-full font-semibold"
                >
                  <Send className="h-3.5 w-3.5 mr-1" />
                  {t("contacts.invite")}
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
