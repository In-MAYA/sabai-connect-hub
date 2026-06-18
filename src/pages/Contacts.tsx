import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShieldCheck,
  Loader2,
  MessageCircle,
  Send,
  Users,
  Search,
  RefreshCw,
  Lock,
  X,
  ArrowRight,
  Sparkles,
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
import { chats as chatsStore, type Chat } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Stage = "browse" | "select" | "form";

export default function Contacts() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [perm, setPermState] = useState<ContactPermission>("unknown");
  const [syncing, setSyncing] = useState(false);
  const [registered, setRegistered] = useState<RegisteredContact[]>([]);
  const [unregistered, setUnregistered] = useState<DeviceContact[]>([]);
  const [tab, setTab] = useState<"app" | "invite">("app");
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<Stage>("browse");
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

  const selectedContacts = useMemo(
    () => registered.filter((c) => selected.has(c.id)),
    [registered, selected],
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enterSelect = () => {
    setStage("select");
    setSelected(new Set());
    setTab("app");
  };

  const cancelSelect = () => {
    setStage("browse");
    setSelected(new Set());
    setGroupName("");
  };

  const goToForm = () => {
    if (selected.size < 2) {
      toast.error(t("contacts.minMembers"));
      return;
    }
    setStage("form");
  };

  const createGroup = () => {
    const name = groupName.trim() || t("contacts.newGroup");
    const memberIds = Array.from(selected);
    const groupId = "g-" + Date.now().toString(36);
    // Persist the new group in the shared chat list so it appears in /chats
    const newChat: Chat = {
      id: groupId,
      user: {
        id: groupId,
        name,
        username: "group",
        avatar: "from-violet-500 to-fuchsia-500",
      },
      lastMessage: "",
      time: "",
      unread: 0,
      isGroup: true,
      members: memberIds.length + 1,
    };
    // Avoid duplicates if re-run
    if (!chatsStore.some((c) => c.id === groupId)) {
      chatsStore.unshift(newChat);
    }
    toast.success(
      t("contacts.groupCreated", { name, n: memberIds.length }),
    );
    setStage("browse");
    setSelected(new Set());
    setGroupName("");
    navigate(`/chat/${groupId}`, {
      state: { isGroup: true, name, memberIds },
    });
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

  // ── Stage: dedicated create-group form ─────────────────────────
  if (stage === "form") {
    return (
      <div className="pb-32">
        <PageHeader
          title={t("contacts.createGroupTitle")}
          left={
            <button
              onClick={() => setStage("select")}
              aria-label={t("common.cancel")}
              className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-smooth"
            >
              <X className="h-4 w-4" />
            </button>
          }
        />

        <div className="px-5 pt-4 space-y-6">
          {/* Group identity */}
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-3xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-glow mb-4">
              <Users className="h-11 w-11" strokeWidth={2} />
            </div>
            <label className="w-full">
              <span className="sr-only">{t("contacts.groupName")}</span>
              <Input
                autoFocus
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={t("contacts.groupNamePlaceholder")}
                maxLength={40}
                className="h-13 rounded-2xl text-center font-display text-lg font-semibold border-2 focus-visible:border-primary focus-visible:ring-0"
              />
            </label>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {groupName.length}/40
            </p>
          </div>

          {/* Members preview */}
          <div>
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t("contacts.members")} · {selectedContacts.length}
              </h3>
              <button
                onClick={() => setStage("select")}
                className="text-xs font-semibold text-primary"
              >
                + {t("contacts.members")}
              </button>
            </div>
            <div className="rounded-2xl border bg-card divide-y divide-border/60 overflow-hidden">
              {selectedContacts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar
                    name={c.user.name}
                    gradient={c.user.avatar}
                    size="md"
                    online={c.user.online}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-sm">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {c.user.online
                        ? t("contacts.online")
                        : t("contacts.lastSeen", { when: c.lastSeen })}
                    </p>
                  </div>
                  <button
                    onClick={() => toggle(c.id)}
                    aria-label="remove"
                    className="h-7 w-7 rounded-full bg-muted hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-smooth"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky create bar */}
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-md p-4 z-40">
          <Button
            onClick={createGroup}
            disabled={selectedContacts.length < 2}
            className="w-full h-13 rounded-2xl bg-gradient-primary text-base font-semibold shadow-glow"
          >
            {t("contacts.startChat")}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Stage: browse / select ─────────────────────────────────────
  const inSelect = stage === "select";

  return (
    <div className={cn(inSelect && "pb-28")}>
      <PageHeader
        title={inSelect ? t("contacts.newGroup") : t("contacts.title")}
        back={!inSelect}
        left={
          inSelect ? (
            <button
              onClick={cancelSelect}
              aria-label={t("common.cancel")}
              className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-smooth"
            >
              <X className="h-4 w-4" />
            </button>
          ) : undefined
        }
        right={
          !inSelect ? (
            <button
              onClick={runSync}
              disabled={syncing}
              aria-label={t("contacts.resync")}
              className="h-10 w-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-smooth"
            >
              <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
            </button>
          ) : undefined
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

        {/* New group entry (browse only) */}
        {!inSelect && (
          <button
            onClick={enterSelect}
            className="w-full flex items-center gap-3 rounded-2xl bg-primary/10 hover:bg-primary/15 transition-smooth px-3 py-3"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <span className="font-semibold text-sm text-primary">{t("contacts.newGroup")}</span>
          </button>
        )}

        {/* Selected pills (select only, only when there are selections) */}
        {inSelect && selectedContacts.length > 0 && (
          <div className="rounded-2xl bg-primary/5 border border-primary/15 p-2.5 animate-fade-in">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {selectedContacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggle(c.id)}
                  className="shrink-0 flex items-center gap-1.5 bg-card pl-1 pr-2.5 py-1 rounded-full shadow-soft border"
                >
                  <Avatar name={c.user.name} gradient={c.user.avatar} size="xs" />
                  <span className="text-xs font-semibold max-w-[80px] truncate">
                    {c.name.split(" ")[0]}
                  </span>
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabs (browse only — select mode only shows On-app) */}
        {!inSelect && (
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
        )}

        {/* Privacy footnote */}
        {!inSelect && (
          <p className="text-[11px] text-muted-foreground px-1">{t("contacts.privacy")}</p>
        )}
      </div>

      {/* Loading state */}
      {syncing && registered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mb-2" />
          <p className="text-sm">{t("contacts.syncing")}</p>
        </div>
      )}

      {/* Registered list (always shown in select mode) */}
      {(inSelect || tab === "app") && (
        <div className="mt-2">
          {filteredReg.length === 0 && !syncing ? (
            <p className="text-center text-sm text-muted-foreground py-12">
              {t("contacts.empty")}
            </p>
          ) : (
            filteredReg.map((c) => {
              const isSelected = selected.has(c.id);
              const onRowClick = () => {
                if (inSelect) {
                  toggle(c.id);
                  return;
                }
                // Resolve to an existing chat for this user, else create one
                const existing = chatsStore.find((ch) => !ch.isGroup && ch.user.id === c.user.id);
                if (existing) {
                  navigate(`/chat/${existing.id}`);
                  return;
                }
                const newId = `c-${c.user.id}-${Date.now().toString(36)}`;
                chatsStore.unshift({
                  id: newId,
                  user: c.user,
                  lastMessage: "",
                  time: "",
                  unread: 0,
                });
                navigate(`/chat/${newId}`);
              };
              return (
                <div
                  key={c.id}
                  role="button"
                  tabIndex={0}
                  onClick={onRowClick}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick();
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 active:bg-muted/60 transition-smooth text-left cursor-pointer select-none",
                    inSelect && isSelected && "bg-primary/5",
                  )}
                >
                  {inSelect && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggle(c.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-5 w-5 rounded-md"
                    />
                  )}
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
                  {!inSelect && (
                    <Link
                      to={`/chat/${c.user.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center"
                      aria-label={t("contacts.message")}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Invite list (browse only) */}
      {!inSelect && tab === "invite" && (
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

      {/* Sticky bottom action bar (select mode) */}
      {inSelect && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-md p-4 z-40 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm">
              {t("contacts.selected", { n: selected.size })}
            </p>
            {selected.size < 2 && (
              <p className="text-[11px] text-muted-foreground">
                {t("contacts.minMembers")}
              </p>
            )}
          </div>
          <Button
            onClick={goToForm}
            disabled={selected.size < 2}
            className="h-12 px-6 rounded-2xl bg-gradient-primary font-semibold shadow-glow"
          >
            {t("contacts.next")}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
