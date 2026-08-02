import { Smartphone, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { useEffect, useState } from "react";
import { getDownloadApps, type DownloadAppItem } from "@/features/guest/download/services/downloadApi";
import { Link } from "react-router";

export default function DownloadSection() {
  const [apps, setApps] = useState<DownloadAppItem[]>([]);

  useEffect(() => {
    getDownloadApps().then(setApps);
  }, []);

  return (
    <section className="py-14 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="relative bg-gradient-to-br from-brand-gold/5 via-background to-brand-gold/5 rounded-[2.5rem] p-6 sm:p-8 md:p-16 overflow-hidden border border-brand-gold/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/5 rounded-full -translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-brand-charcoal space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 text-brand-gold text-sm font-semibold">
                <Smartphone className="w-4 h-4" />
                Mobile App
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Download Aplikasi
                <span className="block text-brand-gold">Aesthetic Pondok Indah</span>
              </h2>
              <p className="text-base sm:text-lg text-brand-warm-gray leading-relaxed max-w-md">
                Akses lebih mudah ke layanan klinik kami. Booking janji temu, lihat riwayat perawatan, dan dapatkan informasi terbaru langsung dari ponsel Anda.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {apps.length > 0 && !apps[0]?.is_development ? (
                  <>
                    {apps[0]?.apk_url && (
                      <a href={apps[0].apk_url} download>
                        <Button className="bg-gradient-gold text-white font-semibold px-6 rounded-xl shadow-lg shadow-brand-gold/20 h-12">
                          <Download className="w-5 h-5 mr-2" />
                          Download APK
                        </Button>
                      </a>
                    )}
                    {apps[0]?.download_link && (
                      <a href={apps[0].download_link} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" className="rounded-xl border-brand-gold/30 text-brand-gold h-12">
                          Link Download
                        </Button>
                      </a>
                    )}
                  </>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 max-w-md">
                    <p className="font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Aplikasi Sedang Dalam Tahap Development
                    </p>
                    <p className="mt-1 text-amber-700">
                      Aplikasi mobile masih dalam pengembangan dan akan segera tersedia.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <Link
                  to="/download"
                  className="text-brand-gold hover:text-brand-gold-dark font-semibold text-sm underline underline-offset-4"
                >
                  Lihat halaman download
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-64 h-80 bg-gradient-to-b from-brand-gold/20 to-brand-gold/5 rounded-[2rem] border border-brand-gold/20 flex items-center justify-center">
                  <Smartphone className="w-24 h-24 text-brand-gold/30" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-brand-gold/10 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
