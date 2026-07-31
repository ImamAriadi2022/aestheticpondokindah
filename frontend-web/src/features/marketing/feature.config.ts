import type { AppRole } from "@/authorization";
import { ROLES } from "@/authorization";

export default {
  name: "Marketing",
  description: "Public marketing pages (home, about, doctors, blog, promo, download, contact, legal).",
  roles: [ROLES.GUEST, ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC],
  menu: false,
} as const;

export type MarketingFeatureRole = AppRole;
