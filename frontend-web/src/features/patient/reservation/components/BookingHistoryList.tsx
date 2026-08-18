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
  Filter,
} from "lucide-react";
import { Button } from "@/shared/ui/button";

interface BookingHistoryItem {
  id: string | number;
  code?: string;
  doctorName: string;
  doctorPhoto?: string;
  specialization?: string;
  serviceName: string;
  date: string;
  displayDate?: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled" | string;
  branchName?: string;
  locationAddress?: string;
  totalAmount?: string | number;
  notes?: string;
  examinationResult?: string;
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
      const isCompleted = s === "completed" || s === "selesai" || s === "cancelled" || s === "dibatalkan";
      
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
    <div className="w-full max-w-2xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Header Location & User Avatar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#8C6B1C] bg-[#FAF5EA] px-3 py-1.5 rounded-full border border-[#EADBBD]">
          <MapPin className="w-4 h-4" />
          <span>Pondok Indah Main Branch</span>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="w-8 h-8 rounded-full bg-white border border-[#E6DECB] flex items-center justify-center text-[#7C7365] hover:text-[#8C6B1C] hover:bg-[#FAF8F5] transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
          <div className="w-9 h-9 rounded-full bg-[#EFE9DC] border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-[#8C6B1C]">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Page Title & Subtitle */}
      <div className="space-y-1 text-left">
        <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#2C2416]">
          Riwayat Booking
        </h2>
        <p className="text-xs sm:text-sm text-[#7C7365]">
          Kelola janji temu dan riwayat perawatan Anda.
        </p>
      </div>

      {/* Tabs Aktif & Selesai */}
      <div className="border-b border-[#E6DECB] flex">
        <button
          type="button"
          onClick={() => setActiveTab("aktif")}
          className={`flex-1 py-3 text-sm font-semibold transition-all relative text-center ${
            activeTab === "aktif"
              ? "text-[#8C6B1C]"
              : "text-[#8C8272] hover:text-[#2C2416]"
          }`}
        >
          <span>Aktif</span>
          {activeTab === "aktif" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C6B1C] rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("selesai")}
          className={`flex-1 py-3 text-sm font-semibold transition-all relative text-center ${
            activeTab === "selesai"
              ? "text-[#8C6B1C]"
              : "text-[#8C8272] hover:text-[#2C2416]"
          }`}
        >
          <span>Selesai</span>
          {activeTab === "selesai" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C6B1C] rounded-full" />
          )}
        </button>
      </div>

      {/* Booking Cards List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-[#E6DECB] rounded-3xl p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7 stroke-[1.5]" />
            </div>
            <h4 className="text-base font-bold text-[#2C2416]">
              Belum Ada Riwayat Booking {activeTab === "aktif" ? "Aktif" : "Selesai"}
            </h4>
            <p className="text-xs text-[#7C7365] max-w-sm mx-auto">
              {activeTab === "aktif"
                ? "Jadwalkan kunjungan dokter gigi spesialis favorit Anda sekarang juga."
                : "Riwayat kunjungan perawatan gigi yang telah selesai akan tampil di sini."}
            </p>
            {activeTab === "aktif" && (
              <Button
                type="button"
                onClick={onBookNew}
                className="mt-2 h-11 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white font-semibold text-xs sm:text-sm shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Buat Booking Baru</span>
              </Button>
            )}
          </div>
        ) : (
          filteredBookings.map((item) => {
            const raw = (item.status || "").toLowerCase();
            const isConfirmed = raw === "confirmed" || raw === "dikonfirmasi";
            const isCompleted = raw === "completed" || raw === "selesai";
            const isCancelled = raw === "cancelled" || raw === "dibatalkan";

            return (
              <div
                key={item.id}
                className="bg-white border border-[#E6DECB] hover:border-[#C59E3F] rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 space-y-3.5 text-left"
              >
                {/* Doctor Header & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#EFE9DC] overflow-hidden shrink-0 border border-[#D9D0BC]">
                      {item.doctorPhoto ? (
                        <img
                          src={item.doctorPhoto}
                          alt={item.doctorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8C6B1C]">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#2C2416]">
                        {item.doctorName}
                      </h4>
                      <p className="text-xs text-[#8C8272]">
                        {item.specialization || "Dokter Gigi Umum"}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide ${
                      isCompleted
                        ? "bg-[#8C6B1C] text-white"
                        : isConfirmed
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : isCancelled
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {isCompleted
                      ? "Selesai"
                      : isConfirmed
                      ? "Confirmed"
                      : isCancelled
                      ? "Dibatalkan"
                      : "Pending"}
                  </span>
                </div>

                {/* Treatment & Time */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-sm font-semibold text-[#2C2416]">
                    {item.serviceName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#7C7365]">
                    <Calendar className="w-3.5 h-3.5 text-[#8C6B1C]" />
                    <span>
                      {item.displayDate || item.date}, {item.time} WIB
                    </span>
                  </div>
                </div>

                {/* Buttons: E-Ticket & Hubungi Admin */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#EDE5D6]">
                  <Button
                    type="button"
                    onClick={() => onOpenETicket(item)}
                    className="h-10 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white font-semibold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>E-Ticket</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onContactAdmin(item)}
                    className="h-10 rounded-xl border border-[#8C6B1C] text-[#8C6B1C] hover:bg-[#8C6B1C]/10 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Hubungi Admin</span>
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
