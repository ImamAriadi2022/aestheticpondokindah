import { CalendarDays, Users, Activity, CheckCircle2, Loader2 } from "lucide-react";
import type { DoctorConsultation } from "@/features/doctor/consultation/types/consultation";

interface ConsultationSummaryCardsProps {
  consultations: DoctorConsultation[];
  loading?: boolean;
}

const CARDS = [
  {
    key: "total" as const,
    label: "Total Konsultasi",
    icon: CalendarDays,
    className: "from-[#C9A24A] to-[#B8943F]",
  },
  {
    key: "waiting" as const,
    label: "Menunggu",
    icon: Users,
    className: "from-amber-500 to-amber-600",
  },
  {
    key: "current" as const,
    label: "Sedang Berjalan",
    icon: Activity,
    className: "from-sky-500 to-sky-600",
  },
  {
    key: "completed" as const,
    label: "Selesai",
    icon: CheckCircle2,
    className: "from-emerald-500 to-emerald-600",
  },
];

export function ConsultationSummaryCards({ consultations, loading = false }: ConsultationSummaryCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-[#FDF8F0] border border-[#F0E6D3] flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#C9A24A] animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  const values = {
    total: consultations.length,
    waiting: consultations.filter((item) => item.status === "Menunggu").length,
    current: consultations.filter((item) => item.status === "Dibuka").length,
    completed: consultations.filter((item) => item.status === "Selesai").length,
  };

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {CARDS.map(({ key, label, icon: Icon, className }) => (
        <div
          key={key}
          className="rounded-2xl border border-[#F0E6D3] bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[#8A7B6B]">{label}</p>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${className} flex items-center justify-center shadow-sm`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#4A3F35]">
            {values[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
