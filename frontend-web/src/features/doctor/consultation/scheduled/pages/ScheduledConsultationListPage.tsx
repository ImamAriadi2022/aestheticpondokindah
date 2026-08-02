import { useState } from "react";
import { useNavigate } from "react-router";
import { Loader2, MessageSquare, RefreshCw, Video } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { ConsultationSummaryCards } from "@/features/doctor/consultation/dashboard/components/ConsultationSummaryCards";
import { StatusBadge } from "@/features/doctor/consultation/shared/components/StatusBadge";
import { TYPE_META } from "@/features/doctor/consultation/constants/consultation";
import {
  useScheduledConsultations,
} from "@/features/doctor/consultation/hooks/useScheduledConsultations";

export default function ScheduledConsultationListPage() {
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
            Konsultasi terjadwal pasien Anda — kelola meeting dan masuki ruang chat.
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
            className="h-9 rounded-xl border-[#C9A24A]/60 text-[#8A6B2B] hover:bg-[#F5E6C8]"
          >
            {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Segarkan
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <ConsultationSummaryCards consultations={consultations} loading={loading} />

      <div className="rounded-xl border border-[#F0E6D3] bg-[#FDF8F0] px-4 py-3 text-xs text-[#6B5A4E] leading-relaxed">
        <span className="font-bold">Arti status:</span> Menunggu = permintaan belum diproses; Terjadwal = dokter dan waktu sudah ditentukan, tetapi sesi belum dimulai; Sedang Berjalan = ruang chat/sesi sudah dibuka; Selesai = konsultasi ditutup.
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#8A7B6B]">Memuat konsultasi terjadwal...</p>
            </div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-12 text-[#B8A99A]">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Belum Ada Konsultasi Terjadwal</p>
              <p className="text-xs mt-1">Konsultasi terjadwal pasien akan muncul di sini</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0E6D3] bg-[#FDF8F0]/60 text-left text-xs font-bold text-[#8A7B6B] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pasien</th>
                  <th className="py-3.5 px-4">Topik</th>
                  <th className="py-3.5 px-4">Jadwal</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0E8] text-xs text-[#4A3F35]">
                {consultations.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FDF8F0]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(c.user?.name || "P").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{c.user?.name || "Klien"}</p>
                          <p className="text-[10px] text-[#B8A99A] truncate">{c.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold truncate max-w-[220px]">{c.topic}</p>
                      {c.location && (
                        <p className="text-[10px] text-[#B8A99A] truncate max-w-[220px]">{c.location}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FDF8F0] border border-[#F0E6D3] text-[#4A3F35]">
                        <Video className="w-3 h-3 text-[#C9A24A]" />
                        {c.scheduleDate ? `${c.scheduleDate}${c.scheduleTime ? ` • ${c.scheduleTime}` : ""}` : c.date}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/dashboard/doctor/consultation/${c.id}`)}
                        className="h-9 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Masuk Chat
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p className="text-[11px] text-[#B8A99A]">
        Tipe: <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeMeta.badgeClassName}`}>{typeMeta.label}</span> — data diambil langsung dari backend.
      </p>
    </div>
  );
}
