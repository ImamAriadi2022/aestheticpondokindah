import { useNavigate, useSearchParams } from "react-router";
import NewMobileDashboardLayout from "@/components/dashboard/NewMobileDashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  CalendarDays,
  Clock,
  Stethoscope,
  MapPin,
  Check,
  Copy,
  Share2,
  Home,
  FileText,
  CalendarCheck
} from "lucide-react";
import { toast } from "@/components/ui/toast";

const serviceNames: Record<string, string> = {
  konsultasi: "Konsultasi & Pemeriksaan",
  scaling: "Scaling / Pembersihan Karang Gigi",
  tambal: "Tambal Gigi",
  behel: "Behel (Orthodonti)",
  pembersihan: "Pembersihan Gigi",
  cabut: "Cabut Gigi",
};

const doctorNames: Record<string, string> = {
  "1": "drg. Jenny Wilson",
  "2": "drg. Alana Rusner",
  "3": "drg. Arvin Primera",
  "4": "drg. Sina Anrelia",
};

export default function MobileBookingSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingCode = searchParams.get("code") || "BK-XXXXXX";
  const serviceId = searchParams.get("service") || "konsultasi";
  const doctorId = searchParams.get("doctor") || "1";
  const date = searchParams.get("date") || "2026-05-26";
  const time = searchParams.get("time") || "09:00";
  const serviceNameOverride = searchParams.get("serviceName") || "";
  const doctorNameOverride = searchParams.get("doctorName") || "";
  const dateTextOverride = searchParams.get("dateText") || "";
  const timeTextOverride = searchParams.get("timeText") || "";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('id-ID', options);
  };

  const copyBookingCode = () => {
    navigator.clipboard.writeText(bookingCode);
    toast({ title: "Berhasil", message: "Kode booking disalin ke clipboard", variant: "success" });
  };

  const shareBooking = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Booking Aesthetic Pondok Indah',
          text: `Booking saya di Aesthetic Pondok Indah dengan kode ${bookingCode}. ${serviceNames[serviceId]} dengan ${doctorNames[doctorId]} pada ${formatDate(date)} pukul ${time}.`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share or share failed silently
      }
    } else {
      toast({ title: "Info", message: "Fitur share tidak tersedia di browser ini" });
    }
  };

  return (
    <NewMobileDashboardLayout role="user" hideBottomNav hideHeader>
      <div className="min-h-screen flex flex-col">
        {/* Success Animation Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#c9a24a]/10 to-white">
          {/* Success Icon */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-[#c9a24a] to-[#a8843a] rounded-full flex items-center justify-center shadow-xl shadow-[#c9a24a]/30">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
            {/* Pulse rings */}
            <div className="absolute inset-0 w-24 h-24 bg-[#c9a24a] rounded-full animate-ping opacity-20" />
          </div>

          {/* Success Text */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Booking Berhasil!
          </h1>
          <p className="text-sm text-gray-500 text-center max-w-xs mb-6">
            Janji temu Anda telah dikonfirmasi. Tunjukkan kode booking saat datang ke klinik.
          </p>

          {/* Booking Code Card */}
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-lg border border-gray-100 mb-6">
            <p className="text-xs text-gray-500 text-center mb-2">Kode Booking</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-bold text-gray-900 tracking-wider">
                {bookingCode}
              </span>
              <button
                onClick={copyBookingCode}
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Booking Details */}
          <div className="w-full max-w-xs bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Dokter</p>
                  <p className="text-sm font-semibold text-gray-900">{doctorNameOverride || doctorNames[doctorId]}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Layanan</p>
                  <p className="text-sm font-semibold text-gray-900">{serviceNameOverride || serviceNames[serviceId]}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tanggal</p>
                  <p className="text-sm font-semibold text-gray-900">{dateTextOverride || formatDate(date)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Waktu</p>
                  <p className="text-sm font-semibold text-gray-900">{timeTextOverride || `${time} - ${parseInt(time.split(':')[0]) + 1}:00`}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lokasi</p>
                  <p className="text-sm font-semibold text-gray-900">Aesthetic Pondok Indah</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 space-y-3 bg-white border-t border-gray-100">
          <Button
            onClick={() => navigate("/dashboard/user")}
            className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold text-lg rounded-xl shadow-lg shadow-[#c9a24a]/20"
          >
            <Home className="w-5 h-5 mr-2" />
            Kembali ke Beranda
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/user?tab=riwayat")}
              className="flex-1 h-12 border-gray-200 text-gray-700 rounded-xl"
            >
              <CalendarCheck className="w-4 h-4 mr-2" />
              Lihat Jadwal
            </Button>
            
            <Button
              variant="outline"
              onClick={shareBooking}
              className="flex-1 h-12 border-gray-200 text-gray-700 rounded-xl"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Bagikan
            </Button>
          </div>
          
          <button
            onClick={() => navigate("/dashboard/user?tab=reservasi")}
            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Lihat Detail Booking
          </button>
        </div>
      </div>
    </NewMobileDashboardLayout>
  );
}
