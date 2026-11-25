import { useState, useMemo } from "react";
import {
  Calendar,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import ReservationTable from "../components/ReservationTable";
import ReservationDetailModal from "../components/ReservationDetailModal";
import CreateReservationModal from "../components/CreateReservationModal";
import WeeklyAppointmentCalendar from "../components/WeeklyAppointmentCalendar";
import { deleteAdminReservation, type ReservationItem } from "../services/reservationService";
import { DUMMY_WEEKLY_RESERVATIONS } from "../services/dummyReservations";
import { toast } from "@/shared/ui/toast";
import { scrollPageToTop } from "@/core/router/ScrollToTop";
import { PageTransition } from "@/core/router/RouteTransition";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { usePageRefresh } from "@/core/events/refreshEvents";

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sourceFilter, setSourceFilter] = useState("Semua");

  usePageRefresh(() => {
    if (onRefresh) onRefresh();
  });

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

  // 100% Realtime backend reservations from database (no dummy)
  const activeReservationsList = useMemo(() => {
    return Array.isArray(reservations) ? [...reservations] : [];
  }, [reservations]);

  // Quick stats calculation
  const totalCount = activeReservationsList.length;
  const newCount = activeReservationsList.filter((r) => {
    const st = (r.status || "").toLowerCase();
    return st === "baru" || st === "pending" || st === "menunggu" || st === "menunggu konfirmasi" || st === "submitted";
  }).length;
  const confirmedCount = activeReservationsList.filter((r) => {
    const st = (r.status || "").toLowerCase();
    return st === "dikonfirmasi" || st === "confirmed" || st === "approved" || st === "disetujui";
  }).length;
  const completedCount = activeReservationsList.filter((r) => {
    const st = (r.status || "").toLowerCase();
    return st === "selesai" || st === "completed" || st === "selesai dirawat";
  }).length;

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return activeReservationsList.filter((r) => {
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
  }, [activeReservationsList, searchQuery, statusFilter, sourceFilter]);

  return (
    <div className="space-y-5 text-left">
      {/* Top Header (Hidden during Detail View) */}
      {!selected && (
        <PageHeader
          title="Manajemen Reservasi Pasien"
          actions={
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 h-9 bg-[#8C6B1C] hover:bg-[#785A17] active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              Tambah Reservasi
            </button>
          }
        />
      )}

      {/* RESERVASI JANJI TEMU PASIEN */}
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
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Weekly Appointment Calendar Overview */}
              <WeeklyAppointmentCalendar
                reservations={activeReservationsList}
                onSelectReservation={handleSelect}
              />

              {/* Ringkasan Status Kecil (Tepat di atas bar pencarian) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Total Reservasi */}
                <div className="bg-white rounded-2xl p-4 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-[#8C6B1C] flex items-center justify-center mb-2">
                    <span className="text-sm font-bold text-[#3D332A]">{totalCount}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#4A3F35]">Total Reservasi</span>
                </div>

                {/* Perlu Konfirmasi */}
                <div className="bg-white rounded-2xl p-4 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-[#E5A024] flex items-center justify-center mb-2">
                    <span className="text-sm font-bold text-[#3D332A]">{newCount}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#4A3F35]">Perlu Konfirmasi</span>
                </div>

                {/* Dikonfirmasi */}
                <div className="bg-white rounded-2xl p-4 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-[#10B981] flex items-center justify-center mb-2">
                    <span className="text-sm font-bold text-[#3D332A]">{confirmedCount}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#4A3F35]">Dikonfirmasi</span>
                </div>

                {/* Selesai Dirawat */}
                <div className="bg-white rounded-2xl p-4 border border-[#EADBBD] shadow-2xs flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-[#8B5CF6] flex items-center justify-center mb-2">
                    <span className="text-sm font-bold text-[#3D332A]">{completedCount}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#4A3F35]">Selesai Dirawat</span>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white rounded-2xl p-3.5 border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Cari kode, nama pasien, layanan..."
                />

                {/* Dropdown Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <FilterDropdown
                    value={statusFilter}
                    onChange={setStatusFilter}
                    icon={Filter}
                    labelPrefix="Status"
                    options={[
                      { value: "Semua", label: "Semua Status" },
                      { value: "Baru", label: "Baru" },
                      { value: "Dikonfirmasi", label: "Dikonfirmasi" },
                      { value: "Selesai", label: "Selesai" },
                      { value: "Dibatalkan", label: "Dibatalkan" },
                    ]}
                  />

                  <FilterDropdown
                    value={sourceFilter}
                    onChange={setSourceFilter}
                    labelPrefix="Asal"
                    options={[
                      { value: "Semua", label: "Semua Asal" },
                      { value: "guest", label: "Guest" },
                      { value: "member", label: "Member" },
                    ]}
                  />
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
