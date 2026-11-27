import { Navigate } from "react-router";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { getSession } from "@/core/auth/services/session";
import DoctorSchedulePage from "@/features/doctor/schedule/pages/DoctorSchedulePage";

export default function DoctorDashboardPage() {
  const session = getSession();

  if (!session) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout role="doctor">
      <DoctorSchedulePage />
    </DashboardLayout>
  );
}
