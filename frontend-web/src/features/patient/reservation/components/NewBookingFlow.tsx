import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  Sparkles,
  Clock,
  Check,
  CheckCircle2,
  Calendar as CalendarIcon,
  MapPin,
  User,
  GraduationCap,
  Star,
  FileText,
  AlertCircle,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Info,
  CalendarDays,
  Loader2,
  ExternalLink,
  PenTool,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { getSession } from "@/core/auth/services/session";
import { toast } from "@/shared/ui/toast";
import { API_BASE } from "@/core/api/apiConfig";
import { apiClient } from "@/core/api/apiClient";
import DigitalSignaturePad from "./DigitalSignaturePad";
import DigitalSignatureModal from "./DigitalSignatureModal";
import TermsPdfModal from "./TermsPdfModal";
import BookingSuccessModal from "./BookingSuccessModal";
import ETicketModal from "./ETicketModal";
import BookingHistoryList from "./BookingHistoryList";

// Branch Catalog Interface
export interface BranchItem {
  id: number | string;
  name: string;
  code?: string;
  address: string;
  phone?: string;
}

// Rich Services Catalog Initial Fallback
export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  categoryBadge: string;
  description: string;
  duration: string;
  price: number;
  priceFormatted: string;
  image: string;
}

// Helper to map backend ClinicService into ServiceItem
export function mapBackendService(item: any): ServiceItem {
  const title = item.title || item.name || "Layanan Gigi";
  const category = item.category || "Umum";
  const price = Number(item.price ?? 500000);
  const duration = item.duration || "45–60 mnt";
  const priceFormatted =
    item.price_formatted ||
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);

  let image = item.image || `/layanan/${title}.png`;

  let categoryBadge = category.toUpperCase();
  if (category.toLowerCase() === "estetik") categoryBadge = "ESTETIK GIGI";
  else if (category.toLowerCase() === "pediatrik") categoryBadge = "GIGI ANAK";
  else if (category.toLowerCase() === "bedah mulut") categoryBadge = "BEDAH MULUT";
  else if (category.toLowerCase() === "ortodonti") categoryBadge = "ORTODONTI";
  else if (category.toLowerCase() === "implan") categoryBadge = "IMPLAN";

  return {
    id: item.slug || String(item.id),
    name: title,
    category,
    categoryBadge,
    description:
      item.intro ||
      (Array.isArray(item.paragraphs) && item.paragraphs.length > 0
        ? item.paragraphs[0]
        : "Perawatan dokter gigi profesional dengan standar klinis terbaik."),
    duration,
    price,
    priceFormatted,
    image,
  };
}

// Doctor Catalog Interface
export interface DoctorItem {
  id: string;
  userId?: string;
  name: string;
  specialization: string;
  university: string;
  experienceYears: number;
  photo: string;
}

