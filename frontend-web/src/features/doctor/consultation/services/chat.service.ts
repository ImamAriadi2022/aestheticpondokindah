import { apiClient } from "@/core/api/apiClient";
import type { ConsultationMessage } from "@/features/doctor/consultation/types/consultation";

export async function getConsultationMessages(id: string): Promise<ConsultationMessage[]> {
  const res = await apiClient.get<{ messages: ConsultationMessage[] }>(
    `/doctor/consultations/${id}/messages`
  );
  return res.messages;
}

export async function sendConsultationMessage(
  id: string,
  body: string
): Promise<ConsultationMessage> {
  const res = await apiClient.post<{ message: ConsultationMessage }>(
    `/doctor/consultations/${id}/messages`,
    { body }
  );
  return res.message;
}

export async function markConsultationRead(id: string): Promise<number> {
  const res = await apiClient.post<{ read: number }>(`/doctor/consultations/${id}/read`);
  return res.read ?? 0;
}
