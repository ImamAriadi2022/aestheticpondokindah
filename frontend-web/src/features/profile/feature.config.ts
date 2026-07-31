import type { AppRole } from "@/authorization";
import { ROLES } from "@/authorization";

export default {
  name: "Profile",
  description: "User profile settings and account security.",
  roles: [ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC],
  menu: true,
} as const;

export type ProfileFeatureRole = AppRole;
