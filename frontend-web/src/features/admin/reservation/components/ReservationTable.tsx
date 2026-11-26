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
} from "lucide-react";
import type { ReservationItem } from "../services/reservationService";

type Props = {
  reservations: ReservationItem[];
  onSelect: (item: ReservationItem) => void;
  onDelete?: (item: ReservationItem) => void;
  token?: string;
  onRefresh?: () => void;
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

export default function ReservationTable({ reservations, onSelect, onDelete }: Props) {
  return (
    <div className="bg-white rounded-3xl border border-[#F0E6D3] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5] border-b border-[#F0E6D3]">
              <TableHead className="font-bold text-[#3D332A] py-3.5 pl-4 md:pl-6 text-xs">Nama</TableHead>
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
                <TableCell colSpan={7} className="text-center py-12 text-[#8A7B6B]">
                  <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#B8943F]" />
                  <p className="text-sm font-medium">Belum ada data reservasi janji temu yang sesuai filter.</p>
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((item) => {
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
                    className="hover:bg-[#FDFBF7] transition-colors border-b border-[#F5ECE0]"
                  >
                    {/* Nama */}
                    <TableCell className="py-3.5 pl-4 md:pl-6">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D332A]">
                        <User className="w-3.5 h-3.5 text-[#B8943F] shrink-0" />
                        <span>{patientName}</span>
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
                            onClick={() => onDelete(item)}
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
  );
}
