import { useState, useEffect } from "react";
import { API_BASE } from "@/core/api/apiConfig";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  Smartphone,
  Download,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  QrCode,
  ExternalLink,
  Laptop,
} from "lucide-react";
import { PwaInstallButton } from "@/core/components/PwaInstallButton";

export default function DesktopUserDownload() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback default app details if API has not uploaded an APK yet
  const defaultApps = [
    {
      id: "app-1",
      title: "Aesthetic Dental Mobile App (Android)",
      version: "v2.4.0",
      platform: "android",
      description: "Aplikasi mobile resmi Aesthetic Pondok Indah Dental Clinic. Nikmati kemudahan booking jadwal periksa, rekam medis digital, odontogram, dan konsultasi cepat via smartphone Anda.",
      file_size_formatted: "38.5 MB",
      download_link: "#",
      apk_url: "/downloads/aesthetic-dental.apk",
      is_development: false,
    },
  ];

  useEffect(() => {
    fetch(`${API_BASE}/public/download-apps`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setApps(data);
        } else {
          setApps(defaultApps);
        }
        setLoading(false);
      })
      .catch(() => {
        setApps(defaultApps);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a1612] via-[#2a2319] to-[#1a1612] p-8 text-white border border-[#c9a24a]/30 shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#c9a24a]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a24a]/20 text-[#e8c547] text-xs font-semibold border border-[#c9a24a]/30">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Application</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Unduh Aplikasi Mobile Resmi
            </h1>
            <p className="text-sm text-[#d4c5b0] max-w-xl">
              Akses cepat layanan kesehatan gigi, pengingat janji periksa, serta rekam medis dan odontogram elektronik langsung dari perangkat genggam Anda.
            </p>
          </div>

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#e8c547] to-[#c9a24a] p-0.5 shadow-lg shrink-0">
            <div className="w-full h-full bg-[#1a1612] rounded-[14px] flex items-center justify-center text-[#e8c547]">
              <Download className="w-9 h-9" />
            </div>
          </div>
          <PwaInstallButton className="bg-[#e8c547] hover:bg-[#d4b33f] text-[#2c2416] rounded-xl text-xs font-bold" />
        </div>
      </div>

      {/* Main Grid: Download Cards + App Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Download Cards (Span 2) */}
        <div className="md:col-span-2 space-y-5">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#c9a24a]" />
            Pilih Versi Aplikasi
          </h3>

          {loading ? (
            <div className="text-center py-12 text-gray-500 font-medium">Memuat info aplikasi...</div>
          ) : (
            apps.map((app, idx) => (
              <Card
                key={app.id || idx}
                className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white hover:shadow-md transition-all"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#c9a24a] shrink-0">
                        {app.platform === "ios" ? (
                          <Smartphone className="w-6 h-6" />
                        ) : (
                          <Download className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{app.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold text-[#c9a24a] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                            {app.version || "v2.4.0"}
                          </span>
                          {app.file_size_formatted && (
                            <span className="text-xs text-gray-500">• {app.file_size_formatted}</span>
                          )}
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Aman & Terverifikasi
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {app.description}
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    {app.apk_url && (
                      <a
                        href={app.apk_url}
                        download
                        className="w-full sm:w-auto"
                      >
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-xl px-6 h-11 text-xs shadow-md transition-all flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" />
                          Unduh Berkas APK Langsung
                        </Button>
                      </a>
                    )}

                    {app.download_link && app.download_link !== "#" && (
                      <a
                        href={app.download_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto"
                      >
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto rounded-xl px-5 h-11 text-xs font-semibold border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Buka PlayStore / AppStore
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Desktop Web Access Info */}
          <Card className="rounded-2xl border-gray-100 shadow-sm p-6 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a] shrink-0">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 text-sm">Akses Web Progressive App (PWA)</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Anda juga dapat menginstal web ini sebagai aplikasi desktop/mobile dengan mengeklik tombol *"Tambahkan ke Layar Utama"* pada browser Chrome atau Safari Anda.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Features & QR Code */}
        <div className="space-y-5">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#c9a24a]" />
            Fitur Utama Aplikasi
          </h3>

          <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#c9a24a] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">Notifikasi Jadwal Real-Time</h5>
                    <p className="text-[11px] text-gray-500">Pengingat otomatis H-1 jadwal periksa perawat & dokter.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#c9a24a] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">Rekam Medis & Odontogram</h5>
                    <p className="text-[11px] text-gray-500">Pantau catatan kondisi gigi dan riwayat medis 24/7.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#c9a24a] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">Fast Track Booking</h5>
                    <p className="text-[11px] text-gray-500">Pilih dokter & jam periksa tanpa antre di lokasi.</p>
                  </div>
                </div>
              </div>

              {/* QR Code Box */}
              <div className="pt-4 border-t border-gray-100 text-center space-y-2 bg-gray-50 p-4 rounded-xl">
                <QrCode className="w-16 h-16 text-gray-800 mx-auto" />
                <p className="text-xs font-bold text-gray-800">Pindai QR Untuk Unduh</p>
                <p className="text-[10px] text-gray-500">Buka kamera ponsel Anda untuk mengunduh aplikasi otomatis.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
