import { useCallback, useEffect, useState } from "react";
import {
  getConsultationDetail,
  updateConsultationStatus,
} from "./consultation.service";
import type {
  ConsultationStatus,
  DoctorConsultation,
} from "./consultation.types";

export function useConsultationDetail(id: string) {
  const [consultation, setConsultation] = useState<DoctorConsultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConsultationDetail(id);
      setConsultation(data);
      setNotFound(false);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateStatus = useCallback(
    async (status: ConsultationStatus) => {
      setUpdating(true);
      try {
        const updated = await updateConsultationStatus(id, status);
        setConsultation(updated);
        return updated;
      } finally {
        setUpdating(false);
      }
    },
    [id]
  );

  return { consultation, loading, updating, notFound, reload, updateStatus };
}
