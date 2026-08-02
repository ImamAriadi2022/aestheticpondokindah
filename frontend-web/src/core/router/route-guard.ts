import { getDefaultDashboardPath, normalizeRole, type AppRole } from "@/core/permissions/roles";

export interface SessionSnapshot {
  role?: string | null;
}

export function resolveRole(session: SessionSnapshot | null | undefined): AppRole {
  return normalizeRole(session?.role);
}

export function canActivate(role: AppRole, allow?: AppRole[]): boolean {
  if (role === "guest") return false;
  if (!allow || allow.length === 0) return true;
  return allow.includes(role);
}

export function getRedirectPath(role: AppRole, fallbackPath?: string): string {
  if (role === "guest") return "/login";
  return getDefaultDashboardPath(role);
}
