import type { AppRole } from "@/authorization";
import { ROLES } from "@/authorization";

export default {
  name: "Doctors",
  description: "Public doctor directory and doctor schedule management.",
  roles: [ROLES.GUEST, ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC],
  menu: true,
} as const;

export type DoctorsFeatureRole = AppRole;
