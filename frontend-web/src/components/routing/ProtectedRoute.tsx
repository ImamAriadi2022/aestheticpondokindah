import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { getSession } from "@/features/auth/services/demoAuth";
import { clearSessionStorage, isSessionExpired, touchSessionLastActive } from "@/features/auth/services/sessionTtl";
import { logger } from "@/lib/logger";
import { canActivate, getRedirectPath, normalizeRole, ROLES, type AppRole } from "@/authorization";

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

  // Ambil session dari demo atau backend asli
  let session = getSession();
  if (!session) {
    const storedUser = localStorage.getItem("apident:user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const role = normalizeRole(user.role);
        session = { ...user, role };
      } catch (e) {
        logger.error("Gagal parse user session", e);
      }
    }
  }

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
