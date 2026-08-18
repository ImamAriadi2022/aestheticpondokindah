import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  FileCheck,
  Send,
  Loader2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { updateAdminReservation, type ReservationItem } from "../services/reservationService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reservation: ReservationItem | null;
  doctors?: any[];
  token: string;
  onUpdated?: () => void;
}

export default function ReservationDetailModal({
  isOpen,
  onClose,
  reservation,
  doctors = [],
  token,
  onUpdated,
}: Props) {
  if (!reservation) return null;

  const [status, setStatus] = useState(reservation.status || "Baru");
  const [selectedDoctorId, setSelectedDoctorId] = useState(reservation.doctor_id || "");
  const [adminNotes, setAdminNotes] = useState(reservation.admin_notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reservation) {
      setStatus(reservation.status || "Baru");
      setSelectedDoctorId(reservation.doctor_id || "");
      setAdminNotes(reservation.admin_notes || "");
    }
  }, [reservation]);

  const isGuest = !reservation.user_id || (reservation.source && reservation.source.includes("guest"));

  // Status badge config
  const getStatusBadge = (st: string) => {
    switch (st) {
      case "Dikonfirmasi":
      case "confirmed":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          label: "Dikonfirmasi",
        };
      case "Selesai":
      case "completed":
        return {
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          icon: CheckCircle2,
          label: "Selesai",
        };
      case "Dibatalkan":
      case "cancelled":
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          icon: XCircle,
          label: "Dibatalkan",
        };
      case "Ditolak":
      case "rejected":
        return {
          bg: "bg-gray-100 text-gray-700 border-gray-200",
          icon: XCircle,
          label: "Ditolak",
        };
      default:
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: AlertCircle,
          label: "Baru (Menunggu)",
        };
    }
  };

  const statusConfig = getStatusBadge(status);

  // Handle Quick Status Change
  const handleUpdateStatus = async (newStatus: string) => {
    if (!token) {
      toast({ title: "Error", message: "Sesi admin tidak valid", variant: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateAdminReservation(token, reservation.id, {
        status: newStatus,
        doctor_id: selectedDoctorId ? Number(selectedDoctorId) : undefined,
        admin_notes: adminNotes,
      });

      setStatus(newStatus);
      toast({
        title: "Status Berhasil Diperbarui",
        message: `Reservasi #${reservation.code || reservation.id} sekarang berstatus "${newStatus}".`,
        variant: "success",
      });

      if (onUpdated) onUpdated();
    } catch (err: any) {
      toast({
        title: "Gagal Memperbarui",
        message: err.message || "Terjadi kesalahan saat memperbarui status",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Notes & Doctor
  const handleSaveNotesAndDoctor = async () => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await updateAdminReservation(token, reservation.id, {
        status,
        doctor_id: selectedDoctorId ? Number(selectedDoctorId) : undefined,
        admin_notes: adminNotes,
      });

      toast({
        title: "Data Disimpan",
        message: "Catatan internal dan penugasan dokter berhasil disimpan.",
        variant: "success",
      });

      if (onUpdated) onUpdated();
    } catch (err: any) {
      toast({
        title: "Gagal Menyimpan",
        message: err.message || "Gagal menyimpan perubahan",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Link Generator
  const handleOpenWhatsApp = () => {
    const rawPhone = reservation.phone || "";
    let cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("62") && cleanPhone.length > 5) {
      cleanPhone = "62" + cleanPhone;
    }

    const patientName = reservation.name || "Pasien";
    const bookingCode = reservation.code || `RSV-${reservation.id}`;
    const serviceName = reservation.treatment_interest || "Perawatan Gigi";
    const dateStr = reservation.date || "-";
    const timeStr = reservation.preferred_time || "10:00 WIB";
    const doctorStr = reservation.doctor || "Dokter Spesialis";

    const message = encodeURIComponent(
      `Halo Kak ${patientName},\n\nKami dari *Aesthetic Pondok Indah Dental Clinic* mengonfirmasi reservasi janji temu Anda:\n\n` +
      `📌 *Kode Booking*: ${bookingCode}\n` +
      `🦷 *Layanan*: ${serviceName}\n` +
      `🩺 *Dokter*: ${doctorStr}\n` +
      `📅 *Tanggal*: ${dateStr}\n` +
      `⏰ *Waktu*: ${timeStr}\n` +
      `📍 *Lokasi*: Aesthetic Pondok Indah Main Branch\n\n` +
      `Mohon hadir 15 menit sebelum waktu konsultasi. Jika ada perubahan jadwal, silakan balas pesan ini. Terima kasih! 🙏`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl bg-[#FAF8F5] border border-[#E8DFC8] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-5 bg-white/95 backdrop-blur-md border-b border-[#E8DFC8]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F5E6C8] to-[#E8D4A2] flex items-center justify-center text-[#8A6B2B] shadow-inner">
              <Calendar className="w-5 h-5 text-[#8A6B2B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-[#3D332A]">
                  Reservasi #{reservation.code || `RSV-${reservation.id}`}
                </DialogTitle>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.bg}`}>
                  <statusConfig.icon className="w-3.5 h-3.5" />
                  {statusConfig.label}
                </span>
              </div>
              <DialogDescription className="text-xs text-[#8A7B6B] mt-0.5">
                {isGuest ? (
                  <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                    🌐 Asal Reservasi: Guest User (Tanpa Login)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    👤 Asal Reservasi: Pasien Terdaftar (Akun Member)
                  </span>
                )}
                {reservation.createdAt && ` • Diajukan pada ${new Date(reservation.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`}
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F5ECE0] hover:bg-[#EADBBD] text-[#4A3F35] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Data Pasien */}
            <div className="bg-white rounded-2xl p-5 border border-[#F0E6D3] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8943F] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Informasi Pasien
                </h4>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                  isGuest ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                }`}>
                  {isGuest ? "Guest" : "Member"}
                </span>
              </div>

              <div>
                <p className="text-base font-bold text-[#3D332A]">{reservation.name || "Pasien"}</p>
                <div className="mt-2 space-y-1.5 text-xs text-[#6B5E4F]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#B8943F]" />
                    <span className="font-medium">{reservation.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#B8943F]" />
                    <span>{reservation.email || "-"}</span>
                  </div>
                  {reservation.gender && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#8A7B6B]">Jenis Kelamin:</span>
                      <span className="font-medium text-[#3D332A]">{reservation.gender}</span>
                    </div>
                  )}
                  {reservation.birth_date && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#8A7B6B]">Tgl Lahir:</span>
                      <span className="font-medium text-[#3D332A]">{reservation.birth_date}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Fast Contact Button */}
              {reservation.phone && (
                <Button
                  onClick={handleOpenWhatsApp}
                  variant="outline"
                  className="w-full mt-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold py-2 h-auto flex items-center justify-center gap-2 rounded-xl"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Chat Konfirmasi WhatsApp
                </Button>
              )}
            </div>

            {/* Card 2: Layanan & Jadwal Kunjungan */}
            <div className="bg-white rounded-2xl p-5 border border-[#F0E6D3] shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8943F] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Layanan & Jadwal
              </h4>

              <div className="space-y-3">
                <div className="p-3 bg-[#FDF8F0] rounded-xl border border-[#F5E6C8]">
                  <p className="text-[11px] font-semibold text-[#8A6B2B]">Layanan yang Dipilih</p>
                  <p className="text-sm font-bold text-[#3D332A] mt-0.5">
                    {reservation.treatment_interest || "Pemeriksaan Gigi Umum"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EFE5D5]">
                    <span className="text-[10px] text-[#8A7B6B] block">Tanggal Kunjungan</span>
                    <span className="font-bold text-[#3D332A] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-[#B8943F]" />
                      {reservation.date || "-"}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EFE5D5]">
                    <span className="text-[10px] text-[#8A7B6B] block">Waktu / Jam</span>
                    <span className="font-bold text-[#3D332A] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#B8943F]" />
                      {reservation.preferred_time || "10:00 WIB"}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[#6B5E4F] flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B8943F] shrink-0 mt-0.5" />
                  <span>{reservation.branch_name || "Aesthetic Pondok Indah Main Branch"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Dokter & Keluhan Pasien */}
          <div className="bg-white rounded-2xl p-5 border border-[#F0E6D3] shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8943F] flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" /> Dokter & Keluhan
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Doctor Assignment */}
              <div>
                <label className="block text-xs font-semibold text-[#3D332A] mb-1.5">
                  Dokter yang Bertugas
                </label>
                {doctors.length > 0 ? (
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl px-3 py-2 text-xs font-medium text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
                  >
                    <option value="">-- Pilih / Tetapkan Dokter --</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} {d.specialization ? `(${d.specialization})` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs font-bold text-[#3D332A] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8DFC8]">
                    {reservation.doctor || "drg. Yulita Dora, Sp.KG"}
                  </p>
                )}
              </div>

              {/* Patient Notes / Complaint */}
              <div>
                <label className="block text-xs font-semibold text-[#3D332A] mb-1.5">
                  Catatan / Keluhan Pasien
                </label>
                <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8] text-xs text-[#4A3F35] min-h-[38px]">
                  {reservation.complaint || "Tidak ada catatan keluhan khusus."}
                </div>
              </div>
            </div>

            {/* Digital Signature if available */}
            {reservation.signature_data && (
              <div className="pt-3 border-t border-[#F0E6D3]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Tanda Tangan Digital Pasien (Persetujuan Tindakan)</span>
                </div>
                <div className="w-48 h-20 bg-white border border-[#E8DFC8] rounded-xl p-2 flex items-center justify-center shadow-xs">
                  <img
                    src={reservation.signature_data}
                    alt="Digital Signature"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Catatan Admin & Alur Penanganan */}
          <div className="bg-white rounded-2xl p-5 border border-[#F0E6D3] shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8943F] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Catatan Internal Admin Klinik
            </h4>

            <div>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Tulis catatan internal untuk staf front-desk / dokter (contoh: Pasien ingin konsultasi behel transparan, sudah dihubungi via WA)..."
                rows={2}
                className="w-full bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
              />
              <div className="flex justify-end mt-2">
                <Button
                  onClick={handleSaveNotesAndDoctor}
                  disabled={isSubmitting}
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 rounded-xl border-[#C9A24A] text-[#8A6B2B] hover:bg-[#FDF8F0]"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Simpan Catatan & Dokter"}
                </Button>
              </div>
            </div>

            {/* Quick Status Action Flow */}
            <div className="pt-4 border-t border-[#F0E6D3]">
              <p className="text-xs font-bold text-[#3D332A] mb-3">
                Alur Penanganan Status Reservasi:
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {status !== "Dikonfirmasi" && status !== "Selesai" && (
                  <Button
                    onClick={() => handleUpdateStatus("Dikonfirmasi")}
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-4 py-2 h-auto flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Konfirmasi Reservasi
                  </Button>
                )}

                {status !== "Selesai" && (
                  <Button
                    onClick={() => handleUpdateStatus("Selesai")}
                    disabled={isSubmitting}
                    className="bg-[#C9A24A] hover:bg-[#B8943F] text-white rounded-xl text-xs font-semibold px-4 py-2 h-auto flex items-center gap-1.5 shadow-sm"
                  >
                    <FileCheck className="w-4 h-4" />
                    Tandai Selesai
                  </Button>
                )}

                {status !== "Dibatalkan" && (
                  <Button
                    onClick={() => handleUpdateStatus("Dibatalkan")}
                    disabled={isSubmitting}
                    variant="outline"
                    className="bg-white hover:bg-red-50 text-red-600 border-red-200 rounded-xl text-xs font-semibold px-4 py-2 h-auto flex items-center gap-1.5 shadow-xs"
                  >
                    <XCircle className="w-4 h-4" />
                    Batalkan Reservasi
                  </Button>
                )}

                {status !== "Ditolak" && status === "Baru" && (
                  <Button
                    onClick={() => handleUpdateStatus("Ditolak")}
                    disabled={isSubmitting}
                    variant="ghost"
                    className="hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold px-3 py-2 h-auto"
                  >
                    Tolak
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-t border-[#E8DFC8]">
          <span className="text-xs text-[#8A7B6B]">
            Status Saat Ini: <strong className="text-[#3D332A]">{status}</strong>
          </span>
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-xl text-xs font-semibold px-5 py-2 h-auto border-[#E8DFC8] text-[#4A3F35]"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
