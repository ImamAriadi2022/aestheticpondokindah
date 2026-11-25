import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Edit2, Stethoscope, Calendar, Trash2, Mail, ShieldCheck, CheckCircle2, XCircle, Filter } from "lucide-react";
import { getStorageUrl } from "@/core/api/apiConfig";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Cari nama dokter, spesialisasi, email..."
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FilterDropdown
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as any)}
            icon={Filter}
            labelPrefix="Status"
            options={[
              { value: "all", label: `Semua Status (${doctors.length})` },
              { value: "active", label: `Aktif (${doctors.filter((d) => d.is_active !== false).length})` },
              { value: "inactive", label: `Non-aktif (${doctors.filter((d) => d.is_active === false).length})` },
            ]}
          />
        </div>
      </div>

      {/* Table List with horizontal scroll on mobile */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-x-auto shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead>Nama Dokter</TableHead>
              <TableHead>Spesialisasi</TableHead>
              <TableHead>Status Praktik</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-xs text-[#8A7B6B]">
                  Tidak ada dokter spesialis yang sesuai dengan pencarian.
                </TableCell>
              </TableRow>
            ) : (
              filteredDoctors.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                  <TableCell>
                    <p className="text-sm font-bold text-[#4A3F35]">
                      {doc.name}
                    </p>
                  </TableCell>

                  <TableCell>
                    <span className="text-xs font-semibold text-[#8C6B1C] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#F0E6D3] inline-block">
                      {doc.specialization || doc.speciality || "Dokter Gigi"}
                    </span>
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
                      className="h-8 px-2.5 text-xs font-semibold text-[#C9A24A] bg-[#FAF8F5] hover:bg-[#F5E6C8]/40 border border-[#F0E6D3] rounded-lg"
                      title="Kelola Jadwal Praktik Dokter"
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
