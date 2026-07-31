import { API_BASE } from "@/lib/apiConfig";

function getToken(): string | null {
  return localStorage.getItem("apident:token");
}

function headers() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ConsultationItem {
  id: string;
  userId: string;
  doctorId?: string | null;
  type: "quick" | "scheduled";
  status: "Menunggu" | "Dijadwalkan" | "Selesai";
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
  createdAt?: string;
  user?: { id: string; name: string; email: string };
}

export interface CreateQuickConsultationInput {
  type: "quick";
  topic?: string;
  category?: string;
  chiefComplaint: string;
  duration?: string;
  painScale?: number;
  allergies?: string;
  medications?: string;
  priorTreatment?: string;
  preferredContact?: string;
  contactNumber?: string;
  expectations?: string;
  attachments?: { url?: string; name: string; size?: number; type?: string }[];
}

export interface CreateScheduledConsultationInput {
  type: "scheduled";
  topic?: string;
  category?: string;
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
  attachments?: { url?: string; name: string; size?: number; type?: string }[];
  doctorName?: string;
  scheduleDate?: string;
  scheduleTime?: string;
  location?: string;
  doctorScheduleId?: number;
}

export async function getMyConsultations(): Promise<ConsultationItem[]> {
  const res = await fetch(`${API_BASE}/user/consultations`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Gagal memuat konsultasi");
  return res.json();
}

export async function createConsultation(
  input: CreateQuickConsultationInput | CreateScheduledConsultationInput
): Promise<ConsultationItem> {
  const res = await fetch(`${API_BASE}/user/consultations`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Gagal membuat konsultasi");
  }
  return res.json();
}

// Admin APIs
export async function getAllConsultations(params?: {
  search?: string;
  status?: string;
  type?: string;
}): Promise<ConsultationItem[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.status && params.status !== "Semua") qs.set("status", params.status);
  if (params?.type && params.type !== "Semua") qs.set("type", params.type);

  const res = await fetch(`${API_BASE}/admin/consultations?${qs.toString()}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Gagal memuat daftar konsultasi");
  return res.json();
}

export async function getConsultationDetail(id: string): Promise<ConsultationItem> {
  const res = await fetch(`${API_BASE}/admin/consultations/${id}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Gagal memuat detail konsultasi");
  return res.json();
}

// Doctor APIs
export async function getDoctorScheduledConsultations(): Promise<ConsultationItem[]> {
  const res = await fetch(`${API_BASE}/doctor/consultations`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Gagal memuat daftar konsultasi");
  return res.json();
}

export async function updateConsultationStatus(
  id: string,
  status: "Menunggu" | "Dijadwalkan" | "Selesai"
): Promise<ConsultationItem> {
  const res = await fetch(`${API_BASE}/admin/consultations/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Gagal memperbarui status");
  return res.json();
}
