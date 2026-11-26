import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import {
  Eye,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Stethoscope,
  User,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import type { ReservationItem } from "../services/reservationService";

type Props = {
  reservations: ReservationItem[];
  onSelect: (item: ReservationItem) => void;
  onDelete?: (item: ReservationItem) => void;
  onBulkDelete?: (items: ReservationItem[]) => Promise<void> | void;
  token?: string;
  onRefresh?: () => void;
  selectedIds?: (string | number)[];
  onToggleSelect?: (id: string | number) => void;
  onToggleSelectAll?: () => void;
};

const DAYS_NAME = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

function getStatusBadge(status: string) {
  const raw = (status || "").toLowerCase();
  if (raw === "selesai" || raw === "completed") {
    return {
      bg: "bg-purple-50 text-purple-700 border-purple-200",
      dot: "bg-purple-500",
      label: "Selesai",
    };
  }
  if (raw === "dikonfirmasi" || raw === "confirmed") {
    return {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
      label: "Dikonfirmasi",
    };
  }
  if (raw === "dibatalkan" || raw === "cancelled") {
    return {
      bg: "bg-red-50 text-red-700 border-red-200",
      dot: "bg-red-500",
      label: "Dibatalkan",
    };
  }
  return {
    bg: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    label: "Menunggu",
  };
}

export default function ReservationTable({
  reservations,
  onSelect,
  onDelete,
  onBulkDelete,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
}: Props) {
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<ReservationItem | "bulk" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAllSelected = reservations.length > 0 && reservations.every((r) => selectedIds.includes(r.id));
  const isSomeSelected = reservations.some((r) => selectedIds.includes(r.id));

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    setIsDeleting(true);
    try {
      if (deleteConfirmTarget === "bulk") {
        const itemsToDelete = reservations.filter((r) => selectedIds.includes(r.id));
        if (onBulkDelete) {
          await onBulkDelete(itemsToDelete);
        }
      } else {
        if (onDelete) {
          await onDelete(deleteConfirmTarget);
        }
      }
      setDeleteConfirmTarget(null);
    } catch (err) {
      // handled in parent toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Floating Bulk Action Bar when items selected */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 bg-red-50/90 border border-red-200 px-4 py-2.5 rounded-2xl text-xs font-semibold text-red-800 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center text-[11px] font-bold">
              {selectedIds.length}
            </span>
            <span>data reservasi ditandai untuk dihapus</span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleSelectAll && (
              <button
                type="button"
                onClick={onToggleSelectAll}
                className="px-2.5 py-1 text-xs text-red-700 hover:text-red-900 hover:bg-red-100/60 rounded-lg transition-colors cursor-pointer"
              >
                Batal Pilih
              </button>
            )}
            <button
              type="button"
              onClick={() => setDeleteConfirmTarget("bulk")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Ditandai ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-red-100 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1E293B]">
                  {deleteConfirmTarget === "bulk"
                    ? `Hapus ${selectedIds.length} Data Reservasi?`
                    : "Hapus Data Reservasi?"}
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {deleteConfirmTarget === "bulk"
                    ? "Tindakan ini akan menghapus data yang ditandai secara permanen tanpa menyebabkan sistem down."
                    : `Hapus reservasi ${(deleteConfirmTarget as ReservationItem).code || `RSV-${(deleteConfirmTarget as ReservationItem).id}`} atas nama ${(deleteConfirmTarget as ReservationItem).name}?`}
                </p>
              </div>
            </div>

            <div className="p-3 bg-red-50/70 rounded-2xl border border-red-100 text-[11px] text-red-700 leading-relaxed">
              Data yang dihapus tidak dapat dipulihkan kembali. Pastikan pilihan Anda sudah sesuai.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 h-9 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#475569] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-[#F0E6D3] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#FAF8F5] border-b border-[#F0E6D3]">
                {/* Checkbox Column */}
                <TableHead className="w-10 py-3.5 pl-4 md:pl-6 text-xs">
                  {onToggleSelectAll && (
                    <button
                      type="button"
                      onClick={onToggleSelectAll}
                      aria-label="Tandai semua baris"
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                        isAllSelected
                          ? "bg-red-600 border-red-600 text-white"
                          : isSomeSelected
                          ? "bg-red-100 border-red-400 text-red-600"
                          : "border-[#CBD5E1] bg-white hover:border-[#94A3B8]"
                      }`}
                      title={isAllSelected ? "Batal tandai semua" : "Tandai semua data di halaman ini"}
                    >
                      {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      {!isAllSelected && isSomeSelected && <div className="w-2 h-0.5 bg-red-600 rounded-full" />}
                    </button>
                  )}
                </TableHead>
                <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Nama</TableHead>
                <TableHead className="hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs">Layanan</TableHead>
                <TableHead className="hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs">Dokter</TableHead>
                <TableHead className="hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs">Jadwal</TableHead>
                <TableHead className="hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs">Waktu</TableHead>
                <TableHead className="hidden md:table-cell font-bold text-[#3D332A] py-3.5 text-xs">Status</TableHead>
                <TableHead className="font-bold text-[#3D332A] py-3.5 pr-4 md:pr-6 text-right text-xs">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-[#8A7B6B]">
                    <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#B8943F]" />
                    <p className="text-sm font-medium">Belum ada data reservasi janji temu yang sesuai filter.</p>
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  const statusBadge = getStatusBadge(item.status || "Baru");
                  const patientName = item.name || (item as any).patient_name || (item as any).user_name || "Pasien";
                  const serviceName = item.treatment_interest || (item as any).service_name || (item as any).service || item.complaint || "Pemeriksaan Gigi";
                  const doctorName = item.doctor || (item as any).doctor_name || "drg. Yulita Dora, Sp.KG";
                  const rawDate = item.date ? String(item.date).split("T")[0] : "-";
                  const rawTime = item.preferred_time || (item as any).booking_time || "10:00 WIB";

                  // Parse day name & formatted date (e.g. Sen, 23 Nov 2026)
                  let dayFormatted = "-";
                  let dateFormatted = rawDate;
                  if (rawDate !== "-") {
                    const dt = new Date(rawDate);
                    const dayIdx = dt.getDay();
                    dayFormatted = DAYS_NAME[dayIdx] || "";
                    const dayNum = dt.getDate();
                    const monthShort = MONTH_NAMES[dt.getMonth()] || "";
                    const yearNum = dt.getFullYear();
                    dateFormatted = `${dayNum} ${monthShort} ${yearNum}`;
                  }

                  return (
                    <TableRow
                      key={item.id}
                      className={`transition-colors border-b border-[#F5ECE0] ${
                        isChecked
                          ? "bg-red-50/50 hover:bg-red-50/70 border-red-100"
                          : "hover:bg-[#FDFBF7]"
                      }`}
                    >
                      {/* Checkbox Tandai Baris */}
                      <TableCell className="py-3.5 pl-4 md:pl-6 w-10">
                        {onToggleSelect && (
                          <button
                            type="button"
                            onClick={() => onToggleSelect(item.id)}
                            aria-label={`Tandai reservasi ${patientName}`}
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                              isChecked
                                ? "bg-red-600 border-red-600 text-white"
                                : "border-[#CBD5E1] bg-white hover:border-[#94A3B8]"
                            }`}
                            title={isChecked ? "Hilangkan tanda" : "Tandai untuk dihapus"}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        )}
                      </TableCell>

                      {/* Nama */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D332A]">
                          <User className="w-3.5 h-3.5 text-[#B8943F] shrink-0" />
                          <span>{patientName}</span>
                          {isChecked && (
                            <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.2 rounded-md">
                              Ditandai
                            </span>
                          )}
                        </div>
                        <div className="md:hidden mt-0.5 text-[10px] text-[#8A7B6B] flex items-center gap-1.5">
                          <span className="truncate max-w-[120px] font-medium">{serviceName}</span>
                          <span>•</span>
                          <span>{dateFormatted}</span>
                        </div>
                      </TableCell>

                      {/* Layanan */}
                      <TableCell className="hidden md:table-cell py-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3D332A] max-w-[200px] truncate">
                          <Sparkles className="w-3.5 h-3.5 text-[#C9A24A] shrink-0" />
                          <span className="truncate">{serviceName}</span>
                        </div>
                      </TableCell>

                      {/* Dokter */}
                      <TableCell className="hidden md:table-cell py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-[#5C4D3C] max-w-[190px] truncate">
                          <Stethoscope className="w-3.5 h-3.5 text-[#B8943F] shrink-0" />
                          <span className="truncate font-medium">{doctorName}</span>
                        </div>
                      </TableCell>

                      {/* Jadwal */}
                      <TableCell className="hidden md:table-cell py-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3D332A]">
                          <CalendarIcon className="w-3.5 h-3.5 text-[#B8943F] shrink-0" />
                          <span>{dayFormatted}, {dateFormatted}</span>
                        </div>
                      </TableCell>

                      {/* Waktu */}
                      <TableCell className="hidden md:table-cell py-3.5">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-[#5C4D3C]">
                          <Clock className="w-3.5 h-3.5 text-[#B8943F] shrink-0" />
                          <span>{rawTime}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="hidden md:table-cell py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                          {statusBadge.label}
                        </span>
                      </TableCell>

                      {/* Aksi */}
                      <TableCell className="py-3.5 pr-4 md:pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => onSelect(item)}
                            className="h-7 w-7 p-0 bg-[#FAF4E8] hover:bg-[#F5E6C8] text-[#8A6B2B] rounded-xl border border-[#E8D4A2]/60 transition-all shadow-2xs inline-flex items-center justify-center cursor-pointer"
                            title="Lihat Detail Reservasi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {onDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteConfirmTarget(item)}
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl border border-red-200/60 transition-all shadow-2xs inline-flex items-center justify-center cursor-pointer"
                              title="Hapus Data Reservasi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
