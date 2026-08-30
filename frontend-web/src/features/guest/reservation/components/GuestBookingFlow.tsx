import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router";
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
  Stethoscope,
  PenTool,
  Info,
  ShieldCheck,
  Phone,
  User,
  Star,
  Download,
  AlertCircle,
  FileCheck,
  FileText,
  CheckCircle2,
  ChevronDown,
  CalendarOff,
} from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { apiClient } from "@/core/api/apiClient";
import DigitalSignatureModal from "@/features/patient/reservation/components/DigitalSignatureModal";
import TermsPdfModal from "@/features/patient/reservation/components/TermsPdfModal";
import ReservationConsentPdfModal from "@/features/admin/reservation/components/ReservationConsentPdfModal";
import { scrollPageToTop } from "@/core/router/ScrollToTop";
import { PageTransition } from "@/core/router/RouteTransition";
import { updateZestaReservationContext } from "@/core/services/zestaService";

interface ServiceItem {
  id: string | number;
  name: string;
  category: string;
  price: string;
  duration: string;
  description: string;
  popular?: boolean;
}

interface DoctorItem {
  id: string | number;
  userId?: string | number;
  name: string;
  specialization: string;
  experienceYears?: string | number;
  rating: number;
  avatar: string;
  branches: string[];
}

const displayPhoneWithoutPrefix = (phone: string | null | undefined): string => {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    return digits.substring(2);
  }
  if (digits.startsWith("0")) {
    return digits.substring(1);
  }
  return digits;
};

const handlePhoneChange = (input: string): string => {
  const digits = input.replace(/\D/g, "");
  const clean = digits.startsWith("62") ? digits.substring(2) : digits.startsWith("0") ? digits.substring(1) : digits;
  return clean ? `+62${clean}` : "";
};

