import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Trash2 } from "lucide-react";

type Props = {
  users: any[];
  onSelect: (user: any) => void;
  onDelete?: (user: any) => void;
  isSearching?: boolean;
};

export default function UserTable({ users, onSelect, onDelete, isSearching }: Props) {
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
            users.map((user) => {
              const isAdmin = user.role === "admin";
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="text-xs font-bold text-[#4A3F35]">{user.name}</p>
                    <p className="text-[10px] text-[#8A7B6B]">ID: {user.id}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-[#4A3F35]">{user.email || "-"}</p>
                    <p className="text-[10px] text-[#8A7B6B]">{user.whatsapp || user.phone || "-"}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium text-[#4A3F35]">
                      {user.role || "user"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-[#8C6B1C]">
                      {user.membership_tier || user.membership_level || "Bronze"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onSelect(user)}
                        className="h-8 px-2.5 text-xs text-[#B8943F] cursor-pointer hover:bg-amber-50 rounded-lg"
                        title="Lihat Detail Pengguna"
                      >
                        Detail
                      </Button>
                      {!isAdmin && onDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(user);
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Hapus Akun Pengguna"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
