import type { AppRole } from "@/authorization";
import { ROLES } from "@/authorization";

export default {
  name: "Dashboard",
  description: "Role-based home dashboards for user, doctor, and clinic with analytics and management panels.",
  roles: [ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC],
  menu: true,
} as const;

export type DashboardFeatureRole = AppRole;
