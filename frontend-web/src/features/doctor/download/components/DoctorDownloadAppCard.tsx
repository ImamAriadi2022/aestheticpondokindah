import { Smartphone, Download, Globe, AlertTriangle, HardDrive } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { DownloadAppItem } from "../services/doctorDownloadService";

interface DoctorDownloadAppCardProps {
  app: DownloadAppItem;
}

export default function DoctorDownloadAppCard({ app }: DoctorDownloadAppCardProps) {
  return (
    <div className="relative bg-white rounded-2xl border border-[#c9a24a]/20 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
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
            <p className="mt-1 text-xs text-amber-700">
              Aplikasi ini masih dalam proses pengembangan. Tombol unduh akan aktif setelah rilis resmi tersedia.
            </p>
          </div>
        ) : (
          <Button
            asChild
            className="w-full bg-[#c9a24a] hover:bg-[#b8923f] text-white font-medium rounded-xl h-11 text-sm shadow-sm"
          >
            <a
              href={app.download_link || app.apk_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Download className="w-4 h-4 mr-2" />
              Unduh Aplikasi
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
