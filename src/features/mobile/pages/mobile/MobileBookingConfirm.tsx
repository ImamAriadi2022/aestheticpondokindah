import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import NewMobileDashboardLayout from "@/components/dashboard/NewMobileDashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { 
  CalendarDays,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Check,
  ArrowRight,
  Shield,
  ChevronRight,
  Copy,
  Share2
} from "lucide-react";

const serviceNames: Record<string, string> = {
  konsultasi: "Konsultasi & Pemeriksaan",
  scaling: "Scaling / Pembersihan Karang Gigi",
  tambal: "Tambal Gigi",
  behel: "Behel (Orthodonti)",
  pembersihan: "Pembersihan Gigi",
  cabut: "Cabut Gigi",
};

const servicePrices: Record<string, string> = {
  konsultasi: "Rp 150.000",
  scaling: "Rp 300.000",
  tambal: "Rp 250.000",
  behel: "Rp 15.000.000",
  pembersihan: "Rp 200.000",
  cabut: "Rp 350.000",
};

const doctorNames: Record<string, string> = {
  "1": "drg. Jenny Wilson",
  "2": "drg. Alana Rusner",
  "3": "drg. Arvin Primera",
  "4": "drg. Sina Anrelia",
};

const doctorImages: Record<string, string | null> = {
  "1": null,
  "2": null,
  "3": null,
  "4": null,
};

export default function MobileBookingConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("service") || "konsultasi";
  const doctorId = searchParams.get("doctor") || "1";
  const date = searchParams.get("date") || "2026-05-26";
  const time = searchParams.get("time") || "09:00";
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [agreed, setAgreed] = useState(false);

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

  const bookingCode = "BK-" + Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleConfirm = async () => {
    if (!agreed) {
      toast({ 
        title: "Syarat & Ketentuan", 
        message: "Harap setujui syarat dan ketentuan terlebih dahulu",
        variant: "error"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Save to localStorage history
    try {
      const existing = JSON.parse(localStorage.getItem('apident:bookings') || '[]');
      const record = {
        id: bookingCode,
        service: serviceNames[serviceId] || serviceId,
        doctor: doctorNames[doctorId] || "Dokter",
        date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: `${time} - ${parseInt(time.split(':')[0]) + 1}:00`,
        status: 'upcoming',
        price: '-',
      };
      localStorage.setItem('apident:bookings', JSON.stringify([record, ...existing].slice(0, 50)));
    } catch {}
    
    setIsSubmitting(false);
    navigate(`/dashboard/user?tab=booking&step=sukses&code=${bookingCode}&service=${serviceId}&doctor=${doctorId}&date=${date}&time=${time}`);
  };

  return (
    <NewMobileDashboardLayout role="user" hideBottomNav>
      {/* Progress Steps */}
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded-full bg-[#c9a24a] text-white flex items-center justify-center text-sm font-bold">
              4
            </div>
            <span className="text-xs font-medium text-[#c9a24a]">Konfirmasi</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-32">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Konfirmasi Booking</h1>
          <p className="text-sm text-gray-500">
            Pastikan detail booking Anda sudah benar
          </p>
        </div>

        {/* Doctor Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
              {doctorImages[doctorId] ? (
                <img 
                  src={doctorImages[doctorId]!} 
                  alt={doctorNames[doctorId]}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <Stethoscope className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{doctorNames[doctorId]}</h3>
              <p className="text-xs text-gray-500">Dokter Gigi Spesialis</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">{formatDate(date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-600">{time} - {parseInt(time.split(':')[0]) + 1}:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Detail Layanan</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Layanan</span>
              <span className="text-sm font-medium text-gray-900">{serviceNames[serviceId]}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-600">Lokasi</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">Aesthetic Pondok Indah</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Harga</span>
              <span className="text-sm font-semibold text-[#c9a24a]">{servicePrices[serviceId]}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Catatan (Opsional)</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tulis catatan untuk dokter..."
            className="w-full h-24 p-3 bg-gray-50 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/30 resize-none"
          />
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => setAgreed(!agreed)}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
              agreed 
                ? "bg-[#c9a24a] border-[#c9a24a]" 
                : "border-gray-300"
            }`}
          >
            {agreed && <Check className="w-3 h-3 text-white" />}
          </button>
          <p className="text-xs text-gray-600 leading-relaxed">
            Saya menyetujui{" "}
            <span className="text-[#c9a24a]">Syarat dan Ketentuan</span>
            {" "}serta{" "}
            <span className="text-[#c9a24a]">Kebijakan Privasi</span>
            {" "}yang berlaku. Booking dapat dibatalkan maksimal 24 jam sebelum jadwal.
          </p>
        </div>

        {/* Safety Badge */}
        <div className="flex items-center justify-center gap-2 py-3">
          <Shield className="w-4 h-4 text-green-500" />
          <span className="text-xs text-gray-500">Booking Anda terlindungi dan aman</span>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 max-w-lg mx-auto z-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs text-gray-500">Total Pembayaran</span>
            <p className="text-lg font-bold text-[#c9a24a]">{servicePrices[serviceId]}</p>
          </div>
        </div>
        <Button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold text-lg rounded-xl shadow-lg shadow-[#c9a24a]/20 disabled:opacity-50"
        >
          {isSubmitting ? "Memproses..." : "Konfirmasi Booking"}
          {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>
      </div>
    </NewMobileDashboardLayout>
  );
}
