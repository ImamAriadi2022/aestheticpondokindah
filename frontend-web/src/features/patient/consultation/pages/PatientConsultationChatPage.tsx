import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Send,
  MessageSquare,
  Sparkles,
  Calendar,
  ChevronRight,
  Check,
  CheckCheck,
  Info,
  X,
  Phone,
  MoreVertical,
  Activity,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import type { Consultation, ConsultationMessage } from "@/shared/consultation/types/consultation";
import {
  getMyConsultationDetail,
  markMyConsultationRead,
  sendMyConsultationMessage,
} from "@/features/patient/consultation/services/consultationApi";
import {
  getCachedConsultation,
  setCachedConsultation,
} from "@/features/patient/consultation/services/consultationCache";
import { apiClient } from "@/core/api/apiClient";

function FormattedChatMessage({ text }: { text: string; isPatient?: boolean }) {
  if (!text) return null;

  // Clean literal \n string escaping and remove markdown asterisks
  const normalized = text.replace(/\\n/g, "\n");
  const cleanText = normalized.replace(/\*\*/g, "").replace(/\*/g, "");
  const lines = cleanText.split("\n");

  return (
    <div className="space-y-1 text-[13px] leading-relaxed select-text">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Section divider line
        if (trimmed.startsWith("─────")) {
          return <div key={idx} className="border-t border-[#EADBBD]/70 my-1.5" />;
        }

        // Section headings with emoji
        if (
          trimmed.startsWith("📋") ||
          trimmed.startsWith("💡") ||
          trimmed.startsWith("⭐") ||
          trimmed.startsWith("💬") ||
          trimmed.startsWith("🔔") ||
          trimmed.startsWith("💎") ||
          trimmed.startsWith("🩺") ||
          trimmed.startsWith("📌")
        ) {
          return (
            <div
              key={idx}
              className="font-bold text-[13px] pt-1 pb-0.5 flex items-center gap-1.5 text-[#2C2416]"
            >
              <span>{trimmed}</span>
            </div>
          );
        }

        // Bullet points
        if (trimmed.startsWith("•") || trimmed.startsWith("-") || trimmed.startsWith("👉")) {
          return (
            <div
              key={idx}
              className="flex items-start gap-1.5 pl-1 text-[#4A3F35]"
            >
              <span className="font-bold shrink-0 text-[#8C6B1C]">
                {trimmed.startsWith("👉") ? "👉" : "•"}
              </span>
              <span>{trimmed.replace(/^[•\-👉]\s*/, "")}</span>
            </div>
          );
        }

        return (
          <p
            key={idx}
            className="text-[#2C2416]"
          >
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

export default function PatientConsultationChatPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  // Read cache immediately (0ms instant render if opened before)
  const [consultation, setConsultation] = useState<Consultation | null>(() => {
    return getCachedConsultation(id);
  });
  const [loading, setLoading] = useState(!consultation);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showDesktopSummary, setShowDesktopSummary] = useState(false);
  const [showMobileInfoModal, setShowMobileInfoModal] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFetchingRef = useRef(false);

  const refresh = useCallback(async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const data = await getMyConsultationDetail(id, { silent: true });
      if (data && data.id) {
        setConsultation(data);
        setCachedConsultation(id, data);
        setNotFound(false);
        markMyConsultationRead(id).catch(() => {});
      }
    } catch {
      if (!silent && !consultation) setNotFound(true);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [id, consultation]);

  useEffect(() => {
    refresh(!!consultation);

    // Smart background poll every 4 seconds only if tab is active
    refreshTimer.current = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        refresh(true);
      }
    }, 4000);

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [refresh]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consultation?.messages?.length]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    // Optimistic UI update
    const tempId = "temp_" + Date.now();
    const optimisticMessage: ConsultationMessage = {
      id: tempId,
      senderId: null,
      senderRole: "patient",
      body: text,
      createdAt: new Date().toISOString(),
    };

    setConsultation((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        messages: [...(prev.messages || []), optimisticMessage],
      };
      setCachedConsultation(id, updated);
      return updated;
    });
    setInputText("");
    setSending(true);

    try {
      const realMessage = await sendMyConsultationMessage(id, text);
      setConsultation((prev) => {
        if (!prev) return prev;
        const filtered = (prev.messages || []).filter((m) => m.id !== tempId);
        const updated = {
          ...prev,
          messages: [...filtered, realMessage],
        };
        setCachedConsultation(id, updated);
        return updated;
      });
    } catch (err: any) {
      toast({
        title: "Gagal Mengirim Pesan",
        message: err?.message || "Tidak bisa mengirim pesan. Coba lagi.",
        variant: "error",
      });
      refresh(true);
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm("Akhiri sesi konsultasi ini?")) return;
    setClosing(true);
    try {
      await apiClient.post(`/user/consultations/${id}/close`);
      toast({
        title: "Konsultasi Selesai",
        message: "Sesi konsultasi telah ditutup.",
        variant: "success",
      });
      setConsultation((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, status: "Selesai" as any };
        setCachedConsultation(id, updated);
        return updated;
      });
    } catch (err: any) {
      toast({
        title: "Gagal Mengakhiri Konsultasi",
        message: err?.message || "Tidak dapat menutup konsultasi.",
        variant: "error",
      });
    } finally {
      setClosing(false);
    }
  };

  const isClosed = consultation?.status === "Selesai" || consultation?.status === "Ditolak";
  const isHandedOver = (consultation as any)?.notes === "connected_to_human_admin"
    || consultation?.messages?.some((m) => (m as any).attachments?.type === "handoff_confirmed" || (m as any).attachments?.is_handed_off);

  const handleRequestAdminHandoff = async () => {
    if (sending || isClosed) return;
    const text = "Saya ingin berbicara langsung dengan Admin Klinik";
    const tempId = "temp_" + Date.now();
    const optimisticMessage: ConsultationMessage = {
      id: tempId,
      senderId: null,
      senderRole: "patient",
      body: text,
      createdAt: new Date().toISOString(),
    };

    setConsultation((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        messages: [...(prev.messages || []), optimisticMessage],
      };
      setCachedConsultation(id, updated);
      return updated;
    });
    setSending(true);

    try {
      const realMessage = await sendMyConsultationMessage(id, text);
      setConsultation((prev) => {
        if (!prev) return prev;
        const filtered = (prev.messages || []).filter((m) => m.id !== tempId);
        const updated = {
          ...prev,
          messages: [...filtered, realMessage],
        };
        setCachedConsultation(id, updated);
        return updated;
      });
      setTimeout(() => refresh(true), 400);
    } catch (err: any) {
      toast({
        title: "Gagal",
        message: err?.message || "Tidak bisa mengirim permintaan.",
        variant: "error",
      });
    } finally {
      setSending(false);
    }
  };

  if (loading && !consultation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F2F5]">
        <Loader2 className="w-8 h-8 text-[#00A884] animate-spin" />
      </div>
    );
  }

  if (notFound || !consultation) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center shadow-md max-w-md">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#111B21]">Konsultasi Tidak Ditemukan</h2>
          <p className="text-xs text-[#667781] mt-1">
            Anda tidak memiliki akses atau konsultasi ini sudah tidak tersedia.
          </p>
          <Button
            onClick={() => navigate("/dashboard/user?tab=konsultasi")}
            className="mt-5 bg-[#008069] hover:bg-[#00A884] text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Kembali ke Konsultasi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] flex flex-col bg-[#FAF8F5] overflow-hidden select-none">
      {/* Aesthetic Luxury Clinic Header */}
      <header className="bg-gradient-to-r from-[#2C2416] via-[#3A3022] to-[#2C2416] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-md shrink-0 z-30 border-b border-[#C9A24A]/30">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => navigate("/dashboard/user?tab=konsultasi")}
            className="p-1.5 -ml-1 text-white/90 hover:text-white hover:bg-white/10 rounded-full cursor-pointer transition-colors active:scale-95"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Contact Avatar */}
          <div
            onClick={() => setShowMobileInfoModal(true)}
            className="relative cursor-pointer flex items-center gap-2.5 min-w-0"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C9A24A] to-[#8C6B1C] border border-white/30 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0 overflow-hidden">
              {isHandedOver ? (
                <span className="text-sm">👤</span>
              ) : (
                <Sparkles className="w-4 h-4 text-white" />
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white truncate leading-tight flex items-center gap-1.5">
                {isHandedOver ? "Admin Klinik Aesthetic" : "AESPI AI Dental Advisor"}
                <span className="text-[10px] font-normal text-[#F5E6C8] bg-white/10 px-1.5 py-0.2 rounded-md border border-white/10 font-mono">
                  #{consultation.id}
                </span>
              </h1>
              <p className="text-[11px] text-[#EADBBD] truncate flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                {isHandedOver ? "Live Chat • Tim Medis Siaga" : "Online • Asisten Medis AI"}
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Desktop Summary Toggle */}
          <button
            type="button"
            onClick={() => setShowDesktopSummary(!showDesktopSummary)}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-[#F5E6C8] text-xs font-semibold cursor-pointer transition-all border border-[#C9A24A]/40 shadow-xs"
            title="Buka / Tutup Ringkasan Keluhan"
          >
            <Info className="w-3.5 h-3.5 text-[#C9A24A]" />
            <span>{showDesktopSummary ? "Tutup Info" : "Ringkasan Keluhan"}</span>
          </button>

          {/* Mobile Info Button */}
          <button
            type="button"
            onClick={() => setShowMobileInfoModal(true)}
            className="lg:hidden p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-full cursor-pointer"
            title="Lihat Detail Keluhan"
          >
            <Info className="w-4 h-4 text-[#C9A24A]" />
          </button>

          {!isClosed && (
            <button
              type="button"
              onClick={handleClose}
              disabled={closing}
              className="px-2.5 py-1 text-[11px] font-bold text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-400/30 rounded-lg cursor-pointer transition-all shrink-0"
              title="Akhiri Sesi Konsultasi"
            >
              {closing ? <Loader2 className="w-3 h-3 animate-spin" /> : "Akhiri"}
            </button>
          )}
        </div>
      </header>

      {/* Main Body (Chat Area + Optional Desktop Sidebar) */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Chat Room Area */}
        <main className="flex-1 min-h-0 flex flex-col relative bg-[#FAF8F5] overflow-hidden">
          {/* Status Bar */}
          {isHandedOver ? (
            <div className="bg-emerald-50 border-b border-emerald-200 px-3 py-1.5 text-center text-[11px] font-semibold text-emerald-900 shadow-2xs shrink-0 flex items-center justify-center gap-1.5">
              <span>👤</span>
              <span>Terhubung Langsung dengan Tim Admin & Resepsionis Klinik</span>
            </div>
          ) : consultation.status === "Menunggu" ? (
            <div className="bg-[#FAF5EA] border-b border-[#EADBBD] px-3 py-1.5 text-center text-[11px] font-medium text-[#8C6B1C] shadow-2xs shrink-0 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A24A]" />
              <span>AESPI AI Dental Advisor aktif.</span>
              <button
                type="button"
                onClick={handleRequestAdminHandoff}
                disabled={sending}
                className="underline font-bold text-[#8C6B1C] hover:text-[#5C4510] cursor-pointer"
              >
                Bicara dengan Admin Langsung
              </button>
            </div>
          ) : null}

          {/* Messages Stream */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 py-3 space-y-2.5 bg-gradient-to-b from-[#FAF8F5] via-[#FAF6F0] to-[#FAF5EA]">
            {/* Date Separator Badge */}
            <div className="flex justify-center my-1">
              <span className="bg-[#FAF5EA] border border-[#EADBBD] text-[#8C6B1C] text-[10px] font-bold px-3 py-0.5 rounded-full shadow-2xs uppercase tracking-wider">
                HARI INI
              </span>
            </div>

            {consultation.messages && consultation.messages.length > 0 ? (
              consultation.messages.map((m: ConsultationMessage, idx: number) => {
                const isPatient = m.senderRole === "patient" || !m.senderRole;
                const recommendation = (m as any).attachments?.type === "ai_recommendation"
                  ? (m as any).attachments
                  : null;
                const isHandoffConfirmed = (m as any).attachments?.type === "handoff_confirmed";
                const timeStr = m.createdAt
                  ? new Date(m.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                return (
                  <div
                    key={m.id || idx}
                    className={`flex flex-col ${isPatient ? "items-end" : "items-start"}`}
                  >
                    {/* Message Bubble Container */}
                    <div
                      className={`relative max-w-[90%] sm:max-w-[78%] p-3.5 rounded-2xl shadow-xs text-xs select-text leading-relaxed ${
                        isPatient
                          ? "bg-[#FAF3DF] text-[#2C2416] border border-[#ECD9A8] rounded-tr-xs shadow-xs"
                          : isHandoffConfirmed
                          ? "bg-emerald-50 text-[#2C2416] border border-emerald-300 rounded-tl-xs"
                          : "bg-white text-[#2C2416] rounded-tl-xs border border-[#E8DFC8] shadow-xs"
                      }`}
                    >
                      {/* Sender label for incoming messages */}
                      {!isPatient && (
                        <div className="flex items-center gap-1 mb-1 font-bold text-[11px] text-[#8C6B1C]">
                          {isHandoffConfirmed ? (
                            <span>🔔 Admin Klinik • Pengalihan Sesi</span>
                          ) : isHandedOver ? (
                            <span>👤 Tim Admin Klinik</span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#C9A24A]" />
                              AESPI AI Dental Advisor
                            </span>
                          )}
                        </div>
                      )}

                      {/* Main Message Text */}
                      <FormattedChatMessage text={m.body} isPatient={isPatient} />

                      {/* Recommendation Card inside Bubble */}
                      {recommendation && (
                        <div className="mt-3 p-3 bg-gradient-to-br from-[#FAF5EA] to-[#F5EFE6] border border-[#EADBBD] rounded-xl space-y-2 text-left not-italic">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#8C6B1C] uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#C9A24A]" /> Tindakan Disarankan
                            </span>
                            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                              Rekomendasi Klinik
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[#2C2416]">
                              {recommendation.service_name}
                            </p>
                            {recommendation.doctor_name && (
                              <p className="text-[11px] text-[#6B5E4F] mt-0.5">
                                🩺 Dokter: {recommendation.doctor_name}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => navigate(`/dashboard/user?tab=reservasi`)}
                            className="w-full h-8 text-xs font-bold bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white rounded-xl shadow-2xs mt-1 cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Booking Layanan Ini Sekarang</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}

                      {/* Handoff Trigger Button in AI bubble */}
                      {!isPatient && !isHandedOver && (m as any).attachments?.can_handoff && (
                        <div className="mt-2.5 pt-2 border-t border-[#F0EAE1] flex justify-end">
                          <button
                            type="button"
                            onClick={handleRequestAdminHandoff}
                            disabled={sending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF5EA] hover:bg-[#F5EFE6] border border-[#EADBBD] text-[11px] font-bold text-[#8C6B1C] cursor-pointer transition-all shadow-2xs active:scale-95"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>👤 Bicara dengan Admin Langsung</span>
                          </button>
                        </div>
                      )}

                      {/* Timestamp & Delivery status */}
                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#8C8272] float-right ml-2 -mb-0.5">
                        <span>{timeStr}</span>
                        {isPatient && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#C9A24A]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center text-[#8C8272] space-y-2 p-6">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs border border-[#E8DFC8]">
                  <MessageSquare className="w-5 h-5 text-[#C9A24A]" />
                </div>
                <p className="text-xs font-bold text-[#2C2416]">Konsultasi Aktif</p>
                <p className="text-[11px] max-w-xs text-[#8C8272]">
                  Silakan tuliskan pesan atau pertanyaan Anda di bawah.
                </p>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Input Bar */}
          <div className="p-2.5 sm:p-3 bg-white border-t border-[#E8DFC8] shrink-0">
            {isClosed ? (
              <div className="p-2.5 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl text-center text-xs text-[#8C8272] shadow-2xs">
                Sesi konsultasi telah <span className="font-bold text-[#2C2416]">Selesai</span> dan diarsipkan.
              </div>
            ) : (
              <div className="space-y-1.5 max-w-4xl mx-auto">
                {/* Quick Action Suggestion Chips */}
                {!isHandedOver && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                    <button
                      type="button"
                      onClick={handleRequestAdminHandoff}
                      disabled={sending}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5EA] hover:bg-[#F5EFE6] border border-[#EADBBD] text-[11px] font-bold text-[#8C6B1C] shadow-2xs transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>👤 Bicara dengan Admin Langsung</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputText("Berapa estimasi biaya untuk perawatan ini?");
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] hover:bg-[#FAF5EA] border border-[#E8DFC8] text-[11px] font-medium text-[#4A3F35] shadow-2xs transition-all cursor-pointer shrink-0"
                    >
                      <span>💎 Tanya Biaya Perawatan</span>
                    </button>
                  </div>
                )}

                {/* Main Input Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      isHandedOver
                        ? "Ketik pesan ke Admin Klinik..."
                        : "Ketik pesan (atau ketik 'Hubungkan ke Admin')..."
                    }
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] rounded-full border border-[#E8DFC8] focus:border-[#C9A24A] focus:bg-white focus:outline-hidden text-[#2C2416] shadow-xs transition-all placeholder:text-[#8C8272]"
                    disabled={sending}
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md shrink-0 cursor-pointer transition-all active:scale-95 ${
                      !inputText.trim() || sending
                        ? "bg-[#C9A24A]/50 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] shadow-[#C9A24A]/25"
                    }`}
                    title="Kirim Pesan"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>

        {/* Desktop Collapsible Summary Panel */}
        {showDesktopSummary && (
          <aside className="hidden lg:flex lg:flex-col w-80 bg-white border-l border-[#E8DFC8] p-4 space-y-4 overflow-y-auto shrink-0 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
              <h2 className="text-sm font-bold text-[#2C2416] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#C9A24A]" />
                Ringkasan Keluhan
              </h2>
              <button
                type="button"
                onClick={() => setShowDesktopSummary(false)}
                className="p-1 text-[#8C8272] hover:text-[#2C2416] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-[#8C8272] block uppercase font-bold">Gejala yang Dipilih:</span>
                <span className="font-bold text-[#2C2416] block mt-0.5">{consultation.topic || "Keluhan Gigi"}</span>
              </div>

              {consultation.painScale !== undefined && consultation.painScale !== null && (
                <div>
                  <span className="text-[10px] text-[#8C8272] block uppercase font-bold">Tingkat Nyeri:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      consultation.painScale <= 3
                        ? "bg-emerald-100 text-emerald-800"
                        : consultation.painScale <= 6
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {consultation.painScale} / 10
                    </span>
                    <span className="text-[10px] text-[#8C8272]">
                      {consultation.painScale === 0
                        ? "Tidak Nyeri"
                        : consultation.painScale <= 3
                        ? "Nyeri Ringan"
                        : consultation.painScale <= 6
                        ? "Nyeri Sedang"
                        : "Nyeri Berat"}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <span className="text-[10px] text-[#8C8272] block uppercase font-bold">Detail Keluhan:</span>
                <p className="text-xs text-[#4A3F35] font-normal mt-1 leading-relaxed bg-[#FAF8F5] p-2.5 rounded-xl border border-[#F0EAE1] whitespace-pre-wrap">
                  {consultation.chiefComplaint || "Tidak ada keterangan tambahan"}
                </p>
              </div>

              <div className="pt-2 border-t border-[#F0EAE1]">
                <span className="text-[10px] text-[#8C8272] block uppercase font-bold">Status Konsultasi:</span>
                <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isHandedOver ? "Live Chat Admin Aktif" : consultation.status || "Aktif"}
                </span>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Info Sheet Modal */}
      {showMobileInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 border-t border-[#E8DFC8]">
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-3">
              <h2 className="text-sm font-bold text-[#2C2416] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#C9A24A]" />
                Detail Informasi Konsultasi
              </h2>
              <button
                type="button"
                onClick={() => setShowMobileInfoModal(false)}
                className="p-1 text-[#8C8272] hover:text-[#2C2416] rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-[#8C8272] block font-bold uppercase">Gejala yang Dipilih:</span>
                <p className="font-bold text-[#2C2416] mt-0.5">{consultation.topic || "Keluhan Gigi"}</p>
              </div>

              {consultation.painScale !== undefined && consultation.painScale !== null && (
                <div>
                  <span className="text-[10px] text-[#8C8272] block font-bold uppercase">Skala Nyeri:</span>
                  <p className="font-bold text-[#2C2416] mt-0.5">{consultation.painScale} / 10</p>
                </div>
              )}

              <div>
                <span className="text-[10px] text-[#8C8272] block font-bold uppercase">Detail Keluhan:</span>
                <p className="text-xs text-[#4A3F35] mt-1 bg-[#FAF8F5] p-3 rounded-xl border border-[#F0EAE1] whitespace-pre-wrap leading-relaxed">
                  {consultation.chiefComplaint || "Tidak ada keterangan tambahan"}
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => setShowMobileInfoModal(false)}
                  className="w-full bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Tutup & Kembali ke Chat
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}