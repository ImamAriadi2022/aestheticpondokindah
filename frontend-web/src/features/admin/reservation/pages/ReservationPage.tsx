import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  Calendar,
  Search,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  FileCheck,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
} from "lucide-react";
import ReservationTable from "../components/ReservationTable";
import ReservationDetailModal from "../components/ReservationDetailModal";
import CreateReservationModal from "../components/CreateReservationModal";
import WeeklyAppointmentCalendar from "../components/WeeklyAppointmentCalendar";
import {
  deleteAdminReservation,
  bulkDeleteAdminReservations,
  type ReservationItem,
} from "../services/reservationService";
import { DUMMY_WEEKLY_RESERVATIONS } from "../services/dummyReservations";
import { toast } from "@/shared/ui/toast";
import { scrollPageToTop } from "@/core/router/ScrollToTop";
import { PageTransition } from "@/core/router/RouteTransition";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { usePageRefresh } from "@/core/events/refreshEvents";
import { Button } from "@/shared/ui/button";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState<ReservationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [sourceFilter, setSourceFilter] = useState("Semua");
  const [rowsPerPage, setRowsPerPage] = useState<string>("Semua");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sourceFilter, rowsPerPage]);

  // Otomatis buka detail reservasi jika ada parameter query `code` atau `reservation_id` (misal dari notifikasi)
  useEffect(() => {
    const codeParam = searchParams.get("code") || searchParams.get("bookingCode");
    const idParam = searchParams.get("reservation_id") || searchParams.get("id");

    if ((codeParam || idParam) && reservations && reservations.length > 0) {
      const target = reservations.find((r) => {
        const rCode = (r.code || `RSV-${String(r.id).padStart(6, "0")}`).toLowerCase().replace(/#/g, "").trim();
        const cleanQueryCode = (codeParam || "").toLowerCase().replace(/#/g, "").trim();
        const codeMatches = cleanQueryCode && rCode === cleanQueryCode;
        const idMatches = idParam && String(r.id) === String(idParam);
        return codeMatches || idMatches;
      });

      if (target) {
        setSelected(target);
        setIsModalOpen(true);
        scrollPageToTop();
      }
    }
  }, [searchParams, reservations]);

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
    // Hapus parameter code / reservation_id dari URL jika ada
    if (searchParams.has("code") || searchParams.has("bookingCode") || searchParams.has("reservation_id") || searchParams.has("id")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("code");
      nextParams.delete("bookingCode");
      nextParams.delete("reservation_id");
      nextParams.delete("id");
      setSearchParams(nextParams, { replace: true });
    }
    scrollPageToTop();
  };

  const handleModalUpdated = () => {
    if (onRefresh) onRefresh();
  };

  const handleDeleteReservation = async (item: ReservationItem) => {
    if (!token) return;
    const rCode = item.code || `RSV-${String(item.id).padStart(6, "0")}`;

    try {
      await deleteAdminReservation(token, item.id);
      setSelectedIds((prev) => prev.filter((id) => id !== item.id));
      toast({
        title: "Reservasi Dihapus",
        message: `Data reservasi ${rCode} berhasil dihapus tanpa gangguan.`,
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

  const handleBulkDelete = async (items: ReservationItem[]) => {
    if (!token || items.length === 0) return;
    const ids = items.map((i) => i.id);

    try {
      const res = await bulkDeleteAdminReservations(token, ids);
      setSelectedIds([]);
      toast({
        title: "Berhasil Dihapus",
        message: res.message || `${ids.length} data reservasi berhasil dihapus seketika.`,
        variant: "success",
      });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast({
        title: "Gagal Menghapus",
        message: err.message || "Gagal menghapus data yang dipilih.",
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

  // Paginated reservations based on rowsPerPage
  const totalFilteredCount = filteredReservations.length;
  const pageSize = rowsPerPage === "Semua" ? totalFilteredCount : parseInt(rowsPerPage, 10);
  const totalPages = pageSize > 0 ? Math.ceil(totalFilteredCount / pageSize) : 1;

  const paginatedReservations = useMemo(() => {
    if (rowsPerPage === "Semua") return filteredReservations;
    const start = (currentPage - 1) * pageSize;
    return filteredReservations.slice(start, start + pageSize);
  }, [filteredReservations, currentPage, pageSize, rowsPerPage]);

  const handleToggleSelect = (id: string | number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllCurrentPage = () => {
    const currentPageIds = paginatedReservations.map((r) => r.id);
    const allSelectedOnPage = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));

    if (allSelectedOnPage) {
      // Unselect all on current page
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      // Select all on current page
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

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
                doctors={doctors}
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

                  {/* Filter Baris Data / Page Size */}
                  <FilterDropdown
                    value={rowsPerPage}
                    onChange={setRowsPerPage}
                    icon={SlidersHorizontal}
                    labelPrefix="Tampilkan"
                    options={[
                      { value: "10", label: "10 Baris" },
                      { value: "20", label: "20 Baris" },
                      { value: "50", label: "50 Baris" },
                      { value: "Semua", label: "Semua Baris" },
                    ]}
                  />
                </div>
              </div>

              {/* Main Reservation Table */}
              <ReservationTable
                reservations={paginatedReservations}
                onSelect={handleSelect}
                onDelete={handleDeleteReservation}
                onBulkDelete={handleBulkDelete}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAllCurrentPage}
                token={token}
                onRefresh={onRefresh}
              />

              {/* Pagination Controls when limited rows */}
              {rowsPerPage !== "Semua" && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-3.5 rounded-2xl border border-[#F0E6D3] shadow-xs gap-3">
                  <p className="text-xs text-[#8A7B6B]">
                    Menampilkan{" "}
                    <span className="font-bold text-[#4A3F35]">
                      {totalFilteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-bold text-[#4A3F35]">
                      {Math.min(currentPage * pageSize, totalFilteredCount)}
                    </span>{" "}
                    dari <span className="font-bold text-[#4A3F35]">{totalFilteredCount}</span> reservasi
                  </p>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="h-8 px-3 rounded-xl border-[#E2E8F0] text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Sebelumnya
                    </Button>

                    <div className="flex items-center gap-1 px-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return (
                            page === 1 ||
                            page === totalPages ||
                            Math.abs(page - currentPage) <= 1
                          );
                        })
                        .map((page, idx, arr) => {
                          const prevPage = arr[idx - 1];
                          const hasGap = prevPage && page - prevPage > 1;

                          return (
                            <div key={page} className="flex items-center">
                              {hasGap && <span className="text-xs text-gray-400 px-1">...</span>}
                              <button
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                  currentPage === page
                                    ? "bg-[#C9A24A] text-white shadow-2xs"
                                    : "text-[#64748B] hover:bg-gray-100"
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          );
                        })}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="h-8 px-3 rounded-xl border-[#E2E8F0] text-xs font-bold hover:bg-[#FAF8F5] cursor-pointer"
                    >
                      Berikutnya <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
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
