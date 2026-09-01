import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Phone, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

const WHATSAPP_NUMBER = "+62 819-9011-4949";
const WHATSAPP_LINK = "https://wa.me/6281990114949?text=Halo%20Admin%20Aesthetic%20Pondok%20Indah,%20saya%20ingin%20berkonsultasi%20dan%20bertanya%20seputar%20perawatan%20gigi.";

interface Message {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
  cta?: {
    label: string;
    href: string;
  };
}

const initialMessages: Message[] = [
  {
    id: "1",
    text: "Halo! Selamat datang di Aesthetic Pondok Indah Dental Clinic. 🌟\n\nSaya AESPI Bot, asisten virtual Anda. Anda bisa menanyakan info layanan, dokter spesialis, jadwal reservasi, atau menceritakan keluhan gigi Anda agar saya dapat memberikan panduan awal yang tepat.",
    sender: "bot",
    timestamp: new Date(),
  },
];

type ChatIntent = "info" | "dental_triage";

type TriageChiefComplaint =
  | "toothache"
  | "swelling"
  | "sensitivity"
  | "bleeding"
  | "ulcer"
  | "bad_breath"
  | "braces"
  | "post_extraction"
  | "broken_tooth"
  | "other";

type TriageMemory = {
  intent: ChatIntent | null;
  chiefComplaint: TriageChiefComplaint | null;
  complaintFreeText?: string;
  painScore?: number | null;
  duration?: string | null;
  location?: string | null;
  trigger?: string | null;
  swelling?: boolean | null;
  fever?: boolean | null;
  trauma?: boolean | null;
  pusTaste?: boolean | null;
  bleedingHeavy?: boolean | null;
  difficultySwallowBreath?: boolean | null;
  pregnant?: boolean | null;
  ageGroup?: "anak" | "dewasa" | "lansia" | null;
  medications?: string | null;
  allergies?: string | null;
  lastDentalVisit?: string | null;
};

type TriageStage =
  | "idle"
  | "intent"
  | "chief_complaint"
  | "pain_score"
  | "duration"
  | "location"
  | "triggers"
  | "red_flags"
  | "summary"
  | "handoff";

type BotPlan = {
  text: string;
  cta?: Message["cta"];
  quickReplies?: string[];
  set?: Partial<{ stage: TriageStage; memory: Partial<TriageMemory> }>;
};

const defaultQuickReplies = [
  "🦷 Keluhan Sakit Gigi",
  "✨ Info Layanan & Biaya",
  "📅 Cara Buat Janji Temu",
  "👨‍⚕️ Jadwal Dokter Spesialis",
  "📍 Lokasi & Jam Praktik",
  "💬 Chat WhatsApp Admin",
];

