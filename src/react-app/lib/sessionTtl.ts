export const SESSION_LAST_ACTIVE_KEY = "apident:last_active_ms";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function touchSessionLastActive(now = Date.now()) {
  try {
    localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(now));
  } catch {
    // ignore
  }
}

export function isSessionExpired(now = Date.now(), ttlMs = THIRTY_DAYS_MS) {
  try {
    const raw = localStorage.getItem(SESSION_LAST_ACTIVE_KEY);
    if (!raw) return false;
    const last = Number(raw);
    if (!Number.isFinite(last)) return false;
    return now - last > ttlMs;
  } catch {
    return false;
  }
}

export function clearSessionStorage() {
  try {
    localStorage.removeItem("apident:token");
    localStorage.removeItem("apident:user");
    localStorage.removeItem(SESSION_LAST_ACTIVE_KEY);
  } catch {
    // ignore
  }
}
