import type { Consultation } from "@/shared/consultation/types/consultation";

const PREFIX = "apig_consultation_cache_";
const LIST_PREFIX = "apig_consultations_list_cache";

export const getCachedConsultation = (id: string): Consultation | null => {
  try {
    const raw = localStorage.getItem(`${PREFIX}${id}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.data || null;
  } catch {
    return null;
  }
};

export const setCachedConsultation = (id: string, data: Consultation): void => {
  try {
    localStorage.setItem(
      `${PREFIX}${id}`,
      JSON.stringify({ data, cachedAt: Date.now() })
    );
  } catch {}
};

export const getCachedConsultationList = (): any[] | null => {
  try {
    const raw = localStorage.getItem(LIST_PREFIX);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const setCachedConsultationList = (list: any[]): void => {
  try {
    localStorage.setItem(LIST_PREFIX, JSON.stringify(list.slice(0, 100)));
  } catch {}
};
