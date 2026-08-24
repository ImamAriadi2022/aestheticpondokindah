import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { toast } from "@/shared/ui/toast";
import { 
  MessageSquare, 
  Send, 
  User, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Tag
} from "lucide-react";
import { updateComplaintStatus } from "@/features/patient/consultation/services/complaintApi";

interface ComplaintResponseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  complaint: any | null;
  onSaved: () => void;
}

export default function ComplaintResponseModal({
  open,
  onOpenChange,
  complaint,
  onSaved,
}: ComplaintResponseModalProps) {
  const [status, setStatus] = useState<string>("processing");
  const [adminResponse, setAdminResponse] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status || "processing");
      setAdminResponse(complaint.adminResponse || complaint.admin_response || "");
    } else {
      setStatus("processing");
      setAdminResponse("");
    }
  }, [complaint, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint?.id) return;

    if (!adminResponse.trim()) {
      toast({
        title: "Tanggapan Wajib Diisi",
        message: "Silakan ketik tanggapan atau solusi resmi untuk pasien.",
        variant: "error",
      });
      return;
    }

    setSaving(true);
    try {
      await updateComplaintStatus(complaint.id, {
        status,
        admin_response: adminResponse.trim(),
      });

      toast({
        title: "Tanggapan Terkirim",
        message: `Tanggapan pengaduan #${complaint.id} berhasil disimpan dan dikirim ke pasien.`,
        variant: "success",
      });

      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Gagal Menyimpan",
        message: err?.message || "Terjadi kesalahan saat menyimpan tanggapan.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!complaint) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-xl sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#F0E6D3] bg-white">
        <DialogHeader className="pb-3 border-b border-[#F0E6D3] text-left">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold text-[#8C6B1C] bg-[#FAF5EA] border border-[#EADBBD] px-2.5 py-0.5 rounded-full">
              Tiket Pengaduan #{complaint.id}
            </span>
            <span className="text-xs text-[#8A7B6B]">
              {complaint.date || "Hari Ini"}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold text-[#4A3F35] flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C9A24A]/15 flex items-center justify-center text-[#C9A24A] shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span>Tanggapi Pengaduan Pasien</span>
          </DialogTitle>
          <p className="text-xs text-[#8A7B6B] mt-0.5">
            Kirimkan penjelasan, tindak lanjut, dan solusi resmi klinik atas komplain yang diajukan pasien.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3 text-left">
          {/* Info Pasien & Detail Pengaduan */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#F0E6D3] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[10px] text-[#8A7B6B] uppercase font-bold tracking-wider">Nama Pasien</p>
                <p className="text-xs font-bold text-[#4A3F35] flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-[#C9A24A]" />
                  {complaint.user?.name || complaint.patient_name || "Pasien"}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-[#8A7B6B] uppercase font-bold tracking-wider">Kontak Pasien</p>
                <p className="text-xs font-medium text-[#4A3F35] flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {complaint.user?.email || "-"}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F0E6D3] space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-white text-[#C9A24A] border border-[#E8DFC8] px-2 py-0.5 rounded-md">
                  {complaint.category || "Umum"}
                </span>
                <h4 className="text-xs font-bold text-[#4A3F35]">{complaint.title || complaint.subject}</h4>
              </div>
              <p className="text-xs text-[#5C5546] leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-xl border border-gray-200">
                {complaint.description || complaint.complaint || "-"}
              </p>
            </div>
          </div>

          {/* Form Input Tanggapan */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-semibold text-gray-700 block mb-1">
                Ubah Status Pengaduan *
              </Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#4A3F35] outline-none focus:ring-2 focus:ring-[#C9A24A]/30"
              >
                <option value="processing">🟡 Sedang Diproses (Tim Menindaklanjuti)</option>
                <option value="resolved">🟢 Selesai (Solusi Telah Diberikan)</option>
                <option value="rejected">🔴 Ditolak / Tidak Valid</option>
                <option value="pending">⚪ Menunggu Antrean</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold text-gray-700 block mb-1">
                Tulis Tanggapan & Solusi Resmi untuk Pasien *
              </Label>
              <textarea
                required
                rows={4}
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                placeholder="Contoh: Halo Kak, terima kasih atas masukannya. Kami mohon maaf atas ketidaknyamanannya. Tim customer care dan operasional kami telah melakukan evaluasi..."
                className="w-full p-3.5 rounded-xl border border-gray-200 text-xs text-[#4A3F35] outline-none focus:ring-2 focus:ring-[#C9A24A]/30 resize-none bg-white"
              />
              <p className="text-[10px] text-[#8A7B6B] mt-1">
                Tanggapan ini akan langsung muncul di akun pasien saat membuka menu pengaduan.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-[#F0E6D3] flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-gray-200 h-10 px-5 text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:opacity-90 text-white font-bold rounded-xl h-10 px-7 text-xs shadow-md shadow-[#C9A24A]/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {saving ? "Menyimpan..." : "Kirim Tanggapan Pasien"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
