import { Smartphone, Download, Globe, AlertTriangle, HardDrive } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { DownloadAppItem } from "../services/downloadApi";

interface DownloadAppCardProps {
  app: DownloadAppItem;
}

export function DownloadAppCard({ app }: DownloadAppCardProps) {
  const downloadUrl = app.apk_url || app.download_link;

  return (
    <div className="relative bg-white rounded-2xl border border-brand-gold/20 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
      {app.is_development && (
        <div className="absolute -top-3 -right-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            Development / Beta
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-gold/10 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6 text-brand-gold" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-brand-charcoal">{app.title || app.platform || "Aplikasi Mobile"}</h3>
            <p className="text-sm text-brand-warm-gray">
              {app.version ? `Versi ${app.version}` : app.platform || "Android"}
            </p>
          </div>
        </div>

        {app.file_size_formatted && (
          <span className="inline-flex items-center gap-1 text-xs text-brand-warm-gray bg-gray-50 px-2.5 py-1 rounded-lg">
            <HardDrive className="w-3 h-3" />
            {app.file_size_formatted}
          </span>
        )}
      </div>

      {app.description && (
        <p className="text-sm text-brand-warm-gray mb-6 bg-brand-cream/40 rounded-xl p-3 border border-brand-gold/10">
          {app.description}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <Button className="bg-gradient-gold hover:opacity-90 text-white rounded-xl font-semibold gap-2">
              <Download className="w-4 h-4" />
              Download Aplikasi
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
