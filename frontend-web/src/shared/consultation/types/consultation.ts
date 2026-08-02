export type ConsultationStatus = "Menunggu" | "Dijadwalkan" | "Dibuka" | "Selesai" | "Ditolak";

export type ConsultationType = "quick" | "scheduled";

export type MessageSenderRole = "patient" | "doctor" | "admin";

export type MeetingProvider = "zoom" | "google_meet" | "microsoft_teams" | "custom";

export interface Consultation {
  id: string;
  userId: string | null;
  user?: { id: string; name: string; email: string } | null;
  isGuest?: boolean;
  participantName?: string;
  guestPhone?: string;
  doctorId: string | null;
  adminId?: string | null;
  type: ConsultationType;
  status: ConsultationStatus;
  topic: string;
  category?: string;
  doctorName: string;
  date: string;
  chiefComplaint: string;
  duration?: string;
  painScale?: number;
  allergies?: string;
  medications?: string;
  priorTreatment?: string;
  preferredContact?: string;
  contactNumber?: string;
  expectations?: string;
  notes?: string;
  scheduleDate?: string;
  scheduleTime?: string;
  location?: string;
  attachments?: { url?: string; name: string; size?: number; type?: string }[];
  reservationId?: string | null;
  visitId?: string | null;
  unreadCount?: number;
  createdAt?: string;
  messages?: ConsultationMessage[];
  meetings?: ConsultationMeeting[];
  medicalRecord?: {
    id: string;
    recordNumber?: string;
    status?: string;
    summaryNotes?: string;
    visitId?: string;
    finalizedAt?: string;
  } | null;
}

export type DoctorConsultation = Consultation;

export interface ConsultationMessage {
  id: string;
  senderId: string | null;
  senderRole: MessageSenderRole;
  senderName?: string;
  body: string;
  attachments?: { url?: string; name: string; size?: number; type?: string }[];
  readAt?: string;
  createdAt?: string;
}

export interface ConsultationMeeting {
  id: string;
  consultationId: string;
  provider: MeetingProvider;
  title?: string;
  url: string;
  startsAt?: string;
  createdAt?: string;
}

export interface ConsultationSummary {
  today: number;
  waiting: number;
  current: number;
  completed: number;
}

export interface ConsultationDashboard {
  summary: ConsultationSummary;
  recent: Consultation[];
}

export interface PatientClinicalRecord {
  id: string;
  record_number?: string;
  status?: string;
  summary_notes?: string;
  finalized_at?: string;
  doctor_name?: string;
  diagnoses?: { name: string; type?: string; icd10_code?: string }[];
  procedures?: { name: string; status?: string; tooth_number?: string }[];
}

export interface PatientVisit {
  id: string;
  visit_number?: string;
  status?: string;
  visit_date?: string;
  chief_complaint?: string;
  doctor_name?: string;
}

export interface PatientSummary {
  patient: {
    id: string;
    name: string;
    email: string;
    whatsapp?: string;
    gender?: string;
    birth_date?: string;
    blood_type?: string;
    job?: string;
    address?: string;
    membership_level?: string;
  };
  visits: PatientVisit[];
  medical_records: PatientClinicalRecord[];
  history: Consultation[];
}

export interface MeetingInput {
  provider: MeetingProvider;
  title?: string;
  url: string;
  startsAt?: string;
}

export interface ConsultationQueue {
  queue: Consultation[];
  counts: {
    waiting: number;
    active: number;
    completed: number;
    rejected: number;
    scheduled: number;
  };
}

export interface DoctorAvailabilityItem {
  id: string;
  name: string;
  specialization?: string;
  primary_branch?: string;
  schedules: {
    id: string;
    date?: string;
    time_range?: string;
    location?: string;
    slots_left?: number;
    total_slots?: number;
  }[];
}
