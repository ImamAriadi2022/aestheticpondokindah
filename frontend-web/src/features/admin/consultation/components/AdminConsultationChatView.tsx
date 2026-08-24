import { useState, useEffect, useRef, useCallback } from "react";
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
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import type { Consultation, ConsultationMessage } from "@/shared/consultation/types/consultation";
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

interface Props {
  consultationId: string;
  onBack: () => void;
  onRefresh?: () => void;
}

export default function AdminConsultationChatView({
  consultationId,
  onBack,
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
  const [notFound, setNotFound] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
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
        setNotFound(false);

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
    } catch {
      if (!silent && !consultation) setNotFound(true);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [consultationId, consultation, onRefresh]);

  useEffect(() => {
    fetchDetail(!!consultation);

    // Smart background poll every 4 seconds only if tab is active
    refreshTimer.current = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchDetail(true);
      }
    }, 4000);

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
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
      fetchDetail(true);
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm("Akhiri sesi konsultasi ini? Status akan diubah menjadi 'Selesai'.")) return;
    setClosing(true);
    try {
      await closeConsultation(consultationId);
      toast({
        title: "Konsultasi Selesai",
        message: "Sesi konsultasi telah berhasil diakhiri.",
        variant: "success",
      });
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

  if (loading && !consultation) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-white rounded-2xl border border-[#E8DFC8]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin" />
          <p className="text-xs text-[#8C8272]">Memuat percakapan konsultasi...</p>
        </div>
      </div>
    );
  }

  if (notFound || !consultation) {
    return (
      <div className="bg-white rounded-3xl border border-[#E8DFC8] p-8 text-center shadow-xs max-w-md mx-auto my-8">
        <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#2C2416]">Konsultasi Tidak Ditemukan</h2>
        <p className="text-xs text-[#8C8272] mt-1">
          Konsultasi ini sudah tidak tersedia atau ID tidak valid.
        </p>
        <Button
          onClick={onBack}
          className="mt-5 bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Kembali ke Daftar Konsultasi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-xs px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            className="text-[#8C8272] hover:bg-[#FAF5EA] shrink-0 rounded-xl cursor-pointer"
            title="Kembali ke Daftar Konsultasi"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C9A24A] to-[#A8843A] flex items-center justify-center text-white font-bold text-sm shadow-2xs shrink-0">
            {(consultation.participantName || "P").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-[#2C2416] truncate">
                {consultation.participantName || "Pasien"}
              </h2>
              <span className="font-mono text-[10px] text-[#8C6B1C] bg-[#FAF5EA] border border-[#EADBBD] px-1.5 py-0.5 rounded-md font-bold">
                #{consultation.id}
              </span>
              {consultation.status === "Menunggu" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Menunggu Respon
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
              {consultation.topic || "Konsultasi Pasien"}
              {consultation.guestPhone ? ` • ${consultation.guestPhone}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 text-xs font-semibold text-[#8C6B1C] hover:bg-[#FAF5EA] rounded-xl cursor-pointer"
          >
            Tutup Chat
          </Button>
        </div>
      </div>

      {/* Status Guide Alert Box */}
      {consultation.status === "Menunggu" && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">Konsultasi Pasien Baru</p>
            <p className="text-[11px] text-amber-700">Pasien sedang menunggu balasan dari Admin Klinik. Balas pesan untuk memulai sesi konsultasi.</p>
          </div>
        </div>
      )}

      {consultation.status === "Dibuka" && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Sesi Konsultasi Aktif</p>
            <p className="text-[11px] text-emerald-700">Percakapan dua arah sedang berlangsung secara real-time dengan pasien.</p>
          </div>
        </div>
      )}

      {isClosed && (
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3 text-xs text-gray-700">
          <CheckCircle2 className="w-5 h-5 text-gray-500 shrink-0" />
          <div>
            <p className="font-bold">Konsultasi Telah Selesai</p>
            <p className="text-[11px] text-gray-500">Sesi percakapan telah ditutup dan disimpan sebagai arsip riwayat klinik.</p>
          </div>
        </div>
      )}

      {/* Main Grid: Assessment Overview & Interactive Chat Room */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Panel: Patient Assessment & Quick Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8DFC8] p-4 shadow-xs text-xs space-y-3">
            <p className="text-[10px] font-bold text-[#8C6B1C] uppercase tracking-wider">Informasi Pasien</p>
            <div className="space-y-1.5 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8]">
              <p className="font-bold text-[#2C2416] text-xs">{consultation.participantName || "Pasien"}</p>
              {consultation.user?.email && (
                <p className="text-[11px] text-[#8C8272] flex items-center gap-1 truncate">
                  <Mail className="w-3 h-3 text-[#8C6B1C] shrink-0" />
                  {consultation.user.email}
                </p>
              )}
              {consultation.guestPhone && (
                <p className="text-[11px] text-[#8C8272] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#8C6B1C] shrink-0" />
                  {consultation.guestPhone}
                </p>
              )}
              <p className="text-[10px] text-[#8C8272] pt-1">
                Waktu Konsultasi: {consultation.date || "-"}
              </p>
            </div>

            <p className="text-[10px] font-bold text-[#8C6B1C] uppercase tracking-wider pt-2">Ringkasan Keluhan</p>
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

          {/* Quick Action: Send Booking Recommendation */}
          {!isClosed && (
            <div className="bg-gradient-to-br from-[#FAF5EA] to-[#F5EFE6] rounded-2xl border border-[#EADBBD] p-4 shadow-xs text-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#8C6B1C]" />
                <span className="font-bold text-[#2C2416]">Aksi Rekomendasi Booking</span>
              </div>
              <p className="text-[11px] text-[#6B5E4F] leading-relaxed">
                Kirim pesan rekomendasi agar pasien melakukan reservasi jadwal dengan dokter spesialis di klinik.
              </p>
              <Button
                onClick={sendBookingRecommendation}
                className="w-full h-8 text-xs font-bold bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] text-white rounded-xl shadow-2xs cursor-pointer"
              >
                Kirim Saran Booking Dokter
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Right Panel: Interactive 2-Way Chat Room */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8DFC8] shadow-xs flex flex-col h-[560px] overflow-hidden">
          {/* Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]">
            {consultation.messages && consultation.messages.length > 0 ? (
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
  );
}
