import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { getSession } from "@/core/auth/services/session";
import { clearSessionStorage, isSessionExpired, touchSessionLastActive } from "@/core/auth/services/sessionTtl";
import { canActivate, getRedirectPath, normalizeRole, ROLES, type AppRole } from "@/core/permissions/index";

type Props = {
  children: ReactNode;
  allow?: AppRole[];
  /** When true, the route is reachable without a session (e.g. guest consultation by token). */
  guestAccessible?: boolean;
};

export default function ProtectedRoute({ children, allow, guestAccessible }: Props) {
  const location = useLocation();

  // Guest-accessible routes (e.g. resume consultation via token) are public.
  if (guestAccessible) {
    return <>{children}</>;
  }

  if (isSessionExpired()) {
    clearSessionStorage();
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Ambil session dari backend asli
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  touchSessionLastActive();

  const normalizedRole = normalizeRole((session as { role?: unknown })?.role as string);

  if (normalizedRole === ROLES.GUEST) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allow && !canActivate(normalizedRole, allow)) {
    return <Navigate to={getRedirectPath(normalizedRole)} replace />;
  }

  return children;
}
