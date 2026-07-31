import type { AppRole } from "@/authorization";
import { ROLES } from "@/authorization";

export default {
  name: "Authentication",
  description: "Login, registration, session management for all application roles.",
  roles: [ROLES.GUEST],
  menu: false,
} as const;

export type AuthFeatureRole = AppRole;
