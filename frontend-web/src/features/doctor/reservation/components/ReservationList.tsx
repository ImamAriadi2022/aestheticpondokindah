import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Loader2,
  Stethoscope,
  Search,
  RefreshCw,
  Phone,
  Calendar,
  Clock,
  User,
  Building2,
  Eye,
  X,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { apiClient } from "@/core/api/apiClient";
import { getDoctorQueue } from "@/features/doctor/dashboard/services/doctorDashboardService";
import { scrollPageToTop } from "@/core/router/ScrollToTop";
import { PageTransition } from "@/core/router/RouteTransition";

const STORAGE_KEY = "apig_doctor_cached_patients";

export default function DoctorReservationList() {
  // Read cache immediately (0ms instant display)
  const [reservations, setReservations] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(reservations.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const isFetchingRef = useRef(false);

  const fetchPatients = useCallback(async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!silent && reservations.length === 0) setLoading(true);

    try {
      const queue = await getDoctorQueue();
      if (Array.isArray(queue)) {
        setReservations(queue);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
        } catch {}
      }
    } catch {
      // Keep cached data silently
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [reservations.length]);

  useEffect(() => {
    fetchPatients(reservations.length > 0);

    // Smart background poll every 5s only if tab is visible
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchPatients(true);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [fetchPatients, reservations.length]);

  useEffect(() => {
    if (selectedPatient) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedPatient(null);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedPatient]);

  const filteredReservations = useMemo(() => {
    return reservations
      .filter((r) => {
        const s = (r.status || "").toLowerCase();
        if (statusFilter === "in_progress" || statusFilter === "confirmed") {
          return s === "dikonfirmasi" || s === "dalam konsultasi" || s === "confirmed" || s === "in_progress";
        }
        if (statusFilter === "completed" || statusFilter === "selesai") {
          return s === "selesai" || s === "completed";
        }
        return true;
      })
      .filter((r) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const name = (r.patient_name || r.name || "").toLowerCase();
        const code = (r.code || "").toLowerCase();
        const phone = (r.patient_phone || r.phone || "").toLowerCase();
        const treatment = (r.treatment_interest || "").toLowerCase();
        const complaint = (r.complaint || "").toLowerCase();
        return (
          name.includes(q) ||
          code.includes(q) ||
          phone.includes(q) ||
          treatment.includes(q) ||
          complaint.includes(q)
        );
      })
      .sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return Number(b.id || 0) - Number(a.id || 0);
      });
  }, [reservations, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: reservations.length,
      in_progress: reservations.filter((r) => {
        const s = (r.status || "").toLowerCase();
        return s === "dikonfirmasi" || s === "dalam konsultasi" || s === "confirmed" || s === "in_progress";
      }).length,
      completed: reservations.filter((r) => {
        const s = (r.status || "").toLowerCase();
        return s === "selesai" || s === "completed";
      }).length,
    };
  }, [reservations]);

  const formatGender = (gender?: string) => {
    if (!gender) return "-";
    const g = gender.toLowerCase();
    if (g === "male" || g === "laki-laki" || g === "l") return "Laki-laki";
    if (g === "female" || g === "perempuan" || g === "p") return "Perempuan";
    return gender;
  };

  return (
    <PageTransition transitionKey={selectedPatient ? `patient_${selectedPatient.id}` : "list"}>
      {selectedPatient ? (
        /* In-Page Patient Detail View (No Modal Dialog) */
        <div className="space-y-6 text-left animate-in fade-in duration-150">
          {/* Top Bar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-[#EADBBD] shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPatient(null);
                  scrollPageToTop();
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF5EA] hover:bg-[#F3EAD5] text-[#8C6B1C] hover:text-[#735614] text-xs font-bold border border-[#EADBBD] shadow-2xs transition-all cursor-pointer shrink-0"
                title="Kembali ke Daftar Pasien"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C9A24A] to-[#B8943F] flex items-center justify-center text-white shadow-md shadow-[#C9A24A]/20 shrink-0">
                <User className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-[#4A3F35]">
                    Detail Data Pasien
                  </h2>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#8C6B1C]/10 text-[#8C6B1C] border border-[#8C6B1C]/20">
                    #{selectedPatient.code || `RSV-${selectedPatient.id}`}
                  </span>
                </div>
                <p className="text-xs text-[#8A7B6B] mt-0.5">
                  Informasi reservasi klinik Aesthetic Pondok Indah
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedPatient(null);
                  scrollPageToTop();
                }}
                className="rounded-xl text-xs font-bold px-4 py-2 h-9 border-[#EADBBD] text-[#4A3F35] hover:bg-[#FAF8F5] cursor-pointer"
              >
                ← Kembali ke Daftar
              </Button>
            </div>
          </div>

          {/* Patient Detail Cards */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 rounded-2xl bg-[#FAF5EA]/80 border border-[#EADBBD]">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#8C6B1C]" />
                <span className="text-xs text-[#8A7B6B]">Cabang:</span>
                <span className="text-xs font-bold text-[#4A3F35]">
                  {selectedPatient.branch_name || "Aesthetic Pondok Indah Main Branch"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8A7B6B]">Status:</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedPatient.status === "Selesai"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : selectedPatient.status === "Dikonfirmasi" || selectedPatient.status === "Dalam Konsultasi"
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}
                >
                  {selectedPatient.status || "Menunggu"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#F0E6D3] shadow-xs space-y-3">
                <div className="flex items-center gap-1.5 pb-2.5 border-b border-[#F5F0E8] text-[#8C6B1C] font-bold text-xs">
                  <User className="w-4 h-4" />
                  <span>Data Pasien</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#8A7B6B] block text-[11px]">Nama Lengkap</span>
                    <span className="font-bold text-[#4A3F35] text-sm truncate block mt-0.5">
                      {selectedPatient.patient_name || selectedPatient.name || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8A7B6B] block text-[11px]">Jenis Kelamin</span>
                    <span className="font-semibold text-[#4A3F35] text-xs block mt-0.5">
                      {formatGender(selectedPatient.gender)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8A7B6B] block text-[11px]">Tanggal Lahir</span>
                    <span className="font-semibold text-[#4A3F35] text-xs block mt-0.5">
                      {selectedPatient.birth_date || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#F0E6D3] shadow-xs space-y-3">
                <div className="flex items-center gap-1.5 pb-2.5 border-b border-[#F5F0E8] text-[#8C6B1C] font-bold text-xs">
                  <Calendar className="w-4 h-4" />
                  <span>Jadwal & Layanan</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#8A7B6B] block text-[11px]">Tanggal Periksa</span>
                    <div className="flex items-center gap-1.5 font-bold text-[#4A3F35] mt-0.5">
                      <Calendar className="w-4 h-4 text-[#C9A24A]" />
                      <span>{selectedPatient.date || "-"}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#8A7B6B] block text-[11px]">Jam Praktik</span>
                    <div className="flex items-center gap-1.5 font-bold text-[#8C6B1C] mt-0.5">
                      <Clock className="w-4 h-4 text-[#C9A24A]" />
                      <span>{selectedPatient.preferred_time || "Sesuai Jadwal"} WIB</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[#8A7B6B] block text-[11px]">Perawatan yang Dipilih</span>
                    <span className="font-bold text-[#4A3F35] block bg-[#FAF5EA] p-2 rounded-xl border border-[#EADBBD] text-xs mt-0.5">
                      {selectedPatient.treatment_interest || "Pemeriksaan Dokter Gigi"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#F0E6D3] shadow-xs space-y-3">
                <div className="flex items-center gap-1.5 pb-2.5 border-b border-[#F5F0E8] text-[#8C6B1C] font-bold text-xs">
                  <FileText className="w-4 h-4" />
                  <span>Keluhan & Catatan</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#8A7B6B] block text-[11px]">Keluhan Pasien</span>
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#F0E6D3] text-gray-700 leading-relaxed text-xs mt-0.5">
                      {selectedPatient.complaint || "Tidak ada catatan keluhan khusus."}
                    </div>
                  </div>
                  {selectedPatient.admin_notes && (
                    <div>
                      <span className="text-[#8A7B6B] block text-[11px]">Catatan Tambahan</span>
                      <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/60 text-amber-900 text-xs mt-0.5">
                        {selectedPatient.admin_notes}
                      </div>
                    </div>
                  )}
                  <div className="pt-1 text-[11px] text-gray-400">
                    Waktu Booking: {selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleDateString("id-ID") : "-"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* In-Page Footer */}
          <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-[#EADBBD] shadow-xs">
            <div className="text-xs text-[#8A7B6B]">
              ID Pasien: <span className="font-mono font-bold text-gray-800">#{selectedPatient.id}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedPatient(null);
                scrollPageToTop();
              }}
              className="rounded-xl border-[#EADBBD] text-[#4A3F35] hover:bg-[#FAF8F5] text-xs font-bold px-5 py-2.5 h-auto cursor-pointer"
            >
              ← Kembali ke Daftar Pasien
            </Button>
          </div>
        </div>
      ) : (
        /* Patient List Table View */
        <div className="space-y-6 text-left animate-in fade-in duration-150">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 sm:p-6 rounded-2xl border border-[#F0E6D3] shadow-xs">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAF5EA] border border-[#EADBBD] text-[#8C6B1C] text-xs font-semibold mb-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Aesthetic Pondok Indah</span>
              </div>
              <h2 className="text-xl font-bold text-[#4A3F35] flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#C9A24A]" />
                Daftar Pasien
              </h2>
              <p className="text-xs text-[#8A7B6B] mt-0.5">
                Daftar seluruh pasien yang memilih jadwal periksa Anda di klinik
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fetchPatients(false)}
                disabled={loading}
                className="rounded-xl border-[#EADBBD] text-[#8C6B1C] hover:bg-[#FAF5EA] font-semibold h-10 px-4 text-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                Refresh Data
              </Button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#F0E6D3] shadow-xs">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-[#8C6B1C] text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Semua ({counts.all})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("in_progress")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === "in_progress"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                }`}
              >
                Dikonfirmasi Admin ({counts.in_progress})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  statusFilter === "completed"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
              >
                Selesai ({counts.completed})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pasien / tindakan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50/80 border border-[#EADBBD] rounded-xl text-xs text-[#4A3F35] placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]/20 focus:border-[#C9A24A] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Patient Table List */}
          <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-xs overflow-hidden">
            {loading && reservations.length === 0 ? (
              <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#C9A24A]" />
                <span className="text-xs font-semibold text-gray-500">
                  Memuat data pasien praktik...
                </span>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <p className="text-sm font-semibold text-gray-600">
                  Tidak ada jadwal pasien ditemukan
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchQuery
                    ? "Coba ubah kata kunci pencarian Anda"
                    : "Belum ada pasien yang mendaftar pada filter status ini"}
                </p>
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F0E6D3] bg-[#FAF8F5] text-[#8C6B1C] uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">No. Antrean & Pasien</th>
                    <th className="py-3 px-4">Jadwal Periksa</th>
                    <th className="py-3 px-4">Layanan & Keluhan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5ECE0]">
                  {filteredReservations.map((r: any, idx: number) => {
                    const statusStr = (r.status || "").toLowerCase();
                    const isCompleted = statusStr === "selesai" || statusStr === "completed";
                    const isConfirmed = statusStr === "dikonfirmasi" || statusStr === "dalam konsultasi";

                    return (
                      <tr key={r.id || idx} className="hover:bg-[#FAF8F5]/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center font-bold text-[#8C6B1C] text-xs shrink-0">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-[#4A3F35] text-sm">
                                {r.patient_name || r.name || "Pasien Tanpa Nama"}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-[#8A7B6B] mt-0.5">
                                {r.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-[#C9A24A]" />
                                    {r.phone}
                                  </span>
                                )}
                                <span>• {formatGender(r.gender)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-[#4A3F35]">
                            <Calendar className="w-3.5 h-3.5 text-[#C9A24A]" />
                            <span>{r.date || "-"}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>{r.preferred_time || "Sesuai Jadwal"} WIB</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="font-bold text-gray-800">
                            {r.treatment_interest || "Pemeriksaan Umum"}
                          </span>
                          {r.complaint && (
                            <div className="text-[11px] text-gray-500 truncate mt-0.5" title={r.complaint}>
                              {r.complaint}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isCompleted
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : isConfirmed
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {r.status || "Menunggu"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(r);
                              scrollPageToTop();
                            }}
                            className="rounded-xl border-[#C9A24A] text-[#8C6B1C] hover:bg-[#FAF5EA] hover:text-[#735515] font-bold text-xs h-8 px-3.5 shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#C9A24A]" />
                            Preview Pasien
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </PageTransition>
  );
}
