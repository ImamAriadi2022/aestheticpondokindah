import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";

type Props = {
  reservations: any[];
  onSelect: (item: any) => void;
};

export default function ReservationTable({ reservations, onSelect }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FAF8F5]">
            <TableHead>Kode / Pasien</TableHead>
            <TableHead>Layanan / Perawatan</TableHead>
            <TableHead>Dokter & Cabang</TableHead>
            <TableHead>Jadwal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-xs text-[#8A7B6B]">
                Belum ada data reservasi janji temu.
              </TableCell>
            </TableRow>
          ) : (
            reservations.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="text-xs font-bold text-[#4A3F35]">{item.booking_code || item.id}</p>
                  <p className="text-[10px] text-[#8A7B6B]">{item.patient_name || item.user_name || "Pasien"}</p>
                </TableCell>
                <TableCell>
                  <p className="text-xs font-semibold text-[#4A3F35]">{item.service_name || item.service || "-"}</p>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-[#4A3F35]">{item.doctor_name || "-"}</p>
                  <p className="text-[10px] text-[#8A7B6B]">{item.branch_name || "-"}</p>
                </TableCell>
                <TableCell>
                  <p className="text-xs font-medium text-[#4A3F35]">{item.booking_date || "-"}</p>
                  <p className="text-[10px] text-[#8A7B6B]">{item.booking_time || ""}</p>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    {item.status || "Baru"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onSelect(item)} className="h-8 text-xs text-[#B8943F]">
                    Detail
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