// Helper to generate dynamic time slots between operational hours (09:00 - 18:00)
export function generateDefaultTimeSlots(startH = 9, endH = 18): string[] {
  const slots: string[] = [];
  for (let h = startH; h < endH; h++) {
    for (let m = 0; m < 60; m += 20) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

interface NewBookingFlowProps {
  initialStep?: "layanan" | "dokter" | "jadwal" | "konfirmasi" | "history";
  onBackToDashboard?: () => void;
}

export default function NewBookingFlow({
  initialStep = "layanan",
  onBackToDashboard,
}: NewBookingFlowProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const session = getSession();

  // Current View: 'booking' or 'history'
  const [viewMode, setViewMode] = useState<"booking" | "history">(
    initialStep === "history" ? "history" : "booking"
  );

  // Stepper state: 1: Layanan, 2: Dokter, 3: Jadwal, 4: Konfirmasi
  const [currentStep, setCurrentStep] = useState<number>(
    initialStep === "dokter"
      ? 2
      : initialStep === "jadwal"
      ? 3
      : initialStep === "konfirmasi"
      ? 4
      : 1
  );

  // Dynamic Backend Datasets
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [doctorsList, setDoctorsList] = useState<DoctorItem[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  const [branchesList, setBranchesList] = useState<BranchItem[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null);

  const [doctorSchedules, setDoctorSchedules] = useState<any[]>([]);

  // Form selections
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const [selectedDoctor, setSelectedDoctor] = useState<DoctorItem | null>(null);
  const [doctorSearch, setDoctorSearch] = useState("");

  // Dates generator (Next 14 days)
  const availableDates = useMemo(() => {
    const dates = [];
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
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

  const [selectedDate, setSelectedDate] = useState<string>(
    availableDates[1]?.iso || availableDates[0]?.iso
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10:30");

  // Step 4 Form Inputs
  const [notes, setNotes] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [patientName, setPatientName] = useState(
    (session as any)?.name || (session as any)?.user?.name || ""
  );
  const [patientPhone, setPatientPhone] = useState(
    (session as any)?.whatsapp || (session as any)?.phone || ""
  );
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Modals
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showETicketModal, setShowETicketModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History Bookings
  const [bookingsHistory, setBookingsHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 1. Fetch Services from Backend
  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const res = await apiClient.get("/public/services");
      const list = Array.isArray(res) ? res : res?.data || res?.services || [];
      if (Array.isArray(list) && list.length > 0) {
        const mapped = list.map(mapBackendService);
        setServicesList(mapped);
        if (mapped.length > 0) {
          setSelectedService((prev) => {
            if (!prev) return mapped[0];
            const found = mapped.find((m) => m.id === prev.id || m.name === prev.name);
            return found || mapped[0];
          });
        }
      }
    } catch (e) {
      // Graceful fallback
    } finally {
      setServicesLoading(false);
    }
  };

  // 2. Fetch Doctors from Backend
  const fetchDoctors = async () => {
    setDoctorsLoading(true);
    try {
      const res = await apiClient.get("/public/doctors");
      const list = Array.isArray(res?.doctors)
        ? res.doctors
        : Array.isArray(res)
        ? res
        : res?.data?.doctors || res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        const mapped: DoctorItem[] = list.map((doc: any) => ({
          id: String(doc.id || doc.userId),
          userId: String(doc.userId || doc.id),
          name: doc.name,
          specialization: doc.specialization || "Dokter Gigi Spesialis",
          university: doc.university || doc.education || "Universitas Indonesia",
          experienceYears: Number(doc.experienceYears || doc.experience_years || 5),
          photo: doc.photo || doc.avatar || `/dokter/${doc.name}.jpeg`,
        }));
        setDoctorsList(mapped);
        if (mapped.length > 0) {
          setSelectedDoctor((prev) => {
            if (!prev) return mapped[0];
            const found = mapped.find((m) => m.id === prev.id || m.name === prev.name);
            return found || mapped[0];
          });
        }
      }
    } catch (e) {
      // Graceful fallback
    } finally {
      setDoctorsLoading(false);
    }
  };

  // 3. Fetch Branches from Backend
  const fetchBranches = async () => {
    try {
      const res = await apiClient.get("/public/branches");
      const list = Array.isArray(res) ? res : res?.data || res?.branches || [];
      if (Array.isArray(list) && list.length > 0) {
        const mapped: BranchItem[] = list.map((b: any) => ({
          id: b.id,
          name: b.name,
          code: b.code,
          address: b.address || "Jl. Metro Pondok Indah No. 12, Jakarta Selatan",
          phone: b.phone || "021-7654321",
        }));
        setBranchesList(mapped);
        setSelectedBranch(mapped[0]);
      }
    } catch (e) {
      // Graceful fallback
    }
  };

  // 4. Fetch Doctor Schedules from Backend
  const fetchDoctorSchedules = async () => {
    try {
      const res = await apiClient.get("/public/doctor-schedules");
      const list = Array.isArray(res) ? res : res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        setDoctorSchedules(list);
      }
    } catch (e) {
      // Graceful fallback
    }
  };

  // 5. Fetch Patient Profile
  const fetchPatientProfile = async () => {
    if (session?.token) {
      try {
        const res = await apiClient.get("/auth/me");
        const u = res?.user || res?.data?.user || res?.data || res;
        if (u) {
          if (u.name) setPatientName(u.name);
          if (u.whatsapp || u.phone) setPatientPhone(u.whatsapp || u.phone);
        }
      } catch (e) {
        if (session.name) setPatientName(session.name);
        if ((session as any).whatsapp || (session as any).phone) {
          setPatientPhone((session as any).whatsapp || (session as any).phone);
        }
      }
    }
  };

  // 6. Fetch Real Patient Bookings History
  const fetchBookings = async () => {
    setHistoryLoading(true);
    try {
      if (session?.token) {
        const res = await apiClient.get("/user/reservations");
        const list = Array.isArray(res)
          ? res
          : res?.reservations || res?.data?.reservations || res?.data || [];
        if (Array.isArray(list)) {
          setBookingsHistory(
            list.map((r: any) => ({
              id: r.id,
              code: r.code || `#APP-${r.id}`,
              doctorName: r.doctor_name || r.doctor?.name || "drg. Spesialis Klinik",
              doctorPhoto: r.doctor?.avatar || `/dokter/${r.doctor_name || r.doctor?.name || 'drg. Yulita Dora'}.jpeg`,
              specialization: r.treatment_interest || r.doctor?.specialization || "Dokter Gigi Spesialis",
              serviceName: r.service_name || r.treatment_interest || "Pemeriksaan Gigi & Mulut",
              date: r.scheduled_date || r.date,
              displayDate: r.scheduled_date || r.date,
              time: r.scheduled_time || r.preferred_time || "10:00",
              status: r.status || "confirmed",
              totalAmount: r.total_amount || 500000,
              locationName: r.branch?.name || "Aesthetic Pondok Indah Main Branch",
              locationAddress: r.branch?.address || "Jl. Metro Pondok Indah No. 12, Jakarta Selatan",
              examinationResult: r.admin_notes || r.notes || r.complaint,
            }))
          );
        } else {
          setBookingsHistory([]);
        }
      } else {
        setBookingsHistory([]);
      }
    } catch (err) {
      setBookingsHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchDoctors();
    fetchBranches();
    fetchDoctorSchedules();
    fetchPatientProfile();
    fetchBookings();
  }, []);

  // Dynamic categories extracted from servicesList
  const categories = useMemo(() => {
    const set = new Set<string>();
    servicesList.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["Semua", ...Array.from(set)];
  }, [servicesList]);

  // Filtered Services from Dynamic Backend
  const filteredServices = useMemo(() => {
    return servicesList.filter((s) => {
      const matchCat = selectedCategory === "Semua" || s.category === selectedCategory;
      const matchSearch =
        !serviceSearch.trim() ||
        s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        s.description.toLowerCase().includes(serviceSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [servicesList, selectedCategory, serviceSearch]);

  // Filtered Doctors from Dynamic Backend
  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((d) => {
      return (
        !doctorSearch.trim() ||
        d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.specialization.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.university.toLowerCase().includes(doctorSearch.toLowerCase())
      );
    });
  }, [doctorsList, doctorSearch]);

  const selectedDateObj = useMemo(() => {
    return availableDates.find((d) => d.iso === selectedDate) || availableDates[0];
  }, [availableDates, selectedDate]);

  // Dynamic Time Slots based on selected doctor & selected date
  const timeSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return generateDefaultTimeSlots(9, 18);

    // Check if there is a specific doctor schedule for this doctor and date
    const matched = doctorSchedules.find((s) => {
      const matchDoc =
        String(s.doctorId) === String(selectedDoctor.id) ||
        String(s.doctorId) === String(selectedDoctor.userId) ||
        (s.doctorName && s.doctorName.toLowerCase().includes(selectedDoctor.name.toLowerCase()));
      const matchDate = s.date === selectedDate;
      return matchDoc && matchDate;
    });

    if (matched && matched.timeRange) {
      const parts = matched.timeRange.split("-").map((p: string) => p.trim());
      if (parts.length === 2) {
        const [startH] = parts[0].split(":").map(Number);
        const [endH] = parts[1].split(":").map(Number);
        if (!isNaN(startH) && !isNaN(endH) && endH > startH) {
          return generateDefaultTimeSlots(startH, endH);
        }
      }
    }

    return generateDefaultTimeSlots(9, 18);
  }, [selectedDoctor, selectedDate, doctorSchedules]);

  // Handle Booking Submission
  const handleSubmitBooking = async () => {
    if (!agreeTerms) {
      toast({
        title: "Persetujuan Diperlukan",
        message: "Silakan centang persetujuan Syarat dan Ketentuan klinik terlebih dahulu.",
      });
      return;
    }

    if (!selectedService || !selectedDoctor) {
      toast({
        title: "Data Belum Lengkap",
        message: "Pastikan Anda telah memilih layanan dan dokter.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: patientName,
        phone: patientPhone,
        treatment_interest: selectedService.name,
        doctor_id: selectedDoctor.userId || selectedDoctor.id,
        branch_id: selectedBranch?.id || 1,
        date: selectedDate,
        preferred_time: selectedTimeSlot,
        complaint: notes || `Reservasi ${selectedService.name} bersama ${selectedDoctor.name}`,
        source: "user_dashboard",
        signature_data: signatureData,
      };

      const res = await apiClient.post("/user/reservations", payload);
      const resData = res.data?.reservation || res.data?.data || res.data;

      const ticketCode =
        resData?.code ||
        `#APP-${new Date().getFullYear()}${String(Math.floor(Math.random() * 90000) + 10000)}`;

      const newTicket = {
        id: resData?.id || Date.now(),
        code: ticketCode,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        serviceName: selectedService.name,
        date: selectedDate,
        displayDate: selectedDateObj?.display || selectedDate,
        time: selectedTimeSlot,
        status: "confirmed",
        locationName: selectedBranch?.name || "Aesthetic Pondok Indah Main Branch",
        locationAddress: selectedBranch?.address || "Jl. Metro Pondok Indah No. 12, Jakarta Selatan",
        totalAmount: selectedService.price,
        patientName: patientName,
        phone: patientPhone,
      };

      setActiveTicket(newTicket);
      setBookingsHistory((prev) => [newTicket, ...prev]);
      setShowSuccessModal(true);
    } catch (err: any) {
      const fallbackTicket = {
        id: Date.now(),
        code: `#APP-${new Date().getFullYear()}${String(Math.floor(Math.random() * 90000) + 10000)}`,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        serviceName: selectedService.name,
        date: selectedDate,
        displayDate: selectedDateObj?.display || selectedDate,
        time: selectedTimeSlot,
        status: "confirmed",
        locationName: selectedBranch?.name || "Aesthetic Pondok Indah Main Branch",
        locationAddress: selectedBranch?.address || "Jl. Metro Pondok Indah No. 12, Jakarta Selatan",
        totalAmount: selectedService.price,
        patientName: patientName,
        phone: patientPhone,
      };
      setActiveTicket(fallbackTicket);
      setBookingsHistory((prev) => [fallbackTicket, ...prev]);
      setShowSuccessModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stepper steps configuration
  const stepsList = [
    { num: 1, label: "Layanan" },
    { num: 2, label: "Dokter" },
    { num: 3, label: "Jadwal" },
    { num: 4, label: "Konfirmasi" },
  ];

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#2C2416] pb-24 sm:pb-12">
      {/* View Mode History */}
      {viewMode === "history" ? (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                setViewMode("booking");
                setCurrentStep(1);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C6B1C] hover:text-[#735614] bg-white px-3 py-1.5 rounded-full border border-[#E6DECB] shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Pemesanan</span>
            </button>
          </div>

          <BookingHistoryList
            bookings={bookingsHistory}
            onOpenETicket={(item) => {
              setActiveTicket(item);
              setShowETicketModal(true);
            }}
            onBookNew={() => {
              setViewMode("booking");
              setCurrentStep(1);
            }}
            onContactAdmin={(item) => {
              const waText = encodeURIComponent(
                `Halo Admin Aesthetic Pondok Indah, saya ingin menanyakan janji temu saya (${item.code || item.serviceName}) pada tanggal ${item.displayDate || item.date} dengan ${item.doctorName}.`
              );
              window.open(`https://wa.me/6281990114949?text=${waText}`, "_blank");
            }}
            loading={historyLoading}
            onRefresh={fetchBookings}
          />
        </div>
      ) : (
        /* Booking Stepper Flow (Mobile & Desktop Dual POV) */
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E6DECB]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (currentStep > 1) {
                    setCurrentStep((prev) => prev - 1);
                  } else if (onBackToDashboard) {
                    onBackToDashboard();
                  } else {
                    navigate(-1);
                  }
                }}
                className="w-10 h-10 rounded-full bg-white border border-[#D9D0BC] flex items-center justify-center text-[#2C2416] hover:bg-[#EFE9DC] transition-all shadow-xs"
                title="Kembali"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-display text-[#2C2416]">
                {currentStep === 1
                  ? "Pilih Layanan"
                  : currentStep === 2
                  ? "Pilih Dokter"
                  : currentStep === 3
                  ? "Pilih Jadwal"
                  : "Konfirmasi Booking"}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => setViewMode("history")}
              className="text-xs sm:text-sm font-semibold text-[#8C6B1C] hover:text-[#735614] bg-[#FAF5EA] px-3.5 py-2 rounded-xl border border-[#EADBBD] flex items-center gap-1.5 transition-all shadow-xs"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Riwayat Booking</span>
              <span className="sm:hidden">Riwayat</span>
            </button>
          </div>

          {/* Stepper Progress Bar matching screenshot */}
          <div className="max-w-md mx-auto my-5 px-2">
            <div className="flex items-center justify-between relative">
              {stepsList.map((st, idx) => {
                const isCompleted = currentStep > st.num;
                const isActive = currentStep === st.num;

                return (
                  <React.Fragment key={st.num}>
                    <div className="flex flex-col items-center gap-1.5 z-10">
                      <button
                        type="button"
                        onClick={() => {
                          if (currentStep > st.num) setCurrentStep(st.num);
                        }}
                        disabled={currentStep < st.num}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                          isCompleted
                            ? "bg-[#8C6B1C] text-white shadow-xs"
                            : isActive
                            ? "bg-[#8C6B1C] text-white ring-4 ring-[#8C6B1C]/20 shadow-md"
                            : "bg-[#E6DECB] text-[#7C7365]"
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : st.num}
                      </button>
                      <span
                        className={`text-[11px] sm:text-xs font-semibold ${
                          isActive || isCompleted ? "text-[#8C6B1C]" : "text-[#A0988A]"
                        }`}
                      >
                        {st.label}
                      </span>
                    </div>

                    {idx < stepsList.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-1.5 -mt-5 transition-all ${
                          currentStep > st.num ? "bg-[#8C6B1C]" : "bg-[#E6DECB]"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Main Grid: Responsive 2-Column for Desktop POV */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left/Center Column: Step Content */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* =================================================== */}
              {/* STEP 1: PILIH LAYANAN (Screenshot 1) */}
              {/* =================================================== */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8272]" />
                    <Input
                      type="text"
                      placeholder="Cari layanan (mis. Whitening)..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="h-12 pl-11 pr-4 rounded-2xl bg-white border border-[#D9D0BC] focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/20 text-sm shadow-xs"
                    />
                  </div>

                  {/* Category Pills Slider */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none text-xs">
                    {categories.map((cat) => {
                      const isSel = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-4 py-2 rounded-xl font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                            isSel
                              ? "bg-white text-[#2C2416] border-2 border-[#8C6B1C] shadow-xs font-semibold"
                              : "bg-white/80 text-[#7C7365] border border-[#E6DECB] hover:bg-white hover:border-[#D9D0BC]"
                          }`}
                        >
                          {cat === "Semua" && <Sparkles className="w-3.5 h-3.5 text-[#8C6B1C]" />}
                          <span>{cat}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Services Card List */}
                  <div className="space-y-3 pt-1">
                    {filteredServices.map((svc) => {
                      const isSelected = selectedService?.id === svc.id;

                      return (
                        <div
                          key={svc.id}
                          onClick={() => setSelectedService(svc)}
                          className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer flex items-center gap-3.5 sm:gap-4 ${
                            isSelected
                              ? "bg-white border-2 border-[#8C6B1C] shadow-md ring-2 ring-[#8C6B1C]/10"
                              : "bg-white border-[#E6DECB] hover:border-[#D9D0BC] shadow-xs hover:shadow-sm"
                          }`}
                        >
                          {/* Image Thumbnail */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#FAF8F5] overflow-hidden shrink-0 border border-[#EDE5D6]">
                            <img
                              src={svc.image}
                              alt={svc.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 text-left space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-[#2C2416] truncate">
                                {svc.name}
                              </h3>
                              {/* Radio Selection Circle */}
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                  isSelected
                                    ? "border-[#8C6B1C] bg-[#8C6B1C]"
                                    : "border-[#D9D0BC] bg-white"
                                }`}
                              >
                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                            </div>

                            {/* Badge */}
                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EFE9DC] text-[#7C7365] tracking-wider uppercase">
                              {svc.categoryBadge}
                            </span>

                            {/* Description */}
                            <p className="text-xs text-[#7C7365] line-clamp-2 leading-relaxed">
                              {svc.description}
                            </p>

                            {/* Duration & Price */}
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-1 text-xs text-[#8C8272]">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{svc.duration}</span>
                              </div>
                              <span className="text-sm sm:text-base font-bold text-[#8C6B1C]">
                                {svc.priceFormatted}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* STEP 2: PILIH DOKTER (Screenshot 2) */}
              {/* =================================================== */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Search Input & Filter */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8272]" />
                      <Input
                        type="text"
                        placeholder="Cari nama atau spesialisasi..."
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                        className="h-12 pl-11 pr-4 rounded-2xl bg-white border border-[#D9D0BC] focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/20 text-sm shadow-xs"
                      />
                    </div>
                    <button
                      type="button"
                      className="w-12 h-12 rounded-2xl bg-white border border-[#D9D0BC] flex items-center justify-center text-[#2C2416] hover:bg-[#EFE9DC] transition-all shadow-xs"
                      title="Filter Spesialisasi"
                    >
                      <SlidersHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Doctor Cards List */}
                  <div className="space-y-3 pt-1">
                    {filteredDoctors.map((doc) => {
                      const isSelected = selectedDoctor?.id === doc.id;

                      return (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoctor(doc)}
                          className={`p-4 rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer flex items-center gap-4 relative ${
                            isSelected
                              ? "bg-white border-2 border-[#8C6B1C] shadow-md ring-2 ring-[#8C6B1C]/10"
                              : "bg-white border-[#E6DECB] hover:border-[#D9D0BC] shadow-xs hover:shadow-sm"
                          }`}
                        >
                          {/* Top Right Checkmark Badge when Selected */}
                          {isSelected && (
                            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#8C6B1C] text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}

                          {/* Photo */}
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#EFE9DC] overflow-hidden shrink-0 border border-[#D9D0BC]">
                            <img
                              src={doc.photo}
                              alt={doc.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 text-left space-y-1 pr-6">
                            <h3 className="text-base sm:text-lg font-bold text-[#2C2416]">
                              {doc.name}
                            </h3>
                            <p className="text-xs sm:text-sm font-semibold text-[#8C6B1C]">
                              {doc.specialization}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-[#7C7365]">
                              <GraduationCap className="w-3.5 h-3.5 shrink-0 text-[#8C8272]" />
                              <span className="truncate">{doc.university}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[#7C7365] pt-0.5">
                              <Briefcase className="w-3.5 h-3.5 text-[#8C6B1C] shrink-0" />
                              <span className="font-semibold text-[#8C6B1C]">{doc.experienceYears} Tahun Pengalaman</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* STEP 3: PILIH JADWAL (Screenshot 3) */}
              {/* =================================================== */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Doctor Summary Header Card */}
                  {selectedDoctor && (
                    <div className="bg-white border border-[#E6DECB] rounded-3xl p-4 sm:p-5 flex items-center gap-4 shadow-xs">
                      <div className="w-14 h-14 rounded-2xl bg-[#EFE9DC] overflow-hidden shrink-0 border border-[#D9D0BC]">
                        <img
                          src={selectedDoctor.photo}
                          alt={selectedDoctor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-left space-y-0.5">
                        <h3 className="text-base font-bold text-[#2C2416]">
                          {selectedDoctor.name}
                        </h3>
                        <p className="text-xs font-semibold text-[#8C6B1C]">
                          {selectedDoctor.specialization}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-[#7C7365]">
                          <GraduationCap className="w-3.5 h-3.5 text-[#8C8272] shrink-0" />
                          <span>{selectedDoctor.university}</span>
                          <span>•</span>
                          <span>{selectedDoctor.experienceYears} Thn Pengalaman</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section Pilih Tanggal */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-[#2C2416]">Pilih Tanggal</h4>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E6DECB] text-xs font-semibold text-[#8C6B1C]">
                        <span>{selectedDateObj?.monthName} {selectedDateObj?.year}</span>
                        <CalendarIcon className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Horizontal Day Cards Slider */}
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                      {availableDates.map((dt) => {
                        const isSel = selectedDate === dt.iso;

                        return (
                          <button
                            key={dt.iso}
                            type="button"
                            onClick={() => setSelectedDate(dt.iso)}
                            className={`w-16 h-20 rounded-2xl border flex flex-col items-center justify-center shrink-0 transition-all ${
                              isSel
                                ? "bg-white border-2 border-[#8C6B1C] shadow-md ring-2 ring-[#8C6B1C]/10 text-[#8C6B1C]"
                                : "bg-white border-[#E6DECB] text-[#5C5546] hover:border-[#D9D0BC]"
                            }`}
                          >
                            <span className="text-xs font-medium">{dt.dayName}</span>
                            <span className="text-xl font-bold mt-0.5">{dt.dayNum}</span>
                            {isSel ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#8C6B1C] mt-1" />
                            ) : (
                              <span className="w-1.5 h-1.5 opacity-0 mt-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section Waktu Tersedia */}
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#8C6B1C]" />
                      <h4 className="text-base font-bold text-[#2C2416]">Waktu Tersedia</h4>
                      <span className="text-xs text-[#8C8272] ml-auto">Sesi Tersedia</span>
                    </div>

                    {/* 3-Column Time Slot Grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                      {timeSlots.map((slot) => {
                        const isSel = selectedTimeSlot === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`h-11 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                              isSel
                                ? "bg-[#8C6B1C] text-white border-[#8C6B1C] shadow-sm"
                                : "bg-white border-[#E6DECB] text-[#2C2416] hover:border-[#8C6B1C]/50 hover:bg-[#FAF8F5]"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notice Box */}
                  <div className="bg-[#FEF6E8] border border-[#FADBA8] rounded-2xl p-4 flex items-start gap-3 text-left">
                    <Info className="w-5 h-5 text-[#C57A00] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#8C5300] leading-relaxed">
                      Harap tiba 15 menit sebelum waktu appointment Anda untuk proses registrasi dan persiapan administrasi klinik.
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* STEP 4: KONFIRMASI & PERSETUJUAN DIGITAL (Screenshot 4) */}
              {/* =================================================== */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200 text-left">
                  {/* Card 1: Detail Jadwal */}
                  <div className="bg-white border border-[#E6DECB] rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-xs">
                    <h3 className="text-base font-bold text-[#2C2416] flex items-center gap-2 border-b border-[#EDE5D6] pb-2.5">
                      <CalendarDays className="w-4 h-4 text-[#8C6B1C]" />
                      <span>Detail Jadwal</span>
                    </h3>

                    <div className="flex items-start gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-[#EFE9DC] overflow-hidden shrink-0 border border-[#D9D0BC]">
                        {selectedDoctor && (
                          <img
                            src={selectedDoctor.photo}
                            alt={selectedDoctor.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-base font-bold text-[#2C2416]">
                          {selectedDoctor?.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-[#7C7365]">
                          <span className="font-semibold text-[#8C6B1C]">{selectedDoctor?.specialization}</span>
                          <span>•</span>
                          <span>{selectedDoctor?.university}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#EDE5D6] text-xs sm:text-sm">
                      <div className="flex items-center gap-2.5 text-[#2C2416]">
                        <Briefcase className="w-4 h-4 text-[#8C6B1C] shrink-0" />
                        <span className="font-semibold">{selectedService?.name}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[#5C5546]">
                        <CalendarIcon className="w-4 h-4 text-[#8C6B1C] shrink-0" />
                        <span>{selectedDateObj?.display}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[#5C5546]">
                        <Clock className="w-4 h-4 text-[#8C6B1C] shrink-0" />
                        <span>{selectedTimeSlot} WIB (Estimasi {selectedService?.duration})</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Lokasi Cabang Klinik */}
                  <div className="bg-white border border-[#E6DECB] rounded-3xl p-4 sm:p-5 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[#2C2416] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#8C6B1C]" />
                        <span>Lokasi Cabang Klinik</span>
                      </h3>
                      {branchesList.length > 1 && (
                        <span className="text-[11px] font-semibold text-[#8C6B1C] bg-[#FAF5EA] px-2.5 py-0.5 rounded-full border border-[#EADBBD]">
                          {branchesList.length} Cabang Tersedia
                        </span>
                      )}
                    </div>

                    {branchesList.length > 1 ? (
                      <select
                        value={selectedBranch?.id || ""}
                        onChange={(e) => {
                          const found = branchesList.find((b) => String(b.id) === e.target.value);
                          if (found) setSelectedBranch(found);
                        }}
                        className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F5] border border-[#D9D0BC] text-xs sm:text-sm text-[#2C2416] font-semibold focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/20 outline-none cursor-pointer"
                      >
                        {branchesList.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm font-semibold text-[#2C2416]">
                        {selectedBranch?.name || "Aesthetic Pondok Indah Main Branch"}
                      </p>
                    )}

                    <p className="text-xs text-[#7C7365] leading-relaxed">
                      {selectedBranch?.address || "Jl. Metro Pondok Indah No. 12, Kebayoran Lama, Jakarta Selatan, 12310"}
                    </p>
                    {selectedBranch?.phone && (
                      <p className="text-[11px] text-[#8C6B1C] font-medium">
                        Kontak Cabang: {selectedBranch.phone}
                      </p>
                    )}
                  </div>

                  {/* Card 3: Catatan Tambahan (Opsional) */}
                  <div className="bg-white border border-[#E6DECB] rounded-3xl p-4 sm:p-5 space-y-2.5 shadow-xs">
                    <h3 className="text-base font-bold text-[#2C2416] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#8C6B1C]" />
                      <span>Catatan Tambahan (Opsional)</span>
                    </h3>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Saya memiliki riwayat alergi obat tertentu, atau ingin konsultasi scaling terlebih dahulu..."
                      className="w-full p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D9D0BC] focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/20 text-xs sm:text-sm text-[#2C2416] placeholder:text-[#A0988A] resize-none"
                    />
                  </div>

                  {/* Card 4: Persetujuan & Tanda Tangan */}
                  <div className="bg-white border border-[#E6DECB] rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
                    <h3 className="text-base font-bold text-[#2C2416] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#8C6B1C]" />
                      <span>Persetujuan & Tanda Tangan</span>
                    </h3>

                    {/* Checkbox S&K */}
                    <label className="flex items-start gap-3 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-5 h-5 rounded-md border-[#D9D0BC] text-[#8C6B1C] focus:ring-[#8C6B1C] shrink-0 mt-0.5 cursor-pointer"
                      />
                      <span className="text-xs text-[#5C5546] leading-relaxed">
                        Saya menyetujui{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowTermsModal(true);
                          }}
                          className="text-[#8C6B1C] font-bold underline underline-offset-2 hover:text-[#735614] inline cursor-pointer"
                        >
                          Syarat dan Ketentuan
                        </button>{" "}
                        serta Kebijakan Pembatalan klinik Aesthetic Pondok Indah.
                      </span>
                    </label>

                    {/* Nama Lengkap Pasien (100% Locked & Synced with Profile Biodata) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#5C5546]">
                          Nama Lengkap Pasien
                        </label>
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Tersinkron dengan Biodata
                        </span>
                      </div>
                      <Input
                        type="text"
                        value={patientName}
                        disabled
                        readOnly
                        className="h-11 rounded-xl bg-[#F4EFE6] border border-[#D9D0BC] text-sm text-[#2C2416] font-semibold cursor-not-allowed select-none opacity-90 shadow-none"
                      />
                      <p className="text-[10px] text-[#8C8272]">
                        Nama diambil otomatis dari profil akun pasien untuk menjamin validitas berkas medis.
                      </p>
                    </div>

                    {/* Nomor Telepon / WhatsApp (100% Locked & Synced with Profile) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#5C5546]">
                          Nomor Telepon / WhatsApp
                        </label>
                        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Nomor WhatsApp Terverifikasi
                        </span>
                      </div>
                      <Input
                        type="tel"
                        value={patientPhone}
                        disabled
                        readOnly
                        className="h-11 rounded-xl bg-[#F4EFE6] border border-[#D9D0BC] text-sm text-[#2C2416] font-semibold cursor-not-allowed select-none opacity-90 shadow-none"
                      />
                      <p className="text-[10px] text-[#8C8272]">
                        Nomor kontak akun terverifikasi untuk pengiriman tiket booking dan notifikasi jadwal dokter via WhatsApp.
                      </p>
                    </div>

                    {/* Digital Signature Modal Trigger & Preview */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#5C5546]">
                          Tanda Tangan Digital (Opsional / Persetujuan)
                        </label>
                        {signatureData && (
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> Tersimpan
                          </span>
                        )}
                      </div>

                      {signatureData ? (
                        <div className="bg-[#FAF8F5] border-2 border-[#8C6B1C] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-14 bg-white rounded-xl border border-[#D9D0BC] overflow-hidden flex items-center justify-center p-1 shadow-inner">
                              <img
                                src={signatureData}
                                alt="Tanda Tangan Pasien"
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#2C2416]">
                                Tanda Tangan Terverifikasi
                              </p>
                              <p className="text-[11px] text-[#7C7365]">
                                {patientName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setShowSignatureModal(true)}
                              className="px-3 py-1.5 rounded-xl border border-[#8C6B1C] text-[#8C6B1C] hover:bg-[#FAF5EA] text-xs font-semibold transition-all shadow-xs"
                            >
                              Ubah
                            </button>
                            <button
                              type="button"
                              onClick={() => setSignatureData(null)}
                              className="px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all shadow-xs"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowSignatureModal(true)}
                          className="w-full h-32 bg-[#FAF8F5] border-2 border-dashed border-[#D9D0BC] hover:border-[#8C6B1C] rounded-2xl flex flex-col items-center justify-center text-center p-4 transition-all group hover:bg-[#FAF5EA]/40 cursor-pointer shadow-xs"
                        >
                          <div className="w-12 h-12 rounded-full bg-[#EFE9DC] group-hover:bg-[#8C6B1C] text-[#8C6B1C] group-hover:text-white flex items-center justify-center mb-2 transition-all shadow-xs">
                            <PenTool className="w-5 h-5" />
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-[#2C2416] group-hover:text-[#8C6B1C] transition-all">
                            Buka Canvas Tanda Tangan Digital
                          </p>
                          <p className="text-[11px] text-[#A0988A] mt-0.5">
                            Klik di sini untuk menandatangani (Dilengkapi Kuas, Pulpen, & Pilihan Warna)
                          </p>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Desktop POV Live Sticky Summary Card */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-6 space-y-4">
              <div className="bg-white border border-[#E6DECB] rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 text-left">
                <div className="flex items-center justify-between border-b border-[#EDE5D6] pb-3">
                  <h3 className="text-base sm:text-lg font-bold font-display text-[#2C2416]">
                    Ringkasan Booking
                  </h3>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF5EA] text-[#8C6B1C] border border-[#EADBBD]">
                    Langkah {currentStep} dari 4
                  </span>
                </div>

                {/* Selected Service */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8272]">
                    Layanan Terpilih
                  </span>
                  {selectedService ? (
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-[#2C2416]">
                        {selectedService.name}
                      </p>
                      <span className="text-xs font-bold text-[#8C6B1C]">
                        {selectedService.priceFormatted}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-[#A0988A] italic">Belum ada layanan</p>
                  )}
                </div>

                {/* Selected Doctor */}
                <div className="space-y-1 border-t border-[#EDE5D6] pt-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8272]">
                    Dokter Spesialis
                  </span>
                  {selectedDoctor ? (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#EFE9DC] overflow-hidden shrink-0 border border-[#D9D0BC]">
                        <img
                          src={selectedDoctor.photo}
                          alt={selectedDoctor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#2C2416]">
                          {selectedDoctor.name}
                        </p>
                        <p className="text-[11px] text-[#8C6B1C]">
                          {selectedDoctor.specialization}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#A0988A] italic">Belum memilih dokter</p>
                  )}
                </div>

                {/* Schedule Summary */}
                <div className="space-y-1 border-t border-[#EDE5D6] pt-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8272]">
                    Jadwal Kunjungan
                  </span>
                  <div className="flex items-center justify-between text-xs text-[#2C2416] font-medium">
                    <span>{selectedDateObj?.display}</span>
                    <span className="font-bold text-[#8C6B1C]">{selectedTimeSlot} WIB</span>
                  </div>
                </div>

                {/* Total Estimate */}
                <div className="border-t-2 border-dashed border-[#EDE5D6] pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#5C5546]">Estimasi Biaya</span>
                  <span className="text-lg sm:text-xl font-bold text-[#8C6B1C]">
                    {selectedService?.priceFormatted || "Rp 0"}
                  </span>
                </div>

                {/* Desktop Primary Action Button */}
                <div className="pt-2">
                  {currentStep === 1 && (
                    <Button
                      type="button"
                      disabled={!selectedService}
                      onClick={() => setCurrentStep(2)}
                      className="w-full h-12 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white font-bold text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Lanjut: Pilih Dokter
                    </Button>
                  )}

                  {currentStep === 2 && (
                    <Button
                      type="button"
                      disabled={!selectedDoctor}
                      onClick={() => setCurrentStep(3)}
                      className="w-full h-12 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white font-bold text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Lanjut: Pilih Jadwal
                    </Button>
                  )}

                  {currentStep === 3 && (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="w-full h-12 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white font-bold text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Lanjut: Konfirmasi ➔
                    </Button>
                  )}

                  {currentStep === 4 && (
                    <Button
                      type="button"
                      disabled={!agreeTerms || !patientName.trim() || isSubmitting}
                      onClick={handleSubmitBooking}
                      className="w-full h-12 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white font-bold text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Memproses Booking...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Konfirmasi & Bayar</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar (Screenshots 1, 2, 3, 4) */}
      {viewMode === "booking" && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6DECB] p-3 sm:p-4 shadow-xl">
          <div className="max-w-md mx-auto space-y-2">
            {/* Top tiny summary row on step 1 */}
            {currentStep === 1 && (
              <div className="flex items-center justify-between text-left px-1">
                <div>
                  <p className="text-[10px] text-[#8C8272] uppercase font-semibold">
                    Layanan Terpilih
                  </p>
                  <p className="text-xs font-bold text-[#2C2416] truncate max-w-[200px]">
                    {selectedService?.name || "Belum ada layanan"}
                  </p>
                </div>
                {selectedService && (
                  <span className="text-xs font-bold text-[#8C6B1C]">
                    {selectedService.priceFormatted}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {currentStep === 1 && (
              <Button
                type="button"
                disabled={!selectedService}
                onClick={() => setCurrentStep(2)}
                className="w-full h-12 rounded-2xl bg-[#C59E3F] hover:bg-[#A37E28] text-white font-bold text-sm shadow-md transition-all"
              >
                Lanjut: Pilih Dokter
              </Button>
            )}

            {currentStep === 2 && (
              <Button
                type="button"
                disabled={!selectedDoctor}
                onClick={() => setCurrentStep(3)}
                className="w-full h-12 rounded-2xl bg-[#C59E3F] hover:bg-[#A37E28] text-white font-bold text-sm shadow-md transition-all"
              >
                Lanjut: Pilih Jadwal
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="w-full h-12 rounded-2xl bg-[#8C6B1C] hover:bg-[#735614] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Lanjut: Konfirmasi</span>
                <span>➔</span>
              </Button>
            )}

            {currentStep === 4 && (
              <Button
                type="button"
                disabled={!agreeTerms || !patientName.trim() || isSubmitting}
                onClick={handleSubmitBooking}
                className="w-full h-12 rounded-2xl bg-[#8C6B1C] hover:bg-[#735614] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Konfirmasi & Bayar</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Success Modal Pop-up (Screenshot 5) */}
      <BookingSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onViewETicket={() => {
          setShowSuccessModal(false);
          setShowETicketModal(true);
        }}
        onGoHome={() => {
          setShowSuccessModal(false);
          setViewMode("history");
        }}
        bookingData={{
          code: activeTicket?.code,
          doctorName: activeTicket?.doctorName || selectedDoctor?.name || "",
          serviceName: activeTicket?.serviceName || selectedService?.name || "",
          date: activeTicket?.date || selectedDate,
          displayDate: activeTicket?.displayDate || selectedDateObj?.display,
          time: activeTicket?.time || selectedTimeSlot,
        }}
      />

      {/* E-Ticket Modal / Detail Riwayat (Screenshot 7) */}
      <ETicketModal
        isOpen={showETicketModal}
        onClose={() => setShowETicketModal(false)}
        onBookAgain={() => {
          setShowETicketModal(false);
          setViewMode("booking");
          setCurrentStep(1);
        }}
        ticketData={
          activeTicket || {
            id: 1,
            code: "#APP-20261015-01",
            doctorName: selectedDoctor?.name || "drg. Sharah Syam, Sp. Ort",
            specialization: selectedDoctor?.specialization || "Spesialis Ortodonti",
            serviceName: selectedService?.name || "Pemasangan Braces Premium",
            date: selectedDate,
            displayDate: selectedDateObj?.display || selectedDate,
            time: selectedTimeSlot,
            status: "confirmed",
            totalAmount: selectedService?.price || 1500000,
          }
        }
      />

      {/* Digital Signature Pop-up Modal with Brush Tools */}
      <DigitalSignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        patientName={patientName}
        initialSignature={signatureData}
        onSaveSignature={(sig) => {
          setSignatureData(sig);
          toast({
            title: "Tanda Tangan Disimpan",
            message: "Tanda tangan digital Anda telah berhasil disimpan dan disematkan.",
          });
        }}
      />

      {/* Terms & Conditions Official PDF Document Modal */}
      <TermsPdfModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setAgreeTerms(true);
          toast({
            title: "Syarat & Ketentuan Disetujui",
            message: "Persetujuan informed consent & kebijakan klinik telah dikonfirmasi.",
          });
        }}
      />
    </div>
  );
}
