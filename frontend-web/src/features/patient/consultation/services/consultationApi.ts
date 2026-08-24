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

export async function getMyConsultations(options?: { silent?: boolean }): Promise<ConsultationItem[]> {
  const res = await apiClient.get<any>("/user/consultations", { skipToast: true, timeoutMs: 12000 });
  return Array.isArray(res) ? res : res?.data || res?.consultations || [];
}

export async function createConsultation(
  input: CreateQuickConsultationInput | CreateScheduledConsultationInput
): Promise<ConsultationItem> {
  const res = await apiClient.post<ConsultationItem>("/user/consultations", input);
  return (res as any)?.data || res;
}

export async function getMyConsultationDetail(id: string, options?: { silent?: boolean }): Promise<Consultation> {
  const res = await apiClient.get<{ consultation: Consultation }>(
    `/user/consultations/${id}`,
    { skipToast: options?.silent ?? true, timeoutMs: 12000 }
  );
  return res?.consultation || (res as any)?.data || (res as any);
}

export async function sendMyConsultationMessage(
  id: string,
  body: string
): Promise<ConsultationMessage> {
  const res = await apiClient.post<{ message: ConsultationMessage }>(
    `/user/consultations/${id}/messages`,
    { body },
    { timeoutMs: 12000 }
  );
  return res?.message || (res as any)?.data || (res as any);
}

export async function markMyConsultationRead(id: string): Promise<number> {
  try {
    const res = await apiClient.post<{ read: number }>(
      `/user/consultations/${id}/read`,
      {},
      { skipToast: true, timeoutMs: 8000 }
    );
    return res?.read ?? 0;
  } catch {
    return 0;
  }
}

export async function getMyConsultationMeetings(id: string): Promise<ConsultationMeeting[]> {
  const res = await apiClient.get<{ meetings: ConsultationMeeting[] }>(
    `/user/consultations/${id}/meetings`,
    { skipToast: true }
  );
  return res?.meetings || [];
}

// Admin APIs
export async function getAllConsultations(params?: {
  search?: string;
  status?: string;
  type?: string;
}, options?: { silent?: boolean }): Promise<ConsultationItem[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.status && params.status !== "Semua") qs.set("status", params.status);
  if (params?.type && params.type !== "Semua") qs.set("type", params.type);

  const url = `/admin/consultations${qs.toString() ? `?${qs.toString()}` : ""}`;
  const res = await apiClient.get<any>(url, { skipToast: options?.silent ?? true, timeoutMs: 12000 });
  return Array.isArray(res) ? res : res?.data || res?.consultations || [];
}

export async function getConsultationDetail(id: string, options?: { silent?: boolean }): Promise<Consultation> {
  const res = await apiClient.get<{ consultation: Consultation }>(
    `/admin/consultations/${id}`,
    { skipToast: options?.silent ?? true, timeoutMs: 12000 }
  );
  return res?.consultation || (res as any)?.data || (res as any);
}

export async function getConsultationQueue(): Promise<ConsultationQueue> {
  return apiClient.get<ConsultationQueue>("/admin/consultations/queue", { skipToast: true });
}

export async function getDoctorsAvailability(): Promise<DoctorAvailabilityItem[]> {
  return apiClient.get<DoctorAvailabilityItem[]>("/admin/doctors-availability", { skipToast: true });
}

export async function acceptConsultation(id: string): Promise<Consultation> {
  const res = await apiClient.post<{ consultation: Consultation }>(
    `/admin/consultations/${id}/accept`,
    {},
    { skipToast: true, timeoutMs: 10000 }
  );
  return res?.consultation || (res as any)?.data || (res as any);
}

export async function rejectConsultation(id: string, reason?: string): Promise<Consultation> {
  const res = await apiClient.post<{ consultation: Consultation }>(
    `/admin/consultations/${id}/reject`,
    { reason }
  );
  return res?.consultation || (res as any)?.data || (res as any);
}

export async function transferConsultation(
  id: string,
  doctorId: string | number
): Promise<Consultation> {
  const res = await apiClient.post<{ consultation: Consultation }>(
    `/admin/consultations/${id}/transfer`,
    { doctorId }
  );
  return res?.consultation || (res as any)?.data || (res as any);
}

export async function closeConsultation(id: string): Promise<Consultation> {
  const res = await apiClient.post<{ consultation: Consultation }>(
    `/admin/consultations/${id}/close`,
    {},
    { timeoutMs: 12000 }
  );
  return res?.consultation || (res as any)?.data || (res as any);
}

export async function sendAdminConsultationMessage(
  id: string,
  body: string
): Promise<ConsultationMessage> {
  const res = await apiClient.post<{ message: ConsultationMessage }>(
    `/admin/consultations/${id}/messages`,
    { body },
    { timeoutMs: 12000 }
  );
  return res?.message || (res as any)?.data || (res as any);
}

export async function markAdminConsultationRead(id: string): Promise<number> {
  try {
    const res = await apiClient.post<{ read: number }>(
      `/admin/consultations/${id}/read`,
      {},
      { skipToast: true, timeoutMs: 8000 }
    );
    return res?.read ?? 0;
  } catch {
    return 0;
  }
}

// Doctor APIs
export async function getDoctorScheduledConsultations(): Promise<ConsultationItem[]> {
  const res = await apiClient.get<any>("/doctor/consultations", { skipToast: true });
  return Array.isArray(res) ? res : res?.data || res?.consultations || [];
}

export async function updateConsultationStatus(
  id: string,
  status: ConsultationStatus
): Promise<ConsultationItem> {
  const res = await apiClient.put<any>(`/admin/consultations/${id}`, { status });
  return (res as any)?.data || res;
}

export type { ConsultationStatus, ConsultationType };
