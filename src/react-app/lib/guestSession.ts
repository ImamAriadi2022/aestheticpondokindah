/**
 * Guest Session Cache Manager with Expiration, Versioning, and Corruption Protection
 * Aesthetic Pondok Indah Dental Clinic
 */

const GUEST_ID_KEY = "apig_guest_id_v1";
const GUEST_CACHE_VERSION = "1.0.0";
const GUEST_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 Hari TTL

interface GuestSessionData {
  id: string;
  version: string;
  createdAt: number;
  expiresAt: number;
}

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const isValidUuidOrId = (id: string): boolean => {
  if (!id || typeof id !== "string") return false;
  // Format check: minimum 10 chars, no suspicious script tags
  return id.length >= 10 && !/[<>{}]/.test(id);
};

export const getOrCreateGuestId = (): string => {
  try {
    const raw = window.localStorage.getItem(GUEST_ID_KEY);
    if (raw) {
      const data: GuestSessionData = JSON.parse(raw);
      const now = Date.now();

      // Check version, expiration, and format validity
      if (
        data &&
        data.version === GUEST_CACHE_VERSION &&
        data.expiresAt > now &&
        isValidUuidOrId(data.id)
      ) {
        return data.id;
      }
      // Outdated or expired: remove invalid cache
      window.localStorage.removeItem(GUEST_ID_KEY);
    }
  } catch (error) {
    // Corrupted cache detection
    console.warn("[GuestSession] Corrupted cache detected, resetting guest session:", error);
    window.localStorage.removeItem(GUEST_ID_KEY);
  }

  // Create fresh validated guest session
  const newId = generateId();
  const sessionData: GuestSessionData = {
    id: newId,
    version: GUEST_CACHE_VERSION,
    createdAt: Date.now(),
    expiresAt: Date.now() + GUEST_SESSION_TTL_MS,
  };

  try {
    window.localStorage.setItem(GUEST_ID_KEY, JSON.stringify(sessionData));
  } catch (e) {
    console.error("[GuestSession] Failed to save session to localStorage:", e);
  }

  return newId;
};

export const clearGuestId = () => {
  try {
    window.localStorage.removeItem(GUEST_ID_KEY);
  } catch (e) {
    console.error("[GuestSession] Error clearing guest id:", e);
  }
};
