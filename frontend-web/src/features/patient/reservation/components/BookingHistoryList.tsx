import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  MessageCircle,
  Ticket,
  User,
  Plus,
  RefreshCw,
  Search,
  Building2,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/ui/button";

export interface BookingHistoryItem {
  id: string | number;
  code?: string;
  doctorName: string;
  doctorPhoto?: string;
  specialization?: string;
  serviceName: string;
  date: string;
  displayDate?: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled" | "rejected" | string;
  rawStatus?: string;
  branchName?: string;
  locationAddress?: string;
  totalAmount?: string | number;
  notes?: string;
  examinationResult?: string;
  patientName?: string;
  phone?: string;
}

interface BookingHistoryListProps {
  bookings: BookingHistoryItem[];
  onOpenETicket: (item: BookingHistoryItem) => void;
  onBookNew: () => void;
  onContactAdmin: (item: BookingHistoryItem) => void;
  loading?: boolean;
  onRefresh?: () => void;
  userAvatar?: string;
}

export default function BookingHistoryList({
  bookings,
  onOpenETicket,
  onBookNew,
  onContactAdmin,
  loading = false,
  onRefresh,
}: BookingHistoryListProps) {
  const [activeTab, setActiveTab] = useState<"aktif" | "selesai">("aktif");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((item) => {
        const s = (item.status || "").toLowerCase();
        const isCompleted =
          s === "completed" ||
          s === "selesai" ||
          s === "cancelled" ||
          s === "dibatalkan" ||
          s === "rejected" ||
          s === "ditolak";

        const matchesTab = activeTab === "aktif" ? !isCompleted : isCompleted;
        if (!matchesTab) return false;

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.doctorName.toLowerCase().includes(q) ||
          (item.displayDate && item.displayDate.toLowerCase().includes(q)) ||
          (item.date && item.date.toLowerCase().includes(q)) ||
          (item.time && item.time.toLowerCase().includes(q)) ||
          (item.code && item.code.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        if (timeB !== timeA) return timeB - timeA;
        return Number(b.id || 0) - Number(a.id || 0);
      });
  }, [bookings, activeTab, searchQuery]);

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mx-auto space-y-5 animate-in fade-in duration-200 text-left">
      {/* Top Header */}
      <div className="pt-1">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#8C6B1C] bg-[#FAF5EA] px-3.5 py-1.5 rounded-full border border-[#EADBBD] shadow-2xs mb-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>Aesthetic Pondok Indah Dental Clinic</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#2C2416]">
          Riwayat Reservasi Saya
        </h2>
        <p className="text-xs text-[#7C7365] mt-0.5">
          Daftar janji temu aktif dan riwayat kunjungan perawatan dokter gigi Anda
        </p>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white border border-[#E8DFC8] rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        {/* Tabs: Janji Temu Aktif & Riwayat Selesai */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#EDE5D6]">
          <button
            type="button"
            onClick={() => setActiveTab("aktif")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "aktif"
                ? "bg-[#8C6B1C] text-white shadow-xs"
                : "text-[#7C7365] hover:text-[#2C2416]"
            }`}
          >
            Janji Temu Aktif
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("selesai")}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "selesai"
                ? "bg-[#8C6B1C] text-white shadow-xs"
                : "text-[#7C7365] hover:text-[#2C2416]"
            }`}
          >
            Riwayat Selesai
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama dokter atau tanggal..."
            className="w-full h-9 pl-8 pr-3 text-xs bg-[#FAF8F5] focus:bg-white border border-[#D9D0BC] rounded-xl outline-none focus:border-[#8C6B1C] text-[#2C2416] transition-all"
          />
        </div>
      </div>

      {/* Reservation Cards List */}
      <div className="space-y-3.5">
        {loading ? (
          <div className="bg-white border border-[#E8DFC8] rounded-3xl p-12 text-center space-y-2.5 shadow-xs">
            <RefreshCw className="w-7 h-7 text-[#8C6B1C] animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#2C2416]">
              Memuat Riwayat Reservasi...
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white border border-[#E8DFC8] rounded-3xl p-8 sm:p-12 text-center space-y-3.5 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center mx-auto border border-[#EADBBD]">
              <CalendarDays className="w-7 h-7 stroke-[1.75]" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h4 className="text-sm sm:text-base font-bold text-[#2C2416]">
                Tidak Ada Riwayat {activeTab === "aktif" ? "Aktif" : "Selesai"}
              </h4>
              <p className="text-xs text-[#7C7365] leading-relaxed">
                {activeTab === "aktif"
                  ? "Anda belum memiliki jadwal janji temu aktif. Buat reservasi baru untuk pemeriksaan dan konsultasi dokter gigi."
                  : "Riwayat janji temu yang telah selesai akan otomatis tersimpan di sini."}
              </p>
            </div>
            {activeTab === "aktif" && (
              <Button
                type="button"
                onClick={onBookNew}
                className="mt-1 h-10 px-5 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:from-[#B8943F] hover:to-[#967430] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Buat Reservasi Sekarang</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {filteredBookings.map((item) => {
              const raw = (item.status || "").toLowerCase();
              const isConfirmed = raw === "confirmed" || raw === "dikonfirmasi";
              const isCompleted = raw === "completed" || raw === "selesai";
              const isCancelled = raw === "cancelled" || raw === "dibatalkan";

              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#E8DFC8] hover:border-[#C9A24A] rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between space-y-3.5 text-left group"
                >
                  {/* Top Doctor & Status Row */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-[#FAF5EA] overflow-hidden shrink-0 border border-[#EADBBD] shadow-2xs">
                        {item.doctorPhoto ? (
                          <img
                            src={item.doctorPhoto}
                            alt={item.doctorName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#8C6B1C]">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[#2C2416] group-hover:text-[#8C6B1C] transition-colors truncate">
                          {item.doctorName}
                        </h4>
                        <p className="text-[11px] text-[#8C8272] truncate">
                          Aesthetic Pondok Indah
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide shrink-0 ${
                        isCompleted
                          ? "bg-[#8C6B1C] text-white"
                          : isConfirmed
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : isCancelled
                          ? "bg-rose-50 text-rose-800 border border-rose-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {isCompleted
                        ? "Selesai"
                        : isConfirmed
                        ? "Terkonfirmasi"
                        : isCancelled
                        ? "Dibatalkan"
                        : "Menunggu"}
                    </span>
                  </div>

                  {/* Date & Time Clean Box (Nama Dokter, Tanggal, Jam saja) */}
                  <div className="bg-[#FAF8F5] border border-[#EDE5D6] rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                    {/* Tanggal */}
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#E8DFC8] flex items-center justify-center text-[#8C6B1C] shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#8C8272] block">Tanggal</span>
                        <span className="font-bold text-[#2C2416] text-[11px] block truncate">
                          {item.displayDate || item.date}
                        </span>
                      </div>
                    </div>

                    {/* Jam */}
                    <div className="flex items-center gap-2 border-l border-[#EDE5D6] pl-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#E8DFC8] flex items-center justify-center text-[#8C6B1C] shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-[#8C8272] block">Jam</span>
                        <span className="font-bold text-[#8C6B1C] text-[11px] block truncate">
                          {item.time} WIB
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Lihat Detail Reservasi & Hubungi Admin */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#F0EAE1]">
                    <Button
                      type="button"
                      onClick={() => onOpenETicket(item)}
                      className="h-9 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:from-[#B8943F] hover:to-[#967430] text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Lihat Detail</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onContactAdmin(item)}
                      className="h-9 rounded-xl border border-[#D9D0BC] text-[#6B5E4F] hover:bg-[#FAF5EA] hover:text-[#8C6B1C] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Bantuan</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

