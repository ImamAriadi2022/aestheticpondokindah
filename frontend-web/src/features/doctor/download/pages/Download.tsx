import DashboardLayout from "@/core/layouts/DashboardLayout";
import { Smartphone, Download, Globe, AlertTriangle, HardDrive } from "lucide-react";
import { useEffect, useState } from "react";
import { getDownloadApps, type DownloadAppItem } from "@/features/guest/download/services/downloadApi";
import { Button } from "@/shared/ui/button";

export default function DoctorDownloadPage() {
  const [apps, setApps] = useState<DownloadAppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDownloadApps()
      .then(setApps)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout role="doctor">
      <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Download Aplikasi</h1>
              <p className="text-sm text-gray-500">Dapatkan akses mudah ke aplikasi mobile klinik</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#c9a24a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : apps.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-6">
              <Smartphone className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Tersedia</h3>
            <p className="text-gray-500">
              Aplikasi mobile sedang dalam tahap pengembangan. Nantikan informasi terbaru dari kami.
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-6">
            {apps.map((app) => (
              <div
                key={app.id}
                className="relative bg-white rounded-2xl border border-[#c9a24a]/20 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                {app.is_development && (
                  <div className="absolute -top-3 -right-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
                      <AlertTriangle className="w-3 h-3" />
                      Development
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center shrink-0">
                    <Smartphone className="w-6 h-6 text-[#c9a24a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900">{app.title}</h3>
                    {app.description && (
                      <p className="text-sm text-gray-500 mt-1">{app.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3">
                      {app.version && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <HardDrive className="w-3 h-3" />
                          Versi {app.version}
                        </span>
                      )}
                      {app.file_size_formatted && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <HardDrive className="w-3 h-3" />
                          {app.file_size_formatted}
                        </span>
                      )}
                      {app.platform && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Globe className="w-3 h-3" />
                          {app.platform}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100">
                  {app.is_development ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                      <p className="font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Aplikasi Sedang Dalam Tahap Development
                      </p>
                      <p className="mt-1 text-amber-700">
                        Aplikasi ini masih dalam tahap pengembangan dan belum tersedia untuk diunduh. Silakan kembali lagi nanti.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      {app.apk_url && (
                        <a href={app.apk_url} download>
                          <Button className="w-full sm:w-auto bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-xl shadow-lg shadow-[#c9a24a]/20">
                            <Download className="w-4 h-4 mr-2" />
                            Download APK ({app.file_size_formatted || "Unknown"})
                          </Button>
                        </a>
                      )}
                      {app.download_link && (
                        <a href={app.download_link} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="w-full sm:w-auto rounded-xl border-[#c9a24a]/30 text-[#c9a24a]">
                            <Globe className="w-4 h-4 mr-2" />
                            Buka Link Download
                          </Button>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
