import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Persistent OTP cooldown shared across pages, keyed per phone number.
 *
 * - Cooldown grows with each attempt: 30s, 60s, 120s, 300s, then locked.
 * - Lockout after MAX_ATTEMPTS within a rolling window until window expires.
 * - State is stored in localStorage so navigating between /auth and /otp
 *   (or reloading) keeps the same timer — users can't bypass by switching pages.
 */

const STORAGE_PREFIX = "sabai_otp_cooldown:";
const COOLDOWN_LADDER_MS = [30_000, 60_000, 120_000, 300_000]; // attempt 1..4
const MAX_ATTEMPTS = 5; // hard cap — after this we lock until window resets
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000; // 1 hour rolling window

type Stored = {
  attempts: number;
  nextAt: number; // epoch ms when resend allowed
  windowStart: number; // epoch ms when current attempt window started
};

const safeKey = (phone?: string | null) =>
  STORAGE_PREFIX + (phone?.replace(/\s+/g, "") || "default");

const read = (phone?: string | null): Stored => {
  if (typeof window === "undefined")
    return { attempts: 0, nextAt: 0, windowStart: Date.now() };
  try {
    const raw = localStorage.getItem(safeKey(phone));
    if (!raw) return { attempts: 0, nextAt: 0, windowStart: Date.now() };
    const parsed = JSON.parse(raw) as Stored;
    // Reset window if expired
    if (Date.now() - parsed.windowStart > ATTEMPT_WINDOW_MS) {
      return { attempts: 0, nextAt: 0, windowStart: Date.now() };
    }
    return parsed;
  } catch {
    return { attempts: 0, nextAt: 0, windowStart: Date.now() };
  }
};

const write = (phone: string | null | undefined, value: Stored) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(safeKey(phone), JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

export function useOtpCooldown(phone?: string | null) {
  const [state, setState] = useState<Stored>(() => read(phone));
  const [now, setNow] = useState(() => Date.now());
  const tickRef = useRef<number | null>(null);

  // Reload state when phone changes
  useEffect(() => {
    setState(read(phone));
    setNow(Date.now());
  }, [phone]);

  // Keep "now" ticking only while a cooldown is active
  useEffect(() => {
    const remaining = state.nextAt - now;
    if (remaining <= 0) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    if (tickRef.current == null) {
      tickRef.current = window.setInterval(() => setNow(Date.now()), 250);
    }
    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [state.nextAt, now]);

  // Sync across tabs / pages
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key === safeKey(phone)) {
        setState(read(phone));
        setNow(Date.now());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [phone]);

  const remainingMs = Math.max(0, state.nextAt - now);
  const remainingSec = Math.ceil(remainingMs / 1000);
  const locked = state.attempts >= MAX_ATTEMPTS && remainingMs > 0;
  const canResend = remainingMs <= 0 && !locked;

  /**
   * Snapshot of the previous state, captured by `trigger()` so the caller
   * can `rollback()` if the actual send request fails. Without this, a
   * failed send would consume an attempt and start the cooldown timer.
   */
  const prevRef = useRef<Stored | null>(null);

  /**
   * Optimistically advance the cooldown for a resend attempt. Returns true
   * when the action was allowed (cooldown advanced); false when blocked
   * (still cooling down or locked out). Always call BEFORE issuing the
   * actual resend request to prevent spam, and call `rollback()` if the
   * request ultimately fails so the user isn't punished.
   */
  const trigger = useCallback((): boolean => {
    const current = read(phone);
    const t = Date.now();
    if (current.nextAt > t) return false; // still cooling down
    if (current.attempts >= MAX_ATTEMPTS) return false;

    const nextAttempts = current.attempts + 1;
    const ladderIdx = Math.min(nextAttempts - 1, COOLDOWN_LADDER_MS.length - 1);
    const nextDelay = COOLDOWN_LADDER_MS[ladderIdx];
    const next: Stored = {
      attempts: nextAttempts,
      nextAt: t + nextDelay,
      windowStart: current.windowStart || t,
    };
    prevRef.current = current;
    write(phone, next);
    setState(next);
    setNow(t);
    return true;
  }, [phone]);

  /**
   * Revert the most recent `trigger()` — use when the OTP send request
   * fails so the cooldown isn't consumed by a failed delivery.
   */
  const rollback = useCallback(() => {
    const prev = prevRef.current;
    if (!prev) return;
    prevRef.current = null;
    write(phone, prev);
    setState(prev);
    setNow(Date.now());
  }, [phone]);

  const reset = useCallback(() => {
    if (typeof window !== "undefined") localStorage.removeItem(safeKey(phone));
    setState({ attempts: 0, nextAt: 0, windowStart: Date.now() });
  }, [phone]);

  return {
    /** Seconds left until next resend is allowed (0 when ready). */
    remainingSec,
    /** Whether the user is allowed to resend right now. */
    canResend,
    /** True when too many attempts — wait until cooldown expires. */
    locked,
    /** Number of resends issued in the current window. */
    attempts: state.attempts,
    /** Hard cap on attempts within the rolling window. */
    maxAttempts: MAX_ATTEMPTS,
    /** Call before issuing a resend — returns false if blocked. */
    trigger,
    /** Clear cooldown state (e.g. after successful verification). */
    reset,
  };
}
