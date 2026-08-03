import type { ConsultationStatus, MeetingProvider } from "@/shared/consultation/types/consultation";

export const STATUS_META: Record<
  ConsultationStatus,
  { label: string; badgeClassName: string; dotClassName: string }
> = {
  Menunggu: {
    label: "Menunggu",
    badgeClassName: "bg-amber-50 text-amber-700 border border-amber-200",
    dotClassName: "bg-amber-500",
  },
  Dijadwalkan: {
    label: "Terjadwal",
    badgeClassName: "bg-sky-50 text-sky-700 border border-sky-200",
    dotClassName: "bg-sky-500",
  },
  Dibuka: {
    label: "Sedang Ditangani",
    badgeClassName: "bg-violet-50 text-violet-700 border border-violet-200",
    dotClassName: "bg-violet-500",
  },
  Selesai: {
    label: "Selesai",
    badgeClassName: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dotClassName: "bg-emerald-500",
  },
  Ditolak: {
    label: "Ditolak",
    badgeClassName: "bg-red-50 text-red-600 border border-red-200",
    dotClassName: "bg-red-500",
  },
};

export const TYPE_META: Record<
  "quick" | "scheduled",
  { label: string; badgeClassName: string }
> = {
  quick: {
    label: "Konsultasi Instan",
    badgeClassName: "bg-violet-50 text-violet-700 border border-violet-200",
  },
  scheduled: {
    label: "Konsultasi Instan",
    badgeClassName: "bg-violet-50 text-violet-700 border border-violet-200",
  },
};

export const MEETING_PROVIDERS: {
  value: MeetingProvider;
  label: string;
  placeholder: string;
}[] = [
  { value: "zoom", label: "Zoom", placeholder: "https://zoom.us/j/..." },
  { value: "google_meet", label: "Google Meet", placeholder: "https://meet.google.com/..." },
  { value: "microsoft_teams", label: "Microsoft Teams", placeholder: "https://teams.microsoft.com/l/meetup-join/..." },
  { value: "custom", label: "Custom URL", placeholder: "https://..." },
];

export const QUICK_REPLIES = [
  "Baik, saya akan segera memeriksa keluhan Anda.",
  "Silakan tunggu sebentar ya.",
  "Boleh saya minta nomor WhatsApp Anda?",
  "Mohon kirimkan foto kondisi gigi Anda jika memungkinkan.",
  "Keluhan ini sebaiknya diperiksa langsung di klinik.",
  "Terima kasih atas informasinya.",
];
