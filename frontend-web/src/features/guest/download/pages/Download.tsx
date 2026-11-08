import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Download, ShieldCheck, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

const OFFICIAL_APK_URL = "https://github.com/osaespi-os/aestheticpondokindah/releases/download/v1.1.0/aespi.apk";

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
      <Header />
      
      <main className="flex-1 pb-24 lg:pb-16 pt-8">
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Header Section */}
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold/10 text-brand-gold text-xs sm:text-sm font-semibold mb-4 tracking-wide border border-brand-gold/20">
                <Sparkles className="w-3.5 h-3.5" />
                Aesthetic Pondok Indah Mobile
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-charcoal tracking-tight mb-4">
                Unduh Aplikasi Resmi
              </h1>
              <p className="text-base sm:text-lg text-brand-warm-gray leading-relaxed">
                Nikmati kemudahan reservasi dokter estetika, pantau jadwal konsultasi, dan akses riwayat perawatan langsung dalam genggaman Anda.
              </p>
            </div>

            {/* Premium Download Card */}
            <div className="relative mx-auto max-w-xl bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-brand-gold/5 border border-brand-gold/20 backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-gold/10 to-transparent rounded-bl-full pointer-events-none" />

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-gold/20 to-brand-gold/5 border border-brand-gold/30 flex items-center justify-center mb-6 shadow-inner">
                  <Smartphone className="w-10 h-10 text-brand-gold" />
                </div>

                <h2 className="text-2xl font-bold text-brand-charcoal mb-2">
                  Aespi Mobile Android
                </h2>

                <div className="flex items-center gap-2 mb-6 text-xs text-brand-warm-gray">
                  <span className="bg-gray-100 px-3 py-1 rounded-full font-medium text-gray-700">Versi 1.1.0</span>
                  <span>•</span>
                  <span>72.62 MB</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified APK
                  </span>
                </div>

                <p className="text-sm text-brand-warm-gray max-w-sm mb-8">
                  File APK resmi terenkripsi aman, bebas malware, dan siap dipasang langsung di perangkat Android Anda.
                </p>

                {/* Single Exclusive Download Button */}
                <a
                  href={OFFICIAL_APK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full sm:w-80 h-14 bg-gradient-gold hover:opacity-95 text-white font-bold rounded-2xl shadow-lg shadow-brand-gold/25 transition-all duration-200 text-base flex items-center justify-center gap-3 active:scale-[0.98]">
                    <Download className="w-5 h-5" />
                    Download Aplikasi (APK)
                  </Button>
                </a>

                <div className="mt-8 pt-6 border-t border-gray-100 w-full flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Kompatibel Android 8.0+</span>
                  </div>
                  <div className="hidden sm:block text-gray-300">•</div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Pembaruan Otomatis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Guide */}
            <div className="mt-12 text-center text-xs text-brand-warm-gray max-w-md mx-auto">
              Perlu bantuan pemasangan? Buka file APK yang telah diunduh, lalu izinkan instalasi dari sumber ini pada pengaturan perangkat Anda.
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
