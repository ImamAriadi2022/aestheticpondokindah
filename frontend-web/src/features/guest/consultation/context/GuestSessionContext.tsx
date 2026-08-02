import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

export interface GuestConsultationRef {
  token: string;
  name: string;
  phone: string;
  topic: string;
  createdAt: string;
  status: string;
}

const STORAGE_KEY = "guest_consultations";

function loadRefs(): GuestConsultationRef[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(refs: GuestConsultationRef[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(refs));
  } catch {
    // ignore quota errors
  }
}

interface GuestSessionContextValue {
  refs: GuestConsultationRef[];
  addRef: (ref: Omit<GuestConsultationRef, "createdAt">) => void;
  updateStatus: (token: string, status: string) => void;
  removeRef: (token: string) => void;
  hasRef: (token: string) => boolean;
}

const GuestSessionContext = createContext<GuestSessionContextValue | null>(null);

export function GuestSessionProvider({ children }: { children: ReactNode }) {
  const [refs, setRefs] = useState<GuestConsultationRef[]>(() => loadRefs());

  const addRef = useCallback((ref: Omit<GuestConsultationRef, "createdAt">) => {
    setRefs((prev) => {
      const next = [
        { ...ref, createdAt: new Date().toISOString() },
        ...prev.filter((r) => r.token !== ref.token),
      ];
      persist(next);
      return next;
    });
  }, []);

  const updateStatus = useCallback((token: string, status: string) => {
    setRefs((prev) => {
      const next = prev.map((r) => (r.token === token ? { ...r, status } : r));
      persist(next);
      return next;
    });
  }, []);

  const removeRef = useCallback((token: string) => {
    setRefs((prev) => {
      const next = prev.filter((r) => r.token !== token);
      persist(next);
      return next;
    });
  }, []);

  const hasRef = useCallback((token: string) => {
    return loadRefs().some((r) => r.token === token);
  }, []);

  const value = useMemo(
    () => ({ refs, addRef, updateStatus, removeRef, hasRef }),
    [refs, addRef, updateStatus, removeRef, hasRef]
  );

  return <GuestSessionContext.Provider value={value}>{children}</GuestSessionContext.Provider>;
}

export function useGuestSession(): GuestSessionContextValue {
  const ctx = useContext(GuestSessionContext);
  if (!ctx) {
    throw new Error("useGuestSession must be used within a GuestSessionProvider");
  }
  return ctx;
}
