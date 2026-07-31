import type { AppRole } from "@/authorization";
import { ROLES } from "@/authorization";

export default {
  name: "Home",
  description: "Landing page sections (hero, services, gallery, testimonials, download, etc).",
  roles: [ROLES.GUEST, ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC],
  menu: false,
} as const;

export type HomeFeatureRole = AppRole;
