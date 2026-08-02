import { useCallback, useEffect, useState } from "react";
import {
  createConsultationMeeting,
  deleteConsultationMeeting,
  getConsultationMeetings,
  updateConsultationMeeting,
} from "@/features/doctor/consultation/services/meeting.service";
import type {
  ConsultationMeeting,
  MeetingInput,
} from "@/features/doctor/consultation/types/consultation";

export function useMeeting(consultationId: string) {
  const [meetings, setMeetings] = useState<ConsultationMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    try {
      const data = await getConsultationMeetings(consultationId);
      setMeetings(data);
    } catch {
      // Keep current list on failure.
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    setLoading(true);
    reload();
  }, [reload]);

  const add = useCallback(
    async (input: MeetingInput) => {
      setSaving(true);
      try {
        const meeting = await createConsultationMeeting(consultationId, input);
        setMeetings((prev) => [meeting, ...prev]);
        return meeting;
      } finally {
        setSaving(false);
      }
    },
    [consultationId]
  );

  const update = useCallback(
    async (meetingId: string, input: Partial<MeetingInput>) => {
      setSaving(true);
      try {
        const meeting = await updateConsultationMeeting(meetingId, input);
        setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? meeting : m)));
        return meeting;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const remove = useCallback(async (meetingId: string) => {
    await deleteConsultationMeeting(meetingId);
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
  }, []);

  return { meetings, loading, saving, reload, add, update, remove };
}
