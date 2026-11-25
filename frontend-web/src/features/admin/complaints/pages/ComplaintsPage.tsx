import { useState, useEffect, useCallback } from "react";
import ComplaintTable from "../components/ComplaintTable";
import ComplaintResponseModal from "../components/ComplaintResponseModal";
import ComplaintRecapPdfModal from "../components/ComplaintRecapPdfModal";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { FileText } from "lucide-react";
import { getAllComplaints } from "@/features/patient/consultation/services/complaintApi";
import { getCachedComplaints, setCachedComplaints } from "../services/complaintCache";
import { PageHeader } from "@/shared/ui/PageHeader";
import { usePageRefresh } from "@/core/events/refreshEvents";

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

  usePageRefresh(() => loadComplaints(true));

  const handleRespond = (item: any) => {
    setSelectedComplaint(item);
    setResponseModalOpen(true);
  };

  const total = localComplaints.length;
  const resolvedCount = localComplaints.filter((c) => c.status === "resolved").length;
  const processingCount = localComplaints.filter((c) => c.status === "processing" || c.status === "in_progress").length;
  const pendingCount = localComplaints.filter((c) => c.status === "pending" || !c.status).length;

  return (
    <div className="space-y-5 text-left animate-in fade-in duration-150">
      <PageHeader
        title="Pengaduan & Masukan Pasien"
        actions={
          <Button
            type="button"
            onClick={() => setPdfModalOpen(true)}
            className="bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white font-bold rounded-xl text-xs h-9 px-4 shadow-md shadow-[#C9A24A]/20 cursor-pointer justify-center"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Rekap Laporan PDF
          </Button>
        }
      />

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
