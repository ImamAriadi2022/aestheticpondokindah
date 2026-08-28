import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";

type Props = {
  users: any[];
  onSelect: (user: any) => void;
  isSearching?: boolean;
};

export default function UserTable({ users, onSelect, isSearching }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-x-auto shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FAF8F5]">
            <TableHead>Nama Pengguna</TableHead>
            <TableHead>Email / No. HP</TableHead>
            <TableHead>Role / Peran</TableHead>
            <TableHead>Tier Membership</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-xs text-[#8A7B6B]">
                {isSearching ? "Tidak ada pengguna dengan nama tersebut." : "Belum ada data pengguna terdaftar."}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <p className="text-xs font-bold text-[#4A3F35]">{user.name}</p>
                  <p className="text-[10px] text-[#8A7B6B]">ID: {user.id}</p>
                </TableCell>
                <TableCell>
                  <p className="text-xs text-[#4A3F35]">{user.email}</p>
                  <p className="text-[10px] text-[#8A7B6B]">{user.phone || "-"}</p>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] text-[#4A3F35] border border-[#F0E6D3]">
                    {user.role || "user"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF8F0] text-[#B8943F] border border-[#F5E6C8]">
                    {user.membership_tier || user.membership_level || "Bronze"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onSelect(user)} className="h-8 text-xs text-[#B8943F] cursor-pointer hover:bg-amber-50">
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
