import { useState, useMemo } from "react";
import { Search, X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import UserTable from "../components/UserTable";
import UserDetailModal from "../components/UserDetailModal";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { deleteAdminUser } from "../services/userService";
import { getSession } from "@/core/auth/services/session";

type Props = {
  users: any[];
  onSelectUser?: (user: any) => void;
  onRefresh?: () => void;
};

export default function UsersPage({ users, onSelectUser, onRefresh }: Props) {
  const [selected, setSelected] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const session = getSession();

  const handleSelect = (user: any) => {
    setSelected(user);
    if (onSelectUser) onSelectUser(user);
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const token =
        localStorage.getItem("apident:token") ||
        (session as any)?.token ||
        "";

      await deleteAdminUser(token, userToDelete.id);
      toast.success(`Pengguna "${userToDelete.name || "User"}" berhasil dihapus.`);
      setUserToDelete(null);

      if (selected?.id === userToDelete.id) {
        setSelected(null);
      }

      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus pengguna.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase().trim();
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.whatsapp || u.phone || "").includes(q)
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Pengguna / Pasien Klinik</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola data pasien terdaftar, peran pengguna, dan level membership tier.</p>
        </div>

        {/* Search by User Name, Email or Phone */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="w-4 h-4 text-[#8A7B6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, no. HP..."
            className="w-full pl-9 pr-9 py-2 bg-white border border-[#F0E6D3] rounded-xl text-xs text-[#4A3F35] placeholder:text-[#8A7B6B]/70 focus:outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] shadow-2xs transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <UserTable
        users={filteredUsers}
        onSelect={handleSelect}
        onDelete={handleDeleteUser}
        isSearching={Boolean(search.trim())}
      />

      <UserDetailModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        user={selected}
        onDeleteUser={handleDeleteUser}
        onUpdated={() => {
          if (onRefresh) onRefresh();
        }}
      />

      {/* Delete User Confirmation Dialog */}
      <Dialog open={!!userToDelete} onOpenChange={(open) => !open && !isDeleting && setUserToDelete(null)}>
        <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-[#EADBBD] shadow-2xl">
          <div className="text-center sm:text-left space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto sm:mx-0">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <DialogTitle className="text-lg font-black text-[#2C2416]">
                Hapus Akun Pengguna?
              </DialogTitle>
              <DialogDescription className="text-xs text-[#8C8272] mt-1">
                Apakah Anda yakin ingin menghapus akun pengguna berikut secara permanen dari sistem klinik?
              </DialogDescription>
            </div>

            {userToDelete && (
              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EDE5D6] text-left space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8C8272]">Nama Pengguna:</span>
                  <span className="font-bold text-[#2C2416]">{userToDelete.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8C8272]">Email:</span>
                  <span className="font-mono text-[#2C2416]">{userToDelete.email || "-"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8C8272]">Peran / Role:</span>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] text-[#4A3F35] border border-[#F0E6D3]">
                    {userToDelete.role || "patient"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8C8272]">Tier Membership:</span>
                  <span className="font-bold text-[#B8943F]">
                    {userToDelete.membership_level || userToDelete.membership_tier || "Bronze"}
                  </span>
                </div>
              </div>
            )}

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed text-left">
              ⚠️ <strong>Perhatian:</strong> Tindakan ini tidak dapat dibatalkan. Riwayat konsultasi, klaim promo, dan token sesi pengguna ini akan dibersihkan.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="h-10 px-4 rounded-xl border-[#E8DFC8] text-[#4A3F35] hover:bg-[#FAF8F5] text-xs font-semibold cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="h-10 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Pengguna</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
