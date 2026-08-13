import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";

type Props = {
  messages: any[];
  onSelect: (msg: any) => void;
};

export default function MessageTable({ messages, onSelect }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FAF8F5]">
            <TableHead>Pengirim</TableHead>
            <TableHead>Subjek / Kategori</TableHead>
            <TableHead>Pesan</TableHead>
            <TableHead>Waktu</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-xs text-[#8A7B6B]">
                Belum ada pesan masuk.
              </TableCell>
            </TableRow>
          ) : (
            messages.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="text-xs font-bold text-[#4A3F35]">{item.sender_name || item.name || "Pengirim"}</p>
                  <p className="text-[10px] text-[#8A7B6B]">{item.sender_email || item.email || "-"}</p>
                </TableCell>
                <TableCell>
                  <p className="text-xs font-semibold text-[#4A3F35]">{item.subject || "Umum"}</p>
                  <p className="text-[10px] text-[#8A7B6B]">{item.category || ""}</p>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-[#4A3F35] line-clamp-1">{item.content || item.message || "-"}</p>
                </TableCell>
                <TableCell>
                  <span className="text-[10px] text-[#8A7B6B]">{item.created_at ? item.created_at.slice(0, 10) : "-"}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onSelect(item)} className="h-8 text-xs text-[#B8943F]">
                    Baca
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
