import { PERMISSIONS, type Permission } from "@/core/permissions/permissions";
import { ROLES, type AppRole } from "@/core/permissions/roles";

export type FeatureKey =
  | "auth"
  | "home"
  | "marketing"
  | "doctors"
  | "reservation"
  | "consultation"
  | "membership"
  | "profile"
  | "mobile"
  | "dashboard";

export const FEATURE_ROLES: Record<FeatureKey, AppRole[]> = {
  auth: [ROLES.GUEST],
  home: [ROLES.GUEST, ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC, ROLES.DEVELOPER],
  marketing: [ROLES.GUEST, ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC, ROLES.DEVELOPER],
  doctors: [ROLES.GUEST, ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC, ROLES.DEVELOPER],
  reservation: [ROLES.USER, ROLES.CLINIC, ROLES.DEVELOPER],
  consultation: [ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC, ROLES.DEVELOPER],
  membership: [ROLES.USER, ROLES.CLINIC, ROLES.DEVELOPER],
  profile: [ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC, ROLES.DEVELOPER],
  mobile: [ROLES.GUEST, ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC, ROLES.DEVELOPER],
  dashboard: [ROLES.USER, ROLES.DOCTOR, ROLES.CLINIC, ROLES.DEVELOPER],
};

export const FEATURE_PERMISSIONS: Record<FeatureKey, Permission[]> = {
  auth: [],
  home: [],
  marketing: [],
  doctors: [],
  reservation: [PERMISSIONS.CREATE_BOOKING],
  consultation: [
    PERMISSIONS.CREATE_CONSULTATION,
    PERMISSIONS.CREATE_COMPLAINT,
    PERMISSIONS.MANAGE_CONSULTATION,
    PERMISSIONS.MANAGE_COMPLAINT,
  ],
  membership: [PERMISSIONS.VIEW_MEMBERSHIP, PERMISSIONS.MANAGE_MEMBERSHIP],
  profile: [PERMISSIONS.VIEW_PROFILE, PERMISSIONS.VIEW_SETTINGS],
  mobile: [],
  dashboard: [PERMISSIONS.VIEW_DASHBOARD],
};

export function canAccessFeature(role: AppRole, feature: FeatureKey): boolean {
  return FEATURE_ROLES[feature]?.includes(role) ?? false;
}

export function getFeaturePermissions(feature: FeatureKey): Permission[] {
  return FEATURE_PERMISSIONS[feature] ?? [];
}
