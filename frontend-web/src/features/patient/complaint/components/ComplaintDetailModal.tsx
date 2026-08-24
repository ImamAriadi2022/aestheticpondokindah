import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  ShieldAlert, 
  Stethoscope, 
  Calendar, 
  CreditCard,
  Building2,
  X
} from "lucide-react";
import type { ComplaintItem } from "../services/complaintApi";

interface ComplaintDetailModalProps {
  open: boolean;
  onClose: () => void;
  complaint: ComplaintItem | null;
}

const categoryIcons: Record<string, any> = {
  Pelayanan: User,
  Fasilitas: ShieldAlert,
  Dokter: Stethoscope,
  Jadwal: Calendar,
  Pembayaran: CreditCard,
  Lainnya: MessageSquare,
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  pending: { label: "Menunggu Tanggapan", color: "text-amber-700", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  processing: { label: "Sedang Ditindaklanjuti", color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  resolved: { label: "Selesai & Ditanggapi", color: "text-emerald-700", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  rejected: { label: "Ditolak / Ditutup", color: "text-rose-700", bgColor: "bg-rose-50", borderColor: "border-rose-200" },
};

export default function ComplaintDetailModal({ open, onClose, complaint }: ComplaintDetailModalProps) {
  if (!complaint) return null;

  const currentStatus = statusConfig[complaint.status] || statusConfig.pending;
  const CategoryIcon = categoryIcons[complaint.category] || MessageSquare;
  const adminReply = complaint.admin_response || complaint.adminResponse || complaint.response;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-[92vw] max-w-lg sm:max-w-xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#F0E6D3] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-[#F0E6D3] text-left">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold text-[#8C6B1C] bg-[#FAF5EA] border border-[#EADBBD] px-2.5 py-0.5 rounded-full">
              Tiket #{complaint.id}
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentStatus.bgColor} ${currentStatus.color} ${currentStatus.borderColor}`}>
              {currentStatus.label}
            </span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-[#4A3F35] flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FAF5EA] flex items-center justify-center text-[#C9A24A] shrink-0 border border-[#EADBBD]">
              <CategoryIcon className="w-4 h-4" />
            </div>
            <span className="truncate">{complaint.title}</span>
          </DialogTitle>
          <div className="flex items-center gap-2 text-xs text-[#8A7B6B] mt-1">
            <span>Kategori: <strong>{complaint.category}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {complaint.date}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4 text-left">
          {/* Uraian Masalah Pengaduan Pasien */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0E6D3] space-y-1.5">
            <p className="text-xs font-bold text-[#4A3F35] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#C9A24A]" />
              Uraian Pengaduan Anda
            </p>
            <p className="text-xs text-[#5C5546] leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* Tanggapan Resmi Klinik */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#4A3F35] uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#C9A24A]" />
              Tanggapan & Solusi dari Manajemen Klinik
            </p>

            {adminReply ? (
              <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Respon Resmi Tim Customer Care Klinik</span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed whitespace-pre-wrap pl-6">
                  {adminReply}
                </p>
              </div>
            ) : (
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Pengaduan Sedang Dalam Antrean Peninjauan</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed pl-6">
                  Pengaduan Anda telah kami terima dan saat ini sedang ditinjau oleh staf manajemen operasional klinik. Kami akan segera memberikan respons di halaman ini.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-[#F0E6D3]">
          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-[#FAF5EA] hover:bg-[#F3EAD8] text-[#8C6B1C] font-bold rounded-xl h-10 text-xs border border-[#EADBBD] cursor-pointer"
          >
            Tutup Detail Pengaduan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
