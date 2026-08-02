import { API_BASE } from "@/core/api/apiConfig";
import { apiClient } from "@/core/api/apiClient";
import type {
  Consultation,
  ConsultationMeeting,
  ConsultationMessage,
  ConsultationQueue,
  ConsultationStatus,
  ConsultationType,
  DoctorAvailabilityItem,
} from "@/shared/consultation/types/consultation";

export type ConsultationItem = Consultation;

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

export async function getMyConsultationDetail(id: string): Promise<Consultation> {
  const res = await apiClient.get<{ consultation: Consultation }>(
    `/user/consultations/${id}`
  );
  return res.consultation;
}

export async function sendMyConsultationMessage(
  id: string,
  body: string
): Promise<ConsultationMessage> {
  const res = await apiClient.post<{ message: ConsultationMessage }>(
    `/user/consultations/${id}/messages`,
    { body }
  );
  return res.message;
}

export async function markMyConsultationRead(id: string): Promise<number> {
  const res = await apiClient.post<{ read: number }>(`/user/consultations/${id}/read`);
  return res.read ?? 0;
}

export async function getMyConsultationMeetings(id: string): Promise<ConsultationMeeting[]> {
  const res = await apiClient.get<{ meetings: ConsultationMeeting[] }>(
    `/user/consultations/${id}/meetings`
  );
  return res.meetings;
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

export async function getConsultationDetail(id: string): Promise<Consultation> {
  const res = await apiClient.get<{ consultation: Consultation }>(
    `/admin/consultations/${id}`
  );
  return res.consultation;
}

export async function getConsultationQueue(): Promise<ConsultationQueue> {
  return apiClient.get<ConsultationQueue>("/admin/consultations/queue");
}

export async function getDoctorsAvailability(): Promise<DoctorAvailabilityItem[]> {
  return apiClient.get<DoctorAvailabilityItem[]>("/admin/doctors-availability");
}

export async function acceptConsultation(id: string): Promise<Consultation> {
  const res = await apiClient.post<{ consultation: Consultation }>(
    `/admin/consultations/${id}/accept`
  );
  return res.consultation;
}

export async function rejectConsultation(id: string, reason?: string): Promise<Consultation> {
  const res = await apiClient.post<{ consultation: Consultation }>(
    `/admin/consultations/${id}/reject`,
    { reason }
  );
  return res.consultation;
}

export async function transferConsultation(
  id: string,
  doctorId: string | number
): Promise<Consultation> {
  const res = await apiClient.post<{ consultation: Consultation }>(
    `/admin/consultations/${id}/transfer`,
    { doctorId }
  );
  return res.consultation;
}

export async function closeConsultation(id: string): Promise<Consultation> {
  const res = await apiClient.post<{ consultation: Consultation }>(
    `/admin/consultations/${id}/close`
  );
  return res.consultation;
}

export async function sendAdminConsultationMessage(
  id: string,
  body: string
): Promise<ConsultationMessage> {
  const res = await apiClient.post<{ message: ConsultationMessage }>(
    `/admin/consultations/${id}/messages`,
    { body }
  );
  return res.message;
}

export async function markAdminConsultationRead(id: string): Promise<number> {
  const res = await apiClient.post<{ read: number }>(`/admin/consultations/${id}/read`);
  return res.read ?? 0;
}

// Doctor APIs (kept for reference / reuse)
export async function getDoctorScheduledConsultations(): Promise<ConsultationItem[]> {
  const res = await fetch(`${API_BASE}/doctor/consultations`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("Gagal memuat daftar konsultasi");
  return res.json();
}

export async function updateConsultationStatus(
  id: string,
  status: ConsultationStatus
): Promise<ConsultationItem> {
  const res = await fetch(`${API_BASE}/admin/consultations/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Gagal memperbarui status");
  return res.json();
}

export type { ConsultationStatus, ConsultationType };
