import { useState, useMemo, useEffect, useCallback } from "react";
import ConsultationTable from "../components/ConsultationTable";
import AdminConsultationChatView from "../components/AdminConsultationChatView";
import { Filter } from "lucide-react";
import { getAllConsultations } from "@/features/patient/consultation/services/consultationApi";
import {
  getCachedConsultationList,
  setCachedConsultationList,
} from "@/features/patient/consultation/services/consultationCache";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { usePageRefresh } from "@/core/events/refreshEvents";

type Props = {
  consultations?: any[];
  onSelectConsultation?: (id: string) => void;
  onRefresh?: () => void;
};

export default function ConsultationPage({ consultations: initialConsultations = [], onRefresh }: Props) {
  // Read cached list immediately (0ms instant render)
  const [consultations, setConsultations] = useState<any[]>(() => {
    if (initialConsultations && initialConsultations.length > 0) return initialConsultations;
    return getCachedConsultationList() || [];
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Menunggu" | "Dibuka" | "Selesai">("Semua");
  const [loading, setLoading] = useState(consultations.length === 0);

  const fetchItems = useCallback(async (silent = false) => {
    if (!silent && consultations.length === 0) setLoading(true);
    try {
      const data = await getAllConsultations({}, { silent: true });
      const list = Array.isArray(data) ? data : (data as any)?.data || [];
      if (list && list.length >= 0) {
        setConsultations(list);
        setCachedConsultationList(list);
      }
    } catch {
      // ignore silent
    } finally {
      setLoading(false);
    }
  }, [consultations.length]);

  useEffect(() => {
    if (initialConsultations && initialConsultations.length > 0) {
      setConsultations(initialConsultations);
      setCachedConsultationList(initialConsultations);
    } else {
      fetchItems(consultations.length > 0);
    }
  }, [initialConsultations, fetchItems]);

  // Revalidation on window focus / tab active (tanpa polling interval agresif)
  useEffect(() => {
    const handleFocus = () => {
      if (!selectedId && typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchItems(true);
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [fetchItems, selectedId]);

  const handleRefresh = () => {
    fetchItems(false);
    if (onRefresh) onRefresh();
  };

  usePageRefresh(handleRefresh);

  const counts = useMemo(() => {
    return {
      total: consultations.length,
      waiting: consultations.filter((c) => (c.status || "Menunggu") === "Menunggu").length,
      opened: consultations.filter((c) => c.status === "Dibuka").length,
      completed: consultations.filter((c) => c.status === "Selesai" || c.status === "Ditolak").length,
    };
  }, [consultations]);

  const filteredConsultations = useMemo(() => {
    return consultations.filter((item) => {
      const status = item.status || "Menunggu";
      if (statusFilter === "Menunggu" && status !== "Menunggu") return false;
      if (statusFilter === "Dibuka" && status !== "Dibuka") return false;
      if (statusFilter === "Selesai" && status !== "Selesai" && status !== "Ditolak") return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (item.participantName || item.patientName || item.user?.name || "").toLowerCase();
        const topic = (item.topic || item.category || "").toLowerCase();
        const complaint = (item.chiefComplaint || item.complaintText || "").toLowerCase();
        const code = String(item.code || item.id || "").toLowerCase();
        return name.includes(q) || topic.includes(q) || complaint.includes(q) || code.includes(q);
      }
      return true;
    });
  }, [consultations, statusFilter, searchQuery]);

  // If a consultation is selected, render full-page AdminConsultationChatView directly (NO POPUP!)
  if (selectedId) {
    return (
      <AdminConsultationChatView
        consultationId={selectedId}
        onBack={() => {
          setSelectedId(null);
          fetchItems(true);
        }}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Page Header */}
      <PageHeader
        title="Konsultasi Pasien"
        actions={
          <>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari pasien, topik, kode..."
            />
            <FilterDropdown
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as any)}
              icon={Filter}
              labelPrefix="Status"
              options={[
                { value: "Semua", label: "Semua Status" },
                { value: "Menunggu", label: "Menunggu" },
                { value: "Dibuka", label: "Dibuka" },
                { value: "Selesai", label: "Selesai" },
              ]}
            />
          </>
        }
      />

      {/* Consultation Table */}
      <ConsultationTable
        consultations={filteredConsultations}
        onSelect={(id) => setSelectedId(id)}
      />
    </div>
  );
}
