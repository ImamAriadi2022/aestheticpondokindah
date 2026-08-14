import DashboardLayout from "@/core/layouts/DashboardLayout";
import { Smartphone, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { getDoctorDownloadApps, type DownloadAppItem } from "../services/doctorDownloadService";
import DoctorDownloadAppCard from "../components/DoctorDownloadAppCard";

export default function DoctorDownloadPage() {
  const [apps, setApps] = useState<DownloadAppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctorDownloadApps()
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
              <DoctorDownloadAppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
