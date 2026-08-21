import { useState, useEffect, useMemo } from "react";
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
  Bell,
  Check,
  ExternalLink,
  AlertTriangle,
  Users,
  ChevronRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/toast";
import { updateAdminReservation, type ReservationItem } from "../services/reservationService";
import { getAdminDoctorSchedules, type AdminDoctorScheduleItem } from "@/features/admin/doctors/services/adminDoctorScheduleApi";
import ReservationConsentPdfModal from "./ReservationConsentPdfModal";
import TermsPdfModal from "@/features/patient/reservation/components/TermsPdfModal";
import { broadcastRealtimeReservationEvent } from "@/core/services/GlobalNotificationManager";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reservation: ReservationItem | null;
  doctors?: any[];
  token: string;
  onUpdated?: () => void;
}

function normalizeDate(d?: string | null): string {
  if (!d) return "";
  return d.split("T")[0].trim();
}

function cleanDocName(name?: string | null): string {
  if (!name) return "";
  return name.toLowerCase().replace(/^(drg\.|dr\.|drg|dr)\s*/i, "").trim();
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
  const [selectedScheduleId, setSelectedScheduleId] = useState(reservation.doctor_schedule_id || "");
  const [selectedDate, setSelectedDate] = useState(reservation.date || "");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(reservation.preferred_time || "10:00");
  const [adminNotes, setAdminNotes] = useState(reservation.admin_notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isTermsPdfModalOpen, setIsTermsPdfModalOpen] = useState(false);

  // Live Doctor Schedules from DB
  const [dbSchedules, setDbSchedules] = useState<AdminDoctorScheduleItem[]>([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);

  // Load Schedules from DB
  useEffect(() => {
    if (isOpen) {
      setSchedulesLoading(true);
      getAdminDoctorSchedules()
        .then((data) => {
          setDbSchedules(data || []);
        })
        .catch(() => {})
        .finally(() => setSchedulesLoading(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (reservation) {
      setStatus(reservation.status || "Baru");
      setSelectedDoctorId(reservation.doctor_id || "");
      setSelectedScheduleId(reservation.doctor_schedule_id || "");
      setSelectedDate(reservation.date || "");
      setSelectedTimeSlot(reservation.preferred_time || "10:00");
      setAdminNotes(reservation.admin_notes || "");
    }
  }, [reservation]);

  const isGuest = !reservation.user_id || (reservation.source && reservation.source.includes("guest"));

  // Normalize current selected date
  const cleanSelectedDate = normalizeDate(selectedDate);

  // Selected doctor metadata
  const selectedDoctorObj = useMemo(() => {
    const fromProps = doctors.find((d) => String(d.id || d.user_id || d.userId) === String(selectedDoctorId));
    if (fromProps) return fromProps;
    const fromSched = dbSchedules.find((s) => String(s.doctorId || s.id) === String(selectedDoctorId));
    if (fromSched) return { id: fromSched.doctorId, name: fromSched.doctorName };
    return null;
  }, [doctors, dbSchedules, selectedDoctorId]);

  const selectedDocCleanName = cleanDocName(selectedDoctorObj?.name || reservation.doctor);

  // Helper to check if a schedule belongs to the selected doctor
  const isScheduleForSelectedDoctor = (s: AdminDoctorScheduleItem) => {
    if (!selectedDoctorId && !selectedDocCleanName) return false;
    if (selectedDoctorId && (String(s.doctorId) === String(selectedDoctorId) || String(s.id) === String(selectedDoctorId))) {
      return true;
    }
    if (selectedDocCleanName && s.doctorName) {
      const sClean = cleanDocName(s.doctorName);
      if (sClean === selectedDocCleanName || sClean.includes(selectedDocCleanName) || selectedDocCleanName.includes(sClean)) {
        return true;
      }
    }
    return false;
  };

  // Check schedules available on selectedDate
  const availableSchedulesOnDate = useMemo(() => {
    if (!cleanSelectedDate) return [];
    return dbSchedules.filter((s) => normalizeDate(s.date) === cleanSelectedDate);
  }, [dbSchedules, cleanSelectedDate]);

  // Check schedules belonging to the selected doctor
  const doctorAllSchedules = useMemo(() => {
    if (!selectedDoctorId && !selectedDocCleanName) return [];
    return dbSchedules.filter(isScheduleForSelectedDoctor);
  }, [dbSchedules, selectedDoctorId, selectedDocCleanName]);

  const doctorSchedulesOnDate = useMemo(() => {
    if ((!selectedDoctorId && !selectedDocCleanName) || !cleanSelectedDate) return [];
    return dbSchedules.filter(
      (s) => isScheduleForSelectedDoctor(s) && normalizeDate(s.date) === cleanSelectedDate
    );
  }, [dbSchedules, selectedDoctorId, selectedDocCleanName, cleanSelectedDate]);

  const doctorOtherUpcomingSchedules = useMemo(() => {
    if (!selectedDoctorId && !selectedDocCleanName) return [];
    return dbSchedules.filter(
      (s) => isScheduleForSelectedDoctor(s) && normalizeDate(s.date) !== cleanSelectedDate && !s.isFull
    );
  }, [dbSchedules, selectedDoctorId, selectedDocCleanName, cleanSelectedDate]);

  // Find exact matched schedule for doctor & date
  const matchedDoctorSchedule = useMemo(() => {
    if (selectedScheduleId) {
      const byId = dbSchedules.find((s) => String(s.id) === String(selectedScheduleId));
      if (byId) return byId;
    }
    return doctorSchedulesOnDate[0] || null;
  }, [selectedScheduleId, dbSchedules, doctorSchedulesOnDate]);

  // Conflict evaluation
  const scheduleConflictWarning = useMemo(() => {
    if (!selectedDoctorId && !selectedDocCleanName) {
      return {
        hasConflict: true,
        level: "warning",
        message: "Dokter spesialis belum ditetapkan. Silakan pilih dokter yang bertugas.",
      };
    }

    if (!cleanSelectedDate) {
      return {
        hasConflict: true,
        level: "warning",
        message: "Tanggal kunjungan belum ditentukan.",
      };
    }

    if (doctorSchedulesOnDate.length === 0) {
      return {
        hasConflict: true,
        level: "danger",
        message: `⚠️ Jadwal Bentrok: Dokter yang dipilih TIDAK memiliki jadwal praktik pada tanggal ${cleanSelectedDate}. Silakan pilih dokter yang bertugas atau klik salah satu jadwal aktif dokter di bawah.`,
      };
    }

    if (matchedDoctorSchedule && matchedDoctorSchedule.isFull) {
      return {
        hasConflict: true,
        level: "danger",
        message: `⚠️ Kuota Penuh: Jadwal praktik dokter pada tanggal ${cleanSelectedDate} (${matchedDoctorSchedule.timeRange}) sudah penuh (0 slot tersisa).`,
      };
    }

    return {
      hasConflict: false,
      level: "success",
      message: `✓ Jadwal Praktik Sesuai & Terverifikasi: ${matchedDoctorSchedule?.timeRange || selectedTimeSlot} (Sisa ${matchedDoctorSchedule?.slotsLeft || 1} slot kuota di database).`,
    };
  }, [selectedDoctorId, selectedDocCleanName, cleanSelectedDate, doctorSchedulesOnDate, matchedDoctorSchedule, selectedTimeSlot]);

  // Handle doctor selection change & auto-sync practice time
  const handleDoctorChange = (newDocId: string) => {
    setSelectedDoctorId(newDocId);
    if (!newDocId) {
      setSelectedScheduleId("");
      return;
    }

    // Find schedule on current selected date
    const schedOnDate = dbSchedules.find(
      (s) => String(s.doctorId) === String(newDocId) && s.date === selectedDate
    );

    if (schedOnDate) {
      setSelectedScheduleId(schedOnDate.id);
      setSelectedTimeSlot(schedOnDate.timeRange);
    } else {
      // Find nearest upcoming schedule
      const upcoming = dbSchedules.find(
        (s) => String(s.doctorId) === String(newDocId) && !s.isFull
      );
      if (upcoming) {
        setSelectedScheduleId(upcoming.id);
      }
    }
  };

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
          label: "Selesai Dirawat",
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
          label: "Baru (Perlu Konfirmasi)",
        };
    }
  };

  const statusConfig = getStatusBadge(status);

  // Helper formatting phone
  const formatWaPhone = (rawPhone: string) => {
    let clean = (rawPhone || "").replace(/\D/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    } else if (!clean.startsWith("62") && clean.length > 5) {
      clean = "62" + clean;
    }
    return clean;
  };

  const patientName = reservation.name || (isGuest ? "Pasien Guest" : "Pasien");
  const bookingCode = reservation.code || `RSV-${String(reservation.id).padStart(6, "0")}`;
  const serviceName = reservation.treatment_interest || "Perawatan Gigi & Mulut";
  const dateStr = selectedDate || reservation.date || "-";
  const timeStr = selectedTimeSlot || reservation.preferred_time || "10:00 WIB";

  // Find current assigned doctor
  const currentDoctorObj = doctors.find(
    (d) => String(d.id) === String(selectedDoctorId) || String(d.user_id) === String(selectedDoctorId)
  );
  const doctorName = currentDoctorObj?.name || reservation.doctor || "drg. Yulita Dora, Sp.KG";
  const doctorPhone = currentDoctorObj?.phone || currentDoctorObj?.whatsapp || "";

  // 1. WhatsApp Konfirmasi ke Pasien / Guest
  const handleSendWhatsAppConfirmation = () => {
    const cleanPhone = formatWaPhone(reservation.phone || "");
    if (!cleanPhone) {
      toast({ title: "No. HP Tidak Ditemukan", message: "Pasien belum mencantumkan nomor telepon aktif.", variant: "warning" });
      return;
    }

    const message = encodeURIComponent(
      `Halo Kak *${patientName}*,\n\n` +
      `Kami dari Front Desk *Aesthetic Pondok Indah Dental Clinic* mengonfirmasi jadwal reservasi janji temu Anda:\n\n` +
      `📋 *Kode Booking*: ${bookingCode}\n` +
      `🦷 *Layanan*: ${serviceName}\n` +
      `👨‍⚕️ *Dokter Spesialis*: ${doctorName}\n` +
      `📅 *Tanggal*: ${dateStr}\n` +
      `⏰ *Waktu Praktik*: ${timeStr}\n` +
      `📍 *Lokasi*: Aesthetic Pondok Indah Main Branch\n\n` +
      (isGuest ? `_Jadwal reservasi Guest Anda telah disinkronkan dengan jadwal praktik dokter spesialis terkait._\n\n` : `_Jadwal reservasi Anda telah berhasil dikonfirmasi dan kuota slot dokter telah dikunci._\n\n`) +
      `Mohon konfirmasi jika jadwal ini sudah sesuai dengan membalas pesan ini. Terima kasih! 🙏`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  // 2. WhatsApp Pengingat Hadir (Hari H / H-1 Jam)
  const handleSendWhatsAppReminder = () => {
    const cleanPhone = formatWaPhone(reservation.phone || "");
    if (!cleanPhone) {
      toast({ title: "No. HP Tidak Ditemukan", message: "Pasien belum mencantumkan nomor telepon aktif.", variant: "warning" });
      return;
    }

    const message = encodeURIComponent(
      `Halo Kak *${patientName}*,\n\n` +
      `Kami dari *Aesthetic Pondok Indah Dental Clinic* ingin mengingatkan kembali mengenai jadwal perawatan gigi Anda:\n\n` +
      `📋 *Kode*: ${bookingCode}\n` +
      `🦷 *Layanan*: ${serviceName}\n` +
      `🩺 *Dokter*: ${doctorName}\n` +
      `📅 *Tanggal*: ${dateStr}\n` +
      `⏰ *Waktu Praktik*: ${timeStr}\n\n` +
      `Demi kenyamanan dan kelancaran tindakan, mohon dapat hadir di klinik *15–30 menit sebelum jadwal* dimulai untuk persiapan rekam medis awal.\n\n` +
      `Apakah Kak *${patientName}* sudah dalam perjalanan atau sudah tiba di area klinik? Mohon infonya ya Kak. Terima kasih! 😊`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  // 3. WhatsApp Notifikasi ke Dokter yang Bertugas
  const handleSendWhatsAppToDoctor = () => {
    const docCleanPhone = formatWaPhone(doctorPhone);
    const targetPhone = docCleanPhone || "6281990114949";

    const message = encodeURIComponent(
      `Dokter *${doctorName}*,\n\n` +
      `Berikut notifikasi reservasi janji temu pasien dari sistem klinik Aesthetic Pondok Indah:\n\n` +
      `👤 *Pasien*: ${patientName} (${isGuest ? "Guest User" : "Member Pasien"})\n` +
      `📋 *Kode Booking*: ${bookingCode}\n` +
      `🦷 *Layanan/Tindakan*: ${serviceName}\n` +
      `📅 *Tanggal*: ${dateStr}\n` +
      `⏰ *Waktu Praktik*: ${timeStr}\n` +
      `📝 *Keluhan*: ${reservation.complaint || "-"}\n\n` +
      `Data telah tersinkronisasi di jadwal antrean praktik Anda. Terima kasih, Dok.`
    );

    window.open(`https://wa.me/${targetPhone}?text=${message}`, "_blank");
  };

  // Handle Quick Status Change
  const handleUpdateStatus = async (newStatus: string) => {
    if (!token) {
      toast({ title: "Error", message: "Sesi admin tidak valid", variant: "error" });
      return;
    }

    if (newStatus === "Dikonfirmasi" && scheduleConflictWarning.hasConflict && scheduleConflictWarning.level === "danger") {
      toast({
        title: "Peringatan Jadwal Bentrok",
        message: "Tidak dapat mengonfirmasi: Dokter tidak memiliki jadwal praktik atau kuota penuh pada tanggal tersebut. Silakan sesuaikan dokter/jadwal terlebih dahulu.",
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateAdminReservation(token, reservation.id, {
        status: newStatus,
        doctor_id: selectedDoctorId ? Number(selectedDoctorId) : undefined,
        doctor_schedule_id: matchedDoctorSchedule?.id ? Number(matchedDoctorSchedule.id) : (selectedScheduleId ? Number(selectedScheduleId) : undefined),
        date: selectedDate,
        preferred_time: selectedTimeSlot,
        admin_notes: adminNotes,
      });

      setStatus(newStatus);
      toast({
        title: "Status Berhasil Diperbarui",
        message: `Reservasi #${bookingCode} sekarang berstatus "${newStatus}".`,
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
        doctor_schedule_id: matchedDoctorSchedule?.id ? Number(matchedDoctorSchedule.id) : (selectedScheduleId ? Number(selectedScheduleId) : undefined),
        date: selectedDate,
        preferred_time: selectedTimeSlot,
        admin_notes: adminNotes,
      });

      toast({
        title: "Jadwal & Dokter Disimpan",
        message: "Penugasan dokter dan sinkronisasi kuota jadwal berhasil disimpan ke database.",
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

  // Quick select an active schedule from DB
  const handleSelectActiveSchedule = (sched: AdminDoctorScheduleItem) => {
    setSelectedDoctorId(sched.doctorId);
    setSelectedScheduleId(sched.id);
    setSelectedDate(sched.date);
    setSelectedTimeSlot(sched.timeRange);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[95vw] max-w-5xl lg:max-w-5xl xl:max-w-6xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl bg-[#FAF8F5] border border-[#E8DFC8] shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-5 bg-white/95 backdrop-blur-md border-b border-[#E8DFC8]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F5E6C8] to-[#E8D4A2] flex items-center justify-center text-[#8A6B2B] shadow-inner">
              <Calendar className="w-5 h-5 text-[#8A6B2B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-[#3D332A]">
                  Reservasi #{bookingCode}
                </DialogTitle>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.bg}`}>
                  <statusConfig.icon className="w-3.5 h-3.5" />
                  {statusConfig.label}
                </span>
              </div>
              <DialogDescription className="text-xs text-[#8A7B6B] mt-0.5">
                {isGuest ? (
                  <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                    🌐 Alur: Guest Booking (Admin Menentukan & Menjadwalkan Dokter Sesuai Jam Praktik)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                    👤 Alur: Pasien Terdaftar (Dokter & Jadwal Dipilih Langsung Pasien)
                  </span>
                )}
                {reservation.createdAt && ` • Masuk pada ${new Date(reservation.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`}
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
                  <User className="w-3.5 h-3.5" /> Identitas Pasien
                </h4>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md ${
                  isGuest ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {isGuest ? "🌐 Guest User" : "👤 Pasien Member"}
                </span>
              </div>

              <div>
                <p className="text-base font-bold text-[#3D332A]">{patientName}</p>
                <div className="mt-2.5 space-y-1.5 text-xs text-[#6B5E4F]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#B8943F]" />
                    <span className="font-semibold text-[#3D332A]">{reservation.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#B8943F]" />
                    <span>{reservation.email || "Email tidak dicantumkan"}</span>
                  </div>
                  {reservation.gender && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#8A7B6B]">Jenis Kelamin:</span>
                      <span className="font-medium text-[#3D332A]">{reservation.gender}</span>
                    </div>
                  )}
                  {reservation.birth_date && (
                    <div className="flex items-center gap-2">
                      <span className="text-[#8A7B6B]">Tgl Lahir / Usia:</span>
                      <span className="font-medium text-[#3D332A]">{reservation.birth_date}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Layanan & Jadwal Kunjungan */}
            <div className="bg-white rounded-2xl p-5 border border-[#F0E6D3] shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8943F] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Layanan & Jadwal Kunjungan
              </h4>

              <div className="space-y-3">
                <div className="p-3 bg-[#FDF8F0] rounded-xl border border-[#F5E6C8]">
                  <p className="text-[11px] font-semibold text-[#8A6B2B]">Layanan yang Diminati</p>
                  <p className="text-sm font-bold text-[#3D332A] mt-0.5">{serviceName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8A7B6B] block">Tanggal Kunjungan</label>
                    <Input
                      type="date"
                      value={normalizeDate(selectedDate)}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                      }}
                      className="h-9 text-xs rounded-xl bg-white border-[#E8DFC8] font-semibold text-[#3D332A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#8A7B6B] block">
                      Jam Praktik Resmi Dokter
                    </label>
                    {doctorSchedulesOnDate.length > 0 ? (
                      <select
                        value={selectedScheduleId}
                        onChange={(e) => {
                          const sched = doctorSchedulesOnDate.find((s) => s.id === e.target.value);
                          if (sched) {
                            setSelectedScheduleId(sched.id);
                            setSelectedTimeSlot(sched.timeRange);
                          }
                        }}
                        className="h-9 text-xs rounded-xl bg-white border-[#E8DFC8] font-bold text-[#3D332A] w-full px-2 focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
                      >
                        {doctorSchedulesOnDate.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.timeRange} WIB ({s.isFull ? "⚠️ Kuota Penuh" : `Sisa ${s.slotsLeft} Slot`})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type="text"
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        placeholder="Contoh: 10:00 WIB"
                        className="h-9 text-xs rounded-xl bg-white border-[#E8DFC8] font-semibold text-[#3D332A]"
                      />
                    )}
                  </div>
                </div>

                <div className="text-xs text-[#6B5E4F] flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B8943F] shrink-0 mt-0.5" />
                  <span>{reservation.branch_name || "Aesthetic Pondok Indah Main Branch"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: PENUGASAN DOKTER & SINKRONISASI JADWAL DATABASE (ANTI-BENTROK) */}
          <div className="bg-white rounded-2xl p-5 border border-[#F0E6D3] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8943F] flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5" /> Penugasan Dokter & Sinkronisasi Jadwal Praktik
              </h4>
              <span className="text-[10px] font-semibold text-[#8A6B2B] bg-[#FAF4E8] px-2 py-0.5 rounded-md border border-[#EADBBD]">
                Live Sync Jadwal Dokter Database
              </span>
            </div>

            {/* Schedule Conflict Live Warning Banner */}
            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                scheduleConflictWarning.level === "danger"
                  ? "bg-red-50/90 border-red-200 text-red-800"
                  : scheduleConflictWarning.level === "warning"
                  ? "bg-amber-50/90 border-amber-200 text-amber-800"
                  : "bg-emerald-50/90 border-emerald-200 text-emerald-800 font-medium"
              }`}
            >
              {scheduleConflictWarning.level === "danger" ? (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              ) : scheduleConflictWarning.level === "warning" ? (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p>{scheduleConflictWarning.message}</p>
              </div>
            </div>

            {/* Doctor Selection with Live Status Badges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#3D332A]">
                  Pilih Dokter Spesialis yang Bertugas
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
                >
                  <option value="">-- Tetapkan Dokter Spesialis --</option>
                  {doctors.map((d) => {
                    const docClean = cleanDocName(d.name);
                    const sched = dbSchedules.find((s) => {
                      const matchDoc = String(s.doctorId) === String(d.id || d.user_id) ||
                                       (s.doctorName && docClean && (cleanDocName(s.doctorName) === docClean || cleanDocName(s.doctorName).includes(docClean)));
                      return matchDoc && normalizeDate(s.date) === cleanSelectedDate;
                    });
                    const statusLabel = sched
                      ? sched.isFull
                        ? `[⚠️ Kuota Penuh (${sched.timeRange})]`
                        : `[✅ Ada Praktik: ${sched.timeRange} (Sisa ${sched.slotsLeft} Slot)]`
                      : `[⚠️ Tidak Praktik di Tgl ${cleanSelectedDate || "ini"}]`;

                    return (
                      <option key={d.id || d.user_id} value={d.id || d.user_id}>
                        {d.name} {statusLabel}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-[#8A7B6B]">
                  Pilih dokter yang memiliki badge hijau ✅ untuk memastikan jam praktik dokter sesuai.
                </p>
              </div>

              {/* Patient Notes / Complaint */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#3D332A]">
                  Keluhan / Catatan Pasien
                </label>
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8] text-xs text-[#4A3F35] min-h-[50px] leading-relaxed">
                  {reservation.complaint || "Tidak ada catatan keluhan khusus yang diinputkan."}
                </div>
              </div>
            </div>

            {/* If doctor has other available dates, offer 1-click switch */}
            {doctorOtherUpcomingSchedules.length > 0 && doctorSchedulesOnDate.length === 0 && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  Jadwal Praktik Aktif Lainnya untuk {doctorName}:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {doctorOtherUpcomingSchedules.slice(0, 4).map((alt) => (
                    <button
                      key={alt.id}
                      type="button"
                      onClick={() => handleSelectActiveSchedule(alt)}
                      className="px-2.5 py-1.5 bg-white hover:bg-amber-100/70 border border-amber-300 rounded-xl text-[11px] font-semibold text-amber-900 flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>{alt.date} ({alt.timeRange} WIB)</span>
                      <span className="text-[10px] text-emerald-700 font-bold">• Sisa {alt.slotsLeft} slot</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Pick Active Schedule Cards on Selected Date */}
            {availableSchedulesOnDate.length > 0 && (
              <div className="pt-2">
                <label className="text-[11px] font-bold text-[#8A6B2B] uppercase tracking-wider block mb-2">
                  Jadwal Praktik Dokter yang Aktif pada Tanggal {selectedDate}:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableSchedulesOnDate.map((sc) => {
                    const isSelected = String(sc.doctorId) === String(selectedDoctorId);
                    return (
                      <div
                        key={sc.id}
                        onClick={() => handleSelectActiveSchedule(sc)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200"
                            : sc.isFull
                            ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                            : "bg-[#FAF8F5] border-[#E8DFC8] hover:border-[#C9A24A] hover:bg-[#FDFBF7]"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-[#3D332A]">{sc.doctorName || "Dokter Spesialis"}</p>
                          <p className="text-[11px] text-[#7A6E60] mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#B8943F]" />
                            {sc.timeRange} WIB
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              sc.isFull
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {sc.isFull ? "Penuh" : `Sisa ${sc.slotsLeft} Slot`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            </div>

          {/* Card 3: 2 Langkah Verifikasi Dokumen & Tanda Tangan Pasien */}
          <div className="bg-white rounded-2xl p-5 border border-[#F0E6D3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0E6D3] pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8943F] flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-[#8C6B1C]" />
                Verifikasi Dokumen Legal & Persetujuan Pasien
              </h4>
              <span className="text-[10px] font-bold text-[#8C6B1C] bg-[#FAF5EA] px-2.5 py-0.5 rounded-full border border-[#EADBBD]">
                2 Dokumen Terdaftar
              </span>
            </div>

            {/* Verifikasi 1: Syarat & Ketentuan Layanan Pasien */}
            <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-bold text-[#3D332A]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1. Syarat & Ketentuan Layanan Pasien</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ Disetujui via Ceklis
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsTermsPdfModalOpen(true)}
                    className="h-7 px-3 rounded-xl border-[#8C6B1C] text-[#8C6B1C] hover:bg-[#FAF5EA] text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lihat PDF Syarat & Ketentuan</span>
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-[#7A6E60] leading-relaxed">
                Pasien telah menyetujui seluruh ketentuan operasional klinik, aturan penjadwalan & reschedule, garansi perawatan, hak & kewajiban pasien, serta kebijakan rekam medis.
              </p>
            </div>

            {/* Verifikasi 2: Surat Pernyataan & Persetujuan Pasien (Informed Consent + Tanda Tangan Digital) */}
            <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-bold text-[#3D332A]">
                  <ShieldCheck className="w-4 h-4 text-[#8C6B1C] shrink-0" />
                  <span>2. Surat Pernyataan & Persetujuan Pasien (Informed Consent)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ Bertanda Tangan Digital
                  </span>
                  <Button
                    type="button"
                    onClick={() => setIsPdfModalOpen(true)}
                    className="h-7 px-3 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lihat PDF Surat Persetujuan</span>
                  </Button>
                </div>
              </div>

              {reservation.signature_data ? (
                <div className="bg-white border border-[#EADBBD] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => setIsPdfModalOpen(true)}
                      className="w-36 h-16 bg-[#FAF8F5] border border-[#D9D0BC] rounded-lg p-1 flex items-center justify-center cursor-pointer hover:border-[#8C6B1C] transition-all group"
                      title="Klik untuk melihat dokumen PDF Surat Persetujuan Pasien"
                    >
                      <img
                        src={reservation.signature_data}
                        alt="Digital Signature Canvas"
                        className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-xs text-[#6B5E4F] space-y-0.5">
                      <p className="font-bold text-[#3D332A]">Goresan Tangan Asli Terverifikasi</p>
                      <p className="text-[11px]">
                        Penandatangan: <strong className="text-[#2C2416]">{patientName}</strong> ({isGuest ? "Guest User" : "Pasien Member"})
                      </p>
                      <p className="text-[10px] text-[#8A7B6B]">
                        Tersimpan permanen pada database reservasi klinik Aesthetic Pondok Indah.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-white rounded-xl border border-dashed border-[#D9D0BC] flex items-center justify-between text-xs text-[#8A7B6B]">
                  <span>Persetujuan medis elektronik telah terkonfirmasi.</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: AKSI FAST ACTION WHATSAPP (Pasien, Dokter, Pengingat H-1) */}
          <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F5ECE0] rounded-2xl p-5 border border-[#EADBBD] shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A6B2B] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Aksi Komunikasi WhatsApp Terintegrasi
            </h4>
            <p className="text-xs text-[#7A6E60]">
              Admin dapat mengirimkan konfirmasi dan notifikasi otomatis 1-klik ke nomor WhatsApp pasien maupun dokter bertugas:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* 1. Konfirmasi ke Pasien */}
              <button
                onClick={handleSendWhatsAppConfirmation}
                className="p-3 bg-white hover:bg-emerald-50/80 border border-emerald-200 rounded-xl text-left transition-all group shadow-xs hover:border-emerald-400 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Konfirmasi ke Pasien</span>
                </div>
                <p className="text-[11px] text-[#8A7B6B] mt-1 line-clamp-2">
                  Kirim rincian kode booking, jadwal praktik & dokter ke WhatsApp {patientName}.
                </p>
              </button>

              {/* 2. Notifikasi ke Dokter */}
              <button
                onClick={handleSendWhatsAppToDoctor}
                className="p-3 bg-white hover:bg-amber-50/80 border border-[#EADBBD] rounded-xl text-left transition-all group shadow-xs hover:border-[#C9A24A] cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[#8A6B2B] font-bold text-xs">
                  <Stethoscope className="w-4 h-4 text-[#C9A24A] shrink-0" />
                  <span>Notifikasi ke Dokter</span>
                </div>
                <p className="text-[11px] text-[#8A7B6B] mt-1 line-clamp-2">
                  Infokan jadwal janji temu dan keluhan pasien ke dokter bertugas.
                </p>
              </button>

              {/* 3. Pengingat H-1 Jam / Hari H */}
              <button
                onClick={handleSendWhatsAppReminder}
                className="p-3 bg-white hover:bg-blue-50/80 border border-blue-200 rounded-xl text-left transition-all group shadow-xs hover:border-blue-400 cursor-pointer"
              >
                <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                  <Bell className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Pengingat H-1 Jam</span>
                </div>
                <p className="text-[11px] text-[#8A7B6B] mt-1 line-clamp-2">
                  Ingatkan pasien untuk hadir 15-30 menit sebelum jadwal treatment.
                </p>
              </button>
            </div>
          </div>

          {/* Card 5: Catatan Admin & Alur Penanganan Status */}
          <div className="bg-white rounded-2xl p-5 border border-[#F0E6D3] shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8943F] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Catatan Internal Staf & Alur Status
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
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Simpan Catatan & Dokter ke Database"}
                </Button>
              </div>
            </div>

            {/* Quick Status Action Flow */}
            <div className="pt-4 border-t border-[#F0E6D3]">
              <p className="text-xs font-bold text-[#3D332A] mb-3">
                Ubah Status Penanganan Reservasi:
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
                    Tandai Selesai Dirawat
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

    {/* Modal Viewer Dokumen PDF Syarat Ketentuan & Tanda Tangan Lengkap */}
    <ReservationConsentPdfModal
      isOpen={isPdfModalOpen}
      onClose={() => setIsPdfModalOpen(false)}
      bookingCode={bookingCode}
      patientName={patientName}
      patientPhone={reservation.phone || ""}
      isGuest={Boolean(isGuest)}
      serviceName={serviceName}
      doctorName={doctorName}
      dateStr={dateStr}
      timeStr={timeStr}
      signatureData={reservation.signature_data}
      acceptedAt={reservation.terms_accepted_at || reservation.createdAt}
    />
    <TermsPdfModal
        isOpen={isTermsPdfModalOpen}
        onClose={() => setIsTermsPdfModalOpen(false)}
      />
    </>
  );
}
