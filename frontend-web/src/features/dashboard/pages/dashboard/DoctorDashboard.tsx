import { Navigate, useSearchParams, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DesktopDoctorHome from "@/components/dashboard/DesktopDoctorHome";
import { Button } from "@/components/ui/button";
import { getSession } from "@/features/auth/services/session";
import {
  Calendar, Users, Plus, Pencil, Trash2, Loader2,
  Stethoscope, MessageSquare, Play, CheckCircle2,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { getDoctorScheduledConsultations, type ConsultationItem } from "@/features/consultation/services/consultationApi";
import {
  getDoctorSchedules,
  deleteDoctorSchedule,
  type DoctorScheduleItem,
} from "@/features/doctors/services/doctorScheduleApi";
import { apiClient } from "@/shared/lib/apiClient";

export default function DoctorDashboardPage() {
  const session = getSession()!;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "dashboard";

  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);

  const [reservations, setReservations] = useState<any[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  const [schedules, setSchedules] = useState<DoctorScheduleItem[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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
    if (activeTab === "konsultasi" || activeTab === "dashboard") {
      setLoadingConsultations(true);
      getDoctorScheduledConsultations()
        .then((data) => setConsultations(data))
        .catch(() => {})
        .finally(() => setLoadingConsultations(false));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "reservasi" || activeTab === "klien" || activeTab === "dashboard") {
      setLoadingReservations(true);
      apiClient
        .get<{ queue: any[] }>("/doctor/queue")
        .then((res) => setReservations(res.queue || []))
        .catch(() => setReservations([]))
        .finally(() => setLoadingReservations(false));
    }
  }, [activeTab]);

  const handleStartConsultation = async (resId: string) => {
    setActionLoadingId(resId);
    try {
      await apiClient.put(`/doctor/reservations/${resId}/start`);
      toast({ title: "Berhasil", message: "Perawatan/Konsultasi telah dimulai.", variant: "success" });
      const updatedQueue = await apiClient.get<{ queue: any[] }>("/doctor/queue");
      setReservations(updatedQueue.queue || []);
    } catch (e: any) {
      toast({ title: "Gagal", message: e.message || "Gagal memulai perawatan", variant: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteConsultation = async (resId: string) => {
    setActionLoadingId(resId);
    try {
      await apiClient.put(`/doctor/reservations/${resId}/complete`);
      toast({ title: "Berhasil", message: "Perawatan/Konsultasi telah diselesaikan.", variant: "success" });
      const updatedQueue = await apiClient.get<{ queue: any[] }>("/doctor/queue");
      setReservations(updatedQueue.queue || []);
    } catch (e: any) {
      toast({ title: "Gagal", message: e.message || "Gagal menyelesaikan perawatan", variant: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

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
      case "klien": {
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#F0E6D3] pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#4A3F35]">Reservasi Perawatan Pasien Saya</h2>
                <p className="text-xs text-[#8A7B6B]">Daftar pasien yang memilih Anda sebagai dokter periksa & tindakan medis di klinik</p>
              </div>
              <span className="px-3 py-1 bg-[#F5E6C8] text-[#8A6B2B] text-xs font-bold rounded-full border border-[#E8D4A2]">
                Total: {myReservations.length} Pasien
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {loadingReservations ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin mx-auto mb-2" />
                    <p className="text-xs text-[#8A7B6B]">Memuat reservasi pasien dokter...</p>
                  </div>
                ) : myReservations.length === 0 ? (
                  <div className="text-center py-12 text-[#B8A99A]">
                    <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Belum Ada Reservasi Pasien</p>
                    <p className="text-xs mt-1">Pasien yang memilih Anda untuk tindakan periksa akan muncul di sini</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F0E6D3] bg-[#FDF8F0]/60 text-left text-xs font-bold text-[#8A7B6B] uppercase tracking-wider">
                        <th className="py-3.5 px-4">Pasien</th>
                        <th className="py-3.5 px-4">Kontak</th>
                        <th className="py-3.5 px-4">Jadwal Periksa</th>
                        <th className="py-3.5 px-4">Perawatan / Keluhan</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Aksi Praktik</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F0E8] text-xs text-[#4A3F35]">
                      {myReservations.map((r) => (
                        <tr key={r.id} className="hover:bg-[#FDF8F0]/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-900">
                            <div>{r.patient_name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">#{r.code || r.id}</div>
                          </td>
                          <td className="py-3.5 px-4">{r.patient_phone}</td>
                          <td className="py-3.5 px-4 font-medium text-[#c9a24a]">
                            {r.date} &bull; {r.preferred_time}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs truncate">
                            <span className="font-semibold text-gray-800">{r.treatment_interest || "Pemeriksaan"}</span>
                            <div className="text-[11px] text-gray-500 truncate">{r.complaint}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              r.status === "Selesai"
                                ? "bg-emerald-100 text-emerald-700"
                                : r.status === "Dikonfirmasi"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {r.status === "Dikonfirmasi" || r.status === "Baru" ? (
                              <Button
                                size="sm"
                                disabled={actionLoadingId === r.id}
                                onClick={() => handleStartConsultation(r.id)}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold h-8 text-[11px] rounded-lg shadow-sm"
                              >
                                {actionLoadingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                                Mulai Periksa
                              </Button>
                            ) : r.status === "Dalam Konsultasi" ? (
                              <Button
                                size="sm"
                                disabled={actionLoadingId === r.id}
                                onClick={() => handleCompleteConsultation(r.id)}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold h-8 text-[11px] rounded-lg shadow-sm"
                              >
                                {actionLoadingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                                Selesaikan Perawatan
                              </Button>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                              </span>
                            )}
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
      }

      // Fitur Terpisah 2: Konsultasi Online Dokter
      case "konsultasi": {
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#F0E6D3] pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Konsultasi Dokter</h2>
                <p className="text-xs text-[#8A7B6B]">Daftar konsultasi tanya-jawab online dan sesi terprogram pasien Anda</p>
              </div>
              <span className="px-3 py-1 bg-[#F5E6C8] text-[#8A6B2B] text-xs font-bold rounded-full border border-[#E8D4A2]">
                Total: {myClients.length} Konsultasi
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {loadingConsultations ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin mx-auto mb-2" />
                    <p className="text-xs text-[#8A7B6B]">Memuat konsultasi dokter...</p>
                  </div>
                ) : myClients.length === 0 ? (
                  <div className="text-center py-12 text-[#B8A99A]">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Belum Ada Konsultasi Online</p>
                    <p className="text-xs mt-1">Permintaan konsultasi tanya-jawab pasien akan muncul di sini</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F0E6D3] bg-[#FDF8F0]/60 text-left text-xs font-bold text-[#8A7B6B] uppercase tracking-wider">
                        <th className="py-3.5 px-4">Nama Pasien</th>
                        <th className="py-3.5 px-4">Topik</th>
                        <th className="py-3.5 px-4">Tipe</th>
                        <th className="py-3.5 px-4">Tanggal</th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F0E8] text-xs text-[#4A3F35]">
                      {myClients.map((c) => (
                        <tr key={c.id} className="hover:bg-[#FDF8F0]/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-900">{c.user?.name || "Klien"}</td>
                          <td className="py-3.5 px-4">{c.topic}</td>
                          <td className="py-3.5 px-4 capitalize">{c.type === "scheduled" ? "Konsultasi Terjadwal" : "Konsultasi Cepat"}</td>
                          <td className="py-3.5 px-4">{c.date}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              c.status === "Selesai" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {c.status}
                            </span>
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
      }

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
