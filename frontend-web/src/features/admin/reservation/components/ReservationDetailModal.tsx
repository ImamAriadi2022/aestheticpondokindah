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
  Edit3,
  Search,
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

  // Edit Doctor & Schedule State
  const [isEditing, setIsEditing] = useState(false);
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("");

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

  // 2 - 3 Rekomendasi Jadwal Dokter Aktif (dengan sisa kuota)
  const topRecommendations = useMemo(() => {
    const valid = dbSchedules.filter((s) => !s.isFull && (s.slotsLeft === undefined || s.slotsLeft > 0));
    // Prioritize same date if available
    const onDate = valid.filter((s) => normalizeDate(s.date) === cleanSelectedDate);
    if (onDate.length >= 2) {
      return onDate.slice(0, 3);
    }
    // Mix with other upcoming active schedules
    const other = valid.filter((s) => normalizeDate(s.date) !== cleanSelectedDate);
    return [...onDate, ...other].slice(0, 3);
  }, [dbSchedules, cleanSelectedDate]);

  // Filter doctors for manual search
  const filteredDoctors = useMemo(() => {
    if (!doctorSearchQuery.trim()) return doctors;
    const q = doctorSearchQuery.toLowerCase();
    return doctors.filter(
      (d) =>
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.specialization && d.specialization.toLowerCase().includes(q)) ||
        (d.speciality && d.speciality.toLowerCase().includes(q))
    );
  }, [doctors, doctorSearchQuery]);

  // Apply quick recommendation
  const handleApplyRecommendation = (rec: AdminDoctorScheduleItem) => {
    setSelectedDoctorId(String(rec.doctorId || rec.id));
    setSelectedScheduleId(rec.id);
    setSelectedDate(rec.date);
    setSelectedTimeSlot(rec.timeRange);
    toast({
      title: "Rekomendasi Dipilih",
      message: `Dokter ${rec.doctorName || "Spesialis"} (${rec.timeRange} WIB) dipilih.`,
      variant: "success",
    });
  };

  // Save edited doctor & schedule
  const handleSaveDoctorAndSchedule = async () => {
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
        title: "Perubahan Berhasil Disimpan",
        message: "Nama dokter dan jadwal kunjungan berhasil diperbarui.",
        variant: "success",
      });

      setIsEditing(false);
      if (onUpdated) onUpdated();
    } catch (err: any) {
      toast({
        title: "Gagal Menyimpan",
        message: err?.message || "Gagal menyimpan perubahan jadwal dokter.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
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
  const rawDateStr = selectedDate || reservation.date || "";

  // Format tanggal jadi "23 Nov 2026" & nama hari
  const { dateStr, dayName } = useMemo(() => {
    if (!rawDateStr) return { dateStr: "-", dayName: "" };
    try {
      const clean = rawDateStr.split("T")[0];
      const parts = clean.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const dt = new Date(y, m, d);
        const monthShort = [
          "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
          "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
        ][m] || "";
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        return {
          dateStr: `${d} ${monthShort} ${y}`,
          dayName: days[dt.getDay()] || "",
        };
      }
    } catch {}
    return { dateStr: rawDateStr, dayName: "" };
  }, [rawDateStr]);

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
      <div className="space-y-5 animate-fade-in w-full text-left">
        {/* Navigation & Header Summary Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-3xl p-5 sm:p-6 border border-[#F0E6D3] shadow-xs">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onClose}
              title="Kembali"
              className="rounded-xl h-9 w-9 border-[#E8DFC8] text-[#4A3F35] bg-white hover:bg-[#FAF8F5] cursor-pointer active:scale-95 shadow-2xs shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="border-l border-[#E8DFC8] pl-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A7B6B] block">
                KODE RESERVASI
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[#2C2416]">
                #{bookingCode}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Header info atau aksi tambahan jika diperlukan */}
          </div>
        </div>

        {/* Editor Form Card (Muncul saat tombol Edit diklik) */}
        {isEditing && (
          <div className="bg-[#FAF7F0] rounded-2xl p-4 sm:p-5 border border-[#EADBBD] shadow-xs space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[#EADBBD]/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#C9A24A]" />
                <h4 className="text-sm font-bold text-[#2C2416]">Edit Dokter & Jadwal Kunjungan</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-bold text-[#8A7B6B] hover:text-[#2C2416] cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* 1. 2-3 Rekomendasi Dokter & Jadwal Aktif */}
            {topRecommendations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C6B1C] block">
                    ⭐ Rekomendasi Jadwal Dokter Aktif (Pilihan Cepat 2–3 Dokter):
                  </label>
                  <span className="text-[10px] text-[#8A7B6B]">Klik untuk pilih otomatis</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {topRecommendations.map((rec) => {
                    const isSelected = String(rec.doctorId) === String(selectedDoctorId) && normalizeDate(rec.date) === cleanSelectedDate;
                    return (
                      <div
                        key={rec.id}
                        onClick={() => handleApplyRecommendation(rec)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-xs touch-manipulation active:scale-98 ${
                          isSelected
                            ? "bg-amber-50 border-[#C9A24A] ring-2 ring-[#C9A24A]/30 shadow-xs"
                            : "bg-white border-[#E8DFC8] hover:border-[#C9A24A] hover:bg-[#FDFBF7]"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-[#2C2416] text-xs truncate">{rec.doctorName || "Dokter Spesialis"}</p>
                          <p className="text-[11px] text-[#8C6B1C] mt-0.5 font-semibold">📅 {rec.date} • ⏰ {rec.timeRange} WIB</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Sisa {rec.slotsLeft} Slot
                          </span>
                          <span className="text-[11px] font-bold text-[#C9A24A]">
                            {isSelected ? "✓ Terpilih" : "Pilih →"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Pencarian & Pemilihan Dokter/Jadwal Manual */}
            <div className="pt-2 border-t border-[#EADBBD]/60 space-y-2.5">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#8C6B1C] block">
                🔍 Atau Cari Dokter & Atur Jadwal Manual:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Cari & Pilih Dokter */}
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs font-bold text-[#2C2416] block">Cari & Pilih Dokter</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#8A7B6B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Ketik nama dokter..."
                      value={doctorSearchQuery}
                      onChange={(e) => setDoctorSearchQuery(e.target.value)}
                      className="h-9 text-xs rounded-xl bg-white border-[#E8DFC8] text-[#2C2416] pl-9 w-full"
                    />
                  </div>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => handleDoctorChange(e.target.value)}
                    className="w-full mt-1 bg-white border border-[#E8DFC8] rounded-xl px-3 py-2 text-xs font-semibold text-[#2C2416] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
                  >
                    <option value="">-- Tetapkan Dokter Spesialis --</option>
                    {filteredDoctors.map((d) => (
                      <option key={d.id || d.user_id} value={d.id || d.user_id}>
                        {d.name} {d.specialization ? `(${d.specialization})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2C2416] block">Tanggal Kunjungan</label>
                  <div className="relative flex items-center">
                    <Calendar className="w-3.5 h-3.5 text-[#8C6B1C] absolute left-3 pointer-events-none" />
                    <Input
                      type="date"
                      value={normalizeDate(selectedDate)}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="h-9 text-xs rounded-xl bg-white border-[#E8DFC8] font-bold text-[#2C2416] pl-9 w-full"
                    />
                  </div>
                </div>

                {/* Jam */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2C2416] block">Jam / Waktu Praktik</label>
                  <div className="relative flex items-center">
                    <Clock className="w-3.5 h-3.5 text-[#8C6B1C] absolute left-3 pointer-events-none" />
                    <Input
                      type="text"
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      placeholder="Contoh: 10:00 WIB"
                      className="h-9 text-xs rounded-xl bg-white border-[#E8DFC8] font-bold text-[#2C2416] pl-9 w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Simpan & Batal Button */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="h-8.5 px-3.5 rounded-xl text-xs font-bold border-[#E8DFC8] text-[#4A3F35] hover:bg-white cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleSaveDoctorAndSchedule}
                disabled={isSubmitting}
                className="h-8.5 px-4.5 rounded-xl bg-gradient-gold hover:opacity-90 text-white text-xs font-bold shadow-md shadow-brand-gold/20 cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        )}

        {/* 2. Layout 2 Kolom: Kiri (Data Reservasi Vertikal) & Kanan (Tombol Aksi Vertikal) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Kolom Kiri: 1 Kotak Utuh Bersih Putih dengan Divider Halus Sesuai Gambar Kalender */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#F0E6D3] shadow-xs divide-y divide-[#F7EFE2] overflow-hidden">
            {/* 1. NAMA PASIEN */}
            <div className="py-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A7B6B] block">
                  Nama Pasien
                </span>
                <p className="text-base font-bold text-[#2C2416] mt-0.5">
                  {patientName}
                </p>
              </div>
              <p className="text-xs text-[#5C5546] font-medium">
                {reservation.phone || "-"}
              </p>
            </div>

            {/* 2. LAYANAN / TINDAKAN */}
            <div className="py-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A7B6B] block">
                  Layanan / Tindakan
                </span>
                <p className="text-base font-bold text-[#2C2416] mt-0.5">
                  {serviceName}
                </p>
              </div>
              <span className="text-xs text-[#8C6B1C] font-semibold">
                Perawatan Estetik
              </span>
            </div>

            {/* 3. DOKTER */}
            <div className="py-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A7B6B] block">
                  Dokter
                </span>
                <p className="text-base font-bold text-[#2C2416] mt-0.5">
                  {doctorName}
                </p>
              </div>
              <span className="text-xs text-[#5C5546] font-medium">
                {selectedDoctorObj?.specialization || "Spesialis Dental"}
              </span>
            </div>

            {/* 4. JADWAL (HARI & TANGGAL) */}
            <div className="py-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A7B6B] block">
                  Jadwal Janji Temu
                </span>
                <p className="text-base font-bold text-[#2C2416] mt-0.5">
                  {dateStr}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#8C6B1C]">
                {dayName ? `Hari ${dayName}` : "-"}
              </span>
            </div>

            {/* 5. WAKTU */}
            <div className="py-3.5 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8A7B6B] block">
                  Waktu Praktik
                </span>
                <p className="text-base font-bold text-[#2C2416] mt-0.5">
                  {timeStr.replace(/wib/i, "").trim()} WIB
                </p>
              </div>
              <span className="text-xs text-[#5C5546] font-medium">
                WIB (Sesuai Jam Janji Temu)
              </span>
            </div>
          </div>

          {/* Kolom Kanan: 3 Action Buttons Berurutan ke Bawah & Status / Tombol Batal Tepat di Bawahnya */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSendWhatsAppConfirmation}
              className="w-full py-3 px-4 rounded-xl bg-[#8C6B1C] hover:bg-[#785A17] active:scale-[0.98] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Konfirmasi ke Pasien</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsAppToDoctor}
              className="w-full py-3 px-4 rounded-xl bg-[#8C6B1C] hover:bg-[#785A17] active:scale-[0.98] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Notifikasi ke Dokter</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsAppReminder}
              className="w-full py-3 px-4 rounded-xl bg-[#8C6B1C] hover:bg-[#785A17] active:scale-[0.98] text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Pengingat H-1 Jam</span>
            </button>

            {/* Status & Aksi Manajemen: Edit Appointment & Batalkan Appointment */}
            <div className="p-4 bg-white rounded-2xl border border-[#F0E6D3] shadow-xs flex flex-col gap-3">
              <div className="text-xs text-[#8A7B6B] flex items-center justify-between">
                <span>Status:</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg}`}>
                  <statusConfig.icon className="w-3.5 h-3.5" />
                  {statusConfig.label}
                </span>
              </div>

              <div className="flex flex-col gap-2 pt-1 border-t border-[#F7EFE2]">
                {/* Button Edit Appointment */}
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[#E8DFC8] text-xs font-bold text-[#8C6B1C] hover:bg-[#FAF8F5] shadow-2xs cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C9A24A]" />
                  <span>{isEditing ? "Tutup Edit Appointment" : "Edit Appointment"}</span>
                </button>

                {/* Konfirmasi Reservasi jika status masih baru */}
                {status !== "Dikonfirmasi" && status !== "Selesai" && status !== "Dibatalkan" && (
                  <Button
                    type="button"
                    onClick={() => handleUpdateStatus("Dikonfirmasi")}
                    disabled={isSubmitting}
                    className="w-full h-9 px-4 rounded-xl bg-[#8C6B1C] hover:bg-[#785A17] text-white text-xs font-bold shadow-xs transition-all cursor-pointer touch-manipulation active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Konfirmasi Reservasi</span>
                  </Button>
                )}

                {/* Tandai Selesai Dirawat jika belum selesai */}
                {status !== "Selesai" && status !== "Dibatalkan" && (
                  <Button
                    type="button"
                    onClick={() => handleUpdateStatus("Selesai")}
                    disabled={isSubmitting}
                    variant="outline"
                    className="w-full h-9 px-3.5 rounded-xl border-[#D9D0BC] bg-white hover:bg-[#FAF8F5] text-[#4A3F35] text-xs font-bold shadow-2xs transition-all cursor-pointer touch-manipulation active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tandai Selesai Dirawat</span>
                  </Button>
                )}

                {/* Button Batalkan Appointment (Paling Bawah) */}
                {status !== "Dibatalkan" && (
                  <Button
                    type="button"
                    onClick={() => handleUpdateStatus("Dibatalkan")}
                    disabled={isSubmitting}
                    className="w-full h-9 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all cursor-pointer touch-manipulation active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Batalkan Appointment</span>
                  </Button>
                )}
              </div>
            </div>
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
