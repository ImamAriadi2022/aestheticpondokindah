import React, { useState, useMemo } from "react";
import {
  MapPin,
  Calendar,
  Clock,
  MessageCircle,
  Ticket,
  ChevronRight,
  User,
  Plus,
  RefreshCw,
  Search,
  Building2,
  CalendarDays,
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
  userAvatar,
}: BookingHistoryListProps) {
  const [activeTab, setActiveTab] = useState<"aktif" | "selesai">("aktif");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = useMemo(() => {
    return bookings.filter((item) => {
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
        item.serviceName.toLowerCase().includes(q) ||
        (item.code && item.code.toLowerCase().includes(q))
      );
    });
  }, [bookings, activeTab, searchQuery]);

  return (
    <div className="w-full max-w-4xl lg:max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 text-left">
      {/* Top Header Location & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#8C6B1C] bg-[#FAF5EA] px-4 py-2 rounded-full border border-[#EADBBD] shadow-2xs">
          <Building2 className="w-4 h-4" />
          <span>Aesthetic Pondok Indah</span>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              onClick={onRefresh}
              className="h-9 px-3 rounded-xl bg-white border-[#E6DECB] text-[#7C7365] hover:text-[#8C6B1C] hover:bg-[#FAF8F5] transition-all text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Perbarui Riwayat"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#8C6B1C]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}

          <Button
            type="button"
            onClick={onBookNew}
            className="h-9 px-4 rounded-xl bg-[#8C6B1C] hover:bg-[#735716] text-white text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Booking Baru</span>
          </Button>
        </div>
      </div>

      {/* Page Title & Subtitle */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#2C2416]">
          Riwayat Booking Pasien
        </h2>
        <p className="text-xs sm:text-sm text-[#7C7365]">
          Kelola seluruh janji temu aktif dan riwayat perawatan medis gigi Anda yang tersinkronisasi dengan database klinik.
        </p>
      </div>

      {/* Search & Tabs Controls */}
      <div className="bg-white border border-[#E6DECB] rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        {/* Tabs Aktif & Selesai */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#EDE5D6]">
          <button
            type="button"
            onClick={() => setActiveTab("aktif")}
            className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "aktif"
                ? "bg-[#8C6B1C] text-white shadow-xs"
                : "text-[#7C7365] hover:text-[#2C2416]"
            }`}
          >
            <span>Janji Temu Aktif</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("selesai")}
            className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "selesai"
                ? "bg-[#8C6B1C] text-white shadow-xs"
                : "text-[#7C7365] hover:text-[#2C2416]"
            }`}
          >
            <span>Riwayat Selesai</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari dokter, layanan, atau kode..."
            className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-white border border-[#D9D0BC] rounded-xl focus:outline-none focus:border-[#8C6B1C] focus:ring-1 focus:ring-[#8C6B1C] text-[#2C2416]"
          />
        </div>
      </div>

      {/* Booking Cards Grid (Responsive 1 Col on Mobile, 2 Cols on Desktop) */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-[#E6DECB] rounded-3xl p-12 text-center space-y-3 shadow-xs">
            <RefreshCw className="w-8 h-8 text-[#8C6B1C] animate-spin mx-auto" />
            <p className="text-sm font-bold text-[#2C2416]">
              Memuat Riwayat Booking...
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white border border-[#E6DECB] rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center mx-auto border border-[#EADBBD] shadow-inner">
              <CalendarDays className="w-8 h-8 stroke-[1.75]" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="text-base sm:text-lg font-bold text-[#2C2416]">
                Belum Ada Riwayat Booking {activeTab === "aktif" ? "Aktif" : "Selesai"}
              </h4>
              <p className="text-xs sm:text-sm text-[#7C7365]">
                {activeTab === "aktif"
                  ? "Anda belum memiliki janji temu aktif. Buat reservasi baru sekarang untuk berkonsultasi dengan dokter gigi spesialis."
                  : "Riwayat kunjungan perawatan gigi yang telah selesai atau dibatalkan akan tersimpan rapi di sini."}
              </p>
            </div>
            {activeTab === "aktif" && (
              <Button
                type="button"
                onClick={onBookNew}
                className="mt-2 h-11 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735716] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Buat Reservasi Sekarang</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredBookings.map((item) => {
              const raw = (item.status || "").toLowerCase();
              const isConfirmed = raw === "confirmed" || raw === "dikonfirmasi";
              const isCompleted = raw === "completed" || raw === "selesai";
              const isCancelled = raw === "cancelled" || raw === "dibatalkan";

              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#E6DECB] hover:border-[#C59E3F] rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 text-left group"
                >
                  {/* Top Doctor & Status Banner */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#EFE9DC] overflow-hidden shrink-0 border border-[#D9D0BC] shadow-2xs">
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
                            <User className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-[#2C2416] group-hover:text-[#8C6B1C] transition-colors">
                          {item.doctorName}
                        </h4>
                        <p className="text-xs text-[#8C8272]">
                          {item.specialization || "Dokter Gigi Spesialis"}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide shadow-2xs shrink-0 ${
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

                  {/* Treatment Info & Time Card */}
                  <div className="bg-[#FAF8F5] border border-[#EDE5D6] rounded-2xl p-3.5 space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#2C2416]">
                        {item.serviceName}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-[#8C6B1C] bg-white px-2 py-0.5 rounded-md border border-[#E6DECB]">
                        {item.code || `#RSV-${String(item.id).padStart(6, "0")}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#7C7365] pt-1 border-t border-[#EADBBD]">
                      <Calendar className="w-3.5 h-3.5 text-[#8C6B1C] shrink-0" />
                      <span className="font-medium text-[#2C2416]">
                        {item.displayDate || item.date}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-[#8C6B1C]">
                        {item.time} WIB
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#7C7365]">
                      <MapPin className="w-3.5 h-3.5 text-[#8C6B1C] shrink-0" />
                      <span className="truncate">Aesthetic Pondok Indah</span>
                    </div>
                  </div>

                  {/* Action Buttons: E-Ticket & Hubungi Admin */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#EDE5D6]">
                    <Button
                      type="button"
                      onClick={() => onOpenETicket(item)}
                      className="h-10 rounded-xl bg-[#8C6B1C] hover:bg-[#735716] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>Lihat E-Tiket</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onContactAdmin(item)}
                      className="h-10 rounded-xl border border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF5EA] hover:text-[#8C6B1C] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Hubungi Admin</span>
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
