export const WHATSAPP_NUMBER = "+62 819-9011-4949";
export const WHATSAPP_LINK = `https://wa.me/6281990114949?text=Halo%20Aesthetic%20Pondok%20Indah%20Dental,%20saya%20ingin%20bertanya%20tentang%20layanan%20Anda.`;

export interface ChatMessage {
  id: string;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
  cta?: {
    label: string;
    href: string;
  };
}

export type ChatIntent = "info" | "dental_triage";

export type TriageChiefComplaint =
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

export type TriageMemory = {
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
};
