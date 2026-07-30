import { type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { getDefaultDashboardPath, getSession, type DemoRole } from "@/react-app/lib/demoAuth";
import { clearSessionStorage, isSessionExpired, touchSessionLastActive } from "@/react-app/lib/sessionTtl";
import { logger } from "@/react-app/lib/logger";

type Props = {
  children: ReactNode;
  allow?: DemoRole[];
};

export default function ProtectedRoute({ children, allow }: Props) {
  const location = useLocation();
  const navigate = useNavigate();

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
        // Map role backend ke role yang diharapkan frontend jika perlu
        const role = user.role === "clinic_admin" ? "clinic" : 
                    user.role === "patient" ? "user" : user.role;
        
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

  const rawRole = (session as any)?.role;
  const normalizedRole: DemoRole =
    rawRole === "patient" ? "user" : rawRole === "clinic_admin" ? "clinic" : session.role;

  if (allow && !allow.includes(normalizedRole)) {
    return <Navigate to={getDefaultDashboardPath(normalizedRole)} replace />;
  }

  return children;
}
