import { Navigate, useSearchParams, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import DesktopDoctorHome from "@/features/doctor/dashboard/components/DesktopDoctorHome";
import { Button } from "@/shared/ui/button";
import { getSession } from "@/core/auth/services/session";
import {
  Calendar, Plus, Pencil, Trash2, Loader2,
} from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { getDoctorScheduledConsultations, type ConsultationItem } from "@/features/patient/consultation/services/consultationApi";
import {
  getDoctorSchedules,
  deleteDoctorSchedule,
  type DoctorScheduleItem,
} from "@/features/doctor/schedule/services/doctorScheduleApi";
import { apiClient } from "@/core/api/apiClient";
import DoctorConsultationList from "@/features/doctor/consultation/scheduled/pages/ScheduledConsultationListPage";
import DoctorReservationList from "@/features/doctor/reservation/components/ReservationList";

interface DoctorQueueItem {
  id: string;
  date?: string;
  status?: string;
}

export default function DoctorDashboardPage() {
  const session = getSession()!;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);

  const [reservations, setReservations] = useState<DoctorQueueItem[]>([]);

  const [schedules, setSchedules] = useState<DoctorScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === "jadwal" || activeTab === "dashboard") {
      setLoadingSchedules(true);
      getDoctorSchedules()
        .then((data) => setSchedules(data))
        .catch(() => {
          toast({ title: "Gagal", message: "Tidak bisa memuat jadwal", variant: "error" });
        })
        .finally(() => setLoadingSchedules(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "dashboard") {
      getDoctorScheduledConsultations()
        .then((data) => setConsultations(data))
        .catch(() => {});
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "dashboard") {
      apiClient
        .get<{ queue: DoctorQueueItem[] }>("/doctor/queue")
        .then((res) => setReservations(res.queue || []))
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
    () => myReservations.filter((r) => r.status === "Selesai").length + myClients.filter((c) => c.status === "Selesai").length,
    [myReservations, myClients]
  );

  const renderContent = () => {
    switch (activeTab) {
      case "jadwal":
        return (
          <div className="space-y-6">
            {/* Modern Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Jadwal Praktik Dokter</h2>
                <p className="text-sm text-[#8A7B6B] mt-1">Kelola waktu dan slot tempat praktik Anda</p>
              </div>
              <Button
                onClick={() => navigate("/dashboard/doctor/schedule/new")}
                className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl text-sm h-10 shadow-md shadow-[#C9A24A]/20"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Jadwal
              </Button>
            </div>

            {/* Modern Table */}
            <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {loadingSchedules ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-7 h-7 text-[#C9A24A] animate-pulse" />
                    </div>
                    <p className="text-[#4A3F35] font-medium">Memuat jadwal...</p>
                  </div>
                ) : mySchedules.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-7 h-7 text-[#B8A99A]" />
                    </div>
                    <p className="text-[#4A3F35] font-medium">Belum ada jadwal</p>
                    <p className="text-sm text-[#B8A99A] mt-1">Jadwal praktik Anda akan muncul di sini</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F0E6D3]">
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Tanggal</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Jam Praktik</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Lokasi / Cabang</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Slot Terisi</th>
                        <th className="text-right py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mySchedules.map((s) => (
                        <tr key={s.id} className="border-b border-[#F5F0E8] hover:bg-[#FDF8F0]/50 transition-colors">
                          <td className="py-4 px-5 font-semibold text-[#4A3F35]">{s.displayDate || s.date}</td>
                          <td className="py-4 px-5 text-[#4A3F35] font-medium">{s.timeRange}</td>
                          <td className="py-4 px-5 text-[#8A7B6B]">{s.location}</td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${s.isFull ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                              {s.bookedSlots}/{s.totalSlots} Terisi
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/dashboard/doctor/schedule/edit/${s.id}`)}
                                className="w-8 h-8 p-0 rounded-full text-[#B8943F] hover:text-[#8A6B2B] hover:bg-[#F5E6C8]"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={deletingScheduleId === s.id}
                                onClick={async () => {
                                  if (window.confirm("Yakin ingin menghapus jadwal ini?")) {
                                    setDeletingScheduleId(s.id);
                                    try {
                                      await deleteDoctorSchedule(s.id);
                                      setSchedules((prev) => prev.filter((x) => x.id !== s.id));
                                      toast({ title: "Berhasil", message: "Jadwal dihapus", variant: "success" });
                                    } catch {
                                      toast({ title: "Gagal", message: "Tidak bisa menghapus jadwal", variant: "error" });
                                    } finally {
                                      setDeletingScheduleId(null);
                                    }
                                  }
                                }}
                                className="w-8 h-8 p-0 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                {deletingScheduleId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        );

      // Fitur Terpisah 1: Reservasi Pasien Dokter (Tindakan Periksa Medis)
      case "reservasi":
      case "klien":
        return <DoctorReservationList />;

      // Fitur Terpisah 2: Konsultasi Online Dokter
      case "konsultasi":
        return <DoctorConsultationList />;

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
