import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Edit2, Stethoscope } from "lucide-react";
import { getStorageUrl } from "@/core/api/apiConfig";

type Props = {
  doctors: any[];
  onEdit: (doc: any) => void;
};

export default function DoctorTable({ doctors, onEdit }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FAF8F5]">
            <TableHead className="w-16">Foto</TableHead>
            <TableHead>Nama Dokter</TableHead>
            <TableHead>Spesialisasi</TableHead>
            <TableHead>STR / Pengalaman</TableHead>
            <TableHead>Status Praktik</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-xs text-[#8A7B6B]">
                Belum ada data dokter terdaftar.
              </TableCell>
            </TableRow>
          ) : (
            doctors.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>
                  {doc.avatar_url || doc.photo_url ? (
                    <img
                      src={getStorageUrl(doc.avatar_url || doc.photo_url) || doc.avatar_url || doc.photo_url}
                      alt={doc.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#F0E6D3]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <p className="text-xs font-bold text-[#4A3F35]">{doc.name}</p>
                  <p className="text-[10px] text-[#8A7B6B]">{doc.email || doc.sip}</p>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-[#B8943F]">{doc.specialization || doc.speciality || "Spesialis Gigi"}</span>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-[#4A3F35]">{doc.str || doc.sip || "-"}</p>
                  <p className="text-[10px] text-[#8A7B6B]">{doc.experience_years ? `${doc.experience_years} Tahun` : ""}</p>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${doc.is_active !== false ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {doc.is_active !== false ? "Aktif" : "Non-aktif"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(doc)} className="h-8 w-8 p-0 text-[#B8943F]">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
