import { apiClient } from "@/core/api/apiClient";
import type {
  ConsultationMeeting,
  MeetingInput,
} from "@/features/doctor/consultation/types/consultation";

export async function getConsultationMeetings(id: string): Promise<ConsultationMeeting[]> {
  const res = await apiClient.get<{ meetings: ConsultationMeeting[] }>(
    `/doctor/consultations/${id}/meetings`
  );
  return res.meetings;
}

export async function createConsultationMeeting(
  id: string,
  input: MeetingInput
): Promise<ConsultationMeeting> {
  const res = await apiClient.post<{ meeting: ConsultationMeeting }>(
    `/doctor/consultations/${id}/meetings`,
    input
  );
  return res.meeting;
}

export async function updateConsultationMeeting(
  meetingId: string,
  input: Partial<MeetingInput>
): Promise<ConsultationMeeting> {
  const res = await apiClient.put<{ meeting: ConsultationMeeting }>(
    `/doctor/consultation-meetings/${meetingId}`,
    input
  );
  return res.meeting;
}

export async function deleteConsultationMeeting(meetingId: string): Promise<void> {
  await apiClient.delete(`/doctor/consultation-meetings/${meetingId}`);
}
