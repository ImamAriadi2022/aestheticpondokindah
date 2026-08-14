import { useCallback, useEffect, useState } from "react";
import {
  getDoctorConsultations,
  updateConsultationStatus,
} from "./consultation.service";
import type {
  ConsultationStatus,
  DoctorConsultation,
} from "./consultation.types";

export function useScheduledConsultations() {
  const [consultations, setConsultations] = useState<DoctorConsultation[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDoctorConsultations({ type: "scheduled" });
      setConsultations(data);
    } catch {
      // transient failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateStatus = useCallback(
    async (id: string, status: ConsultationStatus) => {
      const updated = await updateConsultationStatus(id, status);
      setConsultations((prev) => prev.map((item) => (item.id === id ? updated : item)));
      return updated;
    },
    []
  );

  return { consultations, loading, reload, updateStatus };
}
