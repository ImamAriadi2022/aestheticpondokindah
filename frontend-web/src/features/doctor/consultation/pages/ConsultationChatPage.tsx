import { useParams, useNavigate } from "react-router";
import { ArrowLeft, ChevronDown, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { ChatWindow } from "../components/ChatWindow";
import { MeetingLinkPanel } from "../components/MeetingLinkPanel";
import { PatientSummaryPanel } from "../components/PatientSummaryPanel";
import { QuickActions } from "../components/QuickActions";
import { StatusBadge } from "../components/StatusBadge";
import { QUICK_REPLIES } from "../services/consultation.constants";
import { useConsultationDetail } from "../services/useConsultationDetail";
import { useDoctorChat } from "../services/useDoctorChat";
import { useMeeting } from "../services/useMeeting";
import { usePatientSummary } from "../services/usePatientSummary";

export default function ConsultationChatPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const { consultation, loading, updating, notFound, updateStatus } = useConsultationDetail(id);
  const { summary, loading: loadingSummary } = usePatientSummary(id);
  const chat = useDoctorChat(id);
  const meeting = useMeeting(id);

  const isDone = consultation?.status === "Selesai";

  const handleComplete = async () => {
    try {
      await updateStatus("Selesai");
      toast({ title: "Berhasil", message: "Konsultasi ditandai selesai", variant: "success" });
    } catch {
      toast({ title: "Gagal", message: "Tidak bisa mengubah status konsultasi", variant: "error" });
    }
  };

  const joinMeeting = (url: string) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin" />
      </div>
    );
  }

  if (notFound || !consultation) {
    return (
      <div className="bg-white rounded-2xl border border-[#F0E6D3] p-10 text-center shadow-sm">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#4A3F35]">Konsultasi tidak ditemukan</h2>
        <p className="text-sm text-[#8A7B6B] mt-1">
          Anda tidak memiliki akses atau konsultasi ini sudah tidak tersedia.
        </p>
        <Button
          onClick={() => navigate("/dashboard/doctor?tab=konsultasi")}
          className="mt-5 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm px-5 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate("/dashboard/doctor?tab=konsultasi")}
              className="text-[#8A7B6B] hover:bg-[#F5E6C8] shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F] flex items-center justify-center text-white font-bold shrink-0">
              {(consultation.user?.name || "P").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[#4A3F35] truncate">
                  {consultation.user?.name || "Pasien"}
                </h2>
                <StatusBadge status={consultation.status} />
              </div>
              <p className="text-xs text-[#8A7B6B] truncate">
                {consultation.topic}
                {consultation.scheduleDate ? ` • ${consultation.scheduleDate}${consultation.scheduleTime ? ` ${consultation.scheduleTime}` : ""}` : ""}
              </p>
            </div>
          </div>

          <QuickActions
            consultation={consultation}
            phone={summary?.patient?.whatsapp}
            busy={updating}
            onComplete={handleComplete}
            onJoinMeeting={joinMeeting}
          />
        </div>
      </div>

      <div className="h-[calc(100vh-230px)] min-h-[500px]">
        <ChatWindow
          messages={chat.messages}
          loading={chat.loading}
          disabled={isDone}
          currentRole="doctor"
          onSend={(body: string) => {
            chat.send(body);
          }}
          quickReplies={isDone ? [] : QUICK_REPLIES}
          title={`Percakapan dengan ${consultation.user?.name || "pasien"}`}
          subtitle="Pesan dari pasien, admin, dan dokter tampil dalam satu percakapan."
          emptyStateTitle="Ruang chat siap digunakan"
          emptyStateDescription="Mulai percakapan atau bagikan link meeting untuk konsultasi video."
        />
      </div>

      <details className="group bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden">
        <summary className="list-none cursor-pointer px-5 py-4 flex items-center justify-between text-sm font-bold text-[#4A3F35] hover:bg-[#FDF8F0]">
          Detail pasien dan meeting
          <ChevronDown className="w-4 h-4 text-[#8A7B6B] transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 px-5 pb-5 border-t border-[#F0E6D3] pt-5">
          <MeetingLinkPanel
            meetings={meeting.meetings}
            loading={meeting.loading}
            saving={meeting.saving}
            disabled={isDone}
            onAdd={meeting.add}
            onUpdate={meeting.update}
            onDelete={meeting.remove}
          />
          <PatientSummaryPanel summary={summary} loading={loadingSummary} />
        </div>
      </details>
    </div>
  );
}
