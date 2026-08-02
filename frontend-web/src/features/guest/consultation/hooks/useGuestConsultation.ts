import { useCallback, useEffect, useRef, useState } from "react";
import {
  getGuestConsultation,
  markGuestRead,
  sendGuestMessage,
  type GuestConsultationDetail,
} from "@/features/guest/consultation/services/guestConsultationApi";

const DEFAULT_POLL_INTERVAL_MS = 10000;

export function useGuestConsultation(
  token: string,
  options?: { pollIntervalMs?: number; enabled?: boolean }
) {
  const pollIntervalMs = options?.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const enabled = options?.enabled ?? true;

  const [consultation, setConsultation] = useState<GuestConsultationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getGuestConsultation(token);
      setConsultation(data.consultation);
      setNotFound(false);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!enabled || !token) return;
    setLoading(true);
    refresh();
    refreshTimer.current = setInterval(refresh, pollIntervalMs);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [enabled, token, pollIntervalMs, refresh]);

  const markRead = useCallback(async () => {
    try {
      await markGuestRead(token);
    } catch {
      // best effort
    }
  }, [token]);

  const send = useCallback(
    async (body: string) => {
      const text = body.trim();
      if (!text || sending) return;
      setSending(true);
      try {
        const message = await sendGuestMessage(token, text);
        setConsultation((prev) =>
          prev
            ? { ...prev, messages: [...(prev.messages ?? []), message] }
            : prev
        );
      } finally {
        setSending(false);
      }
    },
    [token, sending]
  );

  return { consultation, loading, sending, notFound, refresh, send, markRead };
}
