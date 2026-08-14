import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Lock, Mail, Trash2, AlertTriangle } from "lucide-react";

interface DoctorChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oldPassword: string;
  setOldPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function DoctorChangePasswordModal({
  open,
  onOpenChange,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSubmit,
}: DoctorChangePasswordModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#4A3F35]">
            <Lock className="w-5 h-5 text-[#C9A24A]" />
            Ganti Password
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Masukkan password lama dan password baru Anda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-gray-700">Password Saat Ini</label>
            <Input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Password Baru</label>
            <Input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="mt-1 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700">Konfirmasi Password Baru</label>
            <Input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang password baru"
              className="mt-1 rounded-xl text-xs"
            />
          </div>
          <DialogFooter className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-[#C9A24A] hover:bg-[#B8943F] text-white font-semibold rounded-xl text-xs"
            >
              Simpan Password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DoctorChangeEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newEmail: string;
  setNewEmail: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function DoctorChangeEmailModal({
  open,
  onOpenChange,
  newEmail,
  setNewEmail,
  onSubmit,
}: DoctorChangeEmailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-[#4A3F35]">
            <Mail className="w-5 h-5 text-[#C9A24A]" />
            Ganti Email Akun
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Kami akan mengirimkan tautan konfirmasi ke email baru Anda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2">
          <div>
            <label className="text-xs font-semibold text-gray-700">Email Baru</label>
            <Input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="emailbaru@aestheticpondokindah.id"
              className="mt-1 rounded-xl text-xs"
            />
          </div>
          <DialogFooter className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-[#C9A24A] hover:bg-[#B8943F] text-white font-semibold rounded-xl text-xs"
            >
              Kirim Verifikasi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DoctorDeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleteConfirmText: string;
  setDeleteConfirmText: (val: string) => void;
  onConfirm: () => void;
}

export function DoctorDeleteAccountModal({
  open,
  onOpenChange,
  deleteConfirmText,
  setDeleteConfirmText,
  onConfirm,
}: DoctorDeleteAccountModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-red-600">
            <Trash2 className="w-5 h-5" />
            Hapus Akun Dokter
          </DialogTitle>
          <DialogDescription className="text-xs text-gray-500">
            Tindakan ini tidak dapat dibatalkan. Semua data praktik dokter Anda akan dihapus secara permanen.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>Ketik <strong>HAPUS</strong> di bawah ini untuk mengonfirmasi penghapusan akun.</span>
          </div>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Ketik HAPUS"
            className="rounded-xl text-xs border-red-200"
          />
          <DialogFooter className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={deleteConfirmText !== "HAPUS"}
              onClick={onConfirm}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs"
            >
              Hapus Akun Permanen
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
