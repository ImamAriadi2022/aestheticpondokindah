import { useCallback, useEffect, useState } from "react";
import { getPatientSummary } from "@/features/doctor/consultation/services/consultation.service";
import type { PatientSummary } from "@/features/doctor/consultation/types/consultation";

export function usePatientSummary(consultationId: string) {
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPatientSummary(consultationId);
      setSummary(data);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { summary, loading, reload };
}
