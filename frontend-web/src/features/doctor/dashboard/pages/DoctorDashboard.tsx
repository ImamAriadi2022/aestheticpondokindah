import { Navigate, useSearchParams, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import DesktopDoctorHome from "../components/DesktopDoctorHome";
import { getSession } from "@/core/auth/services/session";
import { toast } from "@/shared/ui/toast";
import { getDoctorScheduledConsultations, type ConsultationItem } from "@/features/patient/consultation/services/consultationApi";
import {
  getDoctorSchedules,
  type DoctorScheduleItem,
} from "@/features/doctor/schedule/services/doctorScheduleApi";
import { getDoctorQueue, type DoctorQueueItem } from "../services/doctorDashboardService";
import DoctorSchedulePage from "@/features/doctor/schedule/pages/DoctorSchedulePage";
import DoctorReservationPage from "@/features/doctor/reservation/pages/DoctorReservationPage";
import DoctorConsultationPage from "@/features/doctor/consultation/pages/DoctorConsultationPage";

export default function DoctorDashboardPage() {
  const session = getSession()!;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [reservations, setReservations] = useState<DoctorQueueItem[]>([]);
  const [schedules, setSchedules] = useState<DoctorScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  const fetchSchedules = () => {
    setLoadingSchedules(true);
    getDoctorSchedules()
      .then((data) => setSchedules(data))
      .catch(() => {
        toast({ title: "Gagal", message: "Tidak bisa memuat jadwal praktik", variant: "error" });
      })
      .finally(() => setLoadingSchedules(false));
  };

  useEffect(() => {
    if (activeTab === "jadwal" || activeTab === "dashboard") {
      fetchSchedules();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "dashboard") {
      getDoctorScheduledConsultations()
        .then((data) => setConsultations(data))
        .catch(() => {});

      getDoctorQueue()
        .then((queue) => setReservations(queue))
        .catch(() => setReservations([]));
    }
  }, [activeTab]);

  const mySchedules = schedules;
  const myClients = consultations;

  const myReservations = useMemo(() => {
    return [...reservations].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return Number(b.id || 0) - Number(a.id || 0);
    });
  }, [reservations]);

  const completedCount = useMemo(
    () =>
      myReservations.filter((r) => r.status === "Selesai").length +
      myClients.filter((c) => c.status === "Selesai").length,
    [myReservations, myClients]
  );

  const renderContent = () => {
    switch (activeTab) {
      // Tab 1: Jadwal Praktik Dokter
      case "jadwal":
        return <DoctorSchedulePage schedules={mySchedules} onRefresh={fetchSchedules} />;

      // Tab 2: Reservasi Pasien Dokter (Tindakan & Periksa Medis)
      case "reservasi":
      case "klien":
        return <DoctorReservationPage />;

      // Tab 3: Konsultasi Online Dokter
      case "konsultasi":
        return <DoctorConsultationPage />;

      // Tab Utama: Dashboard Home Dokter
      default:
        return (
          <DesktopDoctorHome
            session={session}
            schedules={mySchedules}
            clients={myClients}
            completedCount={completedCount}
            onAddSchedule={() => navigate("/dashboard/doctor/schedule/new")}
          />
        );
    }
  };

  if (!session) return <Navigate to="/login" replace />;

  return (
    <DashboardLayout role="doctor">
      {renderContent()}
    </DashboardLayout>
  );
}
