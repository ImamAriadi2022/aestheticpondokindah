import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";

type Props = {
  consultations: any[];
  onSelect: (id: string) => void;
};

export default function ConsultationTable({ consultations, onSelect }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FAF8F5]">
            <TableHead>Kode / Pasien</TableHead>
            <TableHead>Keluhan Utama</TableHead>
            <TableHead>Dokter Penanggung Jawab</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consultations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-xs text-[#8A7B6B]">
                Belum ada data konsultasi.
              </TableCell>
            </TableRow>
          ) : (
            consultations.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="text-xs font-bold text-[#4A3F35]">{item.code || item.id}</p>
                  <p className="text-[10px] text-[#8A7B6B]">{item.patientName || item.patient?.name || "Pasien"}</p>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-[#4A3F35] line-clamp-1">{item.complaintText || item.notes || "-"}</p>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-medium text-[#4A3F35]">{item.doctorName || item.doctor?.name || "Belum Ditugaskan"}</span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                    {item.status || "Menunggu"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onSelect(item.id)} className="h-8 text-xs text-[#B8943F]">
                    Buka Chat
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
