import { Navigate, useSearchParams, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DesktopDoctorHome from "@/components/dashboard/DesktopDoctorHome";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSession } from "@/features/auth/services/demoAuth";
import {
  Calendar, Users, ChevronRight, Clock, PlayCircle, Plus, Pencil, Trash2, Eye, ArrowLeft, Loader2,
  Phone, History, Heart, Image, Stethoscope, MessageSquare, FileText, Lightbulb, AlertCircle, User,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { getDoctorScheduledConsultations, type ConsultationItem } from "@/features/consultation/services/consultationApi";
import {
  getDoctorSchedules,
  deleteDoctorSchedule,
  type DoctorScheduleItem,
} from "@/features/doctors/services/doctorScheduleApi";

export default function DoctorDashboardPage() {
  const session = getSession()!;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "dashboard";
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);

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
    if (activeTab === "klien" || activeTab === "dashboard") {
      setLoadingConsultations(true);
      getDoctorScheduledConsultations()
        .then((data) => setConsultations(data))
        .catch(() => {
          toast({ title: "Gagal", message: "Tidak bisa memuat konsultasi terjadwal", variant: "error" });
        })
        .finally(() => setLoadingConsultations(false));
    }
  }, [activeTab]);

  const mySchedules = schedules;
  const myClients = consultations;
  const myClientResults = useMemo(() => [], []);
  const completedConsultations = useMemo(
    () => myClients.filter((c) => c.status === "Selesai").length,
    [myClients]
  );

  const stats = [
    {
      title: "Jadwal Saya",
      value: mySchedules.length,
      subtitle: "Jadwal aktif",
      trend: "up" as const,
      trendValue: "Bulan ini",
      icon: Calendar,
      variant: "green" as const,
    },
    {
      title: "Klien",
      value: myClients.length,
      subtitle: "Menunggu konsultasi",
      trend: "neutral" as const,
      trendValue: "Aktif",
      icon: Users,
    },
    {
      title: "Konsultasi Selesai",
      value: completedConsultations,
      subtitle: "Berhasil ditangani",
      trend: "up" as const,
      trendValue: "Selama ini",
      icon: Eye,
    },
    {
      title: "Hasil Konsultasi",
      value: myClientResults.length,
      subtitle: "Dari klien",
      trend: "neutral" as const,
      trendValue: "-",
      icon: Eye,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "jadwal":
        return (
          <div className="space-y-6">
            {/* Modern Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Jadwal</h2>
                <p className="text-sm text-[#8A7B6B] mt-1">Kelola jadwal praktik Anda</p>
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
                    <p className="text-sm text-[#B8A99A] mt-1">Mohon tunggu sebentar</p>
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
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Waktu</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Lokasi</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Slot</th>
                        <th className="text-right py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mySchedules.map((s) => (
                        <tr key={s.id} className="border-b border-[#F5F0E8] hover:bg-[#FDF8F0]/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#B8A99A]" />
                              <span className="text-sm font-semibold text-[#4A3F35]">{s.displayDate || s.date}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#B8A99A]" />
                              <span className="text-sm text-[#4A3F35]">{s.timeRange}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="text-sm text-[#4A3F35]">{s.location}</span>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              s.isFull
                                ? "bg-red-50 text-red-600 border border-red-200"
                                : "bg-[#F5E6C8] text-[#8A6B2B] border border-[#E8D4A2]/40"
                            }`}>
                              {s.bookedSlots} / {s.totalSlots}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/dashboard/doctor/schedule/edit/${s.id}`)}
                                className="w-8 h-8 p-0 rounded-full text-[#B8943F] hover:text-[#8A6B2B] hover:bg-[#F5E6C8] transition-colors"
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
                                className="w-8 h-8 p-0 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                              >
                                {deletingScheduleId === s.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
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

      case "klien": {
        const selectedResult = myClients.find((r) => r.id === selectedResultId) || null;

        if (selectedResult) {
          const r = selectedResult;
          return (
            <div className="space-y-6">
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={() => setSelectedResultId(null)}
                className="text-[#8A7B6B] hover:text-[#4A3F35] hover:bg-[#FDF8F0] rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali
              </Button>

              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#4A3F35]">Detail Konsultasi</h2>
                  <p className="text-sm text-[#8A7B6B] mt-1">ID: {r.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Status Konsultasi</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200 mt-1">
                      Dijadwalkan
                    </span>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Tipe Konsultasi</p>
                    </div>
                    <p className="text-sm font-semibold text-[#4A3F35] mt-1">Konsultasi Terjadwal</p>
                  </div>
                </div>

                {/* Main Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <User className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Pengguna</p>
                    </div>
                    <p className="text-sm font-semibold text-[#4A3F35] mt-1">{r.user?.name || "-"}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Dokter</p>
                    </div>
                    <p className="text-sm font-semibold text-[#4A3F35] mt-1">{r.doctorName}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Tanggal</p>
                    </div>
                    <p className="text-sm font-semibold text-[#4A3F35] mt-1">{r.date}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Topik</p>
                    </div>
                    <p className="text-sm font-semibold text-[#4A3F35] mt-1">{r.topic}</p>
                  </div>
                </div>

                {/* Contact & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <Phone className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Kontak</p>
                    </div>
                    <p className="text-sm font-semibold text-[#4A3F35] mt-1">{r.preferredContact || "-"}</p>
                    <p className="text-xs text-[#8A7B6B] mt-1">{r.contactNumber || "-"}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Kategori</p>
                    </div>
                    <p className="text-sm font-semibold text-[#4A3F35] mt-1">{r.category || "-"}</p>
                  </div>
                </div>

                {/* Duration & Pain Scale */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <Clock className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Durasi Keluhan</p>
                    </div>
                    <p className="text-sm font-semibold text-[#4A3F35] mt-1">{r.duration || "-"}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <Heart className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Skala Nyeri</p>
                    </div>
                    <p className="text-sm font-semibold text-[#4A3F35] mt-1">{r.painScale != null ? `${r.painScale} / 10` : "-"}</p>
                  </div>
                </div>

                {/* Chief Complaint */}
                <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-[#B8943F]" />
                    </div>
                    <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Keluhan Utama</p>
                  </div>
                  <p className="text-sm text-[#4A3F35] whitespace-pre-wrap">{r.chiefComplaint || "-"}</p>
                </div>

                {/* Allergies & Medications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Alergi</p>
                    </div>
                    <p className="text-sm text-[#4A3F35] whitespace-pre-wrap">{r.allergies || "-"}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Obat yang Dikonsumsi</p>
                    </div>
                    <p className="text-sm text-[#4A3F35] whitespace-pre-wrap">{r.medications || "-"}</p>
                  </div>
                </div>

                {/* Prior Treatment & Expectations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <History className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Perawatan Sebelumnya</p>
                    </div>
                    <p className="text-sm text-[#4A3F35] whitespace-pre-wrap">{r.priorTreatment || "-"}</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <Lightbulb className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Harapan</p>
                    </div>
                    <p className="text-sm text-[#4A3F35] whitespace-pre-wrap">{r.expectations || "-"}</p>
                  </div>
                </div>

                {r.notes && (
                  <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF8F0] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#B8943F]" />
                      </div>
                      <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Catatan Tambahan</p>
                    </div>
                    <p className="text-sm text-[#4A3F35] whitespace-pre-wrap">{r.notes}</p>
                  </div>
                )}

                {/* Attachments */}
                <div className="bg-[#FDF8F0] border border-[#E8D4A2]/40 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
                      <Image className="w-4 h-4 text-[#B8943F]" />
                    </div>
                    <p className="text-xs font-medium text-[#8A7B6B] uppercase tracking-wide">Lampiran</p>
                  </div>
                  {!r.attachments || r.attachments.length === 0 ? (
                    <p className="text-sm text-[#8A7B6B]">-</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {r.attachments.map((a: any, idx: number) => {
                        const url = typeof a === "string" ? a : a?.url || a?.path || "";
                        const name = typeof a === "string" ? `Lampiran ${idx + 1}` : a?.name || `Lampiran ${idx + 1}`;
                        const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|heic|heif)$/i.test(url);
                        return (
                          <div key={`${name}_${idx}`} className="rounded-xl border border-[#F0E6D3] bg-white p-2 shadow-sm">
                            {isImage ? (
                              <a href={url} target="_blank" rel="noopener noreferrer" download>
                                <img
                                  src={url}
                                  alt={name}
                                  className="w-full h-24 object-cover rounded-xl"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                />
                              </a>
                            ) : (
                              <div className="w-full h-24 flex items-center justify-center bg-[#FDF8F0] rounded-xl text-xs text-[#8A7B6B]">
                                <FileText className="w-6 h-6 text-[#B8A99A]" />
                              </div>
                            )}
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="block mt-2 text-xs text-[#B8943F] hover:underline truncate"
                              title={name}
                            >
                              {name}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Modern Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#4A3F35]">Klien Konsultasi</h2>
                <p className="text-sm text-[#8A7B6B] mt-1">Daftar pasien yang melakukan konsultasi dengan Anda</p>
              </div>
            </div>

            {/* Modern Table */}
            <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                {loadingConsultations ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                      <Users className="w-7 h-7 text-[#C9A24A] animate-pulse" />
                    </div>
                    <p className="text-[#4A3F35] font-medium">Memuat klien...</p>
                    <p className="text-sm text-[#B8A99A] mt-1">Mohon tunggu sebentar</p>
                  </div>
                ) : myClients.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDF8F0] flex items-center justify-center mx-auto mb-4">
                      <Users className="w-7 h-7 text-[#B8A99A]" />
                    </div>
                    <p className="text-[#4A3F35] font-medium">Belum ada klien</p>
                    <p className="text-sm text-[#B8A99A] mt-1">Pasien yang melakukan konsultasi akan muncul di sini</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F0E6D3]">
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Nama</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider hidden sm:table-cell">Topik</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Tanggal</th>
                        <th className="text-left py-4 px-5 text-xs font-semibold text-[#8A7B6B] uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myClients.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-[#F5F0E8] hover:bg-[#FDF8F0]/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedResultId(c.id)}
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#F5E6C8] flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-[#B8943F]" />
                              </div>
                              <span className="text-sm font-semibold text-[#4A3F35]">{c.user?.name || "-"}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 hidden sm:table-cell">
                            <span className="text-sm text-[#4A3F35]">{c.topic}</span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-[#B8A99A]" />
                              <span className="text-sm text-[#4A3F35]">{c.date}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              c.status === "Selesai"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : c.status === "Dijadwalkan"
                                ? "bg-blue-50 text-blue-600 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
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
            completedCount={completedConsultations}
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