type KnowledgeItem = {
  id: string;
  keywords: string[];
  answer: string;
  includeWhatsappCta?: boolean;
};

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const knowledgeBase: KnowledgeItem[] = [
  {
    id: "booking_flow",
    keywords: ["booking", "buat janji", "reservasi", "daftar", "antri", "cara booking", "jadwal temu"],
    answer:
      "Untuk membuat janji temu secara instan:\n1. Buka menu 'Book Now' / 'Buat Janji' di navigasi atas.\n2. Pilih layanan perawatan yang dibutuhkan.\n3. Pilih dokter spesialis dan waktu praktik yang tersedia.\n4. Konfirmasi dan Anda akan langsung menerima E-Tiket reservasi resmi!",
    includeWhatsappCta: true,
  },
  {
    id: "address_hours",
    keywords: ["lokasi", "alamat", "dimana", "jam buka", "operasional", "jadwal buka", "cabang", "pondok indah"],
    answer:
      "📍 Lokasi Klinik:\nJl. Metro Pondok Indah Blok TB No. 12, Kebayoran Lama, Jakarta Selatan 12310.\n\n⏰ Jam Operasional:\nSenin – Sabtu: 10:00 – 18:00 WIB (Minggu Libur/Khusus Reservasi Khusus).",
    includeWhatsappCta: true,
  },
  {
    id: "services_whitening",
    keywords: ["whitening", "pemutihan gigi", "bleaching", "putih"],
    answer:
      "Perawatan Dental Whitening kami menggunakan teknologi LED Light Activation modern berstandar internasional yang aman bagi email gigi, mampu mencerahkan gigi hingga 3-8 tingkat dalam 1 kali sesi kunjungan (60–90 menit).",
    includeWhatsappCta: true,
  },
  {
    id: "services_scaling",
    keywords: ["scaling", "karang gigi", "bersihin karang", "pembersihan gigi", "polishing"],
    answer:
      "Scaling & Polishing menggunakan ultrasonic scaler steril untuk membersihkan karang gigi, plak, dan stain akibat kopi/teh secara tuntas, nyaman, dan bebas rasa ngilu berlebih.",
    includeWhatsappCta: true,
  },
  {
    id: "services_veneers",
    keywords: ["veneer", "veneers", "porcelain veneer", "lapisan gigi"],
    answer:
      "Porcelain Veneers kami dibuat dengan bahan keramik porselen E-Max ultra-tipis presisi tinggi untuk memperbaiki warna, bentuk, celah gigi, dan proporsi senyum secara estetis dan tahan lama.",
    includeWhatsappCta: true,
  },
  {
    id: "services_invisalign",
    keywords: ["invisalign", "aligner", "behel transparan", "kawat gigi", "behel", "ortodonti"],
    answer:
      "Kami menyediakan perawatan Invisalign Clear Aligners (perata gigi transparan tanpa behel kawat) dan Behel Ortodonti Konvensional bersama Dokter Spesialis Ortodonti berlisensi resmi (drg. Nadia Safira, Sp.Ort).",
    includeWhatsappCta: true,
  },
  {
    id: "services_implant",
    keywords: ["implan", "implant", "gigi palsu permanen", "tanam gigi"],
    answer:
      "Dental Implant titanium berkualitas tinggi untuk menggantikan gigi yang hilang secara permanen dengan fungsi kunyah dan estetika menyerupai gigi asli seumur hidup.",
    includeWhatsappCta: true,
  },
  {
    id: "services_root_canal",
    keywords: ["saluran akar", "root canal", "saraf gigi", "tambal saraf", "endodonti"],
    answer:
      "Perawatan Saluran Akar (Root Canal Treatment) dilakukan oleh spesialis konservasi gigi untuk menyelamatkan gigi alami yang terinfeksi pada ruang saraf agar tidak perlu dicabut.",
    includeWhatsappCta: true,
  },
  {
    id: "doctors",
    keywords: ["dokter", "dokter spesialis", "siapa dokternya", "jadwal dokter", "drg"],
    answer:
      "Tim dokter kami adalah spesialis berpengalaman:\n• drg. Yulita Dora (Aesthetic & Cosmetic Dentistry)\n• drg. Nadia Safira, Sp.Ort (Ortodonti / Invisalign)\n• drg. Eric Sulistio, Sp.Perio (Periodonsia & Implan)\n• drg. Yudy Ardila Utomo, Sp.BMM (Bedah Mulut & Odontektomi)\n• drg. Achmad Riwandy (General Dentistry)\n• drg. Della Sparringa (Preventive Dentistry)",
    includeWhatsappCta: true,
  },
  {
    id: "whatsapp",
    keywords: ["whatsapp", "wa", "admin", "telepon", "kontak", "hubungi"],
    answer:
      "Anda dapat langsung menghubungi Admin Resmi Aesthetic Pondok Indah melalui WhatsApp di +62 819-9011-4949 untuk konsultasi cepat, konfirmasi reservasi, atau pertanyaan khusus.",
    includeWhatsappCta: true,
  },
];

const matchKnowledge = (userText: string): KnowledgeItem | null => {
  const normalized = normalizeText(userText);
  if (!normalized) return null;
  for (const item of knowledgeBase) {
    if (item.keywords.some((k) => normalized.includes(normalizeText(k)))) return item;
  }
  return null;
};

