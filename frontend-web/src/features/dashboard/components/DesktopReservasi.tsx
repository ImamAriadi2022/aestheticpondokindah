import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
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
  Image as ImageIcon
} from "lucide-react";
import { services as allServices } from "@/pages/Services";
import { getPublicDoctorSchedules } from "@/features/doctors/services/publicDoctorScheduleApi";
import { apiClient } from "@/lib/apiClient";

// Map judul layanan -> ikon bernuansa; fallback jika tidak ada mapping
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
  pending: { label: "Menunggu Konfirmasi", color: "bg-amber-100 text-amber-700", icon: Clock4 },
  confirmed: { label: "Dikonfirmasi", color: "bg-blue-100 text-blue-700", icon: Clock4 },
  upcoming: { label: "Akan Datang", color: "bg-blue-100 text-blue-700", icon: Clock4 },
  completed: { label: "Selesai", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-700", icon: AlertCircle },
};

export default function DesktopReservasi() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<"services" | "history">("services");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const step = searchParams.get("step") || "layanan";
  const [schedules, setSchedules] = useState<any[]>([]);
  const [schedLoading, setSchedLoading] = useState(false);
  const scheduleId = searchParams.get("schedule") || "";
  const [selectedDate, setSelectedDate] = useState<string>("2026-05-26");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Transform services from Services page to booking cards
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

  useEffect(() => {
    if (view === "history") {
      setLoading(true);
      apiClient.get<{ reservations: any[] }>("/user/reservations")
        .then((response) => setBookings(response.reservations || []))
        .catch(() => setBookings([]))
        .finally(() => setLoading(false));
    }
  }, [view, activeTab]);

  // Load public schedules when in doctor step
  useEffect(() => {
    if (step !== "dokter") return;
    setSchedLoading(true);
    getPublicDoctorSchedules()
      .then((items) => setSchedules(items || []))
      .catch(() => setSchedules([]))
      .finally(() => setSchedLoading(false));
  }, [step]);

  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId);
    setTimeout(() => {
      navigate(`/dashboard/user?tab=booking&step=dokter&service=${serviceId}`);
    }, 300);
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === "all") return true;
    return booking.status === activeTab;
  }).filter(booking => {
    if (!searchQuery) return true;
    return (booking.service_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
           (booking.doctor_name || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header dengan Toggle View */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#4A3F35]">Reservasi</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Booking layanan atau lihat riwayat reservasi Anda</p>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setView("services")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "services" ? "bg-white text-[#C9A24A] shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Booking Baru
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === "history" ? "bg-white text-[#C9A24A] shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Riwayat
          </button>
        </div>
      </div>

      {step === "dokter" ? (
        <>
          {/* Header Dokter */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#4A3F35]">Pilih Dokter</h2>
              <p className="text-sm text-[#8A7B6B] mt-1">Pilih dokter dan slot waktu yang tersedia</p>
            </div>
          </div>

          {/* List Dokter & Slot */}
          {schedLoading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">Memuat jadwal...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">Belum ada jadwal publik.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {schedules.map((s: any) => (
                <div key={s.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#FDF8F0] border border-[#F2E6CC] flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5 text-[#C9A24A]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 leading-tight">{s.doctorName || "Dokter"}</h3>
                      <p className="text-xs text-gray-500">{s.location}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          <span>{s.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{s.timeRange}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/dashboard/user?tab=booking&step=jadwal&schedule=${s.id}`)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#c9a24a] text-white hover:opacity-90"
                        >
                          Pilih Slot
                        </button>
                        <span className="text-[11px] text-gray-500">{s.slotsLeft} slot tersisa</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : step === "jadwal" ? (
        <>
          {/* Header Jadwal */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#4A3F35]">Pilih Jadwal</h2>
              <p className="text-sm text-[#8A7B6B] mt-1">Pilih tanggal dan waktu yang tersedia</p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Tanggal</h3>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { date: 26, day: "Sen", fullDate: "2026-05-26" },
                { date: 27, day: "Sel", fullDate: "2026-05-27" },
                { date: 28, day: "Rab", fullDate: "2026-05-28" },
                { date: 29, day: "Kam", fullDate: "2026-05-29" },
                { date: 30, day: "Jum", fullDate: "2026-05-30" },
                { date: 31, day: "Sab", fullDate: "2026-05-31" },
              ].map((d) => {
                const isSelected = selectedDate === d.fullDate;
                return (
                  <button
                    key={d.fullDate}
                    onClick={() => setSelectedDate(d.fullDate)}
                    className={`flex flex-col items-center w-[72px] p-3 rounded-xl transition-all ${
                      isSelected ? "bg-[#c9a24a] text-white shadow" : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className={`text-xs mb-1 ${isSelected ? "text-white/80" : "text-gray-500"}`}>{d.day}</span>
                    <span className={`text-lg font-bold ${isSelected ? "text-white" : "text-gray-900"}`}>{d.date}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-900">Pilih Waktu</h3>
            </div>
            <div className="grid grid-cols-4 xl:grid-cols-6 gap-2">
              {[
                { time: "09:00", available: true },
                { time: "09:30", available: false },
                { time: "10:00", available: true },
                { time: "10:30", available: true },
                { time: "11:00", available: false },
                { time: "13:00", available: true },
                { time: "13:30", available: true },
                { time: "14:00", available: false },
                { time: "14:30", available: true },
                { time: "15:00", available: true },
                { time: "15:30", available: false },
                { time: "16:00", available: true },
              ].map((slot) => {
                const isSelected = selectedTime === slot.time;
                return (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                      !slot.available
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : isSelected
                        ? "bg-[#c9a24a] text-white shadow"
                        : "bg-white border border-gray-200 text-gray-700 hover:border-[#c9a24a]"
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continue */}
          <div className="flex justify-end">
            <Button
              onClick={() => selectedTime && navigate(`/dashboard/user?tab=booking&step=konfirmasi&schedule=${scheduleId}&date=${selectedDate}&time=${selectedTime}`)}
              disabled={!selectedTime}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white disabled:opacity-50"
            >
              Lanjutkan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      ) : view === "services" ? (
        <>
          {/* Progress Steps */}
          <div className="bg-white rounded-2xl p-6 border border-[#C9A24A]/10">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#c9a24a] text-white flex items-center justify-center font-bold">1</div>
                <span className="text-sm font-medium text-[#c9a24a]">Layanan</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">2</div>
                <span className="text-sm font-medium text-gray-400">Dokter</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">3</div>
                <span className="text-sm font-medium text-gray-400">Jadwal</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300" />
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">4</div>
                <span className="text-sm font-medium text-gray-400">Konfirmasi</span>
              </div>
            </div>
          </div>

          {/* Pencarian Layanan */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari layanan (mis. Whitening, Implants)"
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
            />
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {bookingServices
              .filter((s) =>
                !searchQuery || s.label.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((service, i) => {
              const Icon = service.icon;
              const isSelected = selectedService === service.id;
              
              return (
                <div
                  key={service.id}
                  onClick={() => handleSelectService(service.id)}
                  className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg group min-h-[132px] ${
                    isSelected 
                      ? "border-[#c9a24a] bg-[#c9a24a]/5 shadow-md" 
                      : "border-gray-100 bg-white hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Gambar kategori layanan seperti di halaman Layanan */}
                    <div className="w-16 h-16 rounded-xl bg-[#FFF8F0] border border-[#F2E6CC] flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={service.image} alt={service.label} className="w-full h-full object-contain p-2" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">{service.label}</h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{service.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <ImageIcon className="w-4 h-4" />
                          <span>Preview</span>
                        </div>
                        <span className="text-[#c9a24a] font-semibold group-hover:underline">Pilih Layanan</span>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="w-6 h-6 bg-[#c9a24a] rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Search & Filter */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari riwayat booking..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
              />
            </div>
            <button className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-50">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#c9a24a] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-3xl font-bold text-[#c9a24a]">{bookings.length}</p>
              <p className="text-sm text-gray-500">Total Booking</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-3xl font-bold text-blue-600">
                {bookings.filter(b => b.status === "confirmed" || b.status === "pending").length}
              </p>
              <p className="text-sm text-gray-500">Mendatang</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-3xl font-bold text-green-600">
                {bookings.filter(b => b.status === "completed").length}
              </p>
              <p className="text-sm text-gray-500">Selesai</p>
            </div>
          </div>

          {/* Booking List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500">Memuat riwayat...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium mb-1">Belum ada riwayat</p>
                <p className="text-gray-500 text-sm mb-4">
                  Riwayat booking Anda akan muncul di sini
                </p>
                <Button
                  onClick={() => setView("services")}
                  className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white rounded-xl"
                >
                  Booking Sekarang
                </Button>
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const status = statusConfig[booking.status] || statusConfig.upcoming;
                const StatusIcon = status.icon;
                
                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400 font-medium">{booking.id}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {booking.service_name || "Reservasi"}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3">{booking.doctor_name || "Dokter akan dikonfirmasi"}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4 text-gray-400" />
                            <span>{booking.scheduled_date ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(booking.scheduled_date)) : "Menunggu jadwal"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{booking.scheduled_time || "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-base font-semibold text-[#c9a24a]">
                        {booking.price ? `Rp ${Number(booking.price).toLocaleString("id-ID")}` : "Menunggu konfirmasi"}
                      </span>
                      <button className="flex items-center gap-1 text-sm text-[#c9a24a] font-medium hover:underline">
                        Lihat Detail
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
