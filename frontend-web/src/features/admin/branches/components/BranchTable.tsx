import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Edit2, Building2 } from "lucide-react";

type Props = {
  branches: any[];
  onEdit: (branch: any) => void;
};

export default function BranchTable({ branches, onEdit }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FAF8F5]">
            <TableHead>Nama Cabang</TableHead>
            <TableHead>Kota / Wilayah</TableHead>
            <TableHead>Alamat Lengkap</TableHead>
            <TableHead>No. Telepon / WhatsApp</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-xs text-[#8A7B6B]">
                Belum ada data cabang klinik terdaftar.
              </TableCell>
            </TableRow>
          ) : (
            branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#4A3F35]">{branch.name}</p>
                      <p className="text-[10px] text-[#8A7B6B]">{branch.code || `ID: ${branch.id}`}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-[#4A3F35]">{branch.city || branch.region || "Jakarta"}</span>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-[#4A3F35] line-clamp-1">{branch.address || "-"}</p>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-[#4A3F35]">{branch.phone || branch.whatsapp || "-"}</p>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(branch)} className="h-8 w-8 p-0 text-[#B8943F]">
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
