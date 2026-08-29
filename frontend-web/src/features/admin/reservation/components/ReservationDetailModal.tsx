import { useState, useEffect, useMemo } from "react";
import {
  X,
  ArrowLeft,
  Coins,
  CreditCard,
  Banknote,
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
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/toast";
import { updateAdminReservation, confirmAdminReservationPayment, type ReservationItem } from "../services/reservationService";
import { getAdminDoctorSchedules, type AdminDoctorScheduleItem } from "@/features/admin/doctors/services/adminDoctorScheduleApi";
import ReservationConsentPdfModal from "./ReservationConsentPdfModal";
import TermsPdfModal from "@/features/patient/reservation/components/TermsPdfModal";
import { broadcastRealtimeReservationEvent } from "@/core/services/GlobalNotificationManager";
import { scrollPageToTop } from "@/core/router/ScrollToTop";

interface Props {
  isOpen?: boolean;
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


  const isPaid = (reservation.paymentStatus === "Sudah Bayar" || reservation.paymentStatus === "paid" || status === "Selesai");

  const handleConfirmPaymentInModal = async () => {
    if (!token) return;
    if (!window.confirm(`Konfirmasi bahwa pasien ${patientName} telah membayar layanan "${serviceName}" di kasir klinik? Poin reward akan otomatis ditambahkan ke saldo akun member.`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await confirmAdminReservationPayment(token, reservation.id, {
        payment_method: "Tunai / Kasir Offline",
      });

      const pts = res?.data?.point_awarded;
      toast({
        title: "Pembayaran Dikonfirmasi!",
        message: `Reservasi #${bookingCode} berhasil ditandai Lunas. ${pts ? `+${pts} Poin otomatis diberikan ke pasien.` : "Poin telah diproses."}`,
        variant: "success",
      });

      setStatus("Selesai");
      if (onUpdated) onUpdated();
    } catch (err: any) {
      toast({
        title: "Gagal Mengonfirmasi",
        message: err?.message || "Terjadi kesalahan saat memproses pembayaran kasir.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  useEffect(() => {
    scrollPageToTop();
  }, [reservation?.id]);

  return (
    <>
      <div className="space-y-4 sm:space-y-5 animate-fade-in pb-8">
        {/* 1. Header Navigation & Summary Card */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-[#E8DFC8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FAF5EA] hover:bg-[#F3EAD5] text-[#8C6B1C] text-xs font-bold border border-[#EADBBD] transition-all cursor-pointer shrink-0 mt-0.5 sm:mt-0 active:scale-95 touch-manipulation"
              title="Kembali ke Daftar Reservasi"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[#2C2416]">
                  Reservasi #{bookingCode}
                </h2>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.bg}`}>
                  <statusConfig.icon className="w-3 h-3" />
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-[11px] text-[#8A7B6B] mt-0.5 leading-snug">
                {isGuest ? (
                  <span className="text-blue-600 font-semibold">🌐 Alur: Guest Booking</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">👤 Alur: Pasien Terdaftar (Dokter & Jadwal Dipilih Langsung Pasien)</span>
                )}
                {reservation.createdAt && ` • Masuk pada ${new Date(reservation.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="self-end sm:self-auto rounded-xl text-xs font-bold px-3.5 py-2 h-8.5 border-[#E8DFC8] text-[#4A3F35] hover:bg-[#FAF8F5] cursor-pointer flex items-center gap-1 active:scale-95 touch-manipulation shrink-0"
          >
            <span>Kembali ke Daftar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* 2. Top Info Grid (2 Cards: Identitas Pasien & Layanan/Jadwal) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Identitas Pasien */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0E6D3] shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-[#F0E6D3]/60 pb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C6B1C] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#8C6B1C]" /> IDENTITAS PASIEN
                </h4>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  isGuest ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-[#FAF5EA] text-[#8C6B1C] border-[#EADBBD]"
                }`}>
                  {isGuest ? "Pasien Guest" : "Pasien Member"}
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                <div>
                  <span className="text-[10px] font-medium text-[#8A7B6B] block">Pengguna</span>
                  <p className="text-base sm:text-lg font-black text-[#2C2416] leading-tight mt-0.5">
                    {patientName}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-[#5C5546]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#8C6B1C] shrink-0" />
                    <span className="font-semibold text-[#2C2416]">{reservation.phone || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#8C6B1C] shrink-0" />
                    <span className="text-[#6B5E4F] truncate">{reservation.email || "user@aestheticpondokindah.local"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0E6D3]/60 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#8A7B6B] block">Jenis Kelamin:</span>
                <p className="font-bold text-[#2C2416] text-xs capitalize mt-0.5">{reservation.gender || "male"}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#8A7B6B] block">Tgl Lahir / Usia:</span>
                <p className="font-bold text-[#2C2416] text-xs mt-0.5">{reservation.birth_date || "2004-11-21"}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Layanan & Jadwal Kunjungan */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0E6D3] shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#F0E6D3]/60 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C6B1C] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8C6B1C]" /> LAYANAN & JADWAL KUNJUNGAN
              </h4>
            </div>

            {/* Layanan yang Diminati Box */}
            <div className="p-3 sm:p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EDE5D6]">
              <p className="text-[10px] font-bold text-[#8A7B6B] uppercase tracking-wider">Layanan yang Diminati</p>
              <p className="text-base sm:text-lg font-black text-[#2C2416] mt-0.5">{serviceName}</p>
            </div>

            {/* Tanggal & Jam Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8A7B6B] block">Tanggal Kunjungan</label>
                <div className="relative flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-[#8C6B1C] absolute left-3 pointer-events-none" />
                  <Input
                    type="date"
                    value={normalizeDate(selectedDate)}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="h-10 text-xs rounded-xl bg-white border-[#E8DFC8] font-bold text-[#2C2416] pl-9 w-full"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8A7B6B] block">Jam Praktik Resmi Dokter</label>
                <div className="relative flex items-center">
                  <Clock className="w-3.5 h-3.5 text-[#8C6B1C] absolute left-3 pointer-events-none" />
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
                      className="h-10 text-xs rounded-xl bg-white border border-[#E8DFC8] font-bold text-[#2C2416] pl-9 pr-3 w-full focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
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
                      placeholder="Contoh: 10:40 WIB"
                      className="h-10 text-xs rounded-xl bg-white border-[#E8DFC8] font-bold text-[#2C2416] pl-9 w-full"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Branch Location Box */}
            <div className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EDE5D6] text-xs text-[#6B5E4F] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8C6B1C] shrink-0" />
              <span className="font-semibold text-[#3D332A]">{reservation.branch_name || "Aesthetic Pondok Indah Main Branch"}</span>
            </div>
          </div>
        </div>

        {/* 3. Card Penugasan Dokter & Sinkronisasi Jadwal Praktik */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0E6D3] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0E6D3]/60 pb-3 flex-wrap gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C6B1C] flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#8C6B1C]" /> PENUGASAN DOKTER & SINKRONISASI JADWAL PRAKTIK
            </h4>
            <span className="text-[10px] font-semibold text-[#8C6B1C] bg-[#FAF5EA] px-2.5 py-0.5 rounded-full border border-[#EADBBD]">
              Live Sync: Jadwal Dokter Database
            </span>
          </div>

          {/* Schedule Conflict Warning Banner */}
          {scheduleConflictWarning.hasConflict ? (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                scheduleConflictWarning.level === "danger"
                  ? "bg-red-50/90 border-red-200 text-red-800"
                  : "bg-amber-50/90 border-amber-200 text-amber-800"
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{scheduleConflictWarning.message}</p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/90 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{scheduleConflictWarning.message}</span>
            </div>
          )}

          {/* 2-Column Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Pilih Dokter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2C2416]">
                Pilih Dokter Spesialis yang Bertugas
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => handleDoctorChange(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#2C2416] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
              >
                <option value="">--- Tetapkan Dokter Spesialis ---</option>
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

            {/* Right: Keluhan / Catatan Pasien */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#2C2416]">
                Keluhan / Catatan Pasien
              </label>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8] text-xs text-[#4A3F35] min-h-[46px] leading-relaxed">
                {reservation.complaint || `Reservasi ${serviceName} bersama ${doctorName}`}
              </div>
            </div>
          </div>

          {/* Rekomendasi Jadwal Dokter (Maksimal 5 Rekomendasi sesuai instruksi pengguna) */}
          {availableSchedulesOnDate.length > 0 && (
            <div className="pt-2 border-t border-[#F0E6D3]/60">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-[#8C6B1C] uppercase tracking-wider block">
                  Rekomendasi Jadwal Dokter Aktif ({Math.min(availableSchedulesOnDate.length, 5)} Jadwal):
                </label>
                <span className="text-[10px] text-[#8A7B6B]">Klik untuk tetapkan otomatis</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {availableSchedulesOnDate.slice(0, 5).map((sc) => {
                  const isSelected = String(sc.doctorId) === String(selectedDoctorId);
                  return (
                    <div
                      key={sc.id}
                      onClick={() => handleSelectActiveSchedule(sc)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs touch-manipulation active:scale-98 ${
                        isSelected
                          ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200"
                          : sc.isFull
                          ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                          : "bg-[#FAF8F5] border-[#E8DFC8] hover:border-[#C9A24A] hover:bg-[#FDFBF7]"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-[#2C2416] text-xs truncate">{sc.doctorName || "Dokter Spesialis"}</p>
                        <p className="text-[11px] text-[#7A6E60] mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#8C6B1C] shrink-0" />
                          <span>{sc.timeRange} WIB</span>
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          sc.isFull
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {sc.isFull ? "Penuh" : `Sisa ${sc.slotsLeft}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. Verifikasi Dokumen Legal & Persetujuan Pasien */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0E6D3] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0E6D3] pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C6B1C] flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#8C6B1C]" />
              Verifikasi Dokumen Legal & Persetujuan Pasien
            </h4>
            <span className="text-[10px] font-bold text-[#8C6B1C] bg-[#FAF5EA] px-2.5 py-0.5 rounded-full border border-[#EADBBD]">
              2 Dokumen Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* S&K */}
            <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-2xl p-4 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    1. Syarat & Ketentuan Layanan
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Disetujui
                  </span>
                </div>
                <p className="text-[11px] text-[#7A6E60] leading-relaxed">
                  Pasien telah menyetujui seluruh ketentuan operasional klinik & kebijakan rekam medis.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTermsPdfModalOpen(true)}
                className="h-8 px-3 rounded-xl border-[#8C6B1C] text-[#8C6B1C] hover:bg-[#FAF5EA] text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95 w-full"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lihat PDF Syarat & Ketentuan</span>
              </Button>
            </div>

            {/* Informed Consent */}
            <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-2xl p-4 space-y-2.5 flex flex-col justify-between">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#8C6B1C] shrink-0" />
                    2. Surat Persetujuan (Informed Consent)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Bertanda Tangan Digital
                  </span>
                </div>
                <p className="text-[11px] text-[#7A6E60] leading-relaxed">
                  Surat pernyataan persetujuan tindakan medis bertanda tangan sah elektronik.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="h-8 px-3 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-95 w-full"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Lihat PDF Surat Persetujuan</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 5. Aksi Fast Action WhatsApp */}
        <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F5ECE0] rounded-2xl p-4 sm:p-5 border border-[#EADBBD] shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A6B2B] flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Aksi Komunikasi WhatsApp Terintegrasi
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={handleSendWhatsAppConfirmation}
              className="p-3 bg-white hover:bg-emerald-50/80 border border-emerald-200 rounded-xl text-left transition-all shadow-xs cursor-pointer active:scale-95 touch-manipulation"
            >
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Konfirmasi ke Pasien</span>
              </div>
              <p className="text-[10px] text-[#8A7B6B] mt-1 line-clamp-2">
                Kirim detail booking & dokter ke WA {patientName}.
              </p>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsAppToDoctor}
              className="p-3 bg-white hover:bg-amber-50/80 border border-[#EADBBD] rounded-xl text-left transition-all shadow-xs cursor-pointer active:scale-95 touch-manipulation"
            >
              <div className="flex items-center gap-2 text-[#8A6B2B] font-bold text-xs">
                <Stethoscope className="w-4 h-4 text-[#C9A24A] shrink-0" />
                <span>Notifikasi ke Dokter</span>
              </div>
              <p className="text-[10px] text-[#8A7B6B] mt-1 line-clamp-2">
                Infokan janji temu dan keluhan pasien ke dokter.
              </p>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsAppReminder}
              className="p-3 bg-white hover:bg-blue-50/80 border border-blue-200 rounded-xl text-left transition-all shadow-xs cursor-pointer active:scale-95 touch-manipulation"
            >
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                <Bell className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Pengingat H-1 Jam</span>
              </div>
              <p className="text-[10px] text-[#8A7B6B] mt-1 line-clamp-2">
                Ingatkan pasien untuk hadir 15-30 menit sebelum jadwal.
              </p>
            </button>
          </div>
        </div>

        {/* 6. Catatan Internal Staf */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#F0E6D3] shadow-xs space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C6B1C] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Catatan Internal Staf & Dokter
          </h4>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Tulis catatan internal untuk staf front-desk / dokter (contoh: Pasien ingin konsultasi behel, sudah dihubungi via WA)..."
            rows={2}
            className="w-full bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleSaveNotesAndDoctor}
              disabled={isSubmitting}
              size="sm"
              variant="outline"
              className="text-xs h-8 rounded-xl border-[#C9A24A] text-[#8A6B2B] hover:bg-[#FDF8F0] cursor-pointer touch-manipulation active:scale-95"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Simpan Catatan & Dokter ke Database"}
            </Button>
          </div>
        </div>

        {/* 7. Bottom Action Footer Bar (Sesuai Mockup Desain) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5 p-4 sm:p-5 bg-white rounded-2xl border border-[#E8DFC8] shadow-xs">
          <div className="text-xs text-[#8A7B6B] flex items-center gap-2">
            <span>Status Penanganan Saat Ini:</span>
            <strong className="text-[#2C2416] font-bold text-sm">{status}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Konfirmasi Reservasi */}
            {status !== "Dikonfirmasi" && status !== "Selesai" && (
              <Button
                type="button"
                onClick={() => handleUpdateStatus("Dikonfirmasi")}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-xs transition-all cursor-pointer touch-manipulation active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Konfirmasi Reservasi</span>
              </Button>
            )}

            {/* Tandai Selesai Dirawat */}
            {status !== "Selesai" && (
              <Button
                type="button"
                onClick={() => handleUpdateStatus("Selesai")}
                disabled={isSubmitting}
                variant="outline"
                className="flex-1 sm:flex-none h-10 px-4 rounded-xl border-[#D9D0BC] bg-white hover:bg-[#FAF8F5] text-[#4A3F35] text-xs font-bold shadow-2xs transition-all cursor-pointer touch-manipulation active:scale-95 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tandai Selesai Dirawat</span>
              </Button>
            )}

            {/* Batalkan Reservasi */}
            {status !== "Dibatalkan" && (
              <Button
                type="button"
                onClick={() => handleUpdateStatus("Dibatalkan")}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-all cursor-pointer touch-manipulation active:scale-95 flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Batalkan Reservasi</span>
              </Button>
            )}

            {/* Tolak */}
            {status !== "Ditolak" && status === "Baru" && (
              <Button
                type="button"
                onClick={() => handleUpdateStatus("Ditolak")}
                disabled={isSubmitting}
                variant="outline"
                className="flex-1 sm:flex-none h-10 px-4 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-all cursor-pointer touch-manipulation active:scale-95"
              >
                <span>Tolak</span>
              </Button>
            )}
          </div>
        </div>
      </div>

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
      readOnly={true}
    />
    <TermsPdfModal
        isOpen={isTermsPdfModalOpen}
        onClose={() => setIsTermsPdfModalOpen(false)}
        readOnly={true}
      />
    </>
  );
}
