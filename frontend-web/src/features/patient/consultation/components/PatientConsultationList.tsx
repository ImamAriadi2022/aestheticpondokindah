import { useNavigate } from "react-router";
import { ChevronRight, MessageCircle } from "lucide-react";
import { StatusBadge } from "@/shared/consultation/components/StatusBadge";
import type { ConsultationItem } from "@/features/patient/consultation/services/consultationApi";

export default function PatientConsultationList({ consultations }: { consultations: ConsultationItem[] }) {
  const navigate = useNavigate();
  const active = consultations.filter((item) => ["Menunggu", "Dijadwalkan", "Dibuka"].includes(item.status));
  const history = consultations.filter((item) => !["Menunggu", "Dijadwalkan", "Dibuka"].includes(item.status));

  const renderItems = (items: ConsultationItem[], emptyMessage: string) => (
    items.length ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((consultation) => (
          <button
            key={consultation.id}
            onClick={() => navigate(`/dashboard/user/consultation/${consultation.id}`)}
            className="bg-white rounded-2xl p-4 border border-[#F0E6D3] text-left hover:border-[#C9A24A] hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 truncate">{consultation.participantName || "Konsultasi Saya"}</p>
                  <StatusBadge status={consultation.status} />
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{consultation.topic}</p>
                <p className="text-[11px] text-gray-400 mt-1">{consultation.date}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#C9A24A] shrink-0" />
            </div>
          </button>
        ))}
      </div>
    ) : <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-5 py-8 text-center text-sm text-gray-500">{emptyMessage}</p>
  );

  return (
    <div className="space-y-7">
      <section>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#c9a24a]/10 flex items-center justify-center"><MessageCircle className="w-4 h-4 text-[#c9a24a]" /></div>
          <div><h2 className="text-lg font-bold text-gray-900">Konsultasi Aktif</h2><p className="text-xs text-gray-500">{active.length} percakapan sedang berjalan</p></div>
        </div>
        {renderItems(active, "Belum ada konsultasi aktif.")}
      </section>
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Riwayat Konsultasi</h2>
        {renderItems(history, "Belum ada riwayat konsultasi.")}
      </section>
    </div>
  );
}
