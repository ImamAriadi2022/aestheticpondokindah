export const SESSION_LAST_ACTIVE_KEY = "apident:last_active_ms";

export const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000; // 10 days

export function touchSessionLastActive(now = Date.now()) {
  try {
    localStorage.setItem(SESSION_LAST_ACTIVE_KEY, String(now));
  } catch {
    // ignore
  }
}

export function isSessionExpired(now = Date.now(), ttlMs = TEN_DAYS_MS) {
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
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");
    localStorage.removeItem(SESSION_LAST_ACTIVE_KEY);
  } catch {
    // ignore
  }
}
