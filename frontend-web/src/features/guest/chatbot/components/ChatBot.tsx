import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Phone } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

const WHATSAPP_NUMBER = "+6281990114949";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Halo%20Aesthetic%20Pondok%20Indah%20Dental,%20saya%20ingin%20bertanya%20tentang%20layanan%20Anda.`;

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
    text: "Halo! Selamat datang di Aesthetic Pondok Indah Dental. Saya AESPI Bot, asisten virtual yang siap membantu. Anda bisa tanya info layanan/booking, atau ceritakan keluhan gigi & mulut agar saya bisa bantu arahkan langkah awal.",
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

const defaultQuickReplies = ["Keluhan sakit gigi", "Info layanan", "Cara booking", "Lokasi & jam buka"];

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
    id: "contact",
    keywords: ["kontak", "hubungi", "whatsapp", "wa", "telp", "telepon", "email"],
    answer:
      "Anda bisa hubungi kami via WhatsApp +62 819-9011-4949 atau Email info@aestheticpondokindah.com.",
    includeWhatsappCta: true,
  },
  {
    id: "hours",
    keywords: ["jam", "operasional", "buka", "tutup", "senin", "sabtu", "minggu"],
    answer:
      "Jam operasional kami: Senin - Sabtu 10:00 - 18:00 WIB. Minggu: Tutup.",
  },
  {
    id: "location",
    keywords: ["lokasi", "alamat", "maps", "peta", "pondok indah", "jakarta selatan"],
    answer:
      "Lokasi klinik: Pondok Indah, Jakarta Selatan, Indonesia. Anda bisa klik tombol 'Kunjungi Kami' di website untuk membuka peta.",
  },
  {
    id: "about",
    keywords: ["tentang", "about", "company", "profil", "visi", "misi", "cerita"],
    answer:
      "Aesthetic Pondok Indah Dental Clinic berfokus pada solusi dental profesional yang meningkatkan senyum, kepercayaan diri, dan kesehatan jangka panjang. Kami menggabungkan expertise dengan lingkungan klinik yang nyaman serta teknologi modern.",
  },
  {
    id: "services_general",
    keywords: ["layanan", "service", "perawatan", "treatment", "veneer", "invisalign", "implant", "whitening"],
    answer:
      "Kami menyediakan layanan dental premium seperti: Dental Whitening, Root Canal Treatments, Pediatric Dentistry, Full Mouth Rehabilitations, Emergency Dental Services, Dentures, Dental Implants, Wisdom Tooth Removal, Oral Care, Dental Bridges, Bone Grafting, Dental Spa, Veneers, Invisalign, Orthodontics, Dental Fillings/Inlays/Onlays, Gum Ablation, Lip Repositioning, Crown Lengthening, Gummy Smile Correction, dan Frenectomy. Anda bisa lihat detail di halaman 'Layanan'.",
  },
  {
    id: "booking",
    keywords: ["booking", "book", "appointment", "reservasi", "jadwalkan", "konsultasi"],
    answer:
      "Untuk booking konsultasi: klik tombol 'Book Now' di website, isi nama, nomor HP, tanggal, dan pilih dokter. Setelah itu data akan dikirim ke WhatsApp untuk konfirmasi.",
    includeWhatsappCta: true,
  },
  {
    id: "register_account",
    keywords: ["daftar", "register", "buat akun", "akun", "login", "sign in", "lupa password"],
    answer:
      "Untuk daftar akun pengguna: buka halaman Login, lalu klik 'Daftar' dan isi Nama Pengguna, Email, Nomor Telepon, Domisili, dan Password. Jika lupa password, gunakan menu 'Lupa kata sandi?'.",
  },
  {
    id: "doctors",
    keywords: ["dokter", "drg", "sp", "spesialis", "tim dokter"],
    answer:
      "Tim dokter kami terdiri dari dokter gigi dan spesialis berpengalaman (misalnya: drg. Yulita Dora, drg. Della Sparringa, drg. Ryan Jusuf, drg. Nona Lolita T, dan lainnya). Silakan cek halaman 'Dokter' untuk profil lengkap.",
  },
  {
    id: "promo",
    keywords: ["promo", "diskon", "voucher", "10%", "welcome offer"],
    answer:
      "Promo tersedia di website (termasuk voucher diskon 10% untuk pengguna baru). Cek popup promo di Beranda atau carousel promo untuk informasi terbaru.",
    includeWhatsappCta: true,
  },
  {
    id: "blog",
    keywords: ["blog", "artikel", "tips", "informasi", "edukasi"],
    answer:
      "Kami menyediakan artikel Tips & Informasi Kesehatan Gigi di halaman 'Blog' (kategori: Estetika, Tips, Ortodonti, Anak, Restoratif).",
  },
  {
    id: "testimonials_gallery",
    keywords: ["testimoni", "review", "ulasan", "cerita", "galeri", "before", "after", "transformasi"],
    answer:
      "Anda bisa melihat testimoni, galeri, dan video di halaman 'Cerita' serta bagian 'Transformasi Senyum' (Before & After) di Beranda.",
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

const yesNo = (text: string): boolean | null => {
  const t = normalizeText(text);
  if (!t) return null;
  const yes = ["ya", "iya", "y", "betul", "benar", "bener", "ok", "oke", "siap"];
  const no = ["tidak", "ga", "gak", "nggak", "tdk", "no", "bukan"];
  if (yes.some((w) => t === w || t.includes(`${w} `) || t.endsWith(` ${w}`))) return true;
  if (no.some((w) => t === w || t.includes(`${w} `) || t.endsWith(` ${w}`))) return false;
  return null;
};

const extractPainScore = (text: string): number | null => {
  const t = normalizeText(text);
  const m = t.match(/\b([0-9]|10)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  if (Number.isNaN(n)) return null;
  if (n < 0 || n > 10) return null;
  return n;
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

const redFlagFromMemory = (m: TriageMemory): { isRed: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  if (m.difficultySwallowBreath === true) reasons.push("kesulitan menelan/bernapas");
  if (m.fever === true && m.swelling === true) reasons.push("bengkak disertai demam");
  if (m.bleedingHeavy === true) reasons.push("perdarahan banyak/sulit berhenti");
  if (m.trauma === true && (m.chiefComplaint === "broken_tooth" || m.chiefComplaint === "toothache")) reasons.push("cedera/trauma pada gigi atau wajah");
  return { isRed: reasons.length > 0, reasons };
};

const buildDentalAdvice = (m: TriageMemory): { text: string; needsHandoff: boolean } => {
  const lines: string[] = [];

  const { isRed, reasons } = redFlagFromMemory(m);
  if (isRed) {
    lines.push(
      "Dari info yang Anda berikan, ada tanda yang perlu ditangani lebih cepat:",
      `- ${reasons.join("; ")}.`,
      "Saran saya: segera hubungi admin untuk penjadwalan secepatnya atau pertimbangkan IGD bila gejalanya berat/semakin cepat memburuk."
    );
    return { text: lines.join("\n"), needsHandoff: true };
  }

  const chief = m.chiefComplaint ?? "other";
  const pain = typeof m.painScore === "number" ? m.painScore : null;
  const painBand = pain === null ? "unknown" : pain >= 7 ? "high" : pain >= 4 ? "mid" : "low";

  if (chief === "toothache") {
    lines.push("Berikut arahan awal untuk keluhan sakit gigi:");
    lines.push("- Kemungkinan penyebab umum: gigi berlubang (karies), radang saraf gigi, gusi meradang, atau gigi retak.");
    lines.push("- Langkah aman di rumah: kumur air garam hangat 2-3x/hari; jaga kebersihan; kompres dingin dari luar pipi bila bengkak.");
    lines.push("- Hindari: mengunyah sisi sakit, makanan manis/lengket, rokok, dan menempelkan aspirin langsung ke gigi/gusi.");
    if (painBand === "high") {
      lines.push("- Karena nyerinya cukup berat, sebaiknya diperiksa 24 jam ke depan agar penyebabnya jelas dan tidak makin parah.");
    } else if (painBand === "mid") {
      lines.push("- Jika nyeri menetap >24-48 jam, sebaiknya periksa untuk evaluasi lubang/infeksi.");
    } else {
      lines.push("- Jika nyeri ringan tapi sering kambuh, tetap baik diperiksa agar tidak berkembang jadi infeksi.");
    }
  } else if (chief === "swelling") {
    lines.push("Untuk keluhan bengkak gusi/pipi:");
    lines.push("- Bengkak bisa terkait infeksi gigi/gusi. Jangan dipencet/dikorek.");
    lines.push("- Kompres dingin dari luar pipi 10-15 menit, jeda, ulangi.");
    lines.push("- Jika muncul demam, nyeri makin berat, atau bengkak menyebar: sebaiknya periksa segera.");
  } else if (chief === "sensitivity") {
    lines.push("Untuk gigi sensitif (ngilu dingin/manis/panas):");
    lines.push("- Kemungkinan penyebab: enamel menipis, gusi turun, lubang kecil, atau retak halus.");
    lines.push("- Coba: pasta gigi khusus sensitif, sikat lembut, hindari asam/manis berlebih.");
    lines.push("- Jika ngilu tajam saat mengunyah atau makin sering: sebaiknya diperiksa.");
  } else if (chief === "bleeding") {
    lines.push("Untuk gusi berdarah:");
    lines.push("- Penyebab paling sering: radang gusi karena plak/karang gigi.");
    lines.push("- Coba: sikat lembut 2x/hari + floss; kumur air garam.");
    lines.push("- Bila sering berdarah >7 hari atau disertai bengkak/nyeri: sebaiknya scaling & evaluasi gusi.");
  } else if (chief === "ulcer") {
    lines.push("Untuk sariawan/luka di mulut:");
    lines.push("- Umumnya membaik 7-14 hari.");
    lines.push("- Hindari pedas/asam; jaga kebersihan mulut; cukup minum.");
    lines.push("- Jika tidak membaik >2 minggu, membesar cepat, atau sangat nyeri: sebaiknya diperiksa.");
  } else if (chief === "post_extraction") {
    lines.push("Untuk keluhan setelah cabut gigi:");
    lines.push("- Nyeri ringan 1-3 hari masih wajar, tapi nyeri berat + bau tidak enak bisa mengarah ke dry socket.");
    lines.push("- Hindari kumur kencang, sedotan, dan rokok 48-72 jam.");
    lines.push("- Bila nyeri makin berat setelah hari ke-2/3: sebaiknya kontrol.");
  } else if (chief === "broken_tooth") {
    lines.push("Untuk gigi patah/retak:");
    lines.push("- Simpan pecahan (jika ada), bilas lembut.");
    lines.push("- Hindari mengunyah sisi tersebut.");
    lines.push("- Sebaiknya periksa agar bisa ditentukan tambal/mahkota/perawatan saraf bila perlu.");
  } else {
    lines.push("Terima kasih, saya bantu arahkan secara umum.");
    lines.push("- Ceritakan keluhannya singkat (apa yang dirasakan), sudah berapa lama, dan apakah ada bengkak/demam.");
  }

  lines.push("Jika Anda mau, saya bisa bantu simpulkan dan arahkan langkah berikutnya. Anda juga bisa chat admin untuk booking.");
  return { text: lines.join("\n"), needsHandoff: false };
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [stage, setStage] = useState<TriageStage>("intent");
  const [memory, setMemory] = useState<TriageMemory>({
    intent: null,
    chiefComplaint: null,
    painScore: null,
    duration: null,
    location: null,
    trigger: null,
    swelling: null,
    fever: null,
    trauma: null,
    pusTaste: null,
    bleedingHeavy: null,
    difficultySwallowBreath: null,
    pregnant: null,
    ageGroup: null,
    medications: null,
    allergies: null,
    lastDentalVisit: null,
  });
  const [dynamicQuickReplies, setDynamicQuickReplies] = useState<string[]>(defaultQuickReplies);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tooltip animation: loop with 3s delay, show for 3s, then hide
  useEffect(() => {
    const cycle = () => {
      setShowTooltip(true);
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
      return hideTimer;
    };

    // Initial delay 3s, then start cycle
    const startTimer = setTimeout(() => {
      const hideTimer = cycle();
      // Repeat cycle every 6 seconds (3s delay + 3s visible)
      const interval = setInterval(() => {
        cycle();
      }, 6000);

      return () => {
        clearTimeout(hideTimer);
        clearInterval(interval);
      };
    }, 3000);

    return () => clearTimeout(startTimer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(text.trim());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.text,
        sender: "bot",
        timestamp: new Date(),
        cta: botResponse.cta,
      };
      setMessages((prev) => [...prev, botMessage]);
      if (botResponse.quickReplies && botResponse.quickReplies.length > 0) {
        setDynamicQuickReplies(botResponse.quickReplies);
      }
      if (botResponse.set?.stage) setStage(botResponse.set.stage);
      if (botResponse.set?.memory) setMemory((prev) => ({ ...prev, ...botResponse.set!.memory }));
      setIsTyping(false);
    }, 1000);
  };

  const getBotResponse = (userText: string): BotPlan => {
    const normalized = normalizeText(userText);
    if (["halo", "hi", "hello"].some((k) => normalized.includes(k))) {
      return {
        text: "Halo! Saya AESPI Bot. Anda bisa tanya info klinik/booking, atau ceritakan keluhan gigi & mulut agar saya bantu arahkan.",
        quickReplies: defaultQuickReplies,
      };
    }

    if (["terima kasih", "thanks", "makasih"].some((k) => normalized.includes(k))) {
      return { text: "Sama-sama!" };
    }

    if (["reset", "mulai ulang", "ulang", "hapus"].some((k) => normalized.includes(k))) {
      return {
        text: "Baik, saya mulai ulang. Anda ingin tanya info klinik atau konsultasi keluhan gigi/mulut?",
        quickReplies: defaultQuickReplies,
        set: {
          stage: "intent",
          memory: {
            intent: null,
            chiefComplaint: null,
            painScore: null,
            duration: null,
            location: null,
            trigger: null,
            swelling: null,
            fever: null,
            trauma: null,
            pusTaste: null,
            bleedingHeavy: null,
            difficultySwallowBreath: null,
            pregnant: null,
            ageGroup: null,
            medications: null,
            allergies: null,
            lastDentalVisit: null,
          },
        },
      };
    }

    if (["dokter gigi", "konsultasi", "keluhan", "sakit gigi", "bengkak", "ngilu", "darah"].some((k) => normalized.includes(k))) {
      const inferred = inferChiefComplaint(userText);
      return {
        text: inferred
          ? "Baik, saya bantu. Sebelum saya simpulkan, skala nyerinya berapa dari 0-10? (0 tidak nyeri, 10 sangat nyeri)"
          : "Baik, saya bantu sebagai triage awal. Keluhan utamanya apa? (mis. sakit gigi / gusi bengkak / ngilu / gusi berdarah / sariawan)",
        quickReplies: inferred
          ? ["0", "3", "5", "7", "9", "10"]
          : ["Sakit gigi", "Gusi bengkak", "Ngilu sensitif", "Gusi berdarah"],
        set: {
          stage: inferred ? "pain_score" : "chief_complaint",
          memory: {
            intent: "dental_triage",
            chiefComplaint: inferred,
            complaintFreeText: inferred ? userText : undefined,
          },
        },
      };
    }

    if (stage !== "idle") {
      if (stage === "intent") {
        const inferred = inferChiefComplaint(userText);
        const wantsInfo = ["layanan", "service", "booking", "jadwal", "jam", "lokasi", "alamat", "promo", "dokter"].some((k) => normalized.includes(k));
        if (wantsInfo && !inferred) {
          const matched = matchKnowledge(userText);
          if (matched) {
            return {
              text: matched.answer,
              cta: matched.includeWhatsappCta
                ? {
                    label: "Hubungi Admin",
                    href: WHATSAPP_LINK,
                  }
                : undefined,
              quickReplies: defaultQuickReplies,
              set: { stage: "intent", memory: { intent: "info" } },
            };
          }
          return {
            text: "Boleh. Anda mau info apa? (layanan / booking / lokasi / jam operasional / promo / dokter)",
            quickReplies: ["Layanan kami", "Cara booking", "Lokasi", "Jam operasional"],
            set: { stage: "intent", memory: { intent: "info" } },
          };
        }

        if (inferred) {
          return {
            text: "Baik, saya bantu. Skala nyerinya berapa dari 0-10?",
            quickReplies: ["0", "3", "5", "7", "9", "10"],
            set: {
              stage: "pain_score",
              memory: {
                intent: "dental_triage",
                chiefComplaint: inferred,
                complaintFreeText: userText,
              },
            },
          };
        }

        return {
          text: "Anda ingin tanya info klinik/booking, atau konsultasi keluhan gigi & mulut?",
          quickReplies: defaultQuickReplies,
          set: { stage: "intent" },
        };
      }

      if (stage === "chief_complaint") {
        const inferred = inferChiefComplaint(userText) ?? "other";
        return {
          text: "Terima kasih. Skala nyerinya berapa dari 0-10?",
          quickReplies: ["0", "3", "5", "7", "9", "10"],
          set: {
            stage: "pain_score",
            memory: { chiefComplaint: inferred, complaintFreeText: userText, intent: "dental_triage" },
          },
        };
      }

      if (stage === "pain_score") {
        const score = extractPainScore(userText);
        if (score === null) {
          return {
            text: "Boleh sebutkan angka 0-10 ya. (0 tidak nyeri, 10 sangat nyeri)",
            quickReplies: ["0", "3", "5", "7", "9", "10"],
            set: { stage: "pain_score" },
          };
        }
        return {
          text: "Sudah berapa lama keluhannya? (mis. 2 jam / 3 hari / 2 minggu)",
          quickReplies: ["Baru hari ini", "1-3 hari", ">1 minggu", "Kambuhan"],
          set: { stage: "duration", memory: { painScore: score } },
        };
      }

      if (stage === "duration") {
        return {
          text: "Lokasinya di bagian mana? (atas/bawah, kiri/kanan, depan/belakang). Kalau tidak yakin, sebutkan yang paling mendekati.",
          quickReplies: ["Atas kiri", "Atas kanan", "Bawah kiri", "Bawah kanan"],
          set: { stage: "location", memory: { duration: userText } },
        };
      }

      if (stage === "location") {
        return {
          text: "Ada pemicu tertentu? Misalnya ngilu saat dingin/manis, atau sakit saat mengunyah?",
          quickReplies: ["Dingin", "Manis", "Mengunyah", "Tanpa pemicu jelas"],
          set: { stage: "triggers", memory: { location: userText } },
        };
      }

      if (stage === "triggers") {
        const inferredSwelling = /(bengkak|pipi bengkak|gusi bengkak)/.test(normalized);
        return {
          text: "Sekarang saya cek tanda penting dulu. Apakah ada bengkak pada gusi/pipi? (ya/tidak)",
          quickReplies: inferredSwelling ? ["Ya", "Tidak"] : ["Tidak", "Ya"],
          set: { stage: "red_flags", memory: { trigger: userText } },
        };
      }

      if (stage === "red_flags") {
        const yn = yesNo(userText);
        if (memory.swelling === null) {
          if (yn === null) {
            return {
              text: "Jawab ya/tidak ya. Apakah ada bengkak pada gusi/pipi?",
              quickReplies: ["Ya", "Tidak"],
              set: { stage: "red_flags" },
            };
          }
          return {
            text: "Apakah disertai demam atau badan menggigil? (ya/tidak)",
            quickReplies: ["Tidak", "Ya"],
            set: { stage: "red_flags", memory: { swelling: yn } },
          };
        }

        if (memory.fever === null) {
          if (yn === null) {
            return {
              text: "Jawab ya/tidak ya. Apakah ada demam/menggigil?",
              quickReplies: ["Tidak", "Ya"],
              set: { stage: "red_flags" },
            };
          }
          return {
            text: "Ada kesulitan menelan atau sesak napas? (ya/tidak)",
            quickReplies: ["Tidak", "Ya"],
            set: { stage: "red_flags", memory: { fever: yn } },
          };
        }

        if (memory.difficultySwallowBreath === null) {
          if (yn === null) {
            return {
              text: "Jawab ya/tidak ya. Apakah ada kesulitan menelan/napas?",
              quickReplies: ["Tidak", "Ya"],
              set: { stage: "red_flags" },
            };
          }
          const nextMemory = { difficultySwallowBreath: yn };
          const merged = { ...memory, ...nextMemory };
          const advice = buildDentalAdvice(merged);
          return {
            text: `Ringkas info Anda:\n- Keluhan: ${memory.chiefComplaint ?? "-"}\n- Nyeri: ${memory.painScore ?? "-"}/10\n- Durasi: ${memory.duration ?? "-"}\n- Lokasi: ${memory.location ?? "-"}\n- Pemicu: ${memory.trigger ?? "-"}\n- Bengkak: ${merged.swelling === null ? "-" : merged.swelling ? "Ya" : "Tidak"}\n- Demam: ${merged.fever === null ? "-" : merged.fever ? "Ya" : "Tidak"}\n- Sulit menelan/napas: ${merged.difficultySwallowBreath ? "Ya" : "Tidak"}\n\n${advice.text}`,
            cta: advice.needsHandoff
              ? {
                  label: "Hubungi Admin",
                  href: WHATSAPP_LINK,
                }
              : {
                  label: "Booking via WhatsApp",
                  href: WHATSAPP_LINK,
                },
            quickReplies: advice.needsHandoff ? ["Hubungi Admin", "Mulai ulang"] : ["Mulai ulang", "Info layanan", "Cara booking"],
            set: {
              stage: "summary",
              memory: nextMemory,
            },
          };
        }
      }
    }

    const matched = matchKnowledge(userText);
    if (matched) {
      return {
        text: matched.answer,
        cta: matched.includeWhatsappCta
          ? {
              label: "Hubungi Admin",
              href: WHATSAPP_LINK,
            }
          : undefined,
        quickReplies: defaultQuickReplies,
        set: { stage: "intent", memory: { intent: "info" } },
      };
    }

    return {
      text: "Agar saya tidak salah arah, Anda ingin tanya info klinik/booking atau konsultasi keluhan gigi & mulut?",
      cta: {
        label: "Hubungi Admin",
        href: WHATSAPP_LINK,
      },
      quickReplies: defaultQuickReplies,
      set: { stage: "intent" },
    };
  };

  return (
    <>
      {/* Floating Chat Button with Tooltip */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-end gap-1.5 sm:gap-2">
          {/* Tooltip Bubble - slides from button */}
          <div
            className={`relative mb-1.5 sm:mb-2 transition-all duration-500 ease-out ${
              showTooltip
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-4 pointer-events-none"
            }`}
          >
            <div className="bg-gradient-gold text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl rounded-br-none shadow-lg max-w-[140px] sm:max-w-[180px]">
              <p className="text-[10px] sm:text-xs font-medium leading-relaxed">
                Bingung mulai dari mana? AESPI Bot bisa bantu!
              </p>
            </div>
            <div className="absolute -bottom-1 right-0 w-0 h-0 border-l-4 sm:border-l-6 border-l-transparent border-t-4 sm:border-t-6 border-t-brand-gold border-r-4 sm:border-r-6 border-r-transparent"></div>
          </div>

          {/* Chat Button - Smaller on mobile */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 bg-gradient-gold hover:opacity-90 text-white rounded-full px-2.5 py-2 sm:px-4 sm:py-3 shadow-lg shadow-brand-gold/30 transition-all duration-300 hover:scale-105"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
            <span className="font-semibold text-[10px] sm:text-sm">AESPI Bot</span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed z-50 flex flex-col bg-background shadow-2xl shadow-black/20 border border-border overflow-hidden bottom-3 right-3 left-3 top-3 sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:w-[380px] sm:max-w-[calc(100vw-48px)] w-auto max-h-[calc(100dvh-24px)] sm:max-h-[80vh] rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-gold p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm sm:text-base">AESPI Bot</p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] sm:text-xs text-white/90 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  Hubungi Admin
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-brand-cream/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === "bot"
                      ? "bg-gradient-gold text-white"
                      : "bg-brand-gold-light text-brand-gold"
                  }`}
                >
                  {message.sender === "bot" ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm leading-relaxed ${
                    message.sender === "bot"
                      ? "bg-white border border-border text-brand-charcoal rounded-tl-none"
                      : "bg-gradient-gold text-white rounded-tr-none"
                  }`}
                >
                  {message.text}
                  {message.sender === "bot" && message.cta && (
                    <div className="mt-2">
                      <a href={message.cta.href} target="_blank" rel="noopener noreferrer">
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 rounded-full bg-gradient-gold hover:opacity-90 text-white px-3"
                        >
                          {message.cta.label}
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="bg-white border border-border rounded-2xl rounded-tl-none px-3 sm:px-4 py-2 sm:py-3">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-brand-gold/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-brand-gold/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-brand-gold/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-3 sm:px-4 py-2 bg-white border-t border-border">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-nowrap sm:gap-2">
              {dynamicQuickReplies.slice(0, 4).map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => handleSend(reply)}
                  className="min-w-0 px-3 py-2 sm:px-2.5 sm:py-1.5 bg-brand-gold-light/40 hover:bg-brand-gold-light text-brand-gold text-xs font-semibold rounded-full transition-colors truncate"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 bg-white border-t border-border">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend(inputValue);
                  }
                }}
                placeholder="Ketik pesan Anda..."
                className="flex-1 rounded-full border-border text-sm h-10"
              />
              <Button
                type="button"
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim()}
                className="w-9 h-9 sm:w-10 sm:h-10 p-0 rounded-full bg-gradient-gold hover:opacity-90 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
