import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
  FileText,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { apiClient } from "@/core/api/apiClient";

export default function DoctorReservationList() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const loadQueue = () => {
    setLoading(true);
    apiClient
      .get<{ queue: any[] }>("/doctor/queue")
      .then((res) => setReservations(res.queue || []))
      .catch(() => {
        toast({ title: "Gagal", message: "Gagal memuat data pasien dokter", variant: "error" });
        setReservations([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQueue();
  }, []);

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
        if (statusFilter === "pending") {
          return r.status === "Baru" || r.status === "Menunggu";
        }
        if (statusFilter === "in_progress") {
          return r.status === "Dikonfirmasi" || r.status === "Dalam Konsultasi";
        }
        if (statusFilter === "completed") {
          return r.status === "Selesai";
        }
        return true;
      })
      .filter((r) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const name = (r.patient_name || "").toLowerCase();
        const code = (r.code || "").toLowerCase();
        const phone = (r.patient_phone || "").toLowerCase();
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
      pending: reservations.filter((r) => r.status === "Baru" || r.status === "Menunggu").length,
      in_progress: reservations.filter(
        (r) => r.status === "Dikonfirmasi" || r.status === "Dalam Konsultasi"
      ).length,
      completed: reservations.filter((r) => r.status === "Selesai").length,
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
    <div className="space-y-6 text-left">
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
            onClick={loadQueue}
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
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            Menunggu ({counts.pending})
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
            Dikonfirmasi ({counts.in_progress})
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
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pasien / no kontak / layanan..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#EADBBD] focus:outline-none focus:ring-2 focus:ring-[#8C6B1C] bg-[#FAF5EA]/30"
          />
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-14">
              <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#8A7B6B]">Memuat daftar pasien dari database...</p>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-14 text-[#B8A99A]">
              <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-[#4A3F35]">Tidak Ada Data Pasien</p>
              <p className="text-xs mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "Tidak ada pasien yang cocok dengan filter pencarian"
                  : "Pasien yang memilih jadwal dokter Anda akan otomatis muncul di sini"}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0E6D3] bg-[#FDF8F0]/80 text-left text-xs font-bold text-[#8A7B6B] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pasien</th>
                  <th className="py-3.5 px-4">Kontak WhatsApp</th>
                  <th className="py-3.5 px-4">Jadwal Periksa</th>
                  <th className="py-3.5 px-4">Perawatan / Keluhan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0E8] text-xs text-[#4A3F35]">
                {filteredReservations.map((r) => {
                  const isCompleted = r.status === "Selesai";
                  const isConfirmed = r.status === "Dikonfirmasi" || r.status === "Dalam Konsultasi";
                  return (
                    <tr key={r.id} className="hover:bg-[#FDF8F0]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#8C6B1C]" />
                          <span>{r.patient_name || "Pasien"}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          #{r.code || `RSV-${r.id}`}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-700">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{r.patient_phone || "-"}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#8C6B1C]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#C9A24A]" />
                          <span>{r.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{r.preferred_time} WIB</span>
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
                          onClick={() => setSelectedPatient(r)}
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

      {/* POP UP MODAL DETAIL DATA PASIEN (PORTAL TO BODY - SELALU TEPAT DI TENGAH VIEWPORT APAPUN SCROLL NYA) */}
      {selectedPatient &&
        createPortal(
          <div
            onClick={() => setSelectedPatient(null)}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
            style={{ margin: 0 }}
          >
            <div
              className="relative w-full max-w-4xl lg:max-w-5xl bg-white rounded-3xl border border-[#EADBBD] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[calc(100vh-40px)] animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header (Compact) */}
              <div className="relative z-10 flex items-center justify-between px-5 sm:px-6 py-3.5 bg-gradient-to-r from-[#FAF5EA] via-[#FDF8F0] to-[#F5ECE0] border-b border-[#EADBBD] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#C9A24A] to-[#B8943F] flex items-center justify-center text-white shadow-md shadow-[#C9A24A]/20 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-[#4A3F35]">
                        Detail Data Pasien
                      </h3>
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#8C6B1C]/10 text-[#8C6B1C] border border-[#8C6B1C]/20">
                        #{selectedPatient.code || `RSV-${selectedPatient.id}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8A7B6B]">
                      Informasi reservasi klinik Aesthetic Pondok Indah
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Clean, Compact, Horizontal 3-Column Layout) */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1 text-left bg-gradient-to-b from-white to-[#FDFBF7]">
                {/* Status & Location Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#FAF5EA]/80 border border-[#EADBBD]">
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

                {/* 3 Columns Grid (Compact Card Details) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* 1. Biodata Pasien */}
                  <div className="p-4 rounded-xl bg-white border border-[#F0E6D3] shadow-xs space-y-2.5">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-[#F5F0E8] text-[#8C6B1C] font-bold text-xs">
                      <User className="w-3.5 h-3.5" />
                      <span>Data Pasien</span>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[#8A7B6B] block text-[11px]">Nama Lengkap</span>
                        <span className="font-bold text-[#4A3F35] text-sm truncate block">
                          {selectedPatient.patient_name || "-"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8A7B6B] block text-[11px]">Jenis Kelamin</span>
                        <span className="font-semibold text-[#4A3F35] text-xs">
                          {formatGender(selectedPatient.gender)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8A7B6B] block text-[11px]">Tanggal Lahir</span>
                        <span className="font-semibold text-[#4A3F35] text-xs">
                          {selectedPatient.birth_date || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Jadwal & Layanan */}
                  <div className="p-4 rounded-xl bg-white border border-[#F0E6D3] shadow-xs space-y-2.5">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-[#F5F0E8] text-[#8C6B1C] font-bold text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Jadwal &amp; Layanan</span>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <span className="text-[#8A7B6B] block text-[11px]">Tanggal Periksa</span>
                        <div className="flex items-center gap-1.5 font-bold text-[#4A3F35]">
                          <Calendar className="w-3.5 h-3.5 text-[#C9A24A]" />
                          <span>{selectedPatient.date || "-"}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[#8A7B6B] block text-[11px]">Jam Praktik</span>
                        <div className="flex items-center gap-1.5 font-bold text-[#8C6B1C]">
                          <Clock className="w-3.5 h-3.5 text-[#C9A24A]" />
                          <span>{selectedPatient.preferred_time} WIB</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[#8A7B6B] block text-[11px]">Perawatan yang Dipilih</span>
                        <span className="font-bold text-[#4A3F35] block bg-[#FAF5EA] p-1.5 rounded-lg border border-[#EADBBD] text-xs truncate">
                          {selectedPatient.treatment_interest || "Pemeriksaan Dokter Gigi"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Keluhan & Catatan Medis */}
                  <div className="p-4 rounded-xl bg-white border border-[#F0E6D3] shadow-xs space-y-2.5">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-[#F5F0E8] text-[#8C6B1C] font-bold text-xs">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Keluhan &amp; Catatan</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[#8A7B6B] block text-[11px]">Keluhan Pasien</span>
                        <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#F0E6D3] text-gray-700 leading-relaxed text-[11px] max-h-[85px] overflow-y-auto">
                          {selectedPatient.complaint || "Tidak ada catatan keluhan khusus."}
                        </div>
                      </div>
                      {selectedPatient.admin_notes && (
                        <div>
                          <span className="text-[#8A7B6B] block text-[11px]">Catatan Tambahan</span>
                          <div className="p-2 bg-amber-50/60 rounded-lg border border-amber-200/60 text-amber-900 text-[11px]">
                            {selectedPatient.admin_notes}
                          </div>
                        </div>
                      )}
                      <div className="pt-1 text-[10px] text-gray-400">
                        Waktu Booking: {selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleDateString("id-ID") : "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Compact) */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-3 bg-[#FAF8F5] border-t border-[#EADBBD] shrink-0">
                <div className="text-[11px] text-[#8A7B6B]">
                  ID Pasien: <span className="font-mono font-semibold text-gray-800">#{selectedPatient.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPatient(null)}
                    className="rounded-xl border-[#EADBBD] text-[#4A3F35] hover:bg-white text-xs font-semibold px-5 h-8.5 cursor-pointer"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
