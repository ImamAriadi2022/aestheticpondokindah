import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  MessageSquare,
  Sparkles,
  Loader2,
  ChevronRight,
  Phone,
  Mail,
  Check,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import {
  getConsultationDetail,
  sendAdminConsultationMessage,
  markAdminConsultationRead,
  closeConsultation,
  acceptConsultation,
} from "@/features/patient/consultation/services/consultationApi";
import {
  getCachedConsultation,
  setCachedConsultation,
} from "@/features/patient/consultation/services/consultationCache";
import type { Consultation, ConsultationMessage } from "@/shared/consultation/types/consultation";

interface Props {
  consultationId: string;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function AdminConsultationChatModal({
  consultationId,
  onClose,
  onRefresh,
}: Props) {
  // Read cache immediately (0ms instant render if opened before)
  const [consultation, setConsultation] = useState<Consultation | null>(() => {
    return getCachedConsultation(consultationId);
  });
  const [loading, setLoading] = useState(!consultation);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFetchingRef = useRef(false);

  const fetchDetail = useCallback(async (silent = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (!silent && !consultation) setLoading(true);

    try {
      const data = await getConsultationDetail(consultationId, { silent: true });
      if (data && data.id) {
        setConsultation(data);
        setCachedConsultation(consultationId, data);

        if (data.status === "Menunggu") {
          acceptConsultation(consultationId).then(() => {
            getConsultationDetail(consultationId, { silent: true }).then((updated) => {
              if (updated && updated.id) {
                setConsultation(updated);
                setCachedConsultation(consultationId, updated);
                if (onRefresh) onRefresh();
              }
            }).catch(() => {});
          }).catch(() => {});
        }
      }
      markAdminConsultationRead(consultationId).catch(() => {});
    } catch (err: any) {
      if (!silent && !consultation) {
        toast({
          title: "Gagal memuat konsultasi",
          message: err?.message || "Tidak dapat memuat data konsultasi",
          variant: "error",
        });
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [consultationId, consultation, onRefresh]);

  useEffect(() => {
    fetchDetail(!!consultation);

    // Smart background poll every 4 seconds only if tab is active
    pollTimerRef.current = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchDetail(true);
      }
    }, 4000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [fetchDetail]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consultation?.messages?.length]);

  const handleSend = async (customText?: string) => {
    const text = (customText || inputText).trim();
    if (!text || sending) return;

    // Optimistic UI Update (Instant display for fast feel)
    const tempId = "temp_" + Date.now();
    const optimisticMessage: ConsultationMessage = {
      id: tempId,
      senderId: null,
      senderRole: "admin",
      body: text,
      createdAt: new Date().toISOString(),
    };

    setConsultation((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        messages: [...(prev.messages || []), optimisticMessage],
      };
      setCachedConsultation(consultationId, updated);
      return updated;
    });
    setInputText("");
    setSending(true);

    try {
      const realMessage = await sendAdminConsultationMessage(consultationId, text);
      setConsultation((prev) => {
        if (!prev) return prev;
        const filtered = (prev.messages || []).filter((m) => m.id !== tempId);
        const updated = {
          ...prev,
          messages: [...filtered, realMessage],
        };
        setCachedConsultation(consultationId, updated);
        return updated;
      });
    } catch (err: any) {
      toast({
        title: "Gagal Mengirim Pesan",
        message: err?.message || "Terjadi kendala saat mengirim pesan",
        variant: "error",
      });
      // Revert optimistic
      fetchDetail(true);
    } finally {
      setSending(false);
    }
  };

  const handleCloseConsultation = async () => {
    setClosing(true);
    try {
      await closeConsultation(consultationId);
      toast({
        title: "Konsultasi Selesai",
        message: "Sesi konsultasi telah berhasil diakhiri.",
        variant: "success",
      });
      setShowCloseConfirm(false);
      setConsultation((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, status: "Selesai" as any };
        setCachedConsultation(consultationId, updated);
        return updated;
      });
      if (onRefresh) onRefresh();
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

  const sendBookingRecommendation = () => {
    const text =
      "Berdasarkan keluhan yang Anda sampaikan, kami menyarankan Anda untuk melakukan pemeriksaan langsung dengan dokter spesialis kami di Aesthetic Pondok Indah Dental Clinic. Anda dapat membuat janji temu melalui menu Sistem Booking di aplikasi ini.";
    handleSend(text);
  };

  const isClosed = consultation?.status === "Selesai" || consultation?.status === "Ditolak";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl h-[90vh] max-h-[780px] rounded-3xl border border-[#E8DFC8] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#FAF8F5] via-[#FAF5EA] to-[#F5EFE6] border-b border-[#E8DFC8] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C9A24A] to-[#A8843A] flex items-center justify-center text-white font-bold text-sm shadow-2xs shrink-0">
              {(consultation?.participantName || "P").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-[#2C2416] truncate">
                  {consultation?.participantName || "Pasien"}
                </h3>
                <span className="font-mono text-[10px] text-[#8C6B1C] bg-white border border-[#EADBBD] px-1.5 py-0.5 rounded-md font-bold">
                  #{consultation?.id || consultationId}
                </span>
                {consultation?.status === "Menunggu" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Menunggu
                  </span>
                )}
                {consultation?.status === "Dibuka" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                    Dibuka / Aktif
                  </span>
                )}
                {consultation?.status === "Selesai" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                    <Check className="w-3 h-3 mr-0.5 text-gray-500" />
                    Selesai
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8C8272] truncate">
                {consultation?.topic || "Konsultasi Pasien"}
                {consultation?.guestPhone ? ` • ${consultation.guestPhone}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isClosed && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCloseConfirm(true)}
                className="h-8 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300 rounded-xl cursor-pointer"
              >
                Akhiri Konsultasi
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#8C8272] hover:text-[#2C2416] hover:bg-[#FAF5EA] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Confirmation Modal to Close Consultation */}
        {showCloseConfirm && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-rose-900">
            <div>
              <p className="font-bold">Akhiri sesi konsultasi ini?</p>
              <p className="text-[11px] text-rose-700">Status konsultasi akan diubah menjadi 'Selesai' dan percakapan akan diarsipkan.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCloseConfirm(false)}
                className="h-7 text-xs text-gray-600 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleCloseConsultation}
                disabled={closing}
                className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
              >
                {closing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Ya, Selesaikan
              </Button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-[#FDFBF7]">
          {/* Left Panel: Patient Assessment & Details */}
          <div className="w-full lg:w-72 p-4 border-b lg:border-b-0 lg:border-r border-[#E8DFC8] bg-white overflow-y-auto space-y-4 shrink-0 text-xs">
            <div>
              <p className="text-[10px] font-bold text-[#8C6B1C] uppercase tracking-wider mb-1.5">Informasi Pasien</p>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8] space-y-1.5">
                <p className="font-bold text-[#2C2416] text-xs">{consultation?.participantName || "Pasien"}</p>
                {consultation?.user?.email && (
                  <p className="text-[11px] text-[#8C8272] flex items-center gap-1 truncate">
                    <Mail className="w-3 h-3 text-[#8C6B1C] shrink-0" />
                    {consultation.user.email}
                  </p>
                )}
                {consultation?.guestPhone && (
                  <p className="text-[11px] text-[#8C8272] flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#8C6B1C] shrink-0" />
                    {consultation.guestPhone}
                  </p>
                )}
                <p className="text-[10px] text-[#8C8272] pt-1">
                  Waktu: {consultation?.date || "-"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-[#8C6B1C] uppercase tracking-wider mb-1.5">Asesmen Keluhan</p>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8] space-y-2.5">
                <div>
                  <span className="text-[10px] text-[#8C8272] block">Gejala Utama:</span>
                  <span className="font-semibold text-[#2C2416] text-xs block mt-0.5">
                    {consultation?.topic || consultation?.category || "Pemeriksaan Gigi"}
                  </span>
                </div>

                {consultation?.painScale !== undefined && consultation?.painScale !== null && (
                  <div>
                    <span className="text-[10px] text-[#8C8272] block">Tingkat Nyeri:</span>
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
                  <span className="text-[10px] text-[#8C8272] block">Uraian / Keterangan Keluhan:</span>
                  <p className="text-xs text-[#4A3F35] font-normal mt-1 leading-relaxed bg-white p-2.5 rounded-lg border border-[#F0EAE1] whitespace-pre-wrap">
                    {consultation?.chiefComplaint || "Tidak ada rincian tambahan yang dilampirkan."}
                  </p>
                </div>
              </div>
            </div>

            {!isClosed && (
              <div>
                <p className="text-[10px] font-bold text-[#8C6B1C] uppercase tracking-wider mb-1.5">Aksi Cepat</p>
                <button
                  type="button"
                  onClick={sendBookingRecommendation}
                  className="w-full text-left p-2.5 rounded-xl border border-[#EADBBD] bg-[#FAF5EA] hover:bg-[#F3EAD8] transition-colors text-[11px] font-semibold text-[#8C6B1C] flex items-center justify-between gap-1 group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#C9A24A]" />
                    <span>Kirim Saran Booking Dokter</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* Right Panel: Interactive Chat Room */}
          <div className="flex-1 flex flex-col min-h-0 bg-[#FAF8F5]">
            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && !consultation ? (
                <div className="flex flex-col items-center justify-center h-full text-[#8C8272] space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#C9A24A]" />
                  <p className="text-xs">Memuat percakapan konsultasi...</p>
                </div>
              ) : consultation?.messages && consultation.messages.length > 0 ? (
                consultation.messages.map((m: ConsultationMessage, idx: number) => {
                  const isAdmin = m.senderRole === "admin" || (m.senderRole as string) === "clinic";
                  return (
                    <div
                      key={m.id || idx}
                      className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-[#6B5E4F]">
                          {isAdmin ? "Admin Klinik" : consultation.participantName || "Pasien"}
                        </span>
                        <span className="text-[9px] text-[#A69B8D]">
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs whitespace-pre-wrap ${
                          isAdmin
                            ? "bg-gradient-to-br from-[#8C6B1C] to-[#735514] text-white rounded-tr-xs"
                            : "bg-white text-[#2C2416] border border-[#E8DFC8] rounded-tl-xs"
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-[#8C8272] space-y-2 text-center p-6">
                  <MessageSquare className="w-8 h-8 text-[#C9A24A]/60 stroke-1" />
                  <p className="text-xs font-bold text-[#2C2416]">Belum Ada Pesan Percakapan</p>
                  <p className="text-[11px] max-w-xs text-[#8C8272]">
                    Ketik balasan atau berikan rekomendasi medis awal untuk pasien di bawah.
                  </p>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-[#E8DFC8] shrink-0">
              {isClosed ? (
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500">
                  Konsultasi ini telah berstatus <span className="font-bold text-gray-700">Selesai</span>. Ruang chat telah diarsipkan.
                </div>
              ) : (
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
                    placeholder="Tulis balasan untuk pasien..."
                    className="flex-1 px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#E8DFC8] focus:border-[#C9A24A] focus:bg-white rounded-xl outline-hidden text-[#2C2416] transition-all"
                    disabled={sending}
                  />
                  <Button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="h-9 px-4 bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white rounded-xl text-xs font-bold shrink-0 shadow-2xs cursor-pointer"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Kirim
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
