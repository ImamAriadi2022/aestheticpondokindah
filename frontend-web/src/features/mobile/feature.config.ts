import type { AppRole } from "@/authorization";
import { ROLES } from "@/authorization";

export default {
  name: "Mobile",
  description: "Mobile-first PWA pages for booking, consultations, history, and account.",
  roles: [ROLES.GUEST, ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC],
  menu: false,
} as const;

export type MobileFeatureRole = AppRole;
