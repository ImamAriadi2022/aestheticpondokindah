import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import {
  Eye,
  Calendar,
  Clock,
  User,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import type { ReservationItem } from "../services/reservationService";

type Props = {
  reservations: ReservationItem[];
  onSelect: (item: ReservationItem) => void;
  token?: string;
  onRefresh?: () => void;
};

export default function ReservationTable({ reservations, onSelect }: Props) {
  const getStatusBadge = (status: string, isPaid: boolean) => {
    const raw = (status || "").toLowerCase();
    if (raw === "selesai" || raw === "completed") {
      return {
        bg: "bg-purple-50 text-purple-700 border-purple-200",
        icon: CheckCircle2,
        label: isPaid ? "Selesai (Lunas)" : "Selesai",
      };
    }
    if (raw === "dikonfirmasi" || raw === "confirmed") {
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
        label: "Dikonfirmasi",
      };
    }
    if (raw === "dibatalkan" || raw === "cancelled") {
      return {
        bg: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        label: "Dibatalkan",
      };
    }
    if (raw === "ditolak" || raw === "rejected") {
      return {
        bg: "bg-gray-100 text-gray-700 border-gray-200",
        icon: XCircle,
        label: "Ditolak",
      };
    }
    return {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      icon: AlertCircle,
      label: "Menunggu",
    };
  };

  return (
    <div className="bg-white rounded-3xl border border-[#F0E6D3] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5] border-b border-[#F0E6D3]">
              <TableHead className="font-bold text-[#3D332A] py-4 pl-6">Kode & Pasien</TableHead>
              <TableHead className="font-bold text-[#3D332A] py-4">Perawatan & Dokter</TableHead>
              <TableHead className="font-bold text-[#3D332A] py-4">Jadwal Kunjungan</TableHead>
              <TableHead className="font-bold text-[#3D332A] py-4">Status Reservasi</TableHead>
              <TableHead className="font-bold text-[#3D332A] py-4 pr-6 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-[#8A7B6B]">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#B8943F]" />
                  <p className="text-sm font-medium">Belum ada data reservasi janji temu yang sesuai filter.</p>
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((item) => {
                const isGuest = !item.user_id || (item.source && item.source.includes("guest"));
                const isPaid = item.paymentStatus === "Sudah Bayar" || item.paymentStatus === "paid" || item.status === "Selesai";
                const statusBadge = getStatusBadge(item.status || "Baru", isPaid);
                const bookingCode = item.code || `RSV-${String(item.id).padStart(6, "0")}`;
                const patientName = item.name || (item as any).patient_name || (item as any).user_name || "Pasien";
                const serviceName = item.treatment_interest || (item as any).service_name || (item as any).service || item.complaint || "Pemeriksaan Gigi";
                const doctorName = item.doctor || (item as any).doctor_name || "drg. Yulita Dora, Sp.KG";
                const dateStr = item.date || (item as any).booking_date || "-";
                const timeStr = item.preferred_time || (item as any).booking_time || "10:00 WIB";

                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-[#FDFBF7] transition-colors border-b border-[#F5ECE0]"
                  >
                    {/* Kode & Pasien */}
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F5E6C8] to-[#E8D4A2] flex items-center justify-center text-[#8A6B2B] shrink-0 mt-0.5 shadow-xs">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-[#3D332A]">{bookingCode}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                                isGuest ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {isGuest ? "Guest" : "Member"}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#4A3F35] mt-0.5">{patientName}</p>
                          {item.phone && <p className="text-[11px] text-[#8A7B6B]">{item.phone}</p>}
                        </div>
                      </div>
                    </TableCell>

                    {/* Perawatan & Dokter */}
                    <TableCell className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#C9A24A] shrink-0" />
                          <span className="text-xs font-bold text-[#3D332A] max-w-[220px] truncate">
                            {serviceName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#8A7B6B]">
                          <Stethoscope className="w-3 h-3 text-[#B8943F] shrink-0" />
                          <span className="truncate max-w-[200px]">{doctorName}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Jadwal */}
                    <TableCell className="py-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3D332A]">
                          <Calendar className="w-3.5 h-3.5 text-[#B8943F]" />
                          <span>{dateStr}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#8A7B6B]">
                          <Clock className="w-3.5 h-3.5 text-[#B8943F]" />
                          <span>{timeStr}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${statusBadge.bg}`}
                      >
                        <statusBadge.icon className="w-3.5 h-3.5" />
                        {statusBadge.label}
                      </span>
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="py-4 pr-6 text-right">
                      <Button
                        size="sm"
                        onClick={() => onSelect(item)}
                        className="h-8 px-3.5 text-xs font-semibold bg-[#FAF4E8] hover:bg-[#F5E6C8] text-[#8A6B2B] rounded-xl border border-[#E8D4A2]/60 transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                      </Button>
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
