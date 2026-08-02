import type { AppRole } from "@/core/permissions/index";
import { ROLES } from "@/core/permissions/index";

export default {
  name: "Authentication",
  description: "Login, registration, session management for all application roles.",
  roles: [ROLES.GUEST],
  menu: false,
} as const;

export type AuthFeatureRole = AppRole;
