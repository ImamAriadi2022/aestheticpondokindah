import { Navigate, useSearchParams, useNavigate } from "react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import DesktopDoctorHome from "../components/DesktopDoctorHome";
import { getSession } from "@/core/auth/services/session";
import {
  getDoctorSchedules,
  type DoctorScheduleItem,
} from "@/features/doctor/schedule/services/doctorScheduleApi";
import { getDoctorQueue, type DoctorQueueItem } from "../services/doctorDashboardService";
import DoctorSchedulePage from "@/features/doctor/schedule/pages/DoctorSchedulePage";
import DoctorReservationPage from "@/features/doctor/reservation/pages/DoctorReservationPage";
import DoctorGuideView from "@/features/guest/help/components/DoctorGuideView";

export default function DoctorDashboardPage() {
  const session = getSession()!;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [reservations, setReservations] = useState<DoctorQueueItem[]>(() => {
    try {
      const cached = localStorage.getItem("apig_doctor_cached_patients");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [schedules, setSchedules] = useState<DoctorScheduleItem[]>(() => {
    try {
      const cached = localStorage.getItem("apig_doctor_cached_schedules");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loadingSchedules, setLoadingSchedules] = useState(schedules.length === 0);
  const schedulesFetchedRef = useRef(false);

  // 1. JADWAL DOKTER: One-time fetch (Bukan Realtime Polling)
  const fetchSchedules = async () => {
    try {
      const data = await getDoctorSchedules();
      if (Array.isArray(data) && data.length > 0) {
        setSchedules(data);
        localStorage.setItem("apig_doctor_cached_schedules", JSON.stringify(data));
      }
    } catch {
      // Pertahankan data cache jika terjadi gangguan sementara
    } finally {
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    if (!schedulesFetchedRef.current && (activeTab === "jadwal" || activeTab === "dashboard")) {
      schedulesFetchedRef.current = true;
      fetchSchedules();
    }
  }, [activeTab]);

  // 2. DAFTAR PASIEN DI DASHBOARD HOME (One-time fetch saat di home dashboard)
  useEffect(() => {
    if (activeTab === "dashboard") {
      getDoctorQueue()
        .then((queue) => {
          if (Array.isArray(queue) && queue.length > 0) {
            setReservations(queue);
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  const mySchedules = schedules;

  const myReservations = useMemo(() => {
    return [...reservations].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return Number(b.id || 0) - Number(a.id || 0);
    });
  }, [reservations]);

  const completedCount = useMemo(
    () => myReservations.filter((r) => r.status === "Selesai").length,
    [myReservations]
  );

  const renderContent = () => {
    switch (activeTab) {
      // Tab 1: Jadwal Praktik Dokter (Bukan realtime, cukup one-time fetch)
      case "jadwal":
        return <DoctorSchedulePage schedules={mySchedules} onRefresh={fetchSchedules} />;

      // Tab 2: Pasien Saya / Reservasi Perawatan Medis (Realtime di handle oleh ReservationList)
      case "reservasi":
      case "pasien":
      case "klien":
        return <DoctorReservationPage />;

      // Tab 3: Panduan Dokter Spesialis
      case "panduan":
      case "help":
        return <DoctorGuideView />;

      // Tab Utama: Dashboard Home Dokter
      default:
        return (
          <DesktopDoctorHome
            session={session}
            schedules={mySchedules}
            reservations={myReservations}
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
