export type AppRole = "user" | "doctor" | "clinic" | "developer" | "guest";

export const ROLES = {
  GUEST: "guest",
  USER: "user",
  DOCTOR: "doctor",
  CLINIC: "clinic",
  DEVELOPER: "developer",
} as const;

export const AUTH_ROLES: AppRole[] = ["user", "doctor", "clinic", "developer"];

export const ROLE_LABELS: Record<AppRole, string> = {
  guest: "Pengunjung",
  user: "Client Klinik",
  doctor: "Dokter Klinik",
  clinic: "Admin Klinik",
  developer: "Developer API & System",
};

export function normalizeRole(raw?: string | null): AppRole {
  if (!raw) return ROLES.GUEST;
  const lower = String(raw).toLowerCase().trim();
  if (lower === "guest" || lower === "anonymous") return ROLES.GUEST;
  if (lower === "developer" || lower === "dev") return ROLES.DEVELOPER;
  if (lower === "clinic_admin" || lower === "admin" || lower === "clinic" || lower === "klinik") return ROLES.CLINIC;
  if (lower === "doctor" || lower === "dokter") return ROLES.DOCTOR;
  if (lower === "patient" || lower === "user" || lower === "client" || lower === "pasien") return ROLES.USER;
  if (lower === ROLES.USER || lower === ROLES.DOCTOR || lower === ROLES.CLINIC || lower === ROLES.DEVELOPER) return lower;
  return ROLES.USER;
}

export function getDefaultDashboardPath(role?: AppRole | string | null): string {
  const normalized = normalizeRole(role);
  if (normalized === ROLES.DEVELOPER) return "/docs-api";
  if (normalized === ROLES.DOCTOR) return "/dashboard/doctor";
  if (normalized === ROLES.CLINIC) return "/dashboard/clinic";
  return "/dashboard/user";
}
