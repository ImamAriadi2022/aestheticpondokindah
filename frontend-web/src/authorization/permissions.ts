export type Permission =
  | "dashboard:view"
  | "booking:create"
  | "consultation:create"
  | "consultation:manage"
  | "complaint:create"
  | "complaint:manage"
  | "content:manage"
  | "users:manage"
  | "membership:view"
  | "membership:manage"
  | "doctors:manage"
  | "schedule:manage"
  | "profile:view"
  | "settings:view"
  | "notification:view";

export const PERMISSIONS = {
  VIEW_DASHBOARD: "dashboard:view",
  CREATE_BOOKING: "booking:create",
  CREATE_CONSULTATION: "consultation:create",
  MANAGE_CONSULTATION: "consultation:manage",
  CREATE_COMPLAINT: "complaint:create",
  MANAGE_COMPLAINT: "complaint:manage",
  MANAGE_CONTENT: "content:manage",
  MANAGE_USERS: "users:manage",
  VIEW_MEMBERSHIP: "membership:view",
  MANAGE_MEMBERSHIP: "membership:manage",
  MANAGE_DOCTORS: "doctors:manage",
  MANAGE_SCHEDULE: "schedule:manage",
  VIEW_PROFILE: "profile:view",
  VIEW_SETTINGS: "settings:view",
  VIEW_NOTIFICATION: "notification:view",
} as const;
