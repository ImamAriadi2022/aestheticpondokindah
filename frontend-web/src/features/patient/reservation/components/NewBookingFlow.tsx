import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ArrowLeft,
  Search,
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
  ChevronDown,
  CalendarOff,
  Coins,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { getSession } from "@/core/auth/services/session";
import { toast } from "@/shared/ui/toast";
import { API_BASE } from "@/core/api/apiConfig";
import { apiClient } from "@/core/api/apiClient";
import { triggerPushNotification, subscribeToPushNotifications } from "@/core/services/pushNotificationService";
import { broadcastRealtimeReservationEvent } from "@/core/services/GlobalNotificationManager";
import { useRef } from "react";
import DigitalSignaturePad from "./DigitalSignaturePad";
import DigitalSignatureModal from "./DigitalSignatureModal";
import TermsPdfModal from "./TermsPdfModal";
import { scrollPageToTop } from "@/core/router/ScrollToTop";
import { PageTransition } from "@/core/router/RouteTransition";
import ReservationConsentPdfModal from "@/features/admin/reservation/components/ReservationConsentPdfModal";
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
  specialistNames?: string[];
  specialistLabel?: string;
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

  let image = item.image || `/layanan/${title}.webp`;

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
    specialistNames: Array.isArray(item.specialist_names) ? item.specialist_names : [],
    specialistLabel: item.specialist_label || "",
  };
}


// Rich Default Services Catalog (Ensures 0ms instant display without empty blank states)
export const INITIAL_SERVICES_CATALOG: ServiceItem[] = [
  {
    id: "dental-whitening",
    name: "Dental Whitening",
    category: "Estetik",
    categoryBadge: "ESTETIK GIGI",
    description: "Perawatan pemutihan gigi profesional untuk senyum lebih cerah dan percaya diri.",
    duration: "60–90 mnt",
    price: 1500000,
    priceFormatted: "Rp 1.500.000",
    image: "/layanan/Dental Whitening.webp",
    specialistNames: ["drg. Yulita Dora"],
    specialistLabel: "Aesthetic Dentist"
  },
  {
    id: "scaling-polishing",
    name: "Scaling & Polishing",
    category: "Umum",
    categoryBadge: "PERAWATAN UMUM",
    description: "Pembersihan karang gigi menyeluruh dan pemolesan untuk mencegah masalah gusi.",
    duration: "30–45 mnt",
    price: 450000,
    priceFormatted: "Rp 450.000",
    image: "/layanan/Oral Care.webp",
    specialistNames: ["drg. Eric Sulistio, Sp. Perio"],
    specialistLabel: "Periodontics & Preventive Dentist"
  },
  {
    id: "porcelain-veneers",
    name: "Porcelain Veneers",
    category: "Estetik",
    categoryBadge: "ESTETIK GIGI",
    description: "Lapisan porselen tipis presisi tinggi untuk memperbaiki warna, bentuk, dan susunan gigi.",
    duration: "90 mnt",
    price: 4500000,
    priceFormatted: "Rp 4.500.000",
    image: "/layanan/Veneers.webp",
    specialistNames: ["drg. Melati Putri, Sp. Pros", "drg. Yulita Dora"],
    specialistLabel: "Prosthodontist & Aesthetic Specialist"
  },
  {
    id: "dental-implant",
    name: "Dental Implant",
    category: "Implan",
    categoryBadge: "IMPLAN GIGI",
    description: "Solusi permanen untuk mengganti gigi yang hilang dengan teknologi implan titanium.",
    duration: "120 mnt",
    price: 12000000,
    priceFormatted: "Rp 12.000.000",
    image: "/layanan/Dental Implants.webp",
    specialistNames: ["drg. Yudy Ardila Utomo, Sp.BMM", "drg. Eric Sulistio, Sp. Perio"],
    specialistLabel: "Oral Surgeon & Periodontist"
  },
  {
    id: "root-canal",
    name: "Root Canal Treatment",
    category: "Umum",
    categoryBadge: "PERAWATAN SALURAN AKAR",
    description: "Perawatan saraf gigi terinfeksi untuk menyelamatkan gigi alami tanpa pencabutan.",
    duration: "60–90 mnt",
    price: 2500000,
    priceFormatted: "Rp 2.500.000",
    image: "/layanan/Root Canal Treatments.webp",
    specialistNames: ["drg. Pramodanti Jiwanakusuma, Sp.KG", "drg. Riesta Paluvi, Sp.KG"],
    specialistLabel: "Endodontic Specialist"
  },
  {
    id: "dental-extraction",
    name: "Wisdom Tooth Removal",
    category: "Bedah Mulut",
    categoryBadge: "BEDAH MULUT",
    description: "Pencabutan dan odontektomi gigi bungsu dengan pembiusan lokal yang aman dan minim trauma.",
    duration: "45–60 mnt",
    price: 2000000,
    priceFormatted: "Rp 2.000.000",
    image: "/layanan/Dental Extraction and Wisdom Teeth Removal.webp",
    specialistNames: ["drg. Yudy Ardila Utomo, Sp.BMM"],
    specialistLabel: "Oral & Maxillofacial Surgeon"
  },
  {
    id: "invisalign",
    name: "Invisalign Clear Aligners",
    category: "Ortodonti",
    categoryBadge: "ORTODONTI ESTETIK",
    description: "Perataan gigi transparan tanpa kawat dengan teknologi 3D SmartTrack digital.",
    duration: "45 mnt",
    price: 25000000,
    priceFormatted: "Rp 25.000.000",
    image: "/layanan/Invisalign and Clear Aligners.webp",
    specialistNames: ["drg. Nadia Safira, Sp.Ort"],
    specialistLabel: "Orthodontist Specialist"
  },
  {
    id: "dental-filling",
    name: "Tambal Gigi Komposit Estetik",
    category: "Umum",
    categoryBadge: "PERAWATAN UMUM",
    description: "Penambalan gigi berlubang menggunakan resin komposit sewarna gigi asli.",
    duration: "30–45 mnt",
    price: 600000,
    priceFormatted: "Rp 600.000",
    image: "/layanan/Oral Care.webp",
    specialistNames: ["drg. Achmad Riwandy", "drg. Della Sparringa"],
    specialistLabel: "General Dentist"
  },
  {
    id: "pediatric-cleaning",
    name: "Pemeriksaan & Fluoride Anak",
    category: "Pediatrik",
    categoryBadge: "GIGI ANAK",
    description: "Perawatan pencegahan gigi berlubang dan aplikasi topical fluoride khusus anak.",
    duration: "30 mnt",
    price: 500000,
    priceFormatted: "Rp 500.000",
    image: "/layanan/Pediatric Dentistry.webp",
    specialistNames: ["drg. Anindita Putri, Sp.KGA"],
    specialistLabel: "Pediatric Dentist"
  }
];

