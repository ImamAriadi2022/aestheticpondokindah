import {
  getDefaultDashboardPath as getRoleDashboardPath,
  normalizeRole,
  type AppRole,
} from "@/core/permissions/index";

export type AuthRole = Exclude<AppRole, "guest">;

export type AuthSession = {
  id: string;
  role: AuthRole;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  [key: string]: unknown;
};

const USER_KEY = "apident:user";

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as Record<string, unknown>;
    if (!user) return null;
    const role = normalizeRole(user?.role as string | undefined);
    if (role === "guest") return null;
    return { ...user, role } as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession) {
  localStorage.setItem(USER_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(USER_KEY);
  // Bersihkan data cache notifikasi agar tidak bocor ke akun berikutnya saat berganti login
  try {
    localStorage.removeItem("apid_seen_notification_keys");
    localStorage.removeItem("apid_read_notification_keys");
    localStorage.removeItem("apig_recent_push_notifications");
    localStorage.removeItem("apig_push_unread_count");
    localStorage.removeItem("apig_notifications_cache_v1");
  } catch {}
}

export function updateSessionProfile(updates: Partial<Omit<AuthSession, "id" | "role">>) {
  const session = getSession();
  if (!session) return;

  const updatedSession = { ...session, ...updates };
  setSession(updatedSession);
}

export const getDefaultDashboardPath = getRoleDashboardPath;
