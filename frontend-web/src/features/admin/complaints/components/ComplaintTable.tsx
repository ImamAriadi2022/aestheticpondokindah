import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { MessageSquare, Search, Clock, CheckCircle2, AlertCircle, ShieldAlert, User, Send } from "lucide-react";

type Props = {
  complaints: any[];
  onSelect: (complaint: any) => void;
};

const statusMap: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending: { label: "Menunggu", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  processing: { label: "Diproses", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  in_progress: { label: "Diproses", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  resolved: { label: "Selesai", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  rejected: { label: "Ditolak", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

export default function ComplaintTable({ complaints, onSelect }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = complaints.filter((item) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (item.user?.name || item.patient_name || "").toLowerCase().includes(term);
    const titleMatch = (item.title || item.subject || "").toLowerCase().includes(term);
    const descMatch = (item.description || item.complaint || "").toLowerCase().includes(term);
    const catMatch = (item.category || "").toLowerCase().includes(term);
    const idMatch = String(item.id || "").includes(term);
    const matchesSearch = nameMatch || titleMatch || descMatch || catMatch || idMatch;

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "pending") return matchesSearch && (item.status === "pending" || !item.status);
    if (statusFilter === "processing") return matchesSearch && (item.status === "processing" || item.status === "in_progress");
    if (statusFilter === "resolved") return matchesSearch && item.status === "resolved";
    if (statusFilter === "rejected") return matchesSearch && item.status === "rejected";
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#F0E6D3] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari pengaduan, nama pasien, kategori, nomor tiket..."
            className="pl-10 rounded-xl border-gray-200 text-xs h-10 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 shrink-0">Filter Status:</span>
          <div className="flex bg-[#FAF8F5] p-1 rounded-xl border border-[#F0E6D3] text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === "all" ? "bg-[#C9A24A] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Semua ({complaints.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === "pending" ? "bg-amber-500 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Menunggu ({complaints.filter((c) => c.status === "pending" || !c.status).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("processing")}
              className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === "processing" ? "bg-blue-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Diproses ({complaints.filter((c) => c.status === "processing" || c.status === "in_progress").length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("resolved")}
              className={`px-3 py-1 font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === "resolved" ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Selesai ({complaints.filter((c) => c.status === "resolved").length})
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead className="w-28">Tiket & Tanggal</TableHead>
              <TableHead>Nama Pasien</TableHead>
              <TableHead>Kategori / Judul</TableHead>
              <TableHead className="max-w-xs">Uraian Pengaduan</TableHead>
              <TableHead>Status & Tanggapan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-xs text-[#8A7B6B]">
                  Tidak ada pengaduan pasien yang sesuai dengan filter atau pencarian.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const s = statusMap[item.status] || statusMap.pending;
                const hasResponse = Boolean(item.adminResponse || item.admin_response);

                return (
                  <TableRow key={item.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <TableCell>
                      <p className="text-xs font-mono font-bold text-[#8C6B1C]">#{item.id}</p>
                      <p className="text-[10px] text-[#8A7B6B] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {item.date || "-"}
                      </p>
                    </TableCell>

                    <TableCell>
                      <p className="text-xs font-bold text-[#4A3F35]">
                        {item.user?.name || item.patient_name || "Pasien Member"}
                      </p>
                      <p className="text-[10px] text-[#8A7B6B]">
                        {item.user?.email || item.user?.whatsapp || "-"}
                      </p>
                    </TableCell>

                    <TableCell>
                      <span className="inline-block text-[10px] font-bold bg-[#FAF5EA] text-[#8C6B1C] border border-[#EADBBD] px-1.5 py-0.5 rounded mb-1">
                        {item.category || "Pelayanan"}
                      </span>
                      <p className="text-xs font-bold text-[#4A3F35] line-clamp-1">
                        {item.title || item.subject || "Pengaduan Layanan"}
                      </p>
                    </TableCell>

                    <TableCell className="max-w-xs">
                      <p className="text-xs text-[#5C5546] line-clamp-2 leading-relaxed">
                        {item.description || item.complaint || "-"}
                      </p>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${s.bg} ${s.text} ${s.border}`}>
                          {s.label}
                        </span>
                        {hasResponse ? (
                          <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 truncate max-w-[160px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            {item.adminResponse || item.admin_response}
                          </p>
                        ) : (
                          <p className="text-[10px] text-gray-400 italic">Belum ditanggapi</p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => onSelect(item)}
                        className="h-8 px-3.5 text-xs font-bold bg-[#FAF5EA] hover:bg-[#C9A24A] text-[#8C6B1C] hover:text-white border border-[#EADBBD] rounded-xl transition-colors cursor-pointer shadow-2xs"
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