export default function GuestBookingFlow() {
  const [searchParams] = useSearchParams();
  const requestedServiceName = searchParams.get("service") || searchParams.get("treatment") || searchParams.get("layanan");
  const requestedServiceId = searchParams.get("serviceId") || searchParams.get("id");

  const [currentStep, setCurrentStep] = useState<"layanan" | "dokter" | "jadwal" | "konfirmasi">("layanan");

  // Automatically scroll to the top of the page on step transition
  useEffect(() => {
    scrollPageToTop();
  }, [currentStep]);

  // Step 1: Services with Instant Cache
  const [services, setServices] = useState<ServiceItem[]>(() => {
    try {
      const cached = localStorage.getItem("apig_cached_services");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(() => {
    try {
      const cached = localStorage.getItem("apig_cached_services");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch {}
    return null;
  });
  const [searchService, setSearchService] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [servicesLoading, setServicesLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem("apig_cached_services");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return false;
      }
    } catch {}
    return true;
  });

  // Step 2: Doctors with Instant Cache
  const [doctors, setDoctors] = useState<DoctorItem[]>(() => {
    try {
      const cached = localStorage.getItem("apig_cached_doctors");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorItem | null>(() => {
    try {
      const cached = localStorage.getItem("apig_cached_doctors");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch {}
    return null;
  });
  const [doctorsLoading, setDoctorsLoading] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem("apig_cached_doctors");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return false;
      }
    } catch {}
    return true;
  });

  // Step 3: Date & Time
  const availableDates = useMemo(() => {
    const dates = [];
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const dayNum = d.getDate();
      const dayName = dayNames[d.getDay()];
      const monthName = monthNames[d.getMonth()];
      const year = d.getFullYear();
      dates.push({
        iso,
        dayNum,
        dayName,
        monthName,
        year,
        display: `${dayName}, ${dayNum} ${monthName} ${year}`,
      });
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(availableDates[1]?.iso || availableDates[0]?.iso);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10:00");

  const selectedDateObj = useMemo(() => {
    const found = availableDates.find((d) => d.iso === selectedDate);
    if (found) return found;
    if (!selectedDate) return availableDates[0];
    const d = new Date(selectedDate);
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    const dayNum = d.getDate();
    const dayName = dayNames[d.getDay()] || "Senin";
    const monthName = monthNames[d.getMonth()] || "Januari";
    const year = d.getFullYear();
    return {
      iso: selectedDate,
      dayNum,
      dayName,
      monthName,
      year,
      display: `${dayName}, ${dayNum} ${monthName} ${year}`,
    };
  }, [availableDates, selectedDate]);

  // Step 4: Guest Patient Identity
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Modals & States
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showConsentPdfModal, setShowConsentPdfModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([]);

  // Load Services
  useEffect(() => {
    const fetchServices = async () => {
      if (services.length === 0) setServicesLoading(true);
      try {
        const res = await apiClient.get("/public/services", { skipToast: true });
        const list = Array.isArray(res) ? res : res?.data || res?.services || [];
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((item: any) => ({
            id: item.id,
            name: item.title || item.name,
            category: item.category || "Perawatan Gigi",
            price: item.price ? `Rp ${Number(item.price).toLocaleString("id-ID")}` : "Konsultasi Dokter",
            duration: item.duration || "45 - 60 Menit",
            description: item.short_desc || item.description || "Layanan perawatan dental estetik terbaik di Aesthetic Pondok Indah.",
            popular: Boolean(item.is_featured || item.popular),
          }));
          try {
            localStorage.setItem("apig_cached_services", JSON.stringify(mapped));
          } catch {}
          setServices(mapped);

          let initialMatch = mapped[0];
          if (requestedServiceId) {
            const foundById = mapped.find((m: any) => String(m.id) === String(requestedServiceId));
            if (foundById) initialMatch = foundById;
          } else if (requestedServiceName) {
            const q = requestedServiceName.toLowerCase().trim();
            const foundByName = mapped.find(
              (m: any) =>
                m.name.toLowerCase() === q ||
                m.name.toLowerCase().includes(q) ||
                q.includes(m.name.toLowerCase())
            );
            if (foundByName) initialMatch = foundByName;
          }
          setSelectedService(initialMatch);
        }
      } catch {
        // fallback
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, [requestedServiceName, requestedServiceId]);

  // Load Doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      if (doctors.length === 0) setDoctorsLoading(true);
      try {
        const res = await apiClient.get("/public/doctors", { skipToast: true });
        const list = Array.isArray(res) ? res : res?.data || res?.doctors || [];
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((doc: any, index: number) => ({
            id: doc.id || index + 1,
            userId: doc.user_id || doc.id,
            name: doc.name || "drg. Spesialis Gigi",
            specialization: doc.specialization || "Dokter Gigi Spesialis",
            experienceYears: doc.experience_years || 8,
            rating: Number(doc.rating) || 4.9,
            avatar: doc.avatar_url || doc.avatar || "https://images.unsplash.com/photo-1594824813628-98e3532c2560?w=400&q=80",
            branches: ["Aesthetic Pondok Indah Main Branch"],
          }));
          try {
            localStorage.setItem("apig_cached_doctors", JSON.stringify(mapped));
          } catch {}
          setDoctors(mapped);
          setSelectedDoctor(mapped[0]);
        }
      } catch {
        // fallback
      } finally {
        setDoctorsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Load Doctor Schedules
  useEffect(() => {
    const fetchDoctorSchedules = async () => {
      try {
        const res = await apiClient.get("/public/doctor-schedules");
        const list = Array.isArray(res) ? res : res?.data || [];
        if (Array.isArray(list)) {
          setDoctorSchedules(list);
        }
      } catch {
        // fallback
      }
    };
    fetchDoctorSchedules();
  }, []);

  // Helper to parse time_range string into 10-minute slots
  const parseTimeRangeToSlots = (timeRange: string, intervalMinutes: number = 10): string[] => {
    if (!timeRange) return [];
    const ranges = timeRange.split(/[,;/]/).map((r) => r.trim()).filter(Boolean);
    const allSlots: string[] = [];

    for (const range of ranges) {
      const parts = range.split(/[-–—]/).map((p) => p.trim().replace(".", ":"));
      if (parts.length === 2) {
        const [startH, startM = 0] = parts[0].split(":").map(Number);
        const [endH, endM = 0] = parts[1].split(":").map(Number);
        if (!isNaN(startH) && !isNaN(endH)) {
          let currentTotalM = startH * 60 + (isNaN(startM) ? 0 : startM);
          const endTotalM = endH * 60 + (isNaN(endM) ? 0 : endM);
          while (currentTotalM < endTotalM) {
            const hh = String(Math.floor(currentTotalM / 60)).padStart(2, "0");
            const mm = String(currentTotalM % 60).padStart(2, "0");
            const slotStr = `${hh}:${mm}`;
            if (!allSlots.includes(slotStr)) {
              allSlots.push(slotStr);
            }
            currentTotalM += intervalMinutes;
          }
        }
      }
    }

    return allSlots.sort();
  };

  // Helper to get schedules for a specific date and selected doctor
  const getDoctorSchedulesForDate = (dateIso: string) => {
    if (!selectedDoctor) return [];
    return doctorSchedules.filter((s) => {
      const matchDoc =
        String(s.doctorId) === String(selectedDoctor.id) ||
        String(s.doctorId) === String(selectedDoctor.userId) ||
        (s.doctorName &&
          selectedDoctor.name &&
          (s.doctorName.toLowerCase().includes(selectedDoctor.name.toLowerCase()) ||
            selectedDoctor.name.toLowerCase().includes(s.doctorName.toLowerCase())));
      const matchDate = s.date === dateIso;
      return matchDoc && matchDate;
    });
  };

  // Dynamic Time Slots based on selected doctor & selected date
  const currentDaySchedules = useMemo(() => {
    return getDoctorSchedulesForDate(selectedDate);
  }, [selectedDoctor, selectedDate, doctorSchedules]);

  const isDoctorAvailableOnSelectedDate = currentDaySchedules.length > 0;

  const timeSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate || !isDoctorAvailableOnSelectedDate) return [];

    const slots: string[] = [];
    currentDaySchedules.forEach((s) => {
      if (s.timeRange) {
        const generated = parseTimeRangeToSlots(s.timeRange, 10);
        generated.forEach((slot) => {
          if (!slots.includes(slot)) slots.push(slot);
        });
      }
    });

    return slots.sort();
  }, [selectedDoctor, selectedDate, currentDaySchedules, isDoctorAvailableOnSelectedDate]);

  const nextAvailableDate = useMemo(() => {
    if (!selectedDoctor) return null;
    return availableDates.find((d) => getDoctorSchedulesForDate(d.iso).length > 0) || null;
  }, [selectedDoctor, availableDates, doctorSchedules]);

  // Auto-select first available date if current selected date has no schedule
  useEffect(() => {
    if (selectedDoctor && doctorSchedules.length > 0) {
      const currentAvailable = getDoctorSchedulesForDate(selectedDate).length > 0;
      if (!currentAvailable) {
        const firstAvail = availableDates.find(
          (d) => getDoctorSchedulesForDate(d.iso).length > 0
        );
        if (firstAvail) {
          setSelectedDate(firstAvail.iso);
        }
      }
    }
  }, [selectedDoctor, doctorSchedules]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    set.add("Semua");
    services.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchCat = selectedCategory === "Semua" || s.category === selectedCategory;
      const matchSearch =
        !searchService ||
        s.name.toLowerCase().includes(searchService.toLowerCase()) ||
        s.description.toLowerCase().includes(searchService.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [services, selectedCategory, searchService]);

  // Handle Guest Booking Submit
  const handleGuestSubmit = async () => {
    if (!agreeTerms) {
      toast({
        title: "Persetujuan Diperlukan",
        message: "Silakan centang persetujuan Syarat & Ketentuan sebelum melanjutkan.",
        variant: "warning",
      });
      return;
    }

    if (!patientName.trim() || !patientPhone.trim()) {
      toast({
        title: "Identitas Belum Lengkap",
        message: "Mohon isi Nama Lengkap dan Nomor WhatsApp Anda.",
        variant: "warning",
      });
      return;
    }

    if (!selectedService || !selectedDoctor) {
      toast({
        title: "Data Belum Lengkap",
        message: "Pastikan Anda telah memilih layanan dan dokter.",
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: patientName.trim(),
        phone: patientPhone.trim(),
        email: patientEmail.trim() || undefined,
        treatment_interest: selectedService.name,
        doctor_id: selectedDoctor.userId || selectedDoctor.id,
        date: selectedDate,
        preferred_time: selectedTimeSlot,
        complaint: notes || `Reservasi Guest ${selectedService.name} bersama ${selectedDoctor.name}`,
        source: "guest_web_flow",
        signature_data: signatureData,
      };

      const res = await apiClient.post("/public/reservations", payload);
      const resData = res.data?.reservation || res.data?.data || res.data;

      const ticketCode =
        resData?.code ||
        `#RSV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 90000) + 10000)}`;

      const newTicket = {
        id: resData?.id || Date.now(),
        code: ticketCode,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        serviceName: selectedService.name,
        date: selectedDate,
        time: selectedTimeSlot,
        locationName: "Aesthetic Pondok Indah Main Branch",
        patientName: patientName.trim(),
        phone: patientPhone.trim(),
      };

      setActiveTicket(newTicket);

      // Sinkronisasi metadata tiket ke Zesta Live Chat
      updateZestaReservationContext({
        bookingCode: ticketCode,
        serviceName: selectedService.name,
        doctorName: selectedDoctor.name,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail.trim(),
      });

      // Otomatis teruskan pesan ke WhatsApp Admin Klinik
      const waMessage = [
        "*KONFIRMASI RESERVASI JANJI TEMU (GUEST BOOKING)*",
        "*Aesthetic Pondok Indah Dental Clinic*",
        "━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "Halo Admin Aesthetic Pondok Indah, saya telah mengajukan reservasi janji temu online dengan rincian sebagai berikut:",
        "",
        `📋 *Kode Reservasi:* ${ticketCode}`,
        `👤 *Nama Pasien:* ${patientName.trim()}`,
        `📱 *No. WhatsApp:* ${patientPhone.trim()}`,
        patientEmail.trim() ? `📧 *Email:* ${patientEmail.trim()}` : "",
        "",
        `👨‍⚕️ *Dokter Spesialis:* ${selectedDoctor.name} (${selectedDoctor.specialization || "Spesialis Gigi"})`,
        `🏥 *Layanan Perawatan:* ${selectedService.name}`,
        `📅 *Tanggal Janji Temu:* ${selectedDate}`,
        `⏰ *Waktu / Jam:* ${selectedTimeSlot} WIB`,
        `📍 *Lokasi:* Aesthetic Pondok Indah, Jakarta Selatan`,
        notes ? `📝 *Catatan Keluhan:* ${notes}` : "",
        "",
        "Mohon verifikasi dan konfirmasi ketersediaan jadwal tersebut. Terima kasih! 🙏",
      ].filter(Boolean).join("\n");

      const adminPhone = "6281990114949";
      const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(waMessage)}`;

      try {
        window.open(waUrl, "_blank");
      } catch {}

      toast({
        title: "Reservasi Berhasil Dibuat!",
        message: `Kode Booking: ${ticketCode}. Pesan rincian telah diteruskan ke WhatsApp Admin.`,
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Gagal Membuat Reservasi",
        message: err?.response?.data?.message || "Terjadi kendala pada server. Coba lagi.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: "layanan", label: "1. Pilih Layanan" },
    { id: "dokter", label: "2. Pilih Dokter" },
    { id: "jadwal", label: "3. Pilih Jadwal" },
    { id: "konfirmasi", label: "4. Data Pasien & Selesai" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#FBF5EC] via-[#F6EDE0] to-[#EFE2CE] p-6 sm:p-8 rounded-3xl border border-[#EADBBD] shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-xs font-bold text-[#8A6B2B] border border-[#EADBBD] mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A24A]" />
              Reservasi Online Cepat (Guest Booking)
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3D332A] tracking-tight">
              Reservasi Janji Temu Pasien
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6E60] mt-1 max-w-xl leading-relaxed">
              Daftarkan diri Anda untuk konsultasi & perawatan gigi estetik bersama dokter spesialis terbaik di Aesthetic Pondok Indah Dental Clinic.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#EADBBD] shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <ShieldCheck className="w-5 h-5 text-[#C9A24A]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#3D332A]">Tanpa Perlu Login</p>
              <p className="text-[11px] text-[#8A7B6B]">Konfirmasi otomatis ke WhatsApp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2 rounded-2xl border border-[#F0E6D3] shadow-xs">
        {steps.map((st, idx) => {
          const isActive = currentStep === st.id;
          const isPassed =
            (st.id === "layanan" && currentStep !== "layanan") ||
            (st.id === "dokter" && (currentStep === "jadwal" || currentStep === "konfirmasi")) ||
            (st.id === "jadwal" && currentStep === "konfirmasi");

          return (
            <button
              key={st.id}
              onClick={() => {
                if (st.id === "layanan") setCurrentStep("layanan");
                if (st.id === "dokter" && selectedService) setCurrentStep("dokter");
                if (st.id === "jadwal" && selectedService && selectedDoctor) setCurrentStep("jadwal");
                if (st.id === "konfirmasi" && selectedService && selectedDoctor) setCurrentStep("konfirmasi");
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#C9A24A] text-white shadow-xs"
                  : isPassed
                  ? "bg-[#FAF8F5] text-[#8A6B2B] hover:bg-[#F5ECE0]"
                  : "text-[#A89F91] cursor-not-allowed"
              }`}
            >
              {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{idx + 1}.</span>}
              <span>{st.label.split(". ")[1]}</span>
            </button>
          );
        })}
      </div>

      <PageTransition transitionKey={currentStep}>
        {/* STEP 1: PILIH LAYANAN */}
        {currentStep === "layanan" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#F0E6D3] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#3D332A]">Pilih Layanan & Perawatan Gigi</h3>
                <p className="text-xs text-[#8A7B6B]">Pilih perawatan dental yang ingin Anda lakukan di klinik.</p>
              </div>

              {/* Search & Category Filter Dropdown */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89F91]" />
                  <input
                    type="text"
                    value={searchService}
                    onChange={(e) => setSearchService(e.target.value)}
                    placeholder="Cari layanan..."
                    className="w-full h-10 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl pl-9 pr-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
                  />
                </div>

                <div className="relative w-full sm:w-52">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 pl-3 pr-8 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] text-xs font-semibold text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A] cursor-pointer appearance-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "Semua" ? "Semua Kategori Layanan" : cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8C8272] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Service Grid - Showing Service Name only (no icon) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {filteredServices.map((svc) => {
                const isSelected = selectedService?.id === svc.id;
                return (
                  <div
                    key={svc.id}
                    onClick={() => {
                      setSelectedService(svc);
                      setCurrentStep("dokter");
                    }}
                    className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 hover:border-[#C9A24A] hover:shadow-md hover:-translate-y-0.5 ${
                      isSelected
                        ? "bg-[#FAF5EA] border-2 border-[#C9A24A] shadow-md ring-2 ring-[#C9A24A]/20"
                        : "bg-white border-[#F0E6D3] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <h4 className="text-sm sm:text-base font-bold text-[#3D332A] group-hover:text-[#8A6B2B] transition-colors truncate text-left min-w-0 flex-1">{svc.name}</h4>

                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-[#C9A24A] text-white" : "text-[#A89F91] group-hover:text-[#8A6B2B] group-hover:bg-[#FAF5EA]"}`}>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: PILIH DOKTER */}
      {currentStep === "dokter" && (
        <div className="bg-white rounded-3xl p-6 border border-[#F0E6D3] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#3D332A]">Pilih Dokter Spesialis</h3>
              <p className="text-xs text-[#8A7B6B]">Pilih dokter yang akan menangani perawatan {selectedService?.name}.</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep("layanan")}
              className="text-xs font-semibold text-[#8A6B2B] hover:underline cursor-pointer"
            >
              Ganti Layanan
            </button>
          </div>

          {/* Doctor Cards Grid - Showing Doctor Name and Specialization only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {doctors.map((doc) => {
              const isSelected = selectedDoctor?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setCurrentStep("jadwal");
                  }}
                  className={`group p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3.5 hover:border-[#C9A24A] hover:shadow-md hover:-translate-y-0.5 ${
                    isSelected
                      ? "bg-[#FAF5EA] border-2 border-[#C9A24A] shadow-md ring-2 ring-[#C9A24A]/20"
                      : "bg-white border-[#F0E6D3] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-[#E8DFC8] shadow-xs group-hover:scale-105 transition-transform"
                    />
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C9A24A] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left space-y-0.5">
                    <h4 className="text-sm sm:text-base font-bold text-[#3D332A] group-hover:text-[#8A6B2B] transition-colors truncate">{doc.name}</h4>
                    <p className="text-xs text-[#8A6B2B] font-semibold truncate">{doc.specialization}</p>
                  </div>

                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-[#C9A24A] text-white" : "text-[#A89F91] group-hover:text-[#8A6B2B] group-hover:bg-[#FAF5EA]"}`}>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-start pt-4 border-t border-[#F5ECE0]">
            <Button
              onClick={() => setCurrentStep("layanan")}
              variant="outline"
              className="rounded-xl border-[#E8DFC8] text-xs font-semibold px-5 py-2.5 h-auto flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali ke Pilih Layanan
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: PILIH JADWAL */}
      {currentStep === "jadwal" && (
        <div className="bg-white rounded-3xl p-6 border border-[#F0E6D3] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#3D332A]">Pilih Tanggal & Waktu Kunjungan</h3>
              <p className="text-xs text-[#8A7B6B]">Pilih hari dan jam kunjungan yang Anda inginkan.</p>
            </div>
          </div>

          {/* Date Picker Section with Direct Calendar Button */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-[#3D332A]">1. Pilih Tanggal Kunjungan</label>
                <p className="text-xs text-[#8A7B6B]">Pilih dari slider mingguan atau klik tombol kalender</p>
              </div>

              {/* Direct Calendar Picker Button */}
              <div className="relative inline-flex items-center">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF5EA] hover:bg-[#F5ECE0] border border-[#EADBBD] text-xs font-bold text-[#8C6B1C] shadow-2xs transition-all cursor-pointer">
                  <Calendar className="w-4 h-4 text-[#8C6B1C]" />
                  <span>{selectedDateObj?.dayName}, {selectedDateObj?.dayNum} {selectedDateObj?.monthName} {selectedDateObj?.year}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8C6B1C]" />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    if (e.target.value) setSelectedDate(e.target.value);
                  }}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  title="Buka Kalender Pemilihan Tanggal"
                />
              </div>
            </div>

            {/* List Kalender Minggu Berjalan (Day Cards Slider - Soft Gold/White palette without red) */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-[#8C8272] uppercase tracking-wider">Kalender Minggu Berjalan</p>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {availableDates.map((d) => {
                  const isSelected = selectedDate === d.iso;
                  const daySchedules = getDoctorSchedulesForDate(d.iso);
                  const isAvailable = daySchedules.length > 0;

                  return (
                    <button
                      key={d.iso}
                      type="button"
                      onClick={() => setSelectedDate(d.iso)}
                      className={`w-20 h-22 rounded-2xl border flex flex-col items-center justify-center shrink-0 transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-[#C9A24A] border-[#C9A24A] text-white shadow-md"
                          : "bg-[#FAF8F5] border-[#E8DFC8] text-[#3D332A] hover:bg-[#F5ECE0]"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-semibold uppercase ${
                          isSelected ? "text-white/80" : "text-[#8A7B6B]"
                        }`}
                      >
                        {d.dayName}
                      </span>
                      <span className="text-lg font-bold mt-0.5">{d.dayNum}</span>
                      <span
                        className={`text-[9px] font-semibold mt-1 px-1.5 py-0.5 rounded-md ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : isAvailable
                            ? "bg-[#FAF4E8] text-[#8A6B2B]"
                            : "bg-[#F5EFE6] text-[#8C8272]"
                        }`}
                      >
                        {isAvailable ? "Praktik" : "Libur"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Conditional: Dynamic Time Slots OR Off-Duty Notice */}
          {isDoctorAvailableOnSelectedDate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#3D332A]">2. Pilih Jam Kunjungan</label>
                <span className="text-[11px] font-semibold text-[#8A6B2B] bg-[#FAF4E8] px-2.5 py-1 rounded-md border border-[#E8D4A2]/40">
                  {timeSlots.length} Sesi Tersedia
                </span>
              </div>

              {/* Time Slot Responsive Grid (without WIB) */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        setSelectedTimeSlot(slot);
                        setCurrentStep("konfirmasi");
                      }}
                      className={`h-10 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center cursor-pointer hover:scale-105 ${
                        isSelected
                          ? "bg-[#C9A24A] border-[#C9A24A] text-white shadow-xs"
                          : "bg-[#FAF8F5] border-[#E8DFC8] text-[#3D332A] hover:border-[#C9A24A] hover:bg-white"
                      }`}
                    >
                      <span>{slot}</span>
                    </button>
                  );
                })}
              </div>

              {currentDaySchedules.length > 0 && (
                <p className="text-[11px] text-[#8A7B6B] mt-2 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#C9A24A]" />
                  <span>Jadwal dokter: {currentDaySchedules.map((s) => s.timeRange).join(", ")}</span>
                </p>
              )}
            </div>
          ) : (
            /* Off-duty notice box (Soft gold/cream) */
            <div className="bg-[#FAF8F5] border border-[#EADBBD] rounded-2xl p-5 text-left space-y-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] shrink-0">
                  <CalendarOff className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#2C2416]">
                    Tidak Ada Jadwal Praktik Dokter
                  </h4>
                  <p className="text-xs text-[#5C5546] leading-relaxed">
                    <span className="font-bold">{selectedDoctor?.name}</span> tidak memiliki jadwal praktik atau sedang libur pada tanggal yang dipilih.
                  </p>
                  <p className="text-[11px] text-[#8C8272]">
                    Silakan pilih tanggal lain bertanda <strong>"Praktik"</strong> di atas.
                  </p>
                </div>
              </div>

              {nextAvailableDate && (
                <div className="pt-2 border-t border-[#EDE5D6] flex items-center justify-between">
                  <span className="text-xs text-[#5C5546] font-medium">Jadwal dokter berikutnya:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(nextAvailableDate.iso)}
                    className="text-xs font-bold text-[#8A6B2B] bg-white px-3 py-1 rounded-lg border border-[#E8DFC8] hover:bg-[#FAF8F5] cursor-pointer"
                  >
                    Pilih {nextAvailableDate.dayName}, {nextAvailableDate.dayNum} {nextAvailableDate.monthName} →
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-start pt-4 border-t border-[#F5ECE0]">
            <Button
              onClick={() => setCurrentStep("dokter")}
              variant="outline"
              className="rounded-xl border-[#E8DFC8] text-xs font-semibold px-5 py-2.5 h-auto flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Kembali ke Pilih Dokter
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: DATA PASIEN GUEST & KONFIRMASI */}
      {currentStep === "konfirmasi" && (
        <div className="space-y-6">
          {/* Summary Selected Info Card (No price, no WIB) */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0E6D3] shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#B8943F] flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Ringkasan Pilihan Reservasi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FDF8F0] rounded-2xl border border-[#F5E6C8]">
                <p className="text-[10px] text-[#8A6B2B] font-semibold">Layanan Perawatan</p>
                <p className="text-sm font-bold text-[#3D332A] mt-0.5">{selectedService?.name}</p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DFC8]">
                <p className="text-[10px] text-[#8A6B2B] font-semibold">Dokter Bertugas</p>
                <p className="text-sm font-bold text-[#3D332A] mt-0.5">{selectedDoctor?.name}</p>
                <p className="text-xs text-[#8A7B6B] mt-1">{selectedDoctor?.specialization}</p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DFC8]">
                <p className="text-[10px] text-[#8A6B2B] font-semibold">Jadwal Kunjungan</p>
                <p className="text-sm font-bold text-[#3D332A] mt-0.5">{selectedDateObj?.display || selectedDate}</p>
                <p className="text-xs text-[#8A7B6B] mt-1">Pukul {selectedTimeSlot}</p>
              </div>
            </div>
          </div>

          {/* Form Input Identitas Pasien Guest */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0E6D3] shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#B8943F] flex items-center gap-2">
              <User className="w-4 h-4" /> Data Diri Pasien (Guest)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D332A]">
                  Nama Lengkap Pasien <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Contoh: Budi Pratama"
                  className="h-11 rounded-xl bg-white border-[#D9D0BC] text-sm text-[#3D332A] focus:border-[#C9A24A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D332A]">
                  Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center w-full rounded-xl border border-[#D9D0BC] bg-white focus-within:border-[#C9A24A] focus-within:ring-1 focus-within:ring-[#C9A24A] overflow-hidden h-11 shadow-2xs">
                  <div className="flex items-center gap-1.5 px-3.5 h-full bg-[#FAF5EA] border-r border-[#EADBBD] text-[#8C6B1C] font-bold text-xs select-none shrink-0">
                    <span className="text-sm leading-none">🇮🇩</span>
                    <span>+62</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={displayPhoneWithoutPrefix(patientPhone)}
                    onChange={(e) => setPatientPhone(handlePhoneChange(e.target.value))}
                    placeholder="81234567890"
                    className="w-full h-full px-3 text-sm font-semibold text-[#3D332A] bg-transparent outline-none placeholder:text-[#8A7B6B]"
                  />
                </div>
                <p className="text-[10px] text-[#8A7B6B]">Tiket booking dan konfirmasi dokter akan dikirim ke nomor ini.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D332A]">Email (Opsional)</label>
              <Input
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="nama@email.com"
                className="h-11 rounded-xl bg-white border-[#D9D0BC] text-sm text-[#3D332A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D332A]">Keluhan / Catatan</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ceritakan keluhan gigi Anda (contoh: gigi bungsu ngilu saat mengunyah)..."
                rows={3}
                className="w-full bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
              />
            </div>

            {/* Verifikasi Persetujuan */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-[#3D332A] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8C6B1C]" />
                <span>Verifikasi Persetujuan</span>
              </h3>

              {/* Dokumen 1: Syarat & Ketentuan Layanan Pasien */}
              <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${agreeTerms ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"}`}>
                      {agreeTerms ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "1"}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#2C2416]">
                        Syarat & Ketentuan Layanan Pasien
                      </p>
                      <p className="text-[11px] text-[#7C7365]">
                        {agreeTerms ? "✓ Telah disetujui secara digital" : "Wajib dibaca dan disetujui"}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTermsModal(true)}
                    className="h-8 px-3.5 rounded-xl border-[#8C6B1C] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{agreeTerms ? "Lihat Dokumen S&K" : "Buka & Setujui S&K"}</span>
                  </Button>
                </div>
              </div>

              {/* Dokumen 2: Surat Pernyataan & Persetujuan Pasien (Informed Consent) */}
              <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${signatureData ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"}`}>
                      {signatureData ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "2"}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#2C2416]">
                        Surat Pernyataan & Persetujuan Pasien (Informed Consent)
                      </p>
                      <p className="text-[11px] text-[#7C7365]">
                        {signatureData ? `✓ Ditandatangani oleh ${patientName || "Pasien"}` : "Wajib dibubuhkan tanda tangan digital"}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setShowConsentPdfModal(true)}
                    className={`h-8 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                      signatureData
                        ? "bg-white border border-[#8C6B1C] text-[#8C6B1C] hover:bg-[#FAF5EA]"
                        : "bg-[#8C6B1C] hover:bg-[#735614] text-white"
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{signatureData ? "Lihat Surat Persetujuan" : "Buka & Tandatangani"}</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#F5ECE0]">
              <Button
                onClick={() => setCurrentStep("jadwal")}
                variant="outline"
                className="rounded-xl border-[#E8DFC8] text-xs font-semibold px-5 py-2.5 h-auto flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </Button>
              <Button
                onClick={handleGuestSubmit}
                disabled={!agreeTerms || !signatureData || !patientName.trim() || !patientPhone.trim() || isSubmitting}
                className="bg-[#8C6B1C] hover:bg-[#735614] text-white rounded-xl px-8 py-3 text-sm font-bold flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Memproses Reservasi..." : "Konfirmasi & Buat Janji Temu"}
              </Button>
            </div>
          </div>
        </div>
      )}
      </PageTransition>

      {/* Signature Modal */}
      {showSignatureModal && (
        <DigitalSignatureModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onSaveSignature={(data) => {
            setSignatureData(data);
          }}
          patientName={patientName || "Pasien Guest"}
        />
      )}

      {/* Consent PDF Modal (Tanda Tangan Digital Saja) */}
      <ReservationConsentPdfModal
        isOpen={showConsentPdfModal}
        onClose={() => setShowConsentPdfModal(false)}
        bookingCode="DRAFT-GUEST"
        patientName={patientName || "Pasien Tamu"}
        patientPhone={patientPhone || "-"}
        patientEmail={patientEmail || ""}
        isGuest={true}
        serviceName={selectedService?.name || "Layanan Gigi"}
        doctorName={selectedDoctor?.name || "Dokter Gigi"}
        dateStr={selectedDate || "-"}
        timeStr={`${selectedTimeSlot}`}
        signatureData={signatureData}
        acceptedAt={new Date().toISOString()}
        onSaveSignature={(sig) => {
          setSignatureData(sig);
        }}
      />

      {/* Terms Modal (Ceklis Persetujuan Saja) */}
      {showTermsModal && (
        <TermsPdfModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          initialName={patientName}
          initialPhone={patientPhone}
          initialEmail={patientEmail}
          isAgreed={agreeTerms}
          onAccept={(name) => {
            setAgreeTerms(true);
            if (name) setPatientName(name);
          }}
        />
      )}

      {/* Success Modal for Guest */}
      {activeTicket &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 border border-[#E8DFC8] shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Reservasi Berhasil Diajukan
                </span>
                <h3 className="text-xl font-bold text-[#3D332A] mt-2">Tiket Janji Temu #{activeTicket.code}</h3>
                <p className="text-xs text-[#8A7B6B] mt-1">
                  Halo <strong>{activeTicket.patientName}</strong>, data janji temu Anda telah masuk ke sistem kami.
                </p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DFC8] text-left space-y-2 text-xs text-[#3D332A]">
                <p><strong>Layanan:</strong> {activeTicket.serviceName}</p>
                <p><strong>Dokter:</strong> {activeTicket.doctorName}</p>
                <p><strong>Waktu:</strong> {activeTicket.date} • {activeTicket.time} WIB</p>
                <p><strong>Lokasi:</strong> {activeTicket.locationName}</p>
              </div>

              {/* Registration Promo for Guest */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 text-left">
                <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Ingin Menyimpan Riwayat & Rekam Medis?
                </p>
                <p className="text-[11px] text-amber-800 mt-1">
                  Daftarkan akun pasien untuk melacak riwayat konsultasi, klaim poin reward, dan kemudahan booking selanjutnya.
                </p>
                <Link
                  to="/login?mode=register"
                  className="mt-3 inline-block w-full py-2 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white text-center text-xs font-bold rounded-xl shadow-xs hover:opacity-90"
                >
                  Daftar Akun Pasien (Gratis)
                </Link>
              </div>

              <Button
                onClick={() => {
                  setActiveTicket(null);
                  setCurrentStep("layanan");
                }}
                variant="outline"
                className="w-full rounded-xl text-xs font-semibold py-2.5 h-auto border-[#E8DFC8] text-[#4A3F35]"
              >
                Tutup
              </Button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
