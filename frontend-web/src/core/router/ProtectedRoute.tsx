import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { getSession } from "@/core/auth/services/session";
import { clearSessionStorage, isSessionExpired, touchSessionLastActive } from "@/core/auth/services/sessionTtl";
import { canActivate, getRedirectPath, normalizeRole, ROLES, type AppRole } from "@/core/permissions/index";

type Props = {
  children: ReactNode;
  allow?: AppRole[];
};

export default function ProtectedRoute({ children, allow }: Props) {
  const location = useLocation();

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

  const normalizedRole = normalizeRole((session as any)?.role);

  if (normalizedRole === ROLES.GUEST) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allow && !canActivate(normalizedRole, allow)) {
    return <Navigate to={getRedirectPath(normalizedRole)} replace />;
  }

  return children;
}
