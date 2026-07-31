import { Navigate } from "react-router";
import { getDefaultDashboardPath, getSession } from "@/features/auth/services/demoAuth";
import { logger } from "@/lib/logger";

export default function DashboardPage() {
  // Ambil session dari demo atau backend asli
  let session = getSession();
  if (!session) {
    const storedUser = localStorage.getItem("apident:user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // Map role backend ke role yang diharapkan frontend
        const role = user.role === "clinic_admin" ? "clinic" : 
                    user.role === "patient" ? "user" : user.role;
        session = { ...user, role };
      } catch (e) {
        logger.error("Gagal parse user session", e);
      }
    }
  }

  if (!session) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultDashboardPath(session.role)} replace />;
}
