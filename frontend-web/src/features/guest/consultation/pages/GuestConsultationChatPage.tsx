import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  MessageSquareText,
  Send,
  Sparkles,
  Calendar,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Video,
} from "lucide-react";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Button } from "@/shared/ui/button";
import { StatusBadge } from "@/shared/consultation/components/StatusBadge";
import { useGuestConsultation } from "../services/useGuestConsultation";
import { useGuestSession } from "../services/GuestSessionContext";
import { toast } from "@/shared/ui/toast";

export default function GuestConsultationChatPage() {
  const { token = "" } = useParams();
  const navigate = useNavigate();
  const { addRef, updateStatus, hasRef } = useGuestSession();

  const { consultation, loading, notFound, send, markRead, refresh } = useGuestConsultation(token);

  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // Auto scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consultation?.messages?.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputMessage.trim();
    if (!text || sending || isLocked) return;

    setInputMessage("");
    setSending(true);
    try {
      await send(text);
    } catch (err: any) {
      toast({
        title: "Gagal Mengirim",
        message: err?.message || "Tidak dapat mengirim pesan. Coba lagi.",
        variant: "error",
      });
      setInputMessage(text);
    } finally {
      setSending(false);
    }
  };

  const meetings = consultation?.meetings ?? [];
  const activeMeeting = meetings.length > 0 ? meetings[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F5] via-[#FFFDF8] to-[#F5EFE6] flex flex-col justify-between">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-10 w-full">
        {/* Navigation & Header Actions */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={() => navigate("/konsultasi")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C6B1C] hover:text-[#6B521C] bg-white px-3 py-1.5 rounded-xl border border-[#EADBBD] shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Mulai Konsultasi Baru
          </button>

          <button
            onClick={() => refresh()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C8272] hover:text-[#2C2416] bg-white px-3 py-1.5 rounded-xl border border-[#E8DFC8] shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Muat ulang pesan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#C9A24A]" : ""}`} />
            Perbarui Chat
          </button>
        </div>

        {loading && !consultation ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-[#E8DFC8] shadow-sm">
            <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin mb-3" />
            <p className="text-xs font-semibold text-[#8C8272]">Menghubungkan ke ruang percakapan...</p>
          </div>
        ) : notFound || !consultation ? (
          <div className="bg-white rounded-3xl border border-[#E8DFC8] p-8 sm:p-12 text-center shadow-sm max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-base font-bold text-[#2C2416]">Sesi Konsultasi Tidak Ditemukan</h2>
            <p className="text-xs text-[#8C8272] mt-1.5 leading-relaxed">
              Kode token konsultasi tidak valid atau sesi sudah kedaluwarsa. Anda dapat memulai konsultasi baru kapan saja.
            </p>
            <Button
              onClick={() => navigate("/konsultasi")}
              className="mt-6 h-11 px-6 bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:from-[#B8943F] hover:to-[#967430] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              Mulai Konsultasi Baru
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Live Chat Header Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8DFC8] shadow-xs px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#C9A24A] to-[#A8843A] flex items-center justify-center text-white font-bold text-sm shadow-2xs shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-bold text-[#2C2416] truncate">
                      Live Chat: {consultation.participantName || "Konsultasi Pasien"}
                    </h2>
                    <StatusBadge status={consultation.status} />
                  </div>
                  <p className="text-[11px] text-[#8C8272] truncate">
                    Tim Medis Aesthetic Pondok Indah • Responsif
                  </p>
                </div>
              </div>

              {/* Video Meeting Callout if available */}
              {activeMeeting && activeMeeting.url && (
                <a
                  href={activeMeeting.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all shrink-0"
                >
                  <Video className="w-4 h-4 animate-pulse" />
                  Masuk Video Telekonsultasi
                </a>
              )}
            </div>

            {/* Initial Triage Summary Bar (Gejala, Nyeri, Keluhan) */}
            <div className="bg-[#FAF5EA] border border-[#EADBBD] rounded-2xl p-3.5 sm:p-4 text-xs shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="w-4 h-4 text-[#8C6B1C]" />
                <span className="font-bold text-[#8C6B1C] text-[11px] uppercase tracking-wider">
                  Ringkasan Keluhan Awal Pasien
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#F0E6D3]">
                  <span className="text-[#8C8272] block text-[10px]">Gejala yang Dirasakan:</span>
                  <span className="font-bold text-[#2C2416] block mt-0.5">
                    {consultation.topic || "Keluhan Gigi"}
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#F0E6D3]">
                  <span className="text-[#8C8272] block text-[10px]">Tingkat Nyeri:</span>
                  <span className="font-bold text-[#8C6B1C] block mt-0.5">
                    {consultation.painScale !== undefined && consultation.painScale !== null
                      ? `Skala ${consultation.painScale}/10`
                      : "Tidak ditentukan"}
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-[#F0E6D3]">
                  <span className="text-[#8C8272] block text-[10px]">Detail Keluhan:</span>
                  <span className="text-[#4A3F35] block mt-0.5 line-clamp-2" title={consultation.chiefComplaint}>
                    {consultation.chiefComplaint || "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Interactive Live Chat Container */}
            <div className="bg-white rounded-3xl border border-[#E8DFC8] shadow-sm flex flex-col h-[520px] sm:h-[560px] overflow-hidden">
              {/* Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#FAF8F5]">
                {/* System Welcome Card */}
                <div className="p-3.5 rounded-2xl bg-[#FAF5EA]/80 border border-[#EADBBD] text-center max-w-md mx-auto my-2">
                  <p className="text-xs font-bold text-[#8C6B1C]">
                    Selamat datang di Live Chat Konsultasi Medis
                  </p>
                  <p className="text-[11px] text-[#6B5E4F] mt-1 leading-relaxed">
                    Sampaikan pertanyaan atau informasi tambahan tentang kondisi gigi Anda. Dokter gigi kami akan merespons dalam waktu singkat.
                  </p>
                </div>

                {/* Messages List */}
                {consultation.messages && consultation.messages.length > 0 ? (
                  consultation.messages.map((msg, index) => {
                    const isPatient = msg.senderRole === "patient" || !msg.senderRole;
                    const timeStr = msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "";

                    return (
                      <div
                        key={msg.id || index}
                        className={`flex flex-col ${isPatient ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px]">
                          <span className={`font-bold ${isPatient ? "text-[#8C6B1C]" : "text-[#2C2416]"}`}>
                            {isPatient ? "Anda" : msg.senderName || "Tim Medis Klinik"}
                          </span>
                          <span className="text-[#A69B8D]">{timeStr}</span>
                        </div>
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs whitespace-pre-wrap ${
                            isPatient
                              ? "bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white rounded-tr-xs"
                              : "bg-white text-[#2C2416] border border-[#E8DFC8] rounded-tl-xs"
                          }`}
                        >
                          {msg.body}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-[#8C8272]">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF5EA] flex items-center justify-center mb-2">
                      <MessageSquareText className="w-5 h-5 text-[#C9A24A]" />
                    </div>
                    <p className="text-xs font-bold text-[#2C2416]">Pesan Awal Telah Diterima</p>
                    <p className="text-[11px] text-[#8C8272] mt-0.5 max-w-xs">
                      Keluhan Anda telah masuk ke sistem kami. Anda dapat mengetik pesan atau pertanyaan tambahan di bawah.
                    </p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 bg-white border-t border-[#E8DFC8]">
                {isLocked ? (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-600 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-500" />
                    Sesi konsultasi ini telah selesai dan diarsipkan.
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ketik pesan atau pertanyaan untuk dokter..."
                      className="flex-1 px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#D9D0BC] focus:border-[#C9A24A] focus:bg-white rounded-xl outline-hidden text-[#2C2416] transition-all"
                      disabled={sending}
                    />
                    <Button
                      type="submit"
                      disabled={!inputMessage.trim() || sending}
                      className="h-10 px-4 bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:from-[#B8943F] hover:to-[#967430] text-white text-xs font-bold rounded-xl shrink-0 shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Kirim</span>
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Quick Action: Booking In-Clinic Appointment */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF5EA] to-[#F5EFE6] border border-[#EADBBD] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C] shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#2C2416]">Perlu Pemeriksaan Fisik Langsung?</p>
                  <p className="text-[11px] text-[#6B5E4F]">
                    Buat reservasi janji temu dengan dokter spesialis di klinik untuk penanganan menyeluruh.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/booking")}
                className="w-full sm:w-auto h-9 px-4 text-xs font-bold bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] text-white rounded-xl shadow-2xs shrink-0 cursor-pointer flex items-center justify-center gap-1"
              >
                Booking Janji Temu
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

