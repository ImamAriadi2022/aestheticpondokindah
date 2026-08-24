import { useState, useEffect } from "react";
import ComplaintTable from "../components/ComplaintTable";
import ComplaintResponseModal from "../components/ComplaintResponseModal";
import ComplaintRecapPdfModal from "../components/ComplaintRecapPdfModal";
import { Button } from "@/shared/ui/button";
import { 
  MessageSquare, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Search
} from "lucide-react";
import { getAllComplaints } from "@/features/patient/consultation/services/complaintApi";

type Props = {
  complaints?: any[];
  onSelectComplaint?: (complaint: any) => void;
};

export default function ComplaintsPage({ complaints: propsComplaints = [] }: Props) {
  const [localComplaints, setLocalComplaints] = useState<any[]>(propsComplaints);
  const [loading, setLoading] = useState<boolean>(false);

  // Modals
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);

  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await getAllComplaints({});
      if (Array.isArray(res?.data)) {
        setLocalComplaints(res.data);
      }
    } catch (e) {
      console.error("Gagal memuat pengaduan", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propsComplaints.length > 0) {
      setLocalComplaints(propsComplaints);
    } else {
      loadComplaints();
    }
  }, [propsComplaints]);

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleRespond = (item: any) => {
    setSelectedComplaint(item);
    setResponseModalOpen(true);
  };

  const total = localComplaints.length;
  const resolvedCount = localComplaints.filter((c) => c.status === "resolved").length;
  const processingCount = localComplaints.filter((c) => c.status === "processing" || c.status === "in_progress").length;
  const pendingCount = localComplaints.filter((c) => c.status === "pending" || !c.status).length;

  return (
    <div className="space-y-6 text-left">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#4A3F35] flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-[#C9A24A]" />
            Pengaduan & Masukan Pasien
          </h2>
          <p className="text-xs sm:text-sm text-[#8A7B6B] mt-0.5">
            Tindak lanjut keluhan, aspirasi, dan tanggapan admin untuk meningkatkan kualitas layanan klinik.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={loadComplaints}
            disabled={loading}
            className="rounded-xl border-[#E8DFC8] h-10 px-3.5 text-xs text-[#5C5546] hover:bg-[#FAF8F5] cursor-pointer"
            title="Muat Ulang Pengaduan"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin text-[#C9A24A]" : ""}`} />
            Muat Ulang
          </Button>

          <Button
            type="button"
            onClick={() => setPdfModalOpen(true)}
            className="bg-gradient-to-r from-[#C9A24A] to-[#A8843A] hover:opacity-90 text-white font-bold rounded-xl text-xs h-10 px-5 shadow-md shadow-[#C9A24A]/20 cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Rekap Laporan PDF
          </Button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#FAF5EA] flex items-center justify-center text-[#C9A24A] shrink-0 border border-[#EADBBD]">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#8A7B6B] uppercase tracking-wider">Total Pengaduan</p>
            <p className="text-lg font-extrabold text-[#4A3F35] mt-0.5">{total} Masukan</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#8A7B6B] uppercase tracking-wider">Menunggu Tanggapan</p>
            <p className="text-lg font-extrabold text-amber-700 mt-0.5">{pendingCount} Kasus</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#8A7B6B] uppercase tracking-wider">Sedang Diproses</p>
            <p className="text-lg font-extrabold text-blue-700 mt-0.5">{processingCount} Kasus</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-[#F0E6D3] shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#8A7B6B] uppercase tracking-wider">Selesai & Dijawab</p>
            <p className="text-lg font-extrabold text-emerald-700 mt-0.5">{resolvedCount} Kasus</p>
          </div>
        </div>
      </div>

      {/* Complaints Table with Working "Tanggapi" Button */}
      <ComplaintTable
        complaints={localComplaints}
        onSelect={handleRespond}
      />

      {/* Response Modal */}
      <ComplaintResponseModal
        open={responseModalOpen}
        onOpenChange={setResponseModalOpen}
        complaint={selectedComplaint}
        onSaved={loadComplaints}
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
