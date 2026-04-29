// Contacts sync — privacy-first matching.
//
// Real flow on a native device would request permission, read the address
// book, normalize each phone number to E.164, hash it (SHA-256) and send
// only the hashes to the server, which compares against hashed registered
// numbers. The server never sees raw phone numbers it doesn't already know.
//
// In this web preview we simulate the same shape: a mock device address
// book + a mock list of "registered" SABAI users. Matching happens locally
// against hashed numbers so the privacy contract is honoured even in mock.

import { users, type User } from "@/lib/mock-data";

export type DeviceContact = {
  /** Local-only identifier from the device address book. */
  id: string;
  /** Display name as stored on the device. */
  name: string;
  /** Raw phone in any format — normalized before hashing. */
  phone: string;
};

export type RegisteredContact = DeviceContact & {
  user: User;
  lastSeen: string;
};

export type ContactPermission = "unknown" | "granted" | "denied";

const PERMISSION_KEY = "sabai_contacts_permission";
const SYNCED_KEY = "sabai_contacts_synced_at";

export const getPermission = (): ContactPermission => {
  if (typeof window === "undefined") return "unknown";
  return (localStorage.getItem(PERMISSION_KEY) as ContactPermission) || "unknown";
};

export const setPermission = (p: ContactPermission) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(PERMISSION_KEY, p);
};

export const getLastSyncedAt = (): number | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SYNCED_KEY);
  return raw ? Number(raw) : null;
};

const markSynced = () => {
  if (typeof window !== "undefined")
    localStorage.setItem(SYNCED_KEY, String(Date.now()));
};

/** Normalize a phone number to a digits-only E.164-ish form before hashing. */
export const normalizePhone = (raw: string): string => {
  const trimmed = raw.replace(/[^\d+]/g, "");
  if (trimmed.startsWith("+")) return "+" + trimmed.slice(1).replace(/\D/g, "");
  // Heuristic: assume Lao default for un-prefixed local numbers in this demo.
  if (trimmed.startsWith("0")) return "+856" + trimmed.slice(1);
  return "+" + trimmed;
};

/**
 * SHA-256 hash via SubtleCrypto. We hash the normalized phone before any
 * comparison so raw numbers are never directly compared against registered
 * users — matching the secure-sync contract.
 */
export const hashPhone = async (phone: string): Promise<string> => {
  const normalized = normalizePhone(phone);
  if (typeof window === "undefined" || !window.crypto?.subtle) {
    // Fallback: not cryptographically secure, but lets SSR / tests run.
    let h = 0;
    for (let i = 0; i < normalized.length; i++) h = (h * 31 + normalized.charCodeAt(i)) | 0;
    return "fallback_" + h.toString(16);
  }
  const buf = new TextEncoder().encode(normalized);
  const digest = await window.crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Mock "device address book" — what we'd receive from the OS contacts API.
export const mockDeviceContacts: DeviceContact[] = [
  { id: "d1", name: "พิมพ์ชนก",        phone: "+856 20 5512 3401" }, // -> u1
  { id: "d2", name: "ธนกร วงศ์ใหญ่",   phone: "+66 81 234 5678"  }, // -> u2
  { id: "d3", name: "Mei Lin",          phone: "+86 131 1234 5678" }, // -> u3
  { id: "d4", name: "อาทิตย์ ส.",       phone: "+856 20 9988 1122" }, // -> u4
  { id: "d5", name: "Sora Cafe",        phone: "+856 21 555 0199"  }, // -> u5
  { id: "d6", name: "นัทธมน",          phone: "+66 89 765 4321"  }, // -> u6
  { id: "d7", name: "Kevin Tan",        phone: "+65 9123 4567"    }, // -> u7
  { id: "d8", name: "ใบเตย",           phone: "+856 20 7777 8888" }, // -> u8
  // Unregistered — these will appear in the "Invite" list.
  { id: "d9",  name: "แม่",             phone: "+66 89 111 2222" },
  { id: "d10", name: "พ่อ",             phone: "+66 89 222 3333" },
  { id: "d11", name: "Alex Johnson",    phone: "+1 415 555 0148" },
  { id: "d12", name: "เพื่อนใหม่",      phone: "+856 20 4444 5555" },
];

// Phone numbers of registered users — paired by index with `users`.
// In production this lives only on the server and is queried by hash.
const registeredPhones: string[] = [
  "+856 20 5512 3401",
  "+66 81 234 5678",
  "+86 131 1234 5678",
  "+856 20 9988 1122",
  "+856 21 555 0199",
  "+66 89 765 4321",
  "+65 9123 4567",
  "+856 20 7777 8888",
];

const lastSeenSamples = [
  "เมื่อสักครู่",
  "5 นาทีที่แล้ว",
  "1 ชั่วโมงที่แล้ว",
  "วันนี้",
  "เมื่อวาน",
];

export type SyncResult = {
  registered: RegisteredContact[];
  unregistered: DeviceContact[];
};

/**
 * Simulated secure sync.
 *
 * 1. Hash every device phone client-side.
 * 2. Hash every "server" registered phone (in production this set is
 *    pre-hashed and stored).
 * 3. Match by hash only — never by raw number.
 */
export const syncContacts = async (): Promise<SyncResult> => {
  const [deviceHashes, registeredHashes] = await Promise.all([
    Promise.all(mockDeviceContacts.map(async (c) => [c.id, await hashPhone(c.phone)] as const)),
    Promise.all(registeredPhones.map(hashPhone)),
  ]);

  const hashToUser = new Map<string, User>();
  registeredHashes.forEach((h, i) => hashToUser.set(h, users[i]));

  const registered: RegisteredContact[] = [];
  const unregistered: DeviceContact[] = [];

  deviceHashes.forEach(([id, h], idx) => {
    const contact = mockDeviceContacts[idx];
    const user = hashToUser.get(h);
    if (user) {
      registered.push({
        ...contact,
        user,
        lastSeen: user.online ? "online" : lastSeenSamples[idx % lastSeenSamples.length],
      });
    } else {
      unregistered.push(contact);
    }
  });

  markSynced();
  return { registered, unregistered };
};

/** Build an SMS invite link for an unregistered contact. */
export const buildInviteLink = (phone: string, message: string): string => {
  const normalized = normalizePhone(phone).replace(/\+/g, "");
  return `sms:+${normalized}?&body=${encodeURIComponent(message)}`;
};
