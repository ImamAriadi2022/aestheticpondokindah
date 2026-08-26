import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { 
  MessageSquare, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  Calendar,
  MessageCircle,
  Tag,
  Check,
  X
} from "lucide-react";

type Props = {
  complaints: any[];
  onSelect: (complaint: any) => void;
};

const statusMap: Record<string, { label: string; bg: string; text: string; border: string; icon: any }> = {
  pending: { label: "Menunggu Tanggapan", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", icon: Clock },
  processing: { label: "Sedang Diproses", bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200", icon: AlertCircle },
  in_progress: { label: "Sedang Diproses", bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200", icon: AlertCircle },
  resolved: { label: "Selesai & Dijawab", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Ditolak", bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200", icon: X },
};

export default function ComplaintTable({ complaints, onSelect }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const pendingCount = useMemo(() => complaints.filter((c) => c.status === "pending" || !c.status).length, [complaints]);
  const processingCount = useMemo(() => complaints.filter((c) => c.status === "processing" || c.status === "in_progress").length, [complaints]);
  const resolvedCount = useMemo(() => complaints.filter((c) => c.status === "resolved").length, [complaints]);

  const filtered = useMemo(() => {
    return complaints.filter((item) => {
      const term = searchTerm.toLowerCase();
      const nameMatch = (item.user?.name || item.patient_name || "").toLowerCase().includes(term);
      const titleMatch = (item.title || item.subject || "").toLowerCase().includes(term);
      const descMatch = (item.description || item.complaint || "").toLowerCase().includes(term);
      const catMatch = (item.category || "").toLowerCase().includes(term);
      const idMatch = String(item.id || "").includes(term);
      const matchesSearch = nameMatch || titleMatch || descMatch || catMatch || idMatch;

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "pending") return item.status === "pending" || !item.status;
      if (statusFilter === "processing") return item.status === "processing" || item.status === "in_progress";
      if (statusFilter === "resolved") return item.status === "resolved";
      if (statusFilter === "rejected") return item.status === "rejected";
      return true;
    });
  }, [complaints, searchTerm, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls Bar */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#C9A24A] text-white shadow-xs"
                : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]/60"
            }`}
          >
            Semua ({complaints.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]/60"
            }`}
          >
            Menunggu ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("processing")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "processing"
                ? "bg-sky-600 text-white shadow-xs"
                : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]/60"
            }`}
          >
            Diproses ({processingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("resolved")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "resolved"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]/60"
            }`}
          >
            Selesai ({resolvedCount})
          </button>
        </div>

        {/* Searchbar */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89F91] pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama pasien, tiket, kategori..."
            className="w-full h-9 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl pl-10 pr-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A] focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead className="w-32">Tiket & Tanggal</TableHead>
              <TableHead className="w-48">Nama Pasien</TableHead>
              <TableHead className="w-56">Kategori & Judul</TableHead>
              <TableHead>Uraian Pengaduan</TableHead>
              <TableHead className="w-44">Status & Tanggapan</TableHead>
              <TableHead className="text-right w-28">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF5EA] flex items-center justify-center text-[#C9A24A] mx-auto border border-[#EADBBD]">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-[#4A3F35]">Belum Ada Pengaduan</p>
                    <p className="text-xs text-[#8A7B6B]">
                      {searchTerm || statusFilter !== "all"
                        ? "Tidak ada pengaduan pasien yang sesuai dengan filter atau kata kunci pencarian."
                        : "Semua pengaduan dan masukan dari pasien akan tercatat dan dapat ditanggapi langsung di sini."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const s = statusMap[item.status] || statusMap.pending;
                const StatusIcon = s.icon;
                const hasResponse = Boolean(item.adminResponse || item.admin_response);
                const patientName = item.user?.name || item.patient_name || "Pasien Klinik";
                const patientContact = item.user?.whatsapp || item.user?.email || item.contact || "-";

                return (
                  <TableRow key={item.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    {/* Tiket & Tanggal */}
                    <TableCell>
                      <span className="inline-block text-xs font-mono font-bold text-[#8C6B1C] bg-[#FAF5EA] px-2 py-0.5 rounded-md border border-[#EADBBD]">
                        #{item.id}
                      </span>
                      <p className="text-[10px] text-[#8A7B6B] flex items-center gap-1 mt-1 font-medium">
                        <Calendar className="w-3 h-3 text-[#8A7B6B]" />
                        {item.date || item.created_at ? (item.date || item.created_at.slice(0, 10)) : "-"}
                      </p>
                    </TableCell>

                    {/* Nama Pasien */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center font-bold text-xs shrink-0 border border-[#EADBBD]">
                          {patientName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#4A3F35] truncate">{patientName}</p>
                          <p className="text-[10px] text-[#8A7B6B] truncate">{patientContact}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Kategori & Judul */}
                    <TableCell>
                      <span className="inline-block text-[10px] font-bold bg-[#FAF8F5] text-[#8C6B1C] border border-[#E8DFC8] px-2 py-0.5 rounded-full mb-1">
                        {item.category || "Pelayanan Klinik"}
                      </span>
                      <p className="text-xs font-bold text-[#4A3F35] line-clamp-1 leading-snug">
                        {item.title || item.subject || "Pengaduan Layanan Pasien"}
                      </p>
                    </TableCell>

                    {/* Uraian Pengaduan */}
                    <TableCell>
                      <p className="text-xs text-[#5C5546] line-clamp-2 leading-relaxed italic bg-[#FAF8F5]/80 p-2 rounded-xl border border-[#F0E6D3]/60">
                        "{item.description || item.complaint || "-"}"
                      </p>
                    </TableCell>

                    {/* Status & Tanggapan */}
                    <TableCell>
                      <div className="space-y-1.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
                          <StatusIcon className="w-3 h-3" />
                          {s.label}
                        </span>
                        {hasResponse ? (
                          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 truncate max-w-[170px]" title={item.adminResponse || item.admin_response}>
                            <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                            {item.adminResponse || item.admin_response}
                          </p>
                        ) : (
                          <p className="text-[10px] text-stone-400 italic">Belum ditanggapi</p>
                        )}
                      </div>
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => onSelect(item)}
                        className="h-8 px-3 text-xs font-bold bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Tanggapi
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
