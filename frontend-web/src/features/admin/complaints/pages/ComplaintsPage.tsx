import { useState, useEffect, useCallback } from "react";
import ComplaintTable from "../components/ComplaintTable";
import ComplaintResponseModal from "../components/ComplaintResponseModal";
import ComplaintRecapPdfModal from "../components/ComplaintRecapPdfModal";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { 
  MessageSquare, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Sparkles,
  Inbox
} from "lucide-react";
import { getAllComplaints } from "@/features/patient/consultation/services/complaintApi";
import { getCachedComplaints, setCachedComplaints } from "../services/complaintCache";

type Props = {
  complaints?: any[];
  onSelectComplaint?: (complaint: any) => void;
};

export default function ComplaintsPage({ complaints: propsComplaints = [] }: Props) {
  const [localComplaints, setLocalComplaints] = useState<any[]>(() => {
    if (Array.isArray(propsComplaints) && propsComplaints.length > 0) return propsComplaints;
    const cached = getCachedComplaints();
    return Array.isArray(cached) && cached.length > 0 ? cached : [];
  });
  const [loading, setLoading] = useState<boolean>(false);

  // Modals
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const loadComplaints = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setLoading(true);
    }
    try {
      const res = await getAllComplaints({ skipCache: isManualRefresh });
      if (Array.isArray(res?.data)) {
        setLocalComplaints(res.data);
        setCachedComplaints(res.data);
      }
      if (isManualRefresh) {
        toast({
          title: "Sinkronisasi Berhasil",
          message: "Data pengaduan pasien telah diperbarui dari server.",
          variant: "success",
        });
      }
    } catch (e) {
      console.error("Gagal memuat pengaduan", e);
      if (isManualRefresh) {
        toast({
          title: "Gagal Memuat",
          message: "Terjadi kesalahan saat menghubungkan ke server.",
          variant: "error",
        });
      }
    } finally {
      if (isManualRefresh) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (propsComplaints.length > 0) {
      setLocalComplaints(propsComplaints);
      setCachedComplaints(propsComplaints);
    }
    // Background SWR sync
    loadComplaints(false);
  }, [propsComplaints, loadComplaints]);

  const handleRespond = (item: any) => {
    setSelectedComplaint(item);
    setResponseModalOpen(true);
  };

  const total = localComplaints.length;
  const resolvedCount = localComplaints.filter((c) => c.status === "resolved").length;
  const processingCount = localComplaints.filter((c) => c.status === "processing" || c.status === "in_progress").length;
  const pendingCount = localComplaints.filter((c) => c.status === "pending" || !c.status).length;

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-150">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#4A3F35] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FAF5EA] text-[#C9A24A] flex items-center justify-center border border-[#F0E6D3] shadow-2xs">
              <MessageSquare className="w-5 h-5 text-[#C9A24A]" />
            </div>
            Pengaduan & Masukan Pasien
          </h2>
          <p className="text-xs sm:text-sm text-[#8A7B6B] mt-1">
            Tindak lanjut keluhan, aspirasi, dan tanggapan admin untuk meningkatkan mutu layanan klinik.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => loadComplaints(true)}
            disabled={loading}
            className="rounded-xl border-[#E8DFC8] bg-white h-10 px-4 text-xs font-semibold text-[#5C5546] hover:bg-[#FAF8F5] cursor-pointer shadow-2xs justify-center"
            title="Muat Ulang Pengaduan"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-[#C9A24A]" : "text-[#8C6B1C]"}`} />
            Muat Ulang
          </Button>

          <Button
            type="button"
            onClick={() => setPdfModalOpen(true)}
            className="bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white font-bold rounded-xl text-xs h-10 px-5 shadow-md shadow-[#C9A24A]/20 cursor-pointer justify-center"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Rekap Laporan PDF
          </Button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FAF5EA] flex items-center justify-center text-[#C9A24A] shrink-0 border border-[#EADBBD] shadow-2xs">
            <Inbox className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-[#8A7B6B] uppercase tracking-wider">Total Masukan</p>
            <p className="text-xl sm:text-2xl font-black text-[#4A3F35] mt-0.5">{total} <span className="text-xs font-medium text-[#8A7B6B]">Kasus</span></p>
          </div>
        </div>

        {/* Card 2: Menunggu */}
        <div className="bg-white p-5 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 border border-amber-200 shadow-2xs">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#8A7B6B] uppercase tracking-wider">Menunggu Tanggapan</p>
            <p className="text-2xl font-black text-amber-700 mt-0.5">{pendingCount} <span className="text-xs font-medium text-amber-700/70">Perlu Tindak Lanjut</span></p>
          </div>
        </div>

        {/* Card 3: Diproses */}
        <div className="bg-white p-5 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-700 shrink-0 border border-sky-200 shadow-2xs">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#8A7B6B] uppercase tracking-wider">Sedang Diproses</p>
            <p className="text-2xl font-black text-sky-700 mt-0.5">{processingCount} <span className="text-xs font-medium text-sky-700/70">Penanganan</span></p>
          </div>
        </div>

        {/* Card 4: Selesai */}
        <div className="bg-white p-5 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#8A7B6B] uppercase tracking-wider">Selesai & Dijawab</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{resolvedCount} <span className="text-xs font-medium text-emerald-700/70">Tuntas</span></p>
          </div>
        </div>
      </div>

      {/* Complaints Table with Filters */}
      <ComplaintTable
        complaints={localComplaints}
        onSelect={handleRespond}
      />

      {/* Response Modal */}
      <ComplaintResponseModal
        open={responseModalOpen}
        onOpenChange={setResponseModalOpen}
        complaint={selectedComplaint}
        onSaved={(updated) => {
          if (updated && updated.id) {
            setLocalComplaints((prev) =>
              prev.map((c) => (String(c.id) === String(updated.id) ? { ...c, ...updated } : c))
            );
          }
          loadComplaints(false);
        }}
      />

      {/* PDF Recap Export Modal */}
      <ComplaintRecapPdfModal
        open={pdfModalOpen}
        onOpenChange={setPdfModalOpen}
        complaints={localComplaints}
      />
    </div>
  );
}
