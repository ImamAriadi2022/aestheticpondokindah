export type AppRole = "user" | "doctor" | "clinic" | "guest";

export const ROLES = {
  GUEST: "guest",
  USER: "user",
  DOCTOR: "doctor",
  CLINIC: "clinic",
} as const;

export const AUTH_ROLES: AppRole[] = ["user", "doctor", "clinic"];

export const ROLE_LABELS: Record<AppRole, string> = {
  guest: "Pengunjung",
  user: "Client Klinik",
  doctor: "Dokter Klinik",
  clinic: "Admin Klinik",
};

export function normalizeRole(raw?: string | null): AppRole {
  if (raw === "patient") return ROLES.USER;
  if (raw === "clinic_admin") return ROLES.CLINIC;
  if (raw === ROLES.USER || raw === ROLES.DOCTOR || raw === ROLES.CLINIC) return raw;
  return ROLES.GUEST;
}

export function getDefaultDashboardPath(role: AppRole | string): string {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.DOCTOR) return "/dashboard/doctor";
  if (normalized === ROLES.CLINIC) return "/dashboard/clinic";
  return "/dashboard/user";
}
