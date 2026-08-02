import { useCallback, useEffect, useRef, useState } from "react";
import {
  getConsultationMessages,
  markConsultationRead,
  sendConsultationMessage,
} from "@/features/doctor/consultation/services/chat.service";
import type { ConsultationMessage } from "@/features/doctor/consultation/types/consultation";

const DEFAULT_POLL_INTERVAL_MS = 10000;

export function useDoctorChat(
  consultationId: string,
  options?: { pollIntervalMs?: number; enabled?: boolean }
) {
  const pollIntervalMs = options?.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const enabled = options?.enabled ?? true;

  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getConsultationMessages(consultationId);
      setMessages(data);
    } catch {
      // Keep existing messages on transient failures.
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    refresh();
    markConsultationRead(consultationId).catch(() => {});
    refreshTimer.current = setInterval(refresh, pollIntervalMs);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [enabled, consultationId, pollIntervalMs, refresh]);

  const send = useCallback(
    async (body: string) => {
      const text = body.trim();
      if (!text || sending) return;
      setSending(true);
      try {
        const message = await sendConsultationMessage(consultationId, text);
        setMessages((prev) => [...prev, message]);
      } finally {
        setSending(false);
      }
    },
    [consultationId, sending]
  );

  return { messages, loading, sending, refresh, send };
}
