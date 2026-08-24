import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  Check,
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

  if (loading && !consultation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFBF7]">
        <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin" />
      </div>
    );
  }

  if (notFound || !consultation) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-[#E8DFC8] p-8 text-center shadow-md max-w-md">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-[#2C2416]">Konsultasi Tidak Ditemukan</h2>
          <p className="text-xs text-[#8C8272] mt-1">
            Anda tidak memiliki akses atau konsultasi ini sudah tidak tersedia.
          </p>
          <Button
            onClick={() => navigate("/dashboard/user?tab=konsultasi")}
            className="mt-5 bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Kembali ke Konsultasi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-white to-[#FAF5EA] p-3 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-xs px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate("/dashboard/user?tab=konsultasi")}
              className="text-[#8C8272] hover:bg-[#FAF5EA] shrink-0 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C9A24A] to-[#A8843A] flex items-center justify-center text-white font-bold text-sm shadow-2xs shrink-0">
              A
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-[#2C2416] truncate">
                  Konsultasi: {consultation.topic || "Keluhan Gigi"}
                </h2>
                <span className="font-mono text-[10px] text-[#8C6B1C] bg-[#FAF5EA] border border-[#EADBBD] px-1.5 py-0.5 rounded-md font-bold">
                  #{consultation.id}
                </span>
                {consultation.status === "Menunggu" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Menunggu Admin
                  </span>
                )}
                {consultation.status === "Dibuka" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                    Dibuka / Sesi Aktif
                  </span>
                )}
                {consultation.status === "Selesai" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                    <Check className="w-3 h-3 mr-0.5 text-gray-500" />
                    Selesai
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8C8272] truncate">
                Layanan Asesmen Online • Aesthetic Pondok Indah Dental Clinic
              </p>
            </div>
          </div>

          {!isClosed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={closing}
              className="h-8 text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl shrink-0 cursor-pointer"
            >
              {closing ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Akhiri Konsultasi
            </Button>
          )}
        </div>

        {/* Status Guide Alert Box */}
        {consultation.status === "Menunggu" && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Konsultasi Anda aktif dan dalam antrean</p>
              <p className="text-[11px] text-amber-700">Tim admin klinik kami akan segera membuka dan membalas pesan Anda. Anda dapat mengirimkan pesan tambahan jika diperlukan.</p>
            </div>
          </div>
        )}

        {consultation.status === "Dibuka" && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Sesi konsultasi sedang aktif</p>
              <p className="text-[11px] text-emerald-700">Anda terhubung langsung dengan Admin Klinik. Sampaikan pertanyaan atau keluhan Anda dengan nyaman.</p>
            </div>
          </div>
        )}

        {isClosed && (
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3 text-xs text-gray-700">
            <CheckCircle2 className="w-5 h-5 text-gray-500 shrink-0" />
            <div>
              <p className="font-bold">Konsultasi telah selesai</p>
              <p className="text-[11px] text-gray-500">Sesi percakapan telah ditutup dan disimpan sebagai arsip riwayat konsultasi Anda.</p>
            </div>
          </div>
        )}

        {/* Main Grid: Assessment Overview & Chat Room */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel: Complaint Assessment */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E8DFC8] p-4 shadow-xs text-xs space-y-3">
              <p className="text-[10px] font-bold text-[#8C6B1C] uppercase tracking-wider">Ringkasan Keluhan</p>
              <div>
                <span className="text-[10px] text-[#8C8272] block">Gejala yang Dipilih:</span>
                <span className="font-bold text-[#2C2416] block mt-0.5">{consultation.topic || "Keluhan Gigi"}</span>
              </div>

              {consultation.painScale !== undefined && consultation.painScale !== null && (
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
                <span className="text-[10px] text-[#8C8272] block">Detail Keluhan:</span>
                <p className="text-xs text-[#4A3F35] font-normal mt-1 leading-relaxed bg-[#FAF8F5] p-2.5 rounded-xl border border-[#F0EAE1] whitespace-pre-wrap">
                  {consultation.chiefComplaint || "Tidak ada keterangan tambahan"}
                </p>
              </div>
            </div>

            {/* Booking Callout Card */}
            <div className="bg-gradient-to-br from-[#FAF5EA] to-[#F5EFE6] rounded-2xl border border-[#EADBBD] p-4 shadow-xs text-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8C6B1C]" />
                <span className="font-bold text-[#2C2416]">Perlu Penanganan Dokter?</span>
              </div>
              <p className="text-[11px] text-[#6B5E4F] leading-relaxed">
                Jika keluhan membutuhkan tindakan fisik atau pemeriksaan langsung, buat janji temu dengan dokter spesialis kami.
              </p>
              <Button
                onClick={() => navigate("/dashboard/user?tab=reservasi")}
                className="w-full h-8 text-xs font-bold bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] text-white rounded-xl shadow-2xs cursor-pointer"
              >
                Buat Booking Dokter
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>

          {/* Right Panel: Interactive 2-Way Chat Room */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8DFC8] shadow-xs flex flex-col h-[560px] overflow-hidden">
            {/* Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]">
              {consultation.messages && consultation.messages.length > 0 ? (
                consultation.messages.map((m: ConsultationMessage, idx: number) => {
                  const isPatient = m.senderRole === "patient" || !m.senderRole;
                  return (
                    <div
                      key={m.id || idx}
                      className={`flex flex-col ${isPatient ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[10px] font-bold text-[#6B5E4F]">
                          {isPatient ? "Anda (Pasien)" : "Admin Klinik"}
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
                          isPatient
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
                  <p className="text-xs font-bold text-[#2C2416]">Konsultasi Anda Aktif</p>
                  <p className="text-[11px] max-w-xs text-[#8C8272]">
                    Tim klinik kami akan membalas pesan Anda segera. Anda juga dapat mengirim pesan tambahan di bawah.
                  </p>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 bg-white border-t border-[#E8DFC8] shrink-0">
              {isClosed ? (
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500">
                  Konsultasi telah <span className="font-bold text-gray-700">Selesai</span>. Ruang chat telah diarsipkan.
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
                    placeholder="Tulis pesan atau pertanyaan ke Admin Klinik..."
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
