import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/toast";
import {
  Stethoscope,
  Sparkles,
  Crown,
  Star,
  Clock,
  Check,
  CalendarDays,
  ChevronRight,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Clock4,
  AlertCircle,
  FileText,
  ArrowRight,
  User,
  MapPin,
  Send,
  Loader2,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { services as allServices } from "@/features/guest/services/pages/Services";
import { getPublicDoctorSchedules } from "@/features/guest/doctors/services/publicDoctorScheduleApi";
import { getPublicClinicSettings } from "@/features/guest/reservation/services/clinicSettingsApi";
import GuestBookingTermsDialog from "@/features/guest/reservation/components/GuestBookingTermsDialog";
import { apiClient } from "@/core/api/apiClient";
import { API_BASE } from "@/core/api/apiConfig";

const iconMap: Record<string, any> = {
  "Dental Whitening": Sparkles,
  "Root Canal Treatments": Crown,
  "Pediatric Dentistry": Star,
  "Full Mouth Rehabilitations": Crown,
  "Emergency Dental Services": AlertCircle,
  "Dentures": Crown,
  "Dental Implants": Crown,
  "Dental Extraction and Wisdom Tooth Removal": Stethoscope,
  "Oral Care": Stethoscope,
  "Dental Bridges": Crown,
  "Bone Grafting": Crown,
  "Dental Spa": Sparkles,
  "Veneers": Sparkles,
  "Invisalign": Star,
  "Orthodontics": Star,
  "Dental Fillings, Inlays & Onlays": Crown,
  "Gum Ablation": AlertCircle,
  "Lip Repositioning": AlertCircle,
  "Crown lengthening": Crown,
  "Gummy Smile Correction": Sparkles,
  "Frenectomy": AlertCircle,
};

const colorRing = [
  "from-[#c9a24a] to-[#a8843a]",
  "from-emerald-500 to-emerald-600",
  "from-blue-500 to-blue-600",
  "from-purple-500 to-purple-600",
  "from-pink-500 to-rose-500",
  "from-orange-500 to-amber-500",
  "from-teal-500 to-cyan-500",
];

const tabs = [
  { id: "all", label: "Semua" },
  { id: "upcoming", label: "Mendatang" },
  { id: "completed", label: "Selesai" },
  { id: "cancelled", label: "Dibatalkan" },
];

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Menunggu Konfirmasi", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock4 },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock4 },
  upcoming: { label: "Akan Datang", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock4 },
  completed: { label: "Selesai", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
};

export default function DesktopReservasi({
  initialView = "services",
}: {
  initialView?: "services" | "history";
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [view, setView] = useState<"services" | "history">(initialView);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  const step = searchParams.get("step") || "layanan";
  const serviceParam = searchParams.get("service") || "";
  const scheduleId = searchParams.get("schedule") || "";
  const dateParam = searchParams.get("date") || "";
  const timeParam = searchParams.get("time") || "";

  const [schedules, setSchedules] = useState<any[]>([]);
  const [schedLoading, setSchedLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Terms & Conditions Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [bookingTerms, setBookingTerms] = useState<string>();

  useEffect(() => {
    getPublicClinicSettings()
      .then((s) => setBookingTerms(s.booking_terms))
      .catch(() => {});
  }, []);

  // Generate next 7 days for date picker
  const upcomingDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
      const dayNum = d.getDate();
      dates.push({ fullDate: iso, dayName, dayNum });
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(
    dateParam || upcomingDates[0]?.fullDate || new Date().toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(timeParam || "10:00");
  const [complaintNote, setComplaintNote] = useState("");

  // Doctor filtering state
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorFilterDate, setDoctorFilterDate] = useState("");

  const filteredDoctorSchedules = useMemo(() => {
    return schedules.filter((s: any) => {
      // 1. Search Query filter
      const matchesSearch =
        !doctorSearch.trim() ||
        (s.doctorName && s.doctorName.toLowerCase().includes(doctorSearch.toLowerCase())) ||
        (s.location && s.location.toLowerCase().includes(doctorSearch.toLowerCase()));

      // 2. Date Filter
      const matchesDate = (() => {
        if (!doctorFilterDate) return true;
        // Exact ISO date match
        if (s.date === doctorFilterDate) return true;
        // General match if s.date contains "Setiap Hari" or day names
        if (s.date && (s.date.includes("Setiap Hari") || s.date.includes("Senin"))) return true;
        return false;
      })();

      return matchesSearch && matchesDate;
    });
  }, [schedules, doctorSearch, doctorFilterDate]);

  // Map services for selection
  const bookingServices = useMemo(() => {
    return allServices.map((s, idx) => {
      const Icon = iconMap[s.title] || Stethoscope;
      const gradient = colorRing[idx % colorRing.length];
      return {
        id: s.id,
        label: s.title,
        description: s.intro,
        icon: Icon,
        gradient,
        image: s.image,
      };
    });
  }, []);

  // Selected Service details
  const activeServiceObj = useMemo(() => {
    return bookingServices.find((s) => s.id === serviceParam || s.id === selectedService) || bookingServices[0];
  }, [serviceParam, selectedService, bookingServices]);

  // Selected Schedule details
  const activeScheduleObj = useMemo(() => {
    return schedules.find((s) => (s.id || s._id) === scheduleId) || schedules[0] || null;
  }, [scheduleId, schedules]);

  // Real-time synchronization check against selected doctor's schedule
  const scheduleStatus = useMemo(() => {
    if (!activeScheduleObj) {
      return { available: true, message: "Jadwal dokter tersedia", code: "AVAILABLE" };
    }

    // 1. Time range check (e.g., "09:00 - 17:00" or "10:00 - 18:00")
    if (activeScheduleObj.timeRange && typeof activeScheduleObj.timeRange === "string") {
      const parts = activeScheduleObj.timeRange.split("-").map((t: string) => t.trim().replace(/WIB/i, "").trim());
      if (parts.length === 2) {
        const startTime = parts[0];
        const endTime = parts[1];
        const currentTime = selectedTime || "10:00";
        if (currentTime < startTime || currentTime > endTime) {
          return {
            available: false,
            message: `Dokter ${activeScheduleObj.doctorName || ""} hanya berpraktik pada pukul ${activeScheduleObj.timeRange}. Jam ${currentTime} WIB berada di luar jam praktik.`,
            code: "OUT_OF_TIME_RANGE",
          };
        }
      }
    }

    // 2. Specific date check if schedule has specific date string (e.g. "2026-08-10")
    if (activeScheduleObj.date && /^\d{4}-\d{2}-\d{2}$/.test(activeScheduleObj.date)) {
      if (activeScheduleObj.date !== selectedDate) {
        return {
          available: false,
          message: `Dokter ${activeScheduleObj.doctorName || ""} hanya memiliki jadwal praktik pada tanggal ${activeScheduleObj.displayDate || activeScheduleObj.date}.`,
          code: "DATE_MISMATCH",
        };
      }
    }

    // 3. Slot capacity check
    if (activeScheduleObj.isFull || (activeScheduleObj.slotsLeft !== undefined && activeScheduleObj.slotsLeft <= 0)) {
      return {
        available: false,
        message: `Maaf, kuota janji temu untuk ${activeScheduleObj.doctorName || "dokter"} pada jadwal ini sudah penuh.`,
        code: "SLOT_FULL",
      };
    }

    return { available: true, message: "Jadwal dokter tersedia untuk reservasi.", code: "AVAILABLE" };
  }, [activeScheduleObj, selectedDate, selectedTime]);

  // Load history reservations
  useEffect(() => {
    if (view === "history") {
      setLoading(true);
      apiClient
        .get<{ reservations: any[] }>("/user/reservations")
        .then((response) => setBookings(response.reservations || []))
        .catch(() => setBookings([]))
        .finally(() => setLoading(false));
    }
  }, [view, activeTab]);

  // Load public doctor schedules for doctor selection
  useEffect(() => {
    if (step === "dokter" || step === "jadwal" || step === "konfirmasi") {
      setSchedLoading(true);
      getPublicDoctorSchedules()
        .then((items) => setSchedules(items || []))
        .catch(() => setSchedules([]))
        .finally(() => setSchedLoading(false));
    }
  }, [step]);

  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId);
    setTimeout(() => {
      navigate(`/dashboard/user?tab=booking&step=dokter&service=${serviceId}`);
    }, 200);
  };

  const handleConfirmReservation = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("apident:token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const payload = {
        doctor_id: activeScheduleObj?.doctorId || activeScheduleObj?.user_id || null,
        doctor_schedule_id: activeScheduleObj?.id || activeScheduleObj?._id || null,
        treatment_interest: activeServiceObj.label,
        preferred_time: selectedTime || "10:00",
        complaint: complaintNote || `Konsultasi & Perawatan ${activeServiceObj.label}`,
        date: selectedDate,
        source: "user_dashboard",
      };

      const endpoint = token ? `${API_BASE}/user/reservations` : `${API_BASE}/public/reservations`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Gagal membuat reservasi");
      }

      const data = await res.json();
      const code = data.reservation?.code || data.code || "RSV-SUCCESS";

      toast({
        title: "Reservasi Berhasil!",
        message: `Reservasi ${code} telah dibuat. Menunggu konfirmasi klinik.`,
        variant: "info",
      });

      // Switch to history view to display the newly created reservation
      setView("history");
      navigate("/dashboard/user?tab=reservasi");
    } catch (err) {
      toast({
        title: "Gagal Membuat Reservasi",
        message: "Terjadi kesalahan saat menghubungkan ke server.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBookings = bookings
    .filter((booking) => {
      if (activeTab === "all") return true;
      return booking.status === activeTab;
    })
    .filter((booking) => {
      if (!searchQuery) return true;
      return (
        (booking.service_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (booking.doctor_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (booking.notes || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  return (
    <div className="space-y-6">
      {/* Header dengan Toggle View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reservasi Layanan Klinik</h2>
          <p className="text-sm text-gray-500">Booking jadwal periksa atau lihat riwayat reservasi Anda</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1 shrink-0">
          <button
            onClick={() => {
              setView("services");
              navigate("/dashboard/user?tab=reservasi");
            }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              view === "services" && step === "layanan"
                ? "bg-white text-[#c9a24a] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Booking Baru
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              view === "history"
                ? "bg-white text-[#c9a24a] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Riwayat Reservasi
          </button>
        </div>
      </div>

      {/* Progress Steps Header */}
      {view === "services" && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-center gap-2 sm:gap-6">
            <div className={`flex items-center gap-2 ${step === "layanan" ? "text-[#c9a24a]" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step === "layanan" ? "bg-[#c9a24a] text-white" : "bg-gray-100 text-gray-500"}`}>
                1
              </div>
              <span className="text-xs sm:text-sm font-semibold">Layanan</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
            <div className={`flex items-center gap-2 ${step === "dokter" ? "text-[#c9a24a]" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step === "dokter" ? "bg-[#c9a24a] text-white" : "bg-gray-100 text-gray-500"}`}>
                2
              </div>
              <span className="text-xs sm:text-sm font-semibold">Dokter</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
            <div className={`flex items-center gap-2 ${step === "jadwal" ? "text-[#c9a24a]" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step === "jadwal" ? "bg-[#c9a24a] text-white" : "bg-gray-100 text-gray-500"}`}>
                3
              </div>
              <span className="text-xs sm:text-sm font-semibold">Jadwal</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
            <div className={`flex items-center gap-2 ${step === "konfirmasi" ? "text-[#c9a24a]" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step === "konfirmasi" ? "bg-[#c9a24a] text-white" : "bg-gray-100 text-gray-500"}`}>
                4
              </div>
              <span className="text-xs sm:text-sm font-semibold">Konfirmasi</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: PILIH LAYANAN */}
      {view === "services" && step === "layanan" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari layanan gigi (mis. Whitening, Scaling, Veneer, Ortho)..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {bookingServices
              .filter((s) => !searchQuery || s.label.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((service) => {
                const isSelected = selectedService === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => handleSelectService(service.id)}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md group flex flex-col justify-between ${
                      isSelected ? "border-[#c9a24a] bg-amber-50/30 shadow-md" : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={service.image} alt={service.label} className="w-full h-full object-contain p-2" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{service.label}</h3>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{service.description}</p>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 bg-[#c9a24a] rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-3 text-xs">
                      <span className="text-gray-400 font-medium">Spesialis & Perawatan</span>
                      <span className="text-[#c9a24a] font-bold group-hover:underline flex items-center gap-1">
                        Pilih Layanan <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* STEP 2: PILIH DOKTER SPESIALIS */}
      {view === "services" && step === "dokter" && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Pilih Dokter Spesialis</h3>
              <p className="text-xs text-gray-500">
                Layanan terpilih: <span className="font-bold text-[#c9a24a]">{activeServiceObj.label}</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard/user?tab=reservasi")}
              className="rounded-xl border-gray-200 text-xs text-gray-700"
            >
              Ubah Layanan
            </Button>
          </div>

          {/* Filter & Search Bar Header Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm space-y-3.5">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Cari nama dokter atau lokasi klinik..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="pl-10 h-11 text-xs rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
                />
              </div>

              {/* Date Filter Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600 shrink-0 flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-[#c9a24a]" />
                  Filter Tanggal:
                </span>
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={doctorFilterDate}
                  onChange={(e) => setDoctorFilterDate(e.target.value)}
                  className="w-40 h-11 text-xs font-semibold rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white cursor-pointer"
                />
                {doctorFilterDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDoctorFilterDate("")}
                    className="text-xs text-rose-600 hover:bg-rose-50 h-11 px-3 rounded-xl"
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Date Shortcut Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pintas Tanggal:</span>
              <button
                type="button"
                onClick={() => setDoctorFilterDate("")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  !doctorFilterDate
                    ? "bg-[#c9a24a] text-white border-[#c9a24a] shadow-xs"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                Semua Tanggal
              </button>
              {[
                { label: "Hari Ini", days: 0 },
                { label: "Besok", days: 1 },
                { label: "Lusa", days: 2 },
              ].map((chip) => {
                const dateStr = (() => {
                  const d = new Date();
                  d.setDate(d.getDate() + chip.days);
                  return d.toISOString().split("T")[0];
                })();
                const isSelected = doctorFilterDate === dateStr;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setDoctorFilterDate(dateStr)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? "bg-[#c9a24a] text-white border-[#c9a24a] shadow-xs"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {chip.label} ({dateStr})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Doctor List */}
          {schedLoading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Loader2 className="w-8 h-8 text-[#c9a24a] animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Memuat daftar dokter & jadwal publik...</p>
            </div>
          ) : filteredDoctorSchedules.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 space-y-3 p-6">
              <Stethoscope className="w-12 h-12 text-[#c9a24a] mx-auto opacity-70" />
              <h4 className="font-bold text-gray-900">Jadwal Dokter Tidak Ditemukan</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                {doctorFilterDate
                  ? `Tidak ada dokter spesialis yang berpraktik pada tanggal ${doctorFilterDate}. Silakan pilih tanggal lain atau tampilkan semua jadwal.`
                  : "Tidak ada jadwal dokter yang cocok dengan pencarian Anda."}
              </p>
              <Button
                onClick={() => {
                  setDoctorFilterDate("");
                  setDoctorSearch("");
                }}
                className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white rounded-xl text-xs font-semibold px-6 h-10 cursor-pointer"
              >
                Tampilkan Semua Dokter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDoctorSchedules.map((s: any) => (
                <div key={s.id || s._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-6 h-6 text-[#c9a24a]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-gray-900 leading-tight">{s.doctorName || "Dr. Aris S.Sp.KG"}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#c9a24a]" />
                        {s.location || "Aesthetic Pondok Indah Main Branch"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-gray-500">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#c9a24a]" />
                        Hari & Tanggal:
                      </span>
                      <span className="font-semibold text-gray-900">{s.displayDate || s.date || "Setiap Hari"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3.5 h-3.5 text-[#c9a24a]" />
                        Jam Praktik:
                      </span>
                      <span className="font-semibold text-gray-900">{s.timeRange || "09:00 - 17:00"}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() =>
                      navigate(
                        `/dashboard/user?tab=booking&step=jadwal&service=${serviceParam}&schedule=${s.id || s._id}${doctorFilterDate ? `&date=${doctorFilterDate}` : ""}`
                      )
                    }
                    className="w-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white rounded-xl text-xs font-semibold h-10 shadow-sm cursor-pointer"
                  >
                    Pilih Dokter Ini & Lanjut Jadwal
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: PILIH JADWAL & WAKTU (Calendar Date Picker & Time Picker Dropdown) */}
      {view === "services" && step === "jadwal" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Pilih Tanggal & Jam Periksa</h3>
              <p className="text-xs text-gray-500">
                Layanan: <span className="font-bold text-[#c9a24a]">{activeServiceObj.label}</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dashboard/user?tab=booking&step=dokter&service=${serviceParam}`)}
              className="rounded-xl border-gray-200 text-xs text-gray-700"
            >
              Kembali Ke Dokter
            </Button>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl space-y-6">
            {/* Synchronized Doctor Schedule Status Header */}
            <div className={`p-4.5 rounded-2xl border transition-all ${
              scheduleStatus.available
                ? "bg-amber-50/60 border-amber-200/80"
                : "bg-rose-50/80 border-rose-200/90"
            }`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 shadow-xs ${
                    scheduleStatus.available ? "bg-[#c9a24a] text-white" : "bg-rose-500 text-white"
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      Dokter: <span className="text-[#c9a24a]">{activeScheduleObj?.doctorName || "Dokter Klinik"}</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span>📅 Praktik: <strong className="text-gray-800">{activeScheduleObj?.displayDate || activeScheduleObj?.date || "Setiap Hari"}</strong></span>
                      <span>•</span>
                      <span>⏰ Jam: <strong className="text-gray-800">{activeScheduleObj?.timeRange || "09:00 - 17:00 WIB"}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Status Indicator Badge */}
                <div>
                  {scheduleStatus.available ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Jadwal Dokter Tersedia
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300/60">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      Tidak Ada Praktik
                    </span>
                  )}
                </div>
              </div>

              {/* Warning Notice when Out of Schedule */}
              {!scheduleStatus.available && (
                <div className="mt-3 pt-3 border-t border-rose-200/80 text-xs font-semibold text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{scheduleStatus.message}</span>
                </div>
              )}
            </div>

            {/* 1. Pilih Tanggal (Calendar Picker) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#c9a24a]" />
                Pilih Tanggal Periksa *
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c9a24a] pointer-events-none" />
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                  className="pl-12 pr-4 h-13 text-sm font-semibold rounded-2xl border-gray-200 bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:border-[#c9a24a] focus:ring-2 focus:ring-[#c9a24a]/20 cursor-pointer shadow-xs"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                Pilih tanggal periksa yang sesuai dengan hari praktik dokter.
              </p>
            </div>

            {/* 2. Pilih Jam (Manual Time Picker) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#c9a24a]" />
                  Pilih Jam Periksa (Time Picker) *
                </label>
                {selectedTime && (
                  <span className={`text-[11px] font-bold px-3 py-0.5 rounded-full border ${
                    scheduleStatus.available
                      ? "text-[#c9a24a] bg-amber-50 border-amber-200/60"
                      : "text-rose-700 bg-rose-50 border-rose-200"
                  }`}>
                    Terpilih: {selectedTime} WIB
                  </span>
                )}
              </div>

              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#c9a24a] pointer-events-none" />
                <Input
                  type="time"
                  value={selectedTime || "10:00"}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                  className={`pl-12 pr-4 h-13 text-sm font-bold rounded-2xl bg-gray-50/50 hover:bg-gray-50 focus:bg-white cursor-pointer shadow-xs ${
                    scheduleStatus.available
                      ? "border-gray-200 focus:border-[#c9a24a] focus:ring-2 focus:ring-[#c9a24a]/20 text-gray-800"
                      : "border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                  }`}
                />
              </div>
              <p className="text-[11px] text-gray-400">
                Jam periksa harus berada di dalam jam praktik dokter ({activeScheduleObj?.timeRange || "09:00 - 17:00 WIB"}).
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              {!scheduleStatus.available ? (
                <span className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Pilih tanggal & jam yang sesuai jadwal dokter untuk melanjutkan
                </span>
              ) : (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Jadwal telah terverifikasi dengan dokter
                </span>
              )}

              <Button
                disabled={!scheduleStatus.available}
                onClick={() =>
                  navigate(
                    `/dashboard/user?tab=booking&step=konfirmasi&service=${serviceParam}&schedule=${scheduleId}&date=${selectedDate}&time=${selectedTime || "10:00"}`
                  )
                }
                className={`w-full sm:w-auto font-bold rounded-2xl px-8 h-12 text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                  scheduleStatus.available
                    ? "bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white shadow-[#c9a24a]/20 cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                }`}
              >
                <span>Lanjut Ke Konfirmasi</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: KONFIRMASI & KIRIM RESERVASI (API POST /api/user/reservations) */}
      {view === "services" && step === "konfirmasi" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Konfirmasi Reservasi</h3>
              <p className="text-xs text-gray-500">Periksa ringkasan janji temu Anda sebelum dikirimkan ke klinik</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(`/dashboard/user?tab=booking&step=jadwal&service=${serviceParam}&schedule=${scheduleId}`)
              }
              className="rounded-xl border-gray-200 text-xs text-gray-700"
            >
              Ubah Tanggal / Jam
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#c9a24a]" />
                Ringkasan Janji Temu
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Layanan Terpilih</span>
                  <span className="font-bold text-gray-900 text-right">{activeServiceObj.label}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Dokter Spesialis</span>
                  <span className="font-bold text-gray-900 text-right">
                    {activeScheduleObj?.doctorName || "Dr. Aris S.Sp.KG (Spesialis Konservasi Gigi)"}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Tanggal Periksa</span>
                  <span className="font-bold text-gray-900 text-right">
                    {selectedDate
                      ? new Date(selectedDate).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "2026-08-02"}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Jam Praktik</span>
                  <span className="font-bold text-[#c9a24a] text-right">{selectedTime || "10:00"} WIB</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Lokasi Klinik</span>
                  <span className="font-bold text-gray-900 text-right">Aesthetic Pondok Indah Clinic</span>
                </div>
              </div>
            </div>

            {/* Form Input Catatan & Konfirmasi */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#c9a24a]" />
                Catatan & Keluhan Pasien
              </h4>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Keluhan Gigi / Catatan Tambahan (Opsional)</label>
                  <textarea
                    rows={4}
                    value={complaintNote}
                    onChange={(e) => setComplaintNote(e.target.value)}
                    placeholder="Tuliskan keluhan yang Anda rasakan, misal: gigi geraham belakang terasa ngilu saat minum dingin..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#c9a24a] text-gray-900"
                  />
                </div>

                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
                  <span className="font-bold">Info:</span> Data reservasi akan langsung tersimpan di sistem klinik. Staf admin kami akan mengonfirmasi kedatangan Anda.
                </div>

                <Button
                  onClick={() => setShowTermsModal(true)}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-xl h-11 text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Reservasi...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Konfirmasi & Kirim Reservasi</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW RIWAYAT RESERVASI */}
      {view === "history" && (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode atau riwayat reservasi..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
              />
            </div>
            <button className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#c9a24a] text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Loader2 className="w-8 h-8 text-[#c9a24a] animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500">Memuat riwayat reservasi...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                <FileText className="w-12 h-12 text-[#c9a24a] mx-auto opacity-70" />
                <h4 className="font-bold text-gray-900 text-sm">Belum Ada Riwayat Reservasi</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Riwayat booking jadwal Anda akan tampil di sini setelah reservasi dikirimkan.
                </p>
                <Button
                  onClick={() => {
                    setView("services");
                    navigate("/dashboard/user?tab=reservasi");
                  }}
                  className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white rounded-xl text-xs font-semibold px-6 h-10"
                >
                  Booking Sekarang
                </Button>
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const status = statusConfig[booking.status] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-400">{booking.code || `RSV-${booking.id}`}</span>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-50 border border-amber-200/60 rounded-xl flex items-center justify-center shrink-0">
                        <Stethoscope className="w-6 h-6 text-[#c9a24a]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-gray-900 mb-1">
                          {booking.service_name || "Reservasi Periksa Gigi"}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">{booking.notes || "Pemeriksaan Kesehatan & Estetik Gigi"}</p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5 text-[#c9a24a]" />
                            <span>
                              {booking.scheduled_date
                                ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(booking.scheduled_date))
                                : "Menunggu jadwal"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#c9a24a]" />
                            <span>{booking.scheduled_time || "10:00 WIB"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Syarat & Ketentuan Modal Dialog */}
      <GuestBookingTermsDialog
        open={showTermsModal}
        onOpenChange={setShowTermsModal}
        terms={bookingTerms}
        onConfirm={handleConfirmReservation}
      />
    </div>
  );
}
