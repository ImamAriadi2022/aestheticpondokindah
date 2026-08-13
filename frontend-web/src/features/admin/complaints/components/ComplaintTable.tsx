import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";

type Props = {
  complaints: any[];
  onSelect: (complaint: any) => void;
};

export default function ComplaintTable({ complaints, onSelect }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FAF8F5]">
            <TableHead>Kode / Pengirim</TableHead>
            <TableHead>Kategori / Judul</TableHead>
            <TableHead>Isi Pengaduan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-xs text-[#8A7B6B]">
                Belum ada data pengaduan pasien.
              </TableCell>
            </TableRow>
          ) : (
            complaints.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="text-xs font-bold text-[#4A3F35]">{item.ticket_code || item.id}</p>
                  <p className="text-[10px] text-[#8A7B6B]">{item.patient_name || item.user_name || "Pasien"}</p>
                </TableCell>
                <TableCell>
                  <p className="text-xs font-semibold text-[#4A3F35]">{item.category || "Umum"}</p>
                  <p className="text-[10px] text-[#8A7B6B]">{item.subject || ""}</p>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-[#4A3F35] line-clamp-1">{item.description || item.content || "-"}</p>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                    {item.status || "Baru"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onSelect(item)} className="h-8 text-xs text-[#B8943F]">
                    Tanggapi
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
