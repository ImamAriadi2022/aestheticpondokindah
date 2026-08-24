import { useState, useMemo, useEffect, useCallback } from "react";
import ConsultationTable from "../components/ConsultationTable";
import AdminConsultationChatView from "../components/AdminConsultationChatView";
import { MessageSquare, Clock, CheckCircle2, Search, Sparkles, RefreshCw } from "lucide-react";
import { getAllConsultations } from "@/features/patient/consultation/services/consultationApi";
import {
  getCachedConsultationList,
  setCachedConsultationList,
} from "@/features/patient/consultation/services/consultationCache";
import { Button } from "@/shared/ui/button";

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

  // Smart background poll every 5s only if tab is visible and not in chat view
  useEffect(() => {
    const timer = setInterval(() => {
      if (!selectedId && typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchItems(true);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [fetchItems, selectedId]);

  const handleRefresh = () => {
    fetchItems(false);
    if (onRefresh) onRefresh();
  };

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
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2C2416]">Konsultasi Pasien</h2>
          <p className="text-xs text-[#8C8272] mt-0.5">
            Kelola sesi chat konsultasi medis online antara pasien dan admin klinik secara real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 text-xs font-semibold text-[#8C6B1C] border-[#E8DFC8] bg-white hover:bg-[#FAF8F5] rounded-xl cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Segarkan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#8C8272]">Total Konsultasi</span>
            <MessageSquare className="w-4 h-4 text-[#8C6B1C]" />
          </div>
          <p className="text-2xl font-black text-[#2C2416]">{counts.total}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-amber-700">Menunggu Respon</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">{counts.waiting}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-700">Sedang Dibuka</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{counts.opened}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-gray-600">Telah Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-gray-500" />
          </div>
          <p className="text-2xl font-black text-gray-700">{counts.completed}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8DFC8]">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(["Semua", "Menunggu", "Dibuka", "Selesai"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === tab
                  ? "bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] text-white shadow-2xs"
                  : "text-[#6B5E4F] hover:bg-[#FAF5EA] hover:text-[#8C6B1C]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pasien, topik, kode..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8DFC8] focus:border-[#C9A24A] focus:bg-white rounded-xl outline-hidden text-[#2C2416] transition-all"
          />
        </div>
      </div>

      {/* Consultation Table */}
      <ConsultationTable
        consultations={filteredConsultations}
        onSelect={(id) => setSelectedId(id)}
      />
    </div>
  );
}
