import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";

type Props = {
  tiers: any[];
};

export default function MembershipTierTable({ tiers }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FAF8F5]">
            <TableHead>Nama Tier</TableHead>
            <TableHead>Minimum Transaksi</TableHead>
            <TableHead>Diskon Perawatan</TableHead>
            <TableHead>Prioritas Reservasi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-xs text-[#8A7B6B]">
                Belum ada data tier membership.
              </TableCell>
            </TableRow>
          ) : (
            tiers.map((tier) => (
              <TableRow key={tier.id || tier.name}>
                <TableCell>
                  <span className="text-xs font-bold text-[#4A3F35]">{tier.name}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[#4A3F35]">{tier.min_spend ? `Rp ${Number(tier.min_spend).toLocaleString('id-ID')}` : "Rp 0"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-emerald-700">{tier.discount_percent ? `${tier.discount_percent}%` : "0%"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-[#4A3F35]">{tier.priority_booking ? "Ya (VVIP)" : "Standar"}</span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
