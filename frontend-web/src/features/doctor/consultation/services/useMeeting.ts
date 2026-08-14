import { useCallback, useEffect, useState } from "react";
import {
  createConsultationMeeting,
  deleteConsultationMeeting,
  getConsultationMeetings,
  updateConsultationMeeting,
} from "./meeting.service";
import type {
  ConsultationMeeting,
  MeetingInput,
} from "./consultation.types";

export function useMeeting(consultationId: string) {
  const [meetings, setMeetings] = useState<ConsultationMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConsultationMeetings(consultationId);
      setMeetings(data);
    } catch {
      // transient failure
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(
    async (input: MeetingInput) => {
      setSaving(true);
      try {
        const created = await createConsultationMeeting(consultationId, input);
        setMeetings((prev) => [created, ...prev]);
        return created;
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
        const updated = await updateConsultationMeeting(consultationId, meetingId, input);
        setMeetings((prev) => prev.map((m) => (m.id === meetingId ? updated : m)));
        return updated;
      } finally {
        setSaving(false);
      }
    },
    [consultationId]
  );

  const remove = useCallback(
    async (meetingId: string) => {
      setSaving(true);
      try {
        await deleteConsultationMeeting(consultationId, meetingId);
        setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
      } finally {
        setSaving(false);
      }
    },
    [consultationId]
  );

  return { meetings, loading, saving, reload, add, update, remove };
}
