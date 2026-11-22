import { Button } from "@/shared/ui/button";
import { Download } from "lucide-react";
import TrafficUtmAnalyticsSection from "@/features/admin/dashboard/components/TrafficUtmAnalyticsSection";

export default function AnalyticsDashboard() {
  const handleDownload = () => {
    const before = document.body.className;
    document.body.classList.add("printing-analytics");
    setTimeout(() => {
      window.print();
      document.body.className = before;
    }, 200);
  };

  return (
    <div className="space-y-6" id="analytics-report">
      <style>{`
        @media print {
          body.printing-analytics * { visibility: hidden !important; }
          body.printing-analytics #analytics-report,
          body.printing-analytics #analytics-report * { visibility: visible !important; }
          body.printing-analytics #analytics-report { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
          body.printing-analytics .no-print { display: none !important; }
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2C2416]">Analitik Website &amp; UTM</h2>
          <p className="text-sm text-[#7A6E60] mt-0.5">
            Pantau akuisisi trafik pengunjung, performa kampanye UTM, dan konversi booking
          </p>
        </div>
        <Button
          onClick={handleDownload}
          variant="outline"
          className="rounded-xl border-[#E6DECB] text-[#5C5546] hover:bg-[#FAF8F5] no-print self-start sm:self-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Unduh Laporan PDF
        </Button>
      </div>

      <TrafficUtmAnalyticsSection />
    </div>
  );
}