export const INITIAL_DOCTORS_CATALOG: DoctorItem[] = [
  {
    id: "3",
    userId: "3",
    name: "drg. Yulita Dora",
    specialization: "Aesthetic & Cosmetic Dentistry",
    university: "Universitas Indonesia",
    experienceYears: 8,
    photo: "/dokter/drg. Yulita Dora.webp"
  },
  {
    id: "4",
    userId: "4",
    name: "drg. Achmad Riwandy",
    specialization: "General Dentistry & Restorative",
    university: "Universitas Gadjah Mada",
    experienceYears: 6,
    photo: "/dokter/drg. Achmad Riwandy.webp"
  },
  {
    id: "5",
    userId: "5",
    name: "drg. Della Sparringa",
    specialization: "General Dentistry & Preventive",
    university: "Universitas Airlangga",
    experienceYears: 5,
    photo: "/dokter/drg. Della Sparringa.webp"
  },
  {
    id: "6",
    userId: "6",
    name: "drg. Eric Sulistio, Sp. Perio",
    specialization: "Spesialis Periodonsia & Implan",
    university: "Universitas Indonesia",
    experienceYears: 11,
    photo: "/dokter/drg. Eric Sulistio, Sp. Perio.webp"
  },
  {
    id: "7",
    userId: "7",
    name: "drg. Melati Putri, Sp. Pros",
    specialization: "Spesialis Prostodonsia & Veneer",
    university: "Universitas Indonesia",
    experienceYears: 10,
    photo: "/dokter/drg. Melati Putri, Sp. Pros.webp"
  },
  {
    id: "8",
    userId: "8",
    name: "drg. Yudy Ardila Utomo, Sp.BMM",
    specialization: "Spesialis Bedah Mulut & Maksilofasial",
    university: "Universitas Padjadjaran",
    experienceYears: 14,
    photo: "/dokter/drg. Yudy Ardila Utomo, Sp.BMM.webp"
  },
  {
    id: "9",
    userId: "9",
    name: "drg. Pramodanti Jiwanakusuma, Sp.KG",
    specialization: "Spesialis Konservasi Gigi & Endodontik",
    university: "Universitas Indonesia",
    experienceYears: 9,
    photo: "/dokter/drg. Pramodanti Jiwanakusuma, Sp.KG.webp"
  }
];

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

// Helper to parse backend time_range string (e.g. "09:00 - 12:00" or "10.00-14.00") into 10-minute slots
export function parseTimeRangeToSlots(timeRange: string, intervalMinutes: number = 10): string[] {
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
}