const inferChiefComplaint = (text: string): TriageChiefComplaint | null => {
  const t = normalizeText(text);
  if (!t) return null;
  if (/(sakit gigi|nyeri gigi|gigi sakit|berdenyut|ngilu)/.test(t)) return "toothache";
  if (/(bengkak|abses|benjol|gusi bengkak|pipi bengkak)/.test(t)) return "swelling";
  if (/(sensitif|ngilu dingin|ngilu manis|ngilu panas)/.test(t)) return "sensitivity";
  if (/(gusi berdarah|darah saat sikat|berdarah)/.test(t)) return "bleeding";
  if (/(sariawan|ulcer|luka di mulut|aftosa)/.test(t)) return "ulcer";
  if (/(bau mulut|halitosis|mulut bau)/.test(t)) return "bad_breath";
  if (/(behel|braces|kawat|aligner)/.test(t)) return "braces";
  if (/(habis cabut|pasca cabut|setelah cabut|dry socket|bekas cabut)/.test(t)) return "post_extraction";
  if (/(gigi patah|gigi retak|patah|retak)/.test(t)) return "broken_tooth";
  return null;
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [dynamicQuickReplies, setDynamicQuickReplies] = useState<string[]>(defaultQuickReplies);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show tooltip after 2.5s, then hide after 4s
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowTooltip(true);
      const hideTimer = setTimeout(() => setShowTooltip(false), 4500);
      return () => clearTimeout(hideTimer);
    }, 2500);

    return () => clearTimeout(showTimer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = (textToSend?: string) => {
    const rawText = textToSend || inputValue;
    if (!rawText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: rawText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = generateBotReply(rawText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: reply.text,
        sender: "bot",
        timestamp: new Date(),
        cta: reply.cta,
      };

      setMessages((prev) => [...prev, botMessage]);
      if (reply.quickReplies) setDynamicQuickReplies(reply.quickReplies);
      setIsTyping(false);
    }, 600);
  };

  const generateBotReply = (text: string): { text: string; cta?: Message["cta"]; quickReplies?: string[] } => {
    const normalized = normalizeText(text);

    if (normalized.includes("sakit gigi") || normalized.includes("keluhan")) {
      return {
        text: "Saya mengerti keluhan sakit gigi sangat mengganggu kenyamanan Anda. 🩺\n\nLangkah awal yang aman di rumah:\n1. Kumur air garam hangat 2-3 kali sehari.\n2. Hindari makanan/minuman terlalu panas, dingin, atau manis.\n3. Jangan mengunyah di sisi yang sakit.\n\nUntuk diagnosa tepat dan penanganan dokter spesialis, kami sarankan untuk segera menjadwalkan pemeriksaan.",
        cta: {
          label: "💬 Buat Janji via WhatsApp",
          href: WHATSAPP_LINK,
        },
        quickReplies: ["📅 Buat Janji Temu", "👨‍⚕️ Jadwal Dokter", "📍 Lokasi Klinik"],
      };
    }

    if (normalized.includes("layanan") || normalized.includes("biaya") || normalized.includes("harga")) {
      return {
        text: "Klinik Aesthetic Pondok Indah menyediakan layanan dental komprehensif:\n\n✨ Estetika: Dental Whitening, Porcelain Veneers, Smile Makeover\n🦷 Perawatan Umum: Scaling & Polishing, Tambal Gigi Estetik, Root Canal\n😁 Ortodonti: Invisalign Clear Aligners, Behel Gigi\n🏥 Bedah Mulut: Implan Gigi Titanium, Odontektomi Gigi Bungsu\n👶 Gigi Anak: Pembersihan & Aplikasi Fluoride\n\nAda layanan tertentu yang ingin Anda tanyakan lebih lanjut?",
        cta: {
          label: "Konsultasi Layanan via WA",
          href: WHATSAPP_LINK,
        },
        quickReplies: ["Whitening", "Veneer", "Invisalign", "Scaling", "Implan Gigi"],
      };
    }

    if (normalized.includes("jadwal dokter") || normalized.includes("dokter spesialis")) {
      return {
        text: "Tim dokter spesialis kami siap melayani Anda:\n\n• drg. Yulita Dora — Aesthetic & Cosmetic Dentist\n• drg. Nadia Safira, Sp.Ort — Orthodontist & Invisalign Provider\n• drg. Eric Sulistio, Sp.Perio — Periodontist & Dental Implant\n• drg. Yudy Ardila Utomo, Sp.BMM — Oral & Maxillofacial Surgeon\n• drg. Achmad Riwandy & drg. Della Sparringa — General Dentist\n\nJadwal praktik: Senin – Sabtu pk 10.00 – 18.00 WIB.",
        cta: {
          label: "Pilih Jadwal Dokter",
          href: WHATSAPP_LINK,
        },
        quickReplies: ["📅 Buat Janji Temu", "📍 Lokasi Klinik", "💬 Chat WhatsApp"],
      };
    }

    const matched = matchKnowledge(text);
    if (matched) {
      return {
        text: matched.answer,
        cta: matched.includeWhatsappCta ? { label: "Hubungi Admin via WA", href: WHATSAPP_LINK } : undefined,
        quickReplies: defaultQuickReplies.slice(0, 4),
      };
    }

    return {
      text: "Terima kasih atas pertanyaannya! Tim admin dan dokter kami di Aesthetic Pondok Indah siap memberikan informasi lebih detail secara personal melalui WhatsApp resmi klinik.",
      cta: {
        label: "💬 Hubungi WhatsApp Klinik",
        href: WHATSAPP_LINK,
      },
      quickReplies: defaultQuickReplies,
    };
  };

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON (ALWAYS VISIBLE IN BOTTOM RIGHT) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[99999] flex items-end gap-2 pointer-events-auto">
          {/* Tooltip Bubble */}
          <div
            className={`relative mb-1.5 sm:mb-2 transition-all duration-500 ease-out ${
              showTooltip
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-4 pointer-events-none"
            }`}
          >
            <div className="bg-gradient-to-r from-[#C9A24A] via-[#B8943F] to-[#A67F3A] text-white px-3 py-2 rounded-xl rounded-br-none shadow-xl shadow-[#C9A24A]/25 max-w-[170px] sm:max-w-[200px] border border-white/30">
              <p className="text-[11px] sm:text-xs font-semibold leading-snug">
                Bingung mulai dari mana? AESPI Bot siap bantu! ✨
              </p>
            </div>
            <div className="absolute -bottom-1 right-0 w-0 h-0 border-l-6 border-l-transparent border-t-6 border-t-[#A67F3A] border-r-6 border-r-transparent"></div>
          </div>

          {/* Floating Action Button */}
          <button
            type="button"
            onClick={() => {
              setShowTooltip(false);
              setIsOpen(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#C9A24A] via-[#B8943F] to-[#A67F3A] hover:brightness-105 active:scale-95 text-white rounded-full px-3.5 py-2.5 sm:px-4.5 sm:py-3.5 shadow-2xl shadow-[#C9A24A]/40 border border-white/30 transition-all duration-300 hover:scale-105 cursor-pointer touch-manipulation group"
            title="Buka Chat Asisten Virtual"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xs">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <span className="font-bold text-xs sm:text-sm tracking-wide pr-1">AESPI Bot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />
          </button>
        </div>
      )}

      {/* 2. CHATBOT MODAL WINDOW (DESKTOP & MOBILE RESPONSIVE) */}
      {isOpen && (
        <div className="fixed z-[99999] flex flex-col bg-white shadow-2xl shadow-black/30 border border-[#E8DFC8] overflow-hidden bottom-20 right-3.5 left-3.5 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[390px] sm:max-w-[calc(100vw-48px)] w-auto max-h-[calc(100dvh-120px)] sm:max-h-[580px] h-[520px] rounded-3xl animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#C9A24A] via-[#B8943F] to-[#A67F3A] p-3.5 sm:p-4 flex items-center justify-between text-white shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-xs">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-sm sm:text-base leading-tight">AESPI Bot</p>
                <p className="text-[10px] sm:text-xs text-white/90 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Asisten Virtual Aesthetic
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-full text-[10px] sm:text-xs font-bold text-white flex items-center gap-1 transition-colors border border-white/20"
                title="Chat WhatsApp Admin"
              >
                <Phone className="w-3 h-3" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
                title="Tutup Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#FAF8F5]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2.5 ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.sender === "bot"
                      ? "bg-gradient-to-br from-[#C9A24A] to-[#8C6B1C] text-white"
                      : "bg-[#2C2416] text-[#E8C547]"
                  }`}
                >
                  {message.sender === "bot" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[82%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs ${
                    message.sender === "bot"
                      ? "bg-white border border-[#E8DFC8] text-[#2C2416] rounded-tl-none whitespace-pre-line"
                      : "bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white rounded-tr-none"
                  }`}
                >
                  {message.text}
                  {message.sender === "bot" && message.cta && (
                    <div className="mt-2.5 pt-2 border-t border-[#F0E6D3]">
                      <a href={message.cta.href} target="_blank" rel="noopener noreferrer">
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:opacity-90 text-white px-3 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <span>{message.cta.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#C9A24A] to-[#8C6B1C] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-[#E8DFC8] rounded-2xl rounded-tl-none px-3.5 py-3 shadow-xs">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-[#C9A24A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-[#C9A24A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-[#C9A24A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-3 py-2 bg-white border-t border-[#E8DFC8] shrink-0">
            <div className="flex flex-wrap gap-1.5 max-h-[75px] overflow-y-auto">
              {dynamicQuickReplies.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => handleSend(reply)}
                  className="px-2.5 py-1 bg-[#FAF5EA] hover:bg-[#F3E8CF] text-[#8C6B1C] border border-[#EADBBD] text-[11px] font-semibold rounded-full transition-colors cursor-pointer"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-[#E8DFC8] shrink-0">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend(inputValue);
                  }
                }}
                placeholder="Ketik pertanyaan atau keluhan Anda..."
                className="flex-1 rounded-full border-[#E8DFC8] text-xs sm:text-sm h-10 px-4 focus:ring-1 focus:ring-[#C9A24A]"
              />
              <Button
                type="button"
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim()}
                className="w-10 h-10 p-0 rounded-full bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:opacity-90 disabled:opacity-40 text-white cursor-pointer shrink-0"
                title="Kirim Pesan"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
