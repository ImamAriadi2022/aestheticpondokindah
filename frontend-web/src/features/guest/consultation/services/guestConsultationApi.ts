import { apiClient } from "@/core/api/apiClient";
import type {
  Consultation,
  ConsultationMeeting,
  ConsultationMessage,
} from "@/shared/consultation/types/consultation";

export interface CreateGuestConsultationInput {
  name: string;
  phone: string;
  email?: string;
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

export interface GuestConsultationDetail extends Consultation {
  messages?: ConsultationMessage[];
  meetings?: ConsultationMeeting[];
}

export interface GuestConsultationResponse {
  consultation: GuestConsultationDetail;
  token: string;
}

export async function createGuestConsultation(
  input: CreateGuestConsultationInput
): Promise<GuestConsultationResponse> {
  return apiClient.post<GuestConsultationResponse>("/public/consultations", input, {
    skipAuth: true,
    skipToast: true,
  });
}

export async function getGuestConsultation(
  token: string
): Promise<GuestConsultationResponse> {
  return apiClient.get<GuestConsultationResponse>(`/public/consultations/${token}`, {
    skipAuth: true,
    skipToast: true,
  });
}

export async function sendGuestMessage(
  token: string,
  body: string
): Promise<ConsultationMessage> {
  const res = await apiClient.post<{ message: ConsultationMessage }>(
    `/public/consultations/${token}/messages`,
    { body },
    { skipAuth: true, skipToast: true }
  );
  return res.message;
}

export async function markGuestRead(token: string): Promise<number> {
  const res = await apiClient.post<{ read: number }>(
    `/public/consultations/${token}/read`,
    undefined,
    { skipAuth: true, skipToast: true }
  );
  return res.read ?? 0;
}
