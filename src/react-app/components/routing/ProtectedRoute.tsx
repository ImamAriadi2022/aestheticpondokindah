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
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
          <div className="font-semibold text-gray-900">Session tidak ditemukan</div>
          <div className="mt-2 text-gray-600 break-all">
            path: {location.pathname}
          </div>
          <div className="mt-3">
            <button
              className="px-3 py-2 rounded bg-black text-white"
              onClick={() => {
                navigate("/login");
              }}
            >
              Ke halaman login
            </button>
          </div>
        </div>
      </div>
    );
  }

  touchSessionLastActive();

  if (allow && !allow.includes(session.role)) {
    return <Navigate to={getDefaultDashboardPath(session.role)} replace />;
  }

  return children;
}
