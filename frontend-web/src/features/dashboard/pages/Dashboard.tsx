import { Navigate } from "react-router";
import { getDefaultDashboardPath, getSession } from "@/features/auth/services/session";

export default function DashboardPage() {
  // Ambil session dari backend asli
  const session = getSession();

  if (!session) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultDashboardPath(session.role)} replace />;
}
