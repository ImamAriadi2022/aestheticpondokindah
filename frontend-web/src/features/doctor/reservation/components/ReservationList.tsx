import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Play, Stethoscope } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { apiClient } from "@/core/api/apiClient";

export default function DoctorReservationList() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadQueue = () => {
    setLoading(true);
    apiClient
      .get<{ queue: any[] }>("/doctor/queue")
      .then((res) => setReservations(res.queue || []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleStartConsultation = async (resId: string) => {
    setActionLoadingId(resId);
    try {
      await apiClient.put(`/doctor/reservations/${resId}/start`);
      toast({ title: "Berhasil", message: "Perawatan/Konsultasi telah dimulai.", variant: "success" });
      loadQueue();
    } catch (e: any) {
      toast({ title: "Gagal", message: e.message || "Gagal memulai perawatan", variant: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCompleteConsultation = async (resId: string) => {
    setActionLoadingId(resId);
    try {
      await apiClient.put(`/doctor/reservations/${resId}/complete`);
      toast({ title: "Berhasil", message: "Perawatan/Konsultasi telah diselesaikan.", variant: "success" });
      loadQueue();
    } catch (e: any) {
      toast({ title: "Gagal", message: e.message || "Gagal menyelesaikan perawatan", variant: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const myReservations = useMemo(() => {
    return [...reservations].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return Number(b.id || 0) - Number(a.id || 0);
    });
  }, [reservations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#F0E6D3] pb-3">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Reservasi Perawatan Pasien Saya</h2>
          <p className="text-xs text-[#8A7B6B]">Daftar pasien yang memilih Anda sebagai dokter periksa & tindakan medis di klinik</p>
        </div>
        <span className="px-3 py-1 bg-[#F5E6C8] text-[#8A6B2B] text-xs font-bold rounded-full border border-[#E8D4A2]">
          Total: {myReservations.length} Pasien
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin mx-auto mb-2" />
              <p className="text-xs text-[#8A7B6B]">Memuat reservasi pasien dokter...</p>
            </div>
          ) : myReservations.length === 0 ? (
            <div className="text-center py-12 text-[#B8A99A]">
              <Stethoscope className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Belum Ada Reservasi Pasien</p>
              <p className="text-xs mt-1">Pasien yang memilih Anda untuk tindakan periksa akan muncul di sini</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F0E6D3] bg-[#FDF8F0]/60 text-left text-xs font-bold text-[#8A7B6B] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Pasien</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-4">Jadwal Periksa</th>
                  <th className="py-3.5 px-4">Perawatan / Keluhan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi Praktik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F0E8] text-xs text-[#4A3F35]">
                {myReservations.map((r) => (
                  <tr key={r.id} className="hover:bg-[#FDF8F0]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      <div>{r.patient_name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">#{r.code || r.id}</div>
                    </td>
                    <td className="py-3.5 px-4">{r.patient_phone}</td>
                    <td className="py-3.5 px-4 font-medium text-[#c9a24a]">
                      {r.date} &bull; {r.preferred_time}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <span className="font-semibold text-gray-800">{r.treatment_interest || "Pemeriksaan"}</span>
                      <div className="text-[11px] text-gray-500 truncate">{r.complaint}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        r.status === "Selesai"
                          ? "bg-emerald-100 text-emerald-700"
                          : r.status === "Dikonfirmasi"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {r.status === "Dikonfirmasi" || r.status === "Baru" ? (
                        <Button
                          size="sm"
                          disabled={actionLoadingId === r.id}
                          onClick={() => handleStartConsultation(r.id)}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold h-8 text-[11px] rounded-lg shadow-sm"
                        >
                          {actionLoadingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1" />}
                          Mulai Periksa
                        </Button>
                      ) : r.status === "Dalam Konsultasi" ? (
                        <Button
                          size="sm"
                          disabled={actionLoadingId === r.id}
                          onClick={() => handleCompleteConsultation(r.id)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold h-8 text-[11px] rounded-lg shadow-sm"
                        >
                          {actionLoadingId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />}
                          Selesaikan Perawatan
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
