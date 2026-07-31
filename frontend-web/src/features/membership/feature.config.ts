import type { AppRole } from "@/authorization";
import { ROLES } from "@/authorization";

export default {
  name: "Membership",
  description: "Membership plans, tiers, and admin management.",
  roles: [ROLES.USER, ROLES.CLINIC],
  menu: true,
} as const;

export type MembershipFeatureRole = AppRole;
