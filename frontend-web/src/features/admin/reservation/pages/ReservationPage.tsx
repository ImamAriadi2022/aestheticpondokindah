import { useState, useMemo } from "react";
import {
  Calendar,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  FileCheck,
  RefreshCw,
} from "lucide-react";
import ReservationTable from "../components/ReservationTable";
import ReservationDetailModal from "../components/ReservationDetailModal";
import type { ReservationItem } from "../services/reservationService";

type Props = {
  reservations: ReservationItem[];
  doctors?: any[];
  token?: string;
  onRefresh?: () => void;
  onSelectReservation?: (item: ReservationItem) => void;
};

export default function ReservationPage({
  reservations,
  doctors = [],
  token = "",
  onRefresh,
  onSelectReservation,
}: Props) {
  const [selected, setSelected] = useState<ReservationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sourceFilter, setSourceFilter] = useState("Semua");

  const handleSelect = (item: ReservationItem) => {
    setSelected(item);
    setIsModalOpen(true);
    if (onSelectReservation) onSelectReservation(item);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelected(null);
  };

  const handleModalUpdated = () => {
    if (onRefresh) onRefresh();
  };

  // Quick stats calculation
  const totalCount = reservations.length;
  const newCount = reservations.filter(
    (r) => r.status === "Baru" || r.status === "pending"
  ).length;
  const confirmedCount = reservations.filter(
    (r) => r.status === "Dikonfirmasi" || r.status === "confirmed"
  ).length;
  const completedCount = reservations.filter(
    (r) => r.status === "Selesai" || r.status === "completed"
  ).length;

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Search
      const searchLower = searchQuery.toLowerCase();
      const codeMatch = (r.code || `RSV-${r.id}`).toLowerCase().includes(searchLower);
      const nameMatch = (r.name || "").toLowerCase().includes(searchLower);
      const phoneMatch = (r.phone || "").toLowerCase().includes(searchLower);
      const serviceMatch = (r.treatment_interest || "").toLowerCase().includes(searchLower);
      const doctorMatch = (r.doctor || "").toLowerCase().includes(searchLower);

      const matchesSearch = !searchQuery || codeMatch || nameMatch || phoneMatch || serviceMatch || doctorMatch;

      // Status
      const matchesStatus =
        statusFilter === "Semua" ||
        r.status === statusFilter ||
        (statusFilter === "Baru" && (r.status === "Baru" || r.status === "pending")) ||
        (statusFilter === "Dikonfirmasi" && (r.status === "Dikonfirmasi" || r.status === "confirmed")) ||
        (statusFilter === "Selesai" && (r.status === "Selesai" || r.status === "completed")) ||
        (statusFilter === "Dibatalkan" && (r.status === "Dibatalkan" || r.status === "cancelled"));

      // Source
      const isGuest = !r.user_id || (r.source && r.source.includes("guest"));
      const matchesSource =
        sourceFilter === "Semua" ||
        (sourceFilter === "guest" && isGuest) ||
        (sourceFilter === "member" && !isGuest);

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [reservations, searchQuery, statusFilter, sourceFilter]);

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#3D332A] tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#C9A24A]" />
            Reservasi Janji Temu Pasien
          </h2>
          <p className="text-sm text-[#7A6E60] mt-1">
            Monitoring dan kelola kunjungan perawatan pasien klinik Aesthetic Pondok Indah (Guest & Member).
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#FAF6EE] text-[#8A6B2B] rounded-xl border border-[#E8DFC8] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Muat Ulang Data
          </button>
        )}
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#F0E6D3] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A7B6B]">Total Reservasi</span>
            <div className="w-8 h-8 rounded-xl bg-[#F5E6C8] flex items-center justify-center text-[#B8943F]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#3D332A] mt-2">{totalCount}</p>
          <p className="text-[10px] text-[#A89F91] mt-0.5">Semua entri database</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#F0E6D3] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Perlu Konfirmasi</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">{newCount}</p>
          <p className="text-[10px] text-amber-600 mt-0.5">Menunggu respon admin</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#F0E6D3] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Dikonfirmasi</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">{confirmedCount}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Jadwal telah terkunci</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#F0E6D3] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700">Selesai Dirawat</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-2">{completedCount}</p>
          <p className="text-[10px] text-purple-600 mt-0.5">Kunjungan tuntas</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#F0E6D3] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89F91]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode, nama pasien, layanan..."
              className="w-full bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl pl-9.5 pr-4 py-2 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
            />
          </div>

          {/* Asal Booking Tabs (Guest vs Member) */}
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8DFC8] w-full md:w-auto">
            <button
              onClick={() => setSourceFilter("Semua")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sourceFilter === "Semua"
                  ? "bg-white text-[#8A6B2B] shadow-xs"
                  : "text-[#8A7B6B] hover:text-[#3D332A]"
              }`}
            >
              Semua Asal
            </button>
            <button
              onClick={() => setSourceFilter("guest")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sourceFilter === "guest"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-[#8A7B6B] hover:text-blue-700"
              }`}
            >
              🌐 Guest
            </button>
            <button
              onClick={() => setSourceFilter("member")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sourceFilter === "member"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-[#8A7B6B] hover:text-emerald-700"
              }`}
            >
              👤 Member
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#F5ECE0]">
          <span className="text-xs font-semibold text-[#8A7B6B] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-[#B8943F]" /> Status:
          </span>
          {["Semua", "Baru", "Dikonfirmasi", "Selesai", "Dibatalkan"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? "bg-[#C9A24A] text-white shadow-xs"
                  : "bg-[#FAF8F5] hover:bg-[#F5ECE0] text-[#7A6E60] border border-[#E8DFC8]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reservation Table */}
      <ReservationTable
        reservations={filteredReservations}
        onSelect={handleSelect}
      />

      {/* Interactive Detail Modal Popup */}
      <ReservationDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        reservation={selected}
        doctors={doctors}
        token={token}
        onUpdated={handleModalUpdated}
      />
    </div>
  );
}
