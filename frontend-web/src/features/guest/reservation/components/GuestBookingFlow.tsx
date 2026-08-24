import React, { useState, useEffect, useMemo } from "react";
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

export default function GuestBookingFlow() {
  const [searchParams] = useSearchParams();
  const requestedServiceName = searchParams.get("service") || searchParams.get("treatment") || searchParams.get("layanan");
  const requestedServiceId = searchParams.get("serviceId") || searchParams.get("id");

  const [currentStep, setCurrentStep] = useState<"layanan" | "dokter" | "jadwal" | "konfirmasi">("layanan");

  // Step 1: Services
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [searchService, setSearchService] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [servicesLoading, setServicesLoading] = useState(false);

  // Step 2: Doctors
  const [doctors, setDoctors] = useState<DoctorItem[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorItem | null>(null);
  const [doctorsLoading, setDoctorsLoading] = useState(false);

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
      setServicesLoading(true);
      try {
        const res = await apiClient.get("/public/services");
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
      setDoctorsLoading(true);
      try {
        const res = await apiClient.get("/public/doctors");
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

  // Helper to parse time_range string into 20-minute slots
  const parseTimeRangeToSlots = (timeRange: string, intervalMinutes: number = 20): string[] => {
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
        const generated = parseTimeRangeToSlots(s.timeRange, 20);
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
      toast({
        title: "Reservasi Guest Berhasil Dibuat!",
        message: `Kode Booking Anda: ${ticketCode}. Tim klinik akan segera mengonfirmasi via WhatsApp.`,
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

            {/* Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {filteredServices.map((svc) => {
                const isSelected = selectedService?.id === svc.id;
                return (
                  <div
                    key={svc.id}
                    onClick={() => {
                      setSelectedService(svc);
                      setCurrentStep("dokter");
                    }}
                    className={`group p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:border-[#C9A24A] hover:shadow-md hover:-translate-y-0.5 ${
                      isSelected
                        ? "bg-[#FDF8F0] border-[#C9A24A] shadow-md ring-2 ring-[#C9A24A]/20"
                        : "bg-white border-[#F0E6D3] hover:bg-[#FAF8F5]"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? "bg-[#C9A24A] text-white" : "bg-[#F5E6C8] text-[#8A6B2B]"}`}>
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#3D332A] group-hover:text-[#8A6B2B] transition-colors">{svc.name}</h4>
                            <span className="text-[10px] font-semibold text-[#8A6B2B] bg-[#FAF4E8] px-2 py-0.5 rounded-md border border-[#E8D4A2]/40">
                              {svc.category}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-[#8A6B2B] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Pilih</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                      <p className="text-xs text-[#7A6E60] mt-3 line-clamp-2 leading-relaxed">
                        {svc.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#F5ECE0]">
                      <span className="text-xs text-[#8A7B6B]">{svc.duration}</span>
                      <span className="text-sm font-bold text-[#3D332A]">{svc.price}</span>
                    </div>
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
              className="text-xs font-semibold text-[#8A6B2B] hover:underline"
            >
              Ganti Layanan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {doctors.map((doc) => {
              const isSelected = selectedDoctor?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setCurrentStep("jadwal");
                  }}
                  className={`group p-5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center hover:border-[#C9A24A] hover:shadow-md hover:-translate-y-0.5 ${
                    isSelected
                      ? "bg-[#FDF8F0] border-[#C9A24A] shadow-md ring-2 ring-[#C9A24A]/20"
                      : "bg-white border-[#F0E6D3] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <div className="relative">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-[#E8DFC8] shadow-xs group-hover:scale-105 transition-transform"
                    />
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#C9A24A] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-[#3D332A] mt-3 group-hover:text-[#8A6B2B] transition-colors">{doc.name}</h4>
                  <p className="text-xs text-[#8A6B2B] font-medium">{doc.specialization}</p>

                  <div className="flex items-center gap-1 mt-2 text-[11px] text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{doc.rating}</span>
                  </div>
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
              <p className="text-xs text-[#8A7B6B]">Klik salah satu jam untuk langsung lanjut ke formulir data pasien.</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep("dokter")}
              className="text-xs font-semibold text-[#8A6B2B] hover:underline"
            >
              Ganti Dokter
            </button>
          </div>

          {/* Date Picker Grid */}
          <div>
            <label className="block text-xs font-bold text-[#3D332A] mb-2">1. Pilih Tanggal Tersedia</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {availableDates.map((d) => {
                const isSelected = selectedDate === d.iso;
                const daySchedules = getDoctorSchedulesForDate(d.iso);
                const isAvailable = daySchedules.length > 0;

                return (
                  <button
                    key={d.iso}
                    onClick={() => setSelectedDate(d.iso)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center relative ${
                      isAvailable
                        ? isSelected
                          ? "bg-[#C9A24A] border-[#C9A24A] text-white shadow-md"
                          : "bg-[#FAF8F5] border-[#E8DFC8] text-[#3D332A] hover:bg-[#F5ECE0]"
                        : isSelected
                        ? "bg-rose-600 border-rose-600 text-white shadow-md ring-2 ring-rose-300"
                        : "bg-[#FFF5F5] border-rose-200 text-rose-700 hover:border-rose-400 hover:bg-[#FFEBEB]"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-semibold uppercase ${
                        isSelected ? "text-white/80" : isAvailable ? "text-[#8A7B6B]" : "text-rose-500"
                      }`}
                    >
                      {d.dayName}
                    </span>
                    <span className="text-lg font-bold mt-0.5">{d.dayNum}</span>
                    <span
                      className={`text-[9px] font-semibold mt-1 px-1.5 py-0.2 rounded-md ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : isAvailable
                          ? "bg-[#FAF4E8] text-[#8A6B2B]"
                          : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      {isAvailable ? "Praktik" : "Libur"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional: Dynamic Time Slots OR Off-Duty Notice */}
          {isDoctorAvailableOnSelectedDate ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#3D332A]">2. Pilih Jam Kunjungan (Klik Jam)</label>
                <span className="text-[11px] font-semibold text-[#8A6B2B] bg-[#FAF4E8] px-2 py-0.5 rounded-md border border-[#E8D4A2]/40">
                  {timeSlots.length} Sesi Tersedia
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = selectedTimeSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => {
                        setSelectedTimeSlot(slot);
                        setCurrentStep("konfirmasi");
                      }}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 ${
                        isSelected
                          ? "bg-[#C9A24A] border-[#C9A24A] text-white shadow-xs"
                          : "bg-[#FAF8F5] border-[#E8DFC8] text-[#3D332A] hover:border-[#C9A24A] hover:bg-white"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{slot} WIB</span>
                    </button>
                  );
                })}
              </div>

              {currentDaySchedules.length > 0 && (
                <p className="text-[11px] text-[#8A7B6B] mt-2 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#C9A24A]" />
                  <span>Jadwal dokter: {currentDaySchedules.map((s) => s.timeRange).join(", ")} WIB</span>
                </p>
              )}
            </div>
          ) : (
            /* Off-duty notice box */
            <div className="bg-[#FFF5F5] border border-rose-200 rounded-2xl p-5 text-left space-y-3">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                  <CalendarOff className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-rose-900">
                    Tidak Ada Jadwal Praktik Dokter
                  </h4>
                  <p className="text-xs text-rose-800 leading-relaxed">
                    <span className="font-bold">{selectedDoctor?.name}</span> tidak memiliki jadwal praktik atau sedang libur pada tanggal yang dipilih.
                  </p>
                  <p className="text-[11px] text-rose-700">
                    Silakan pilih tanggal lain bertanda <strong>"Praktik"</strong> di atas.
                  </p>
                </div>
              </div>

              {nextAvailableDate && (
                <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between">
                  <span className="text-xs text-rose-800 font-medium">Jadwal dokter berikutnya:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDate(nextAvailableDate.iso)}
                    className="text-xs font-bold text-[#8A6B2B] bg-white px-3 py-1 rounded-lg border border-[#E8DFC8] hover:bg-[#FAF8F5]"
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
          {/* Summary Selected Info Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#F0E6D3] shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#B8943F] flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Ringkasan Pilihan Reservasi
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#FDF8F0] rounded-2xl border border-[#F5E6C8]">
                <p className="text-[10px] text-[#8A6B2B] font-semibold">Layanan Perawatan</p>
                <p className="text-sm font-bold text-[#3D332A] mt-0.5">{selectedService?.name}</p>
                <p className="text-xs text-[#8A7B6B] mt-1">{selectedService?.duration} • {selectedService?.price}</p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DFC8]">
                <p className="text-[10px] text-[#8A6B2B] font-semibold">Dokter Bertugas</p>
                <p className="text-sm font-bold text-[#3D332A] mt-0.5">{selectedDoctor?.name}</p>
                <p className="text-xs text-[#8A7B6B] mt-1">{selectedDoctor?.specialization}</p>
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DFC8]">
                <p className="text-[10px] text-[#8A6B2B] font-semibold">Jadwal & Waktu</p>
                <p className="text-sm font-bold text-[#3D332A] mt-0.5">{selectedDate}</p>
                <p className="text-xs text-[#8A7B6B] mt-1">Pukul {selectedTimeSlot} WIB</p>
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
                <Input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="h-11 rounded-xl bg-white border-[#D9D0BC] text-sm text-[#3D332A] focus:border-[#C9A24A]"
                />
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
              <label className="text-xs font-bold text-[#3D332A]">Keluhan / Catatan Tambahan (Opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ceritakan keluhan gigi Anda (contoh: gigi bungsu ngilu saat mengunyah)..."
                rows={3}
                className="w-full bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl p-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
              />
            </div>

            {/* 2 Langkah Verifikasi Dokumen & Tanda Tangan Pasien */}
            <div className="space-y-4 pt-2">
              {/* Langkah 1: Syarat & Ketentuan Layanan Pasien */}
              <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Langkah 1: Syarat & Ketentuan Layanan Pasien</span>
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTermsModal(true)}
                    className="h-7 px-3 rounded-xl border-[#8C6B1C] text-[#8C6B1C] hover:bg-[#FAF5EA] text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Lihat Dokumen PDF S&K</span>
                  </Button>
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#C9A24A] focus:ring-[#C9A24A]"
                  />
                  <span className="text-xs text-[#5C5546] leading-relaxed">
                    Saya telah membaca, memahami, dan menyetujui seluruh{" "}
                    <strong className="text-[#8C6B1C]">Syarat & Ketentuan Layanan Pasien</strong>{" "}
                    serta Kebijakan Pembatalan klinik Aesthetic Pondok Indah. *
                  </span>
                </label>
              </div>

              {/* Langkah 2: Surat Pernyataan & Persetujuan Pasien (Informed Consent) */}
              <div className="bg-[#FAF8F5] border border-[#E8DFC8] rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-[#8C6B1C] shrink-0" />
                    <span>Langkah 2: Surat Pernyataan & Persetujuan Pasien (Informed Consent)</span>
                  </span>
                  <Button
                    type="button"
                    onClick={() => setShowConsentPdfModal(true)}
                    className="h-7 px-3 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Lihat Dokumen PDF Surat Persetujuan</span>
                  </Button>
                </div>

                {signatureData ? (
                  <div className="bg-white border-2 border-[#C9A24A] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-14 bg-[#FAF8F5] rounded-xl border border-[#D9D0BC] overflow-hidden flex items-center justify-center p-1 shadow-inner">
                        <img src={signatureData} alt="Tanda Tangan Pasien" className="max-w-full max-h-full object-contain" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2C2416]">Tanda Tangan Tersimpan</p>
                        <p className="text-[11px] text-[#7C7365]">{patientName || "Pasien Guest"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowSignatureModal(true)}
                        className="px-3 py-1.5 rounded-xl border border-[#C9A24A] text-[#8A6B2B] hover:bg-[#FAF5EA] text-xs font-semibold cursor-pointer"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignatureData(null)}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSignatureModal(true)}
                    className="w-full h-24 bg-white border-2 border-dashed border-[#D9D0BC] hover:border-[#C9A24A] rounded-2xl flex flex-col items-center justify-center text-center p-3 transition-all group hover:bg-[#FAF5EA]/40 cursor-pointer shadow-xs"
                  >
                    <PenTool className="w-4 h-4 text-[#8A6B2B] mb-1" />
                    <p className="text-xs font-bold text-[#3D332A] group-hover:text-[#8A6B2B]">
                      Buka Canvas Tanda Tangan Digital *
                    </p>
                    <p className="text-[10px] text-[#A89F91]">Bubuhkan tanda tangan sebagai bukti persetujuan tindakan medis</p>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#F5ECE0]">
              <Button
                onClick={() => setCurrentStep("jadwal")}
                variant="outline"
                className="rounded-xl border-[#E8DFC8] text-xs font-semibold px-5 py-2.5 h-auto flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Kembali
              </Button>
              <Button
                onClick={handleGuestSubmit}
                disabled={!agreeTerms || !patientName.trim() || !patientPhone.trim() || isSubmitting}
                className="bg-[#C9A24A] hover:bg-[#B8943F] text-white rounded-xl px-8 py-3 text-sm font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {isSubmitting ? "Memproses Reservasi..." : "Kirim Reservasi Janji Temu"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSignatureModal && (
        <DigitalSignatureModal
          isOpen={showSignatureModal}
          onClose={() => setShowSignatureModal(false)}
          onSaveSignature={(data) => setSignatureData(data)}
          patientName={patientName || "Pasien Guest"}
        />
      )}

      {/* Consent PDF Modal */}
      <ReservationConsentPdfModal
        isOpen={showConsentPdfModal}
        onClose={() => setShowConsentPdfModal(false)}
        bookingCode="DRAFT-GUEST"
        patientName={patientName || "Pasien Tamu"}
        patientPhone={patientPhone || "-"}
        isGuest={true}
        serviceName={selectedService?.name || "Layanan Gigi"}
        doctorName={selectedDoctor?.name || "Dokter Gigi"}
        dateStr={selectedDate || "-"}
        timeStr={`${selectedTimeSlot} WIB`}
        signatureData={signatureData}
        acceptedAt={new Date().toISOString()}
      />

      {/* Terms Modal */}
      {showTermsModal && (
        <TermsPdfModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          onAccept={() => {
            setAgreeTerms(true);
            setShowTermsModal(false);
          }}
        />
      )}

      {/* Success Modal for Guest */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
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
        </div>
      )}
    </div>
  );
}
