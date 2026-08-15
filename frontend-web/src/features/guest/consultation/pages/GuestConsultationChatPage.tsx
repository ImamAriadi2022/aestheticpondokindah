import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Button } from "@/shared/ui/button";
import { ChatWindow } from "@/shared/consultation/components/ChatWindow";
import { MeetingLinkPanel } from "@/shared/consultation/components/MeetingLinkPanel";
import { StatusBadge } from "@/shared/consultation/components/StatusBadge";
import { useGuestConsultation } from "../services/useGuestConsultation";
import { useGuestSession } from "../services/GuestSessionContext";

export default function GuestConsultationChatPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { addRef, updateStatus, hasRef } = useGuestSession();

  const { consultation, loading, notFound, send, markRead } = useGuestConsultation(token);

  const isLocked =
    consultation?.status === "Selesai" || consultation?.status === "Ditolak";

  useEffect(() => {
    if (!consultation) return;
    addRef({
      token,
      name: consultation.participantName || "Konsultasi",
      phone: consultation.guestPhone || "",
      topic: consultation.topic || "Konsultasi",
      status: consultation.status || "Menunggu",
    });
    if (hasRef(token) && consultation.status) {
      updateStatus(token, consultation.status);
    }
  }, [consultation, token, addRef, hasRef, updateStatus]);

  useEffect(() => {
    const unread = (consultation?.messages ?? []).filter(
      (m) => m.senderRole !== "patient" && !m.readAt
    );
    if (unread.length > 0) {
      markRead();
    }
  }, [consultation, markRead]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDF8F0] via-white to-[#F5E6C8]/40">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        <button
          onClick={() => navigate("/konsultasi/lanjut")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#8A7B6B] hover:text-[#4A3F35] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Daftar Konsultasi Saya
        </button>

        {loading && !consultation ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin" />
          </div>
        ) : notFound || !consultation ? (
          <div className="bg-white rounded-3xl border border-[#F0E6D3] p-10 text-center shadow-sm">
            <MessageCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-[#4A3F35]">Konsultasi tidak ditemukan</h2>
            <p className="text-sm text-[#8A7B6B] mt-1 max-w-sm mx-auto">
              Link konsultasi tidak valid atau sudah tidak tersedia.
            </p>
            <Button
              onClick={() => navigate("/konsultasi")}
              className="mt-5 bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white rounded-xl"
            >
              Mulai Konsultasi Baru
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header */}
            <div className="bg-white rounded-3xl border border-[#F0E6D3] shadow-sm px-5 py-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E8C547] via-[#C9A24A] to-[#B8943F] flex items-center justify-center text-white font-bold shrink-0">
                    {(consultation.participantName || "P").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-[#4A3F35] truncate">
                        Konsultasi Anda
                      </h2>
                      <StatusBadge status={consultation.status} />
                    </div>
                    <p className="text-xs text-[#8A7B6B] truncate">
                      {consultation.topic}
                      {consultation.doctorName ? ` • ${consultation.doctorName}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5E6C8]/70 text-[#8A6B2B] text-[11px] font-semibold rounded-full border border-[#E8D4A2]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Simpan link halaman ini untuk melanjutkan konsultasi
                  </span>
                </div>
              </div>
            </div>

            {/* Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 h-[calc(100vh-300px)] min-h-[460px]">
                <ChatWindow
                  messages={consultation.messages ?? []}
                  loading={loading}
                  disabled={isLocked}
                  currentRole="patient"
                  onSend={send}
                  emptyStateTitle="Konsultasi terkirim"
                  emptyStateDescription="Tim klinik kami akan membalas pesan Anda segera. Pantau halaman ini untuk melihat balasan."
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
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