// Fallback dynamic time slots with 10-minute intervals (e.g. 10:00, 10:10, 10:20, ...)
export function generateDefaultTimeSlots(startH = 10, endH = 20): string[] {
  const slots: string[] = [];
  for (let h = startH; h < endH; h++) {
    for (let m = 0; m < 60; m += 10) {
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
  const [servicesList, setServicesList] = useState<ServiceItem[]>(INITIAL_SERVICES_CATALOG);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [doctorsList, setDoctorsList] = useState<DoctorItem[]>(INITIAL_DOCTORS_CATALOG);
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
  const [showNotes, setShowNotes] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [patientName, setPatientName] = useState(
    (session as any)?.name || (session as any)?.user?.name || ""
  );
  const [patientPhone, setPatientPhone] = useState(
    (session as any)?.whatsapp || (session as any)?.phone || ""
  );
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Point Redemption State
  const [userAvailablePoints, setUserAvailablePoints] = useState<number>(() => {
    return Number((session as any)?.membership_points || 0);
  });
  const [pointConversionRate, setPointConversionRate] = useState<number>(1000);
  const [minRedeemPoints, setMinRedeemPoints] = useState<number>(10);
  const [maxDiscountPercentage, setMaxDiscountPercentage] = useState<number>(100);
  const [usePoints, setUsePoints] = useState<boolean>(false);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  // Dynamic Service Pricing and Point Discount Calculations
  const serviceBasePrice = Number(selectedService?.price || 500000);
  const maxRedeemablePoints = Math.min(
    userAvailablePoints,
    Math.floor(((serviceBasePrice * maxDiscountPercentage) / 100) / pointConversionRate)
  );
  const calculatedDiscount = usePoints
    ? Math.min(pointsToRedeem * pointConversionRate, (serviceBasePrice * maxDiscountPercentage) / 100, serviceBasePrice)
    : 0;
  const finalPrice = Math.max(0, serviceBasePrice - calculatedDiscount);

  // Modals
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showConsentPdfModal, setShowConsentPdfModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showETicketModal, setShowETicketModal] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History Bookings with 0ms Instant Cache Render
  const [bookingsHistory, setBookingsHistory] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("apig_user_cached_bookings");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const hasCachedBookings = bookingsHistory.length > 0;
  const [historyLoading, setHistoryLoading] = useState<boolean>(!hasCachedBookings);

  // Automatically scroll to the very top whenever stepper step or viewMode changes
  useEffect(() => {
    scrollPageToTop();
  }, [currentStep, viewMode]);

  // 1. Fetch Services from Backend
  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      let res = await apiClient.get("/public/services", { skipToast: true });
      let list = Array.isArray(res) ? res : res?.data || res?.services || [];
      if (!Array.isArray(list) || list.length === 0) {
        res = await apiClient.get("/services", { skipToast: true });
        list = Array.isArray(res) ? res : res?.data || res?.services || [];
      }
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
      // Retain INITIAL_SERVICES_CATALOG on network error
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
          photo: doc.photo || doc.avatar || `/dokter/${doc.name}.webp`,
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

  // 3. Fetch Branch from Backend (Only Aesthetic Pondok Indah)
  const fetchBranches = async () => {
    try {
      const res = await apiClient.get("/public/branches");
      const list = Array.isArray(res) ? res : res?.data || res?.branches || [];
      if (Array.isArray(list) && list.length > 0) {
        const mapped: BranchItem[] = list.map((b: any) => ({
          id: b.id,
          name: b.name || "Aesthetic Pondok Indah",
          code: b.code || "API-PI",
          address: b.address || "Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310",
          phone: b.phone || "(021) 765-4321",
        }));
        setBranchesList(mapped);
        setSelectedBranch(mapped[0]);
      } else {
        const fallbackBranch: BranchItem = {
          id: 1,
          name: "Aesthetic Pondok Indah",
          code: "API-PI",
          address: "Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310",
          phone: "(021) 765-4321",
        };
        setBranchesList([fallbackBranch]);
        setSelectedBranch(fallbackBranch);
      }
    } catch (e) {
      const fallbackBranch: BranchItem = {
        id: 1,
        name: "Aesthetic Pondok Indah",
        code: "API-PI",
        address: "Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310",
        phone: "(021) 765-4321",
      };
      setBranchesList([fallbackBranch]);
      setSelectedBranch(fallbackBranch);
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

  // 6. Fetch Real Patient Bookings History with 1s Realtime Silent Polling
  const prevReservationStatusesRef = useRef<Map<string | number, string>>(new Map());

  const isFetchingBookingsRef = useRef(false);
  const fetchBookings = async (silent = false) => {
    if (isFetchingBookingsRef.current && silent) return;
    isFetchingBookingsRef.current = true;
    if (!silent) setHistoryLoading(true);
    try {
      const res = await apiClient.get("/user/reservations", { skipToast: true });
      const list = Array.isArray(res)
        ? res
        : res?.reservations || res?.data?.reservations || res?.data || [];
      if (Array.isArray(list)) {
        const formatted = list.map((r: any) => ({
          id: r.id,
          code: r.code || `#RSV-${String(r.id).padStart(6, "0")}`,
          doctorName: r.doctor_name || r.doctor?.name || "drg. Yulita Dora",
          doctorPhoto: r.doctor?.avatar || `/dokter/${r.doctor_name || r.doctor?.name || "drg. Yulita Dora"}.jpeg`,
          specialization: r.treatment_interest || r.doctor?.specialization || "Dokter Gigi Spesialis",
          serviceName: r.service_name || r.treatment_interest || "Pemeriksaan Gigi & Mulut",
          date: r.scheduled_date || r.date,
          displayDate: r.scheduled_date || r.date,
          time: r.scheduled_time || r.preferred_time || "10:00",
          status: r.status || "confirmed",
          rawStatus: r.raw_status || r.status,
          totalAmount: r.total_amount || 1500000,
          locationName: "Aesthetic Pondok Indah",
          locationAddress: "Jl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310",
          examinationResult: r.admin_notes || r.notes || r.complaint,
          patientName: r.patient_name || r.name || patientName,
          phone: r.phone || patientPhone,
          signatureData: r.signature_data || r.signature || r.signatureData || null,
          signature_data: r.signature_data || r.signature || r.signatureData || null,
          termsAcceptedAt: r.terms_accepted_at || r.created_at || null,
        }));

        // Detect status transition to 'confirmed' / 'Dikonfirmasi'
        formatted.forEach((item) => {
          const prevStatus = prevReservationStatusesRef.current.get(item.id);
          const currentStatus = (item.rawStatus || item.status || "").toLowerCase();

          if (
            prevStatus &&
            (prevStatus === "baru" || prevStatus === "pending" || prevStatus === "menunggu") &&
            (currentStatus === "dikonfirmasi" || currentStatus === "confirmed")
          ) {
            triggerPushNotification({
              title: "🎉 Janji Temu Dikonfirmasi!",
              message: `Reservasi ${item.code} bersama ${item.doctorName} telah disetujui oleh Admin. Silakan cek E-Tiket Anda.`,
              sender: "Aesthetic Pondok Indah",
              role: "patient",
              type: "reservation_confirmed",
              bookingCode: item.code,
            });
          }

          prevReservationStatusesRef.current.set(item.id, currentStatus);
        });

        setBookingsHistory(formatted);
        try {
          localStorage.setItem("apig_user_cached_bookings", JSON.stringify(formatted));
        } catch {}
      } else {
        if (!hasCachedBookings) setBookingsHistory([]);
      }
    } catch (err) {
      if (!silent) {
        console.warn("Failed to fetch user reservations from backend:", err);
      }
    } finally {
      isFetchingBookingsRef.current = false;
      if (!silent) setHistoryLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial database fetch on load with Cache-First strategy
    fetchServices();
    fetchDoctors();
    fetchBranches();
    fetchDoctorSchedules();
    fetchPatientProfile();
    fetchBookings(hasCachedBookings);

    // Fetch point redemption settings & user points
    apiClient.get<any>("/membership/point-settings", { skipToast: true })
      .then((res) => {
        const d = res?.data?.data || res?.data || res;
        if (d?.conversion_rate) setPointConversionRate(Number(d.conversion_rate));
        if (d?.min_redeem_points) setMinRedeemPoints(Number(d.min_redeem_points));
        if (d?.max_discount_percentage) setMaxDiscountPercentage(Number(d.max_discount_percentage));
      })
      .catch(() => {});

    apiClient.get<any>("/membership/points", { skipToast: true })
      .then((res) => {
        const payload = res?.data?.data || res?.data || res;
        if (payload?.current_balance !== undefined) {
          setUserAvailablePoints(Number(payload.current_balance));
        }
      })
      .catch(() => {});

    // 2. Realtime Background Silent Polling every 6 seconds
    const pollInterval = setInterval(() => {
      fetchBookings(true);
    }, 6000);

    // 3. Event-Driven Trigger: Refetch data when push notifications occur
    const unsubscribe = subscribeToPushNotifications((payload) => {
      if (payload.type === "reservation_confirmed" || payload.type === "reservation_new" || payload.bookingCode) {
        fetchBookings(true);
      }
    });

    // 4. Window focus / visibility change trigger
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchBookings(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasCachedBookings]);

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

  // Helper to get schedules for a specific date and selected doctor from backend
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

  // Dynamic Time Slots based on selected doctor & selected date from backend schedules
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

  // Find next available date for convenience
  const nextAvailableDate = useMemo(() => {
    if (!selectedDoctor) return null;
    return availableDates.find((d) => getDoctorSchedulesForDate(d.iso).length > 0) || null;
  }, [selectedDoctor, availableDates, doctorSchedules]);

  // Auto-select first available date when doctor changes if current selected date has no schedule
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

  // Handle Booking Submission
  const handleSubmitBooking = async () => {
    if (!agreeTerms) {
      toast({
        title: "Persetujuan Diperlukan",
        message: "Silakan centang persetujuan Syarat dan Ketentuan klinik terlebih dahulu.",
      });
      return;
    }

    if (!signatureData) {
      toast({
        title: "Tanda Tangan Wajib Diisi",
        message: "Silakan berikan goresan tanda tangan digital pada kotak persetujuan sebelum mengirim reservasi.",
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
        redeem_points: usePoints ? pointsToRedeem : 0,
        service_price: serviceBasePrice,
      };

      const res = await apiClient.post("/user/reservations", payload);
      const resData = res.data?.reservation || res.data?.data || res.data;

      const ticketCode =
        resData?.code ||
        res?.data?.code ||
        res?.reservation?.code ||
        (resData?.id ? `#RSV-${String(resData.id).padStart(6, "0")}` : `#RSV-${new Date().getFullYear()}0001`);

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
        totalAmount: finalPrice,
        originalAmount: serviceBasePrice,
        pointDiscount: calculatedDiscount,
        redeemPoints: usePoints ? pointsToRedeem : 0,
        patientName: patientName,
        phone: patientPhone,
      };

      setActiveTicket(newTicket);
      broadcastRealtimeReservationEvent({
        type: "patient_booked",
        bookingCode: newTicket.code,
        patientName: newTicket.patientName,
        serviceName: newTicket.serviceName,
        doctorId: selectedDoctor?.userId || selectedDoctor?.id,
        dateStr: selectedDate,
        timeStr: selectedTimeSlot,
        isGuest: false,
      });

      // Update history so newest booking is at the top (index 0)
      setBookingsHistory((prev) => [newTicket, ...prev.filter((b) => b.id !== newTicket.id && b.code !== newTicket.code)]);

      // Otomatis arahkan ke WhatsApp Admin Klinik dengan data valid dan template rapi
      const waMessage = [
        "*KONFIRMASI RESERVASI JANJI TEMU DOKTER GIGI*",
        "*Aesthetic Pondok Indah Dental Clinic*",
        "━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "Halo Admin Aesthetic Pondok Indah, saya telah mengajukan reservasi janji temu melalui website dengan rincian sebagai berikut:",
        "",
        `📋 *Kode Reservasi:* ${ticketCode}`,
        `👤 *Nama Pasien:* ${patientName}`,
        `📱 *No. WhatsApp:* ${patientPhone}`,
        "",
        `👨‍⚕️ *Dokter Spesialis:* ${selectedDoctor.name} (${selectedDoctor.specialization || "Spesialis Gigi"})`,
        `🏥 *Layanan Perawatan:* ${selectedService.name}`,
        `📅 *Tanggal Janji Temu:* ${selectedDateObj?.display || selectedDate}`,
        `⏰ *Waktu / Jam:* ${selectedTimeSlot} WIB`,
        `📍 *Lokasi:* Aesthetic Pondok Indah, Jakarta Selatan`,
        notes ? `📝 *Catatan Keluhan:* ${notes}` : "",
        "",
        "Mohon verifikasi dan konfirmasi ketersediaan jadwal tersebut. Terima kasih! 🙏",
      ].filter(Boolean).join("\n");

      const adminPhone = "6281990114949";
      const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(waMessage)}`;

      // Buka WhatsApp di tab baru secara otomatis
      try {
        window.open(waUrl, "_blank");
      } catch {}

      setShowSuccessModal(true);
    } catch (err: any) {
      const fallbackCode = `#RSV-${new Date().getFullYear()}${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const fallbackTicket = {
        id: Date.now(),
        code: fallbackCode,
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
      setBookingsHistory((prev) => [fallbackTicket, ...prev.filter((b) => b.id !== fallbackTicket.id)]);

      const waMessage = [
        "*KONFIRMASI RESERVASI JANJI TEMU DOKTER GIGI*",
        "*Aesthetic Pondok Indah Dental Clinic*",
        "━━━━━━━━━━━━━━━━━━━━━━━",
        "",
        "Halo Admin Aesthetic Pondok Indah, saya telah mengajukan reservasi janji temu melalui website dengan rincian sebagai berikut:",
        "",
        `📋 *Kode Reservasi:* ${fallbackCode}`,
        `👤 *Nama Pasien:* ${patientName}`,
        `📱 *No. WhatsApp:* ${patientPhone}`,
        "",
        `👨‍⚕️ *Dokter Spesialis:* ${selectedDoctor.name} (${selectedDoctor.specialization || "Spesialis Gigi"})`,
        `🏥 *Layanan Perawatan:* ${selectedService.name}`,
        `📅 *Tanggal Janji Temu:* ${selectedDateObj?.display || selectedDate}`,
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
      <PageTransition transitionKey={`${viewMode}_${currentStep}`}>
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
                  : "Konfirmasi"}
              </h1>
            </div>
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
          </div>          {/* Main Content Area */}
          {currentStep < 4 ? (
            /* STEP 1, 2, 3: FULL/CENTERED IMMERSIVE CONTAINER WITHOUT SIDEBAR SUMMARY */
            <div className="max-w-4xl mx-auto space-y-6">
              {/* =================================================== */}
              {/* STEP 1: PILIH LAYANAN */}
              {/* =================================================== */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Search & Category Filter Dropdown */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8272]" />
                      <Input
                        type="text"
                        placeholder="Cari tindakan perawatan gigi (mis. Whitening, Scaling, Braces)..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="h-12 pl-11 pr-4 rounded-2xl bg-white border border-[#D9D0BC] focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/20 text-sm shadow-xs"
                      />
                    </div>

                    {/* Category Filter Dropdown */}
                    <div className="relative sm:w-64 shrink-0">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full h-12 pl-4 pr-10 rounded-2xl bg-white border border-[#D9D0BC] text-xs sm:text-sm text-[#2C2416] font-semibold focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/20 outline-none cursor-pointer shadow-xs appearance-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat === "Semua" ? "Semua Kategori Layanan" : cat}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-[#8C8272] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Services Card Grid - Clean layout with Service Name only (no icon) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {filteredServices.map((svc) => {
                      const isSelected = selectedService?.id === svc.id;

                      return (
                        <div
                          key={svc.id}
                          onClick={() => {
                            setSelectedService(svc);
                            setCurrentStep(2);
                          }}
                          className={`group p-4 sm:p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 relative hover:border-[#8C6B1C] hover:shadow-md hover:-translate-y-0.5 ${
                            isSelected
                              ? "bg-[#FAF5EA] border-2 border-[#8C6B1C] shadow-md ring-2 ring-[#8C6B1C]/15"
                              : "bg-white border-[#E6DECB] shadow-2xs hover:bg-[#FAF8F5]/80"
                          }`}
                        >
                          <h3 className="text-sm sm:text-base font-bold text-[#2C2416] group-hover:text-[#8C6B1C] transition-colors truncate text-left min-w-0 flex-1">
                            {svc.name}
                          </h3>

                          <div className="shrink-0 flex items-center">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                              isSelected ? "bg-[#8C6B1C] text-white" : "text-[#A89F91] group-hover:text-[#8C6B1C] group-hover:bg-[#FAF5EA]"
                            }`}>
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* STEP 2: PILIH DOKTER */}
              {/* =================================================== */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Selected Service Quick Info Badge */}
                  {selectedService && (
                    <div className="bg-[#FAF5EA] border border-[#EADBBD] rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DFC8] overflow-hidden shrink-0 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-[#8C6B1C]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#8C6B1C] uppercase tracking-wider">
                            Layanan Terpilih
                          </p>
                          <p className="text-sm font-bold text-[#2C2416]">{selectedService.name}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-semibold text-[#8C6B1C] hover:underline cursor-pointer"
                      >
                        Ganti Layanan
                      </button>
                    </div>
                  )}

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8272]" />
                    <Input
                      type="text"
                      placeholder="Cari nama dokter atau spesialisasi..."
                      value={doctorSearch}
                      onChange={(e) => setDoctorSearch(e.target.value)}
                      className="h-12 pl-11 pr-4 rounded-2xl bg-white border border-[#D9D0BC] focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/20 text-sm shadow-xs"
                    />
                  </div>

                  {/* Doctor Cards Grid - Showing Doctor Name and Specialization only */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                    {doctorsLoading ? (
                      <div className="col-span-full py-12 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-[#E6DECB]">
                        <Loader2 className="w-8 h-8 text-[#8C6B1C] animate-spin" />
                        <p className="text-xs font-semibold text-[#8C8272]">
                          Memuat data dokter dari database klinik...
                        </p>
                      </div>
                    ) : filteredDoctors.length === 0 ? (
                      <div className="col-span-full py-12 flex flex-col items-center justify-center gap-2 bg-white rounded-3xl border border-[#E6DECB] text-center px-4">
                        <AlertCircle className="w-8 h-8 text-[#8C8272]" />
                        <p className="text-sm font-bold text-[#2C2416]">Tidak Ada Dokter Ditemukan</p>
                        <p className="text-xs text-[#8C8272]">
                          Coba cari dengan kata kunci nama atau spesialisasi yang berbeda.
                        </p>
                      </div>
                    ) : (
                      filteredDoctors.map((doc) => {
                        const isSelected = selectedDoctor?.id === doc.id;

                        return (
                          <div
                            key={doc.id}
                            onClick={() => {
                              setSelectedDoctor(doc);
                              setCurrentStep(3);
                            }}
                            className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-3.5 relative hover:border-[#8C6B1C] hover:shadow-md hover:-translate-y-0.5 ${
                              isSelected
                                ? "bg-[#FAF5EA] border-2 border-[#8C6B1C] shadow-md ring-2 ring-[#8C6B1C]/15"
                                : "bg-white border-[#E6DECB] shadow-2xs hover:bg-[#FAF8F5]/80"
                            }`}
                          >
                            {/* Photo */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#EFE9DC] overflow-hidden shrink-0 border border-[#D9D0BC] group-hover:scale-105 transition-transform">
                              <img
                                src={doc.photo}
                                alt={doc.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Doctor Name & Specialization only */}
                            <div className="flex-1 min-w-0 text-left space-y-0.5">
                              <h3 className="text-sm sm:text-base font-bold text-[#2C2416] group-hover:text-[#8C6B1C] transition-colors truncate">
                                {doc.name}
                              </h3>
                              <p className="text-xs font-semibold text-[#8C6B1C] truncate">
                                {doc.specialization}
                              </p>
                            </div>

                            <div className="shrink-0 flex items-center">
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                isSelected ? "bg-[#8C6B1C] text-white" : "text-[#A89F91] group-hover:text-[#8C6B1C] group-hover:bg-[#FAF5EA]"
                              }`}>
                                <ChevronRight className="w-4 h-4" />
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* =================================================== */}
              {/* STEP 3: PILIH JADWAL */}
              {/* =================================================== */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Doctor Summary Header Card (No Ganti Dokter button) */}
                  {selectedDoctor && (
                    <div className="bg-white border border-[#E6DECB] rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
                      <div className="flex items-center gap-4">
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
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section Pilih Tanggal */}
                  <div className="bg-white border border-[#E6DECB] rounded-3xl p-5 sm:p-6 space-y-4 text-left shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-base font-bold text-[#2C2416] flex items-center gap-2">
                          <CalendarIcon className="w-4.5 h-4.5 text-[#8C6B1C]" />
                          <span>1. Pilih Tanggal Kunjungan</span>
                        </h4>
                        <p className="text-xs text-[#7C7365]">Pilih hari dari kalender mingguan atau klik tombol kalender</p>
                      </div>

                      {/* Direct Calendar Picker Button */}
                      <div className="relative inline-flex items-center">
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#FAF5EA] hover:bg-[#F5ECE0] border border-[#EADBBD] text-xs font-bold text-[#8C6B1C] shadow-2xs transition-all cursor-pointer">
                          <CalendarIcon className="w-4 h-4 text-[#8C6B1C]" />
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
                        {availableDates.map((dt) => {
                          const isSel = selectedDate === dt.iso;
                          const daySchedules = getDoctorSchedulesForDate(dt.iso);
                          const isAvailable = daySchedules.length > 0;

                          return (
                            <button
                              key={dt.iso}
                              type="button"
                              onClick={() => setSelectedDate(dt.iso)}
                              className={`w-20 h-22 rounded-2xl border flex flex-col items-center justify-center shrink-0 transition-all cursor-pointer relative ${
                                isSel
                                  ? "bg-[#8C6B1C] text-white border-2 border-[#8C6B1C] shadow-md ring-2 ring-[#8C6B1C]/20"
                                  : "bg-white border-[#E6DECB] text-[#2C2416] hover:border-[#8C6B1C] hover:bg-[#FAF5EA]"
                              }`}
                            >
                              <span
                                className={`text-[10px] font-semibold uppercase tracking-wider ${
                                  isSel ? "text-white/80" : "text-[#8C8272]"
                                }`}
                              >
                                {dt.dayName}
                              </span>
                              <span className="text-xl font-bold mt-0.5">{dt.dayNum}</span>

                              {/* Availability indicator badge */}
                              <span
                                className={`text-[9px] font-semibold mt-1 px-1.5 py-0.5 rounded-md ${
                                  isSel
                                    ? "bg-white/20 text-white"
                                    : isAvailable
                                    ? "bg-[#FAF5EA] text-[#8C6B1C]"
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

                  {/* Conditional Rendering: Time Slots Grid OR Doctor Off-Duty Alert */}
                  {isDoctorAvailableOnSelectedDate ? (
                    <div className="bg-white border border-[#E6DECB] rounded-3xl p-5 sm:p-6 space-y-4 text-left shadow-xs animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-[#2C2416] flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#8C6B1C]" />
                          <span>2. Pilih Jam Kunjungan</span>
                        </h4>
                        <span className="text-xs font-semibold text-[#8C6B1C] bg-[#FAF5EA] px-2.5 py-1 rounded-lg border border-[#EADBBD] shrink-0">
                          {timeSlots.length} Sesi Tersedia
                        </span>
                      </div>

                      {/* Time Slot Responsive Grid (Clean time slot numbers only, without WIB) */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {timeSlots.map((slot) => {
                          const isSel = selectedTimeSlot === slot;

                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                setSelectedTimeSlot(slot);
                                setCurrentStep(4);
                              }}
                              className={`h-10 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center justify-center hover:scale-105 ${
                                isSel
                                  ? "bg-[#8C6B1C] text-white border-[#8C6B1C] shadow-md ring-2 ring-[#8C6B1C]/20"
                                  : "bg-[#FAF8F5] border-[#E6DECB] text-[#2C2416] hover:border-[#8C6B1C] hover:bg-white"
                              }`}
                            >
                              <span>{slot}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Schedule Time Range Info */}
                      {currentDaySchedules.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-[#7C7365] pt-2 border-t border-[#EDE5D6]">
                          <Info className="w-3.5 h-3.5 text-[#8C6B1C] shrink-0" />
                          <span>
                            Jam operasional praktik: {currentDaySchedules.map((s) => s.timeRange).join(", ")}
                            {currentDaySchedules[0]?.location ? ` • ${currentDaySchedules[0].location}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Alert Box: Dokter Tidak Praktik / Libur di Tanggal Ini (Soft Gold/Cream palette) */
                    <div className="bg-[#FAF8F5] border border-[#EADBBD] rounded-3xl p-6 sm:p-7 text-left space-y-4 shadow-xs animate-in fade-in duration-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] shrink-0 shadow-2xs">
                          <CalendarOff className="w-6 h-6" />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base sm:text-lg font-bold text-[#2C2416]">
                              Tidak Ada Jadwal Praktik Dokter
                            </h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F5EFE6] text-[#8C8272] px-2 py-0.5 rounded-md">
                              Libur Bertugas
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-[#5C5546] leading-relaxed">
                            <span className="font-bold text-[#2C2416]">{selectedDoctor?.name}</span> tidak memiliki jadwal praktik atau sedang libur bertugas pada hari <span className="font-bold text-[#2C2416]">{selectedDateObj?.display}</span>.
                          </p>
                          <p className="text-xs text-[#8C8272]">
                            Silakan pilih tanggal lain yang bertanda <strong>"Praktik"</strong> pada deretan tanggal di atas untuk melihat jam praktik yang tersedia.
                          </p>
                        </div>
                      </div>

                      {nextAvailableDate && (
                        <div className="pt-3.5 border-t border-[#EDE5D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-[#5C5546]">
                            Jadwal terdekat dokter ini berikutnya:
                          </span>
                          <Button
                            type="button"
                            onClick={() => setSelectedDate(nextAvailableDate.iso)}
                            className="bg-[#8C6B1C] hover:bg-[#735716] text-white rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer w-full sm:w-auto justify-center"
                          >
                            <span>Pilih {nextAvailableDate.dayName}, {nextAvailableDate.dayNum} {nextAvailableDate.monthName}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notice Box */}
                  <div className="bg-[#FEF6E8] border border-[#FADBA8] rounded-2xl p-4 flex items-start gap-3 text-left">
                    <Info className="w-5 h-5 text-[#C57A00] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#8C5300] leading-relaxed">
                      Harap tiba 15 menit sebelum waktu appointment Anda untuk proses registrasi dan persiapan administrasi klinik.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STEP 4: KONFIRMASI BOOKING (DUAL COLUMN DESKTOP WITH SUMMARY & SUBMIT) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Details & Digital Signature */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                <div className="space-y-4 animate-in fade-in duration-200 text-left">
                  {/* Card: Catatan Tambahan (Collapsible Dropdown) */}
                  <div className="bg-white border border-[#E6DECB] rounded-3xl p-4 sm:p-5 space-y-3 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setShowNotes(!showNotes)}
                      className="w-full flex items-center justify-between text-left cursor-pointer group"
                    >
                      <h3 className="text-sm sm:text-base font-bold text-[#2C2416] group-hover:text-[#8C6B1C] transition-colors flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#8C6B1C]" />
                        <span>Catatan</span>
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C6B1C]">
                        <span>{showNotes ? "Tutup" : "Tulis Catatan"}</span>
                        <ChevronDown className={`w-4 h-4 text-[#8C6B1C] transition-transform duration-200 ${showNotes ? "rotate-180" : ""}`} />
                      </div>
                    </button>
                    {showNotes && (
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Contoh: Saya memiliki riwayat alergi obat tertentu, atau ingin konsultasi terlebih dahulu..."
                        className="w-full p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D9D0BC] focus:border-[#8C6B1C] focus:ring-2 focus:ring-[#8C6B1C]/20 text-xs sm:text-sm text-[#2C2416] placeholder:text-[#A0988A] resize-none animate-in fade-in duration-150"
                      />
                    )}
                  </div>

                  {/* Card: Verifikasi Persetujuan */}
                  <div className="bg-white border border-[#E6DECB] rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[#2C2416] flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#8C6B1C]" />
                        <span>Verifikasi Persetujuan</span>
                      </h3>
                    </div>

                    {/* Dokumen 1: Syarat dan Ketentuan Layanan Pasien */}
                    <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-2xl p-4 space-y-3">
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
                    <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-2xl p-4 space-y-3">
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
                              {signatureData ? `✓ Ditandatangani oleh ${patientName}` : "Wajib dibubuhkan tanda tangan digital"}
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
                </div>
              </div>

              {/* Right Column: Desktop POV Sticky Summary Card (Only on Step 4) */}
              <div className="lg:col-span-5 xl:col-span-4 sticky top-6 space-y-4">
                <div className="bg-white border border-[#E6DECB] rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 text-left">
                  <div className="flex items-center justify-between border-b border-[#EDE5D6] pb-3">
                    <h3 className="text-base sm:text-lg font-bold font-display text-[#2C2416]">
                      Ringkasan Booking
                    </h3>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FAF5EA] text-[#8C6B1C] border border-[#EADBBD]">
                      Langkah 4 dari 4
                    </span>
                  </div>

                  {/* Selected Service */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C8272]">
                      Layanan Terpilih
                    </span>
                    <p className="text-sm font-bold text-[#2C2416]">
                      {selectedService?.name || "Belum ada layanan"}
                    </p>
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
                      <span className="font-bold text-[#8C6B1C]">{selectedTimeSlot}</span>
                    </div>
                  </div>

                  {/* Desktop Primary Submit Button */}
                  <div className="pt-3 border-t border-[#EDE5D6]">
                    <Button
                      type="button"
                      disabled={!agreeTerms || !signatureData || !patientName.trim() || isSubmitting}
                      onClick={handleSubmitBooking}
                      className="w-full h-12 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white font-bold text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <span>Konfirmasi & Buat Janji Temu</span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Sticky Bottom Bar (ONLY SHOWN ON STEP 4) */}
      {viewMode === "booking" && currentStep === 4 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6DECB] p-3.5 sm:p-4 shadow-xl">
          <div className="max-w-md mx-auto">
            <Button
              type="button"
              disabled={!agreeTerms || !signatureData || !patientName.trim() || isSubmitting}
              onClick={handleSubmitBooking}
              className="w-full h-12 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Konfirmasi & Buat Janji Temu</span>
              )}
            </Button>
          </div>
        </div>
      )}
      </PageTransition>

      {/* Success Modal Pop-up (Screenshot 5) */}
      <BookingSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setViewMode("history");
          setCurrentStep(1);
        }}
        onViewETicket={() => {
          setShowSuccessModal(false);
          setShowETicketModal(true);
        }}
        onGoHome={() => {
          setShowSuccessModal(false);
          setViewMode("history");
          setCurrentStep(1);
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
        onClose={() => {
          setShowETicketModal(false);
          setViewMode("history");
          setCurrentStep(1);
        }}
        onBookAgain={() => {
          setShowETicketModal(false);
          setViewMode("booking");
          setCurrentStep(1);
        }}
        ticketData={
          activeTicket || {
            id: 1,
            code: "#RSV-000053",
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
            message: "Tanda tangan digital Anda telah berhasil disimpan.",
          });
        }}
      />

      {/* Medical Informed Consent Official PDF Document Modal */}
      <ReservationConsentPdfModal
        isOpen={showConsentPdfModal}
        onClose={() => setShowConsentPdfModal(false)}
        bookingCode="DRAFT-RESERVASI"
        patientName={patientName}
        patientPhone={patientPhone}
        patientEmail={(session as any)?.email || ""}
        isGuest={false}
        serviceName={selectedService?.name || "Layanan Gigi"}
        doctorName={selectedDoctor?.name || "Dokter Gigi"}
        dateStr={selectedDateObj?.display || selectedDate}
        timeStr={`${selectedTimeSlot}`}
        signatureData={signatureData}
        acceptedAt={new Date().toISOString()}
        onSaveSignature={(sig) => {
          setSignatureData(sig);
          toast({
            title: "Tanda Tangan Disimpan",
            message: "Surat perjanjian telah berhasil ditandatangani secara digital.",
          });
        }}
      />

      {/* Terms & Conditions Official PDF Document Modal */}
      <TermsPdfModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        initialName={patientName}
        initialPhone={patientPhone}
        initialEmail={(session as any)?.email || ""}
        isAgreed={agreeTerms}
        onAccept={(name) => {
          setAgreeTerms(true);
          if (name) setPatientName(name);
          toast({
            title: "Syarat & Ketentuan Disetujui",
            message: "Syarat & Ketentuan telah berhasil dikonfirmasi.",
          });
        }}
      />
    </div>
  );
}
