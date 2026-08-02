import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Loader2, ShieldAlert, FileText } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { ChatWindow } from "@/shared/consultation/components/ChatWindow";
import { MeetingLinkPanel } from "@/shared/consultation/components/MeetingLinkPanel";
import { StatusBadge } from "@/shared/consultation/components/StatusBadge";
import type { Consultation } from "@/shared/consultation/types/consultation";
import {
  getMyConsultationDetail,
  markMyConsultationRead,
  sendMyConsultationMessage,
} from "@/features/patient/consultation/services/consultationApi";

const POLL_INTERVAL_MS = 10000;

export default function PatientConsultationChatPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getMyConsultationDetail(id);
      setConsultation(data);
      setNotFound(false);
      const unread = (data.messages ?? []).filter(
        (m) => m.senderRole !== "patient" && !m.readAt
      );
      if (unread.length > 0) {
        markMyConsultationRead(id).catch(() => {});
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    refresh();
    refreshTimer.current = setInterval(refresh, POLL_INTERVAL_MS);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [refresh]);

  const send = useCallback(
    async (body: string) => {
      try {
        const message = await sendMyConsultationMessage(id, body);
        setConsultation((prev) =>
          prev ? { ...prev, messages: [...(prev.messages ?? []), message] } : prev
        );
      } catch (err) {
        toast({
          title: "Gagal",
          message: (err as Error)?.message || "Tidak bisa mengirim pesan",
          variant: "error",
        });
      }
    },
    [id]
  );

  const isLocked = consultation?.status === "Selesai" || consultation?.status === "Ditolak";

  if (loading && !consultation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDF8F0]">
        <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin" />
      </div>
    );
  }

  if (notFound || !consultation) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-10 text-center shadow-sm max-w-md">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#4A3F35]">Konsultasi tidak ditemukan</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">
            Anda tidak memiliki akses atau konsultasi ini sudah tidak tersedia.
          </p>
          <Button
            onClick={() => navigate("/dashboard/user?tab=konsultasi")}
            className="mt-5 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Konsultasi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF8F0] via-white to-[#F5E6C8]/40 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm px-5 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => navigate("/dashboard/user?tab=konsultasi")}
                className="text-[#8A7B6B] hover:bg-[#F5E6C8] shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F] flex items-center justify-center text-white font-bold shrink-0">
                {(consultation.participantName || "P").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-[#4A3F35] truncate">
                    {consultation.participantName || "Konsultasi Saya"}
                  </h2>
                  <StatusBadge status={consultation.status} />
                </div>
                <p className="text-xs text-[#8A7B6B] truncate">
                  {consultation.topic}
                  {consultation.scheduleDate ? ` • ${consultation.scheduleDate}${consultation.scheduleTime ? ` ${consultation.scheduleTime}` : ""}` : ""}
                </p>
              </div>
            </div>
            {consultation.doctorName && (
              <span className="inline-flex items-center px-3 py-1.5 bg-[#FDF8F0] border border-[#F0E6D3] text-xs font-semibold text-[#8A6B2B] rounded-full">
                {consultation.doctorName}
              </span>
            )}
          </div>
        </div>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 h-[calc(100vh-280px)] min-h-[480px]">
            <ChatWindow
              messages={consultation.messages ?? []}
              loading={loading}
              disabled={isLocked}
              currentRole="patient"
              onSend={send}
              emptyStateTitle="Konsultasi Anda aktif"
              emptyStateDescription="Tim klinik kami akan membalas pesan Anda segera."
            />
          </div>
          <div className="space-y-5">
            <MeetingLinkPanel
              meetings={consultation.meetings ?? []}
              loading={loading}
              readOnly
              onAdd={async () => undefined}
              onUpdate={async () => undefined}
              onDelete={async () => undefined}
            />
            {consultation.medicalRecord && (
              <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-2 border-b border-[#F0E6D3] bg-[#FDF8F0]/60">
                  <FileText className="w-3.5 h-3.5 text-[#8A6B2B]" />
                  <h3 className="text-sm font-bold text-[#4A3F35]">Rekam Medis</h3>
                </div>
                <div className="p-4 text-xs text-[#8A7B6B] space-y-1.5">
                  <p><span className="font-semibold text-[#4A3F35]">Nomor:</span> {consultation.medicalRecord.recordNumber || "-"}</p>
                  <p>
                    <span className="font-semibold text-[#4A3F35]">Status:</span>{" "}
                    <span className="capitalize">{consultation.medicalRecord.status || "-"}</span>
                  </p>
                  {consultation.medicalRecord.summaryNotes && (
                    <p className="whitespace-pre-wrap pt-1 border-t border-[#F5F0E8]">
                      <span className="font-semibold text-[#4A3F35]">Ringkasan:</span>{" "}
                      {consultation.medicalRecord.summaryNotes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
