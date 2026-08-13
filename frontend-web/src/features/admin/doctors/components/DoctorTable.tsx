import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Edit2, Stethoscope, Calendar, Trash2, Search, Mail, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { getStorageUrl } from "@/core/api/apiConfig";

type Props = {
  doctors: any[];
  onEdit: (doc: any) => void;
  onManageSchedule: (doc: any) => void;
  onToggleStatus: (docId: string, currentActive: boolean) => void;
  onDeleteDoctor: (docId: string, docName: string) => void;
};

export default function DoctorTable({ doctors, onEdit, onManageSchedule, onToggleStatus, onDeleteDoctor }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredDoctors = doctors.filter((doc) => {
    const nameMatch = (doc.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const specMatch = (doc.specialization || doc.speciality || "").toLowerCase().includes(searchTerm.toLowerCase());
    const strMatch = (doc.str || doc.str_number || "").toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (doc.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = nameMatch || specMatch || strMatch || emailMatch;

    if (statusFilter === "active") return matchesSearch && doc.is_active !== false;
    if (statusFilter === "inactive") return matchesSearch && doc.is_active === false;
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#F0E6D3] shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama dokter, spesialisasi, email login, atau nomor STR..."
            className="pl-10 rounded-xl border-gray-200 text-xs h-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 shrink-0">Filter Status:</span>
          <div className="flex bg-[#FAF8F5] p-1 rounded-xl border border-[#F0E6D3]">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                statusFilter === "all" ? "bg-[#C9A24A] text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Semua ({doctors.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                statusFilter === "active" ? "bg-emerald-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Aktif ({doctors.filter((d) => d.is_active !== false).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                statusFilter === "inactive" ? "bg-rose-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Non-aktif ({doctors.filter((d) => d.is_active === false).length})
            </button>
          </div>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>Dokter & Kredensial Login</TableHead>
              <TableHead>Spesialisasi & Cabang</TableHead>
              <TableHead>Kredensial STR / SIP</TableHead>
              <TableHead>Jadwal Praktik</TableHead>
              <TableHead>Status Praktik</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-xs text-[#8A7B6B]">
                  Tidak ada dokter spesialis yang sesuai dengan pencarian.
                </TableCell>
              </TableRow>
            ) : (
              filteredDoctors.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                  <TableCell>
                    {doc.avatar_url || doc.photo_url ? (
                      <img
                        src={getStorageUrl(doc.avatar_url || doc.photo_url) || doc.avatar_url || doc.photo_url}
                        alt={doc.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[#C9A24A]/30 shadow-xs"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#C9A24A]/20 to-[#A8843A]/10 border border-[#C9A24A]/30 flex items-center justify-center text-[#C9A24A] font-bold">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <div>
                      <p className="text-xs font-bold text-[#4A3F35] flex items-center gap-1.5">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#8A7B6B] mt-0.5">
                        <Mail className="w-3 h-3 text-[#C9A24A]" />
                        <span>{doc.email || "dokter@aestheticpondokindah.id"}</span>
                      </div>
                      {(doc.phone || doc.whatsapp) && (
                        <p className="text-[10px] text-gray-400">{doc.phone || doc.whatsapp}</p>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div>
                      <span className="text-xs font-bold text-[#C9A24A] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#F0E6D3] inline-block">
                        {doc.specialization || doc.speciality || "Spesialis Gigi"}
                      </span>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                        📍 {doc.primary_branch || "Cabang Utama"}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-xs text-[#4A3F35] font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        STR: {doc.str || doc.str_number || "31.2.1.100.3.21..."}
                      </p>
                      <p className="text-[10px] text-[#8A7B6B]">
                        SIP: {doc.sip || doc.sip_number || "503/449/SIP.DG/2024"}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Pengalaman: {doc.experience_years ? `${doc.experience_years} Tahun` : "5+ Tahun"}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    {doc.schedules && doc.schedules.length > 0 ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Calendar className="w-3 h-3 text-[#C9A24A]" />
                          {doc.schedules.length} Sesi Praktik
                        </span>
                        <p className="text-[10px] text-gray-500">
                          {doc.schedules.map((s: any) => s.day).join(", ")}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400 italic">Belum diatur</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(doc.id, doc.is_active !== false)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer hover:opacity-90 ${
                        doc.is_active !== false
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                      title="Klik untuk mengubah status praktik"
                    >
                      {doc.is_active !== false ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Aktif
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Non-aktif
                        </>
                      )}
                    </button>
                  </TableCell>

                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onManageSchedule(doc)}
                      className="h-8 px-2 text-[11px] font-bold text-[#C9A24A] bg-[#FAF8F5] hover:bg-[#F5E6C8]/40 border border-[#F0E6D3] rounded-lg"
                      title="Kelola Jadwal Praktik"
                    >
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      Jadwal
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(doc)}
                      className="h-8 w-8 p-0 text-[#B8943F] hover:bg-amber-50 rounded-lg"
                      title="Edit Data & Kredensial Dokter"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteDoctor(doc.id, doc.name)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Hapus Dokter"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
