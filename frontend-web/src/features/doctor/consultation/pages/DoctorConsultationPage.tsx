import { useState } from "react";
import { useNavigate } from "react-router";
import { Loader2, MessageSquare, RefreshCw, Video } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { ConsultationSummaryCards } from "../components/ConsultationSummaryCards";
import { StatusBadge } from "../components/StatusBadge";
import { TYPE_META } from "../services/consultation.constants";
import { useScheduledConsultations } from "../services/useScheduledConsultations";

export default function DoctorConsultationPage() {
  const navigate = useNavigate();
  const { consultations, loading, reload } = useScheduledConsultations();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await reload();
      toast({ title: "Berhasil", message: "Daftar konsultasi diperbarui", variant: "success" });
    } catch {
      toast({ title: "Gagal", message: "Tidak bisa memperbarui daftar", variant: "error" });
    } finally {
      setRefreshing(false);
    }
  };

  const typeMeta = TYPE_META.scheduled;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Konsultasi Online Dokter</h2>
          <p className="text-xs text-[#8A7B6B] mt-1">
            Daftar konsultasi pasien Anda — kelola meeting dan masuki ruang chat.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-[#F5E6C8] text-[#8A6B2B] text-xs font-bold rounded-full border border-[#E8D4A2]">
            Total: {consultations.length} Konsultasi
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-[#F0E6D3] text-[#4A3F35] hover:bg-[#FDF8F0] rounded-xl text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <ConsultationSummaryCards consultations={consultations} loading={loading} />

      {/* Main List */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin" />
          </div>
        ) : consultations.length === 0 ? (
          <div className="p-12 text-center text-[#8A7B6B]">
            <MessageSquare className="w-12 h-12 text-[#C9A24A]/40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#4A3F35]">Belum ada jadwal konsultasi</p>
            <p className="text-xs mt-1">Konsultasi terjadwal yang ditugaskan kepada Anda akan muncul di sini.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0E6D3]">
            {consultations.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-[#FDF8F0]/60 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F] flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
                    {(item.user?.name || "P").charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#4A3F35] truncate">
                        {item.user?.name || "Pasien"}
                      </span>
                      <StatusBadge status={item.status} />
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeMeta.badgeClassName}`}>
                        <Video className="w-3 h-3" />
                        {typeMeta.label}
                      </span>
                    </div>

                    <p className="text-xs text-[#4A3F35] font-medium mt-1 truncate">
                      {item.topic}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[#8A7B6B] mt-1.5 flex-wrap">
                      {item.scheduleDate && (
                        <span>
                          📅 {item.scheduleDate} {item.scheduleTime ? `• ${item.scheduleTime}` : ""}
                        </span>
                      )}
                      {item.chiefComplaint && (
                        <span className="truncate max-w-md">
                          💬 {item.chiefComplaint}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/dashboard/doctor/consultation/${item.id}`)}
                    className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl text-xs h-9 px-4 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                    Buka Chat
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
