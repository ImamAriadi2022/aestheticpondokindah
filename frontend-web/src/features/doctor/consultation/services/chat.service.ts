import { apiClient } from "@/core/api/apiClient";
import type { ConsultationMessage } from "./consultation.types";

export async function getConsultationMessages(
  consultationId: string
): Promise<ConsultationMessage[]> {
  const res = await apiClient.get<{ messages: ConsultationMessage[] }>(
    `/doctor/consultations/${consultationId}/messages`
  );
  return res.messages || [];
}

export async function sendConsultationMessage(
  consultationId: string,
  message: string,
  attachmentUrl?: string
): Promise<ConsultationMessage> {
  const res = await apiClient.post<{ message: ConsultationMessage }>(
    `/doctor/consultations/${consultationId}/messages`,
    {
      message,
      attachment_url: attachmentUrl,
    }
  );
  return res.message;
}

export async function markConsultationRead(
  consultationId: string
): Promise<{ markedCount: number }> {
  return apiClient.post<{ markedCount: number }>(
    `/doctor/consultations/${consultationId}/read`,
    {}
  );
}
