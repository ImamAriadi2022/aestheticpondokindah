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
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import ReservationTable from "../components/ReservationTable";
import ReservationDetailModal from "../components/ReservationDetailModal";
import CreateReservationModal from "../components/CreateReservationModal";
import AdminTreatmentManagement from "@/features/admin/treatments/pages/AdminTreatmentManagement";
import { deleteAdminReservation, type ReservationItem } from "../services/reservationService";
import { toast } from "@/shared/ui/toast";
import { scrollPageToTop } from "@/core/router/ScrollToTop";
import { PageTransition } from "@/core/router/RouteTransition";

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
  const [activeSubTab, setActiveSubTab] = useState<"reservations" | "treatments">("reservations");
  const [selected, setSelected] = useState<ReservationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sourceFilter, setSourceFilter] = useState("Semua");

  const handleSelect = (item: ReservationItem) => {
    setSelected(item);
    setIsModalOpen(true);
    scrollPageToTop();
    if (onSelectReservation) onSelectReservation(item);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelected(null);
    scrollPageToTop();
  };

  const handleModalUpdated = () => {
    if (onRefresh) onRefresh();
  };

  const handleDeleteReservation = async (item: ReservationItem) => {
    if (!token) return;
    const rCode = item.code || `RSV-${String(item.id).padStart(6, "0")}`;
    const pName = item.name || "Pasien";
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus data reservasi ${rCode} (${pName})? Tindakan ini akan menghapus data secara permanen.`
    );
    if (!confirmed) return;

    try {
      await deleteAdminReservation(token, item.id);
      toast({
        title: "Reservasi Dihapus",
        message: `Data reservasi ${rCode} berhasil dihapus.`,
        variant: "success",
      });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast({
        title: "Gagal Menghapus",
        message: err.message || "Gagal menghapus data reservasi.",
        variant: "error",
      });
    }
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
    }).sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0);
      if (timeB !== timeA) return timeB - timeA;
      return Number(b.id || 0) - Number(a.id || 0);
    });
  }, [reservations, searchQuery, statusFilter, sourceFilter]);

  return (
    <div className="space-y-6 text-left">
      {/* Top Header & Sub-Tabs Switcher (Hidden during Detail View) */}
      {!selected && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#F0E6D3] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#3D332A] tracking-tight flex items-center gap-2">
                <Calendar className="w-6 h-6 text-[#C9A24A]" />
                Manajemen Reservasi & Layanan Klinik
              </h2>
              <p className="text-sm text-[#7A6E60] mt-1">
                Pusat kendali operasional janji temu pasien (Guest & Member) serta pengelolaan katalog layanan tindakan medis.
              </p>
            </div>

            {activeSubTab === "reservations" && (
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#8C6B1C] hover:bg-[#785A17] active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Tambah Reservasi
                </button>
              </div>
            )}
          </div>

          {/* Sub-Tabs Selector */}
          <div className="flex items-center gap-2 pt-2 pb-1 border-t border-[#F5ECE0] overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveSubTab("reservations")}
              className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "reservations"
                  ? "bg-[#8C6B1C] text-white shadow-md"
                  : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Janji Temu & Alur Reservasi</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeSubTab === "reservations"
                    ? "bg-white/20 text-white"
                    : "bg-[#EADBBD] text-[#4A3F35]"
                }`}
              >
                {totalCount}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab("treatments")}
              className={`shrink-0 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === "treatments"
                  ? "bg-[#8C6B1C] text-white shadow-md"
                  : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span className="whitespace-nowrap">Layanan Klinik (Treatments)</span>
              <span
                className={`shrink-0 whitespace-nowrap text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  activeSubTab === "treatments"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                Tersedia
              </span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: RESERVASI JANJI TEMU PASIEN */}
      {activeSubTab === "reservations" && (
        <PageTransition transitionKey={selected ? `detail_${selected.id}` : "list"}>
          {selected ? (
            /* In-Page Booking Detail View (No Modal Dialog) */
            <ReservationDetailModal
              isOpen={true}
              onClose={handleCloseModal}
              reservation={selected}
              doctors={doctors}
              token={token}
              onUpdated={handleModalUpdated}
            />
          ) : (
            <div className="space-y-6 animate-in fade-in duration-200">
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89F91] pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kode, nama pasien, layanan..."
                      className="w-full h-10 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl pl-10 pr-8 text-xs font-medium text-[#3D332A] placeholder:text-[#A89F91] focus:outline-hidden focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 transition-all shadow-xs"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A89F91] hover:text-[#3D332A] p-0.5 rounded-full"
                      >
                        <span className="text-xs font-bold leading-none">✕</span>
                      </button>
                    )}
                  </div>

                  {/* Dropdown Filters */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Status Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#8A7B6B] flex items-center gap-1 shrink-0">
                        <Filter className="w-3.5 h-3.5 text-[#B8943F]" /> Status:
                      </span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl px-3 text-xs font-semibold text-[#3D332A] focus:outline-hidden focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 cursor-pointer shadow-xs transition-all"
                      >
                        <option value="Semua">Semua Status</option>
                        <option value="Baru">Baru</option>
                        <option value="Dikonfirmasi">Dikonfirmasi</option>
                        <option value="Selesai">Selesai</option>
                        <option value="Dibatalkan">Dibatalkan</option>
                      </select>
                    </div>

                    {/* Asal Booking Dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#8A7B6B] shrink-0">
                        Asal:
                      </span>
                      <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="h-10 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl px-3 text-xs font-semibold text-[#3D332A] focus:outline-hidden focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 cursor-pointer shadow-xs transition-all"
                      >
                        <option value="Semua">Semua Asal</option>
                        <option value="guest">Guest</option>
                        <option value="member">Member</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Reservation Table */}
              <ReservationTable
                reservations={filteredReservations}
                onSelect={handleSelect}
                onDelete={handleDeleteReservation}
                token={token}
                onRefresh={onRefresh}
              />
            </div>
          )}
        </PageTransition>
      )}

      {/* TAB 2: LAYANAN KLINIK (TREATMENTS) */}
      {activeSubTab === "treatments" && (
        <div className="animate-in fade-in duration-200">
          <AdminTreatmentManagement />
        </div>
      )}

      {/* Create Reservation Modal */}
      <CreateReservationModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        token={token}
        doctors={doctors}
        onSuccess={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
