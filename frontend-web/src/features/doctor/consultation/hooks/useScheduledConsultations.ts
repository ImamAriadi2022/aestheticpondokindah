import { useCallback, useEffect, useState } from "react";
import {
  getConsultationDashboard,
  getDoctorConsultations,
} from "@/features/doctor/consultation/services/consultation.service";
import type {
  ConsultationDashboard,
  DoctorConsultation,
} from "@/features/doctor/consultation/types/consultation";

export function useScheduledConsultations() {
  const [consultations, setConsultations] = useState<DoctorConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDoctorConsultations();
      setConsultations(data);
    } catch {
      setError("Gagal memuat daftar konsultasi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { consultations, loading, error, reload };
}

export function useConsultationDashboard() {
  const [dashboard, setDashboard] = useState<ConsultationDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConsultationDashboard();
      setDashboard(data);
    } catch {
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { dashboard, loading, reload };
}
