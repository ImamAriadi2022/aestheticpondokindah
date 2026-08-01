import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { toast } from "@/components/ui/toast";
import { clearSession } from "@/features/auth/services/session";
import { clearSessionStorage } from "@/features/auth/services/sessionTtl";
import {
  Settings,
  Shield,
  Bell,
  FileText,
  Trash2,
  Lock,
  Mail,
  LogOut,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  BellOff,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function SettingsPage() {
  const navigate = useNavigate();

  // Browser notification permission state
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const requestNotifPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === "granted") {
        toast({
          title: "Notifikasi Browser Diizinkan",
          description: "Anda akan menerima notifikasi otomatis dari sistem klinik.",
        });
      } else {
        toast({
          title: "Notifikasi Ditolak",
          description: "Izin notifikasi ditolak oleh browser Anda.",
          variant: "destructive",
        });
      }
    }
  };

  // Security Modals state
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Gagal",
        description: "Password baru dan konfirmasi password tidak cocok.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Password Berhasil Diubah",
      description: "Gunakan password baru Anda untuk login berikutnya.",
    });
    setChangePasswordOpen(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangeEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    toast({
      title: "Permintaan Ganti Email Dikirim",
      description: `Link verifikasi telah dikirimkan ke ${newEmail}.`,
    });
    setChangeEmailOpen(false);
    setNewEmail("");
  };

  const handleLogoutAllDevices = () => {
    clearSession();
    clearSessionStorage();
    toast({
      title: "Logout Berhasil",
      description: "Sesi Anda pada semua perangkat telah diakhiri.",
    });
    navigate("/login");
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== "HAPUS") {
      toast({
        title: "Konfirmasi Gagal",
        description: 'Ketik "HAPUS" untuk mengonfirmasi penghapusan akun.',
        variant: "destructive",
      });
      return;
    }
    clearSession();
    clearSessionStorage();
    toast({
      title: "Akun Dihapus",
      description: "Akun Anda telah dinonaktifkan.",
      variant: "destructive",
    });
    navigate("/");
  };

  return (
    <DashboardLayout role="user">
      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
              <p className="text-sm text-gray-500">Kelola preferensi keamanan dan notifikasi akun Anda</p>
            </div>
          </div>
        </div>

        {/* Section 1: Keamanan Akun */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Keamanan Akun</h3>
          </div>
          <CardContent className="p-6 divide-y divide-gray-100">
            {/* Ubah Password */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Ubah Password
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Perbarui kata sandi secara berkala untuk menjaga keamanan akun</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={() => setChangePasswordOpen(true)}
              >
                Ubah
              </Button>
            </div>

            {/* Ganti Email */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Ganti Email
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Ubah alamat email utama yang terhubung dengan akun ini</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={() => setChangeEmailOpen(true)}
              >
                Ganti Email
              </Button>
            </div>

            {/* Logout Semua Perangkat */}
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <LogOut className="w-4 h-4 text-gray-400" />
                  Logout dari Semua Perangkat
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Akhiri sesi aktif di browser atau perangkat mobile lain</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                onClick={handleLogoutAllDevices}
              >
                Logout Semua
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Notifikasi Website Browser */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Notifikasi Browser Website</h3>
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-50/40 p-4 rounded-2xl border border-amber-100/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">Notifikasi Push Browser</p>
                  {notifPermission === "granted" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3 h-3" />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                      <BellOff className="w-3 h-3" />
                      Belum Diizinkan
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Terima pemberitahuan konfirmasi reservasi, panggilan konsultasi, dan pengingat jadwal langsung di browser Anda.
                </p>
              </div>

              {notifPermission !== "granted" && (
                <Button
                  onClick={requestNotifPermission}
                  className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:opacity-90 text-white font-semibold rounded-xl text-xs px-4 h-10 shrink-0"
                >
                  Aktifkan Notifikasi Browser
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Privasi & Legal */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Privasi & Legal</h3>
          </div>
          <CardContent className="p-6 divide-y divide-gray-100">
            <a
              href="#/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 flex items-center justify-between text-gray-700 hover:text-[#c9a24a] transition-colors"
            >
              <span className="text-sm font-semibold">Kebijakan Privasi</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </a>
            <a
              href="#/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 flex items-center justify-between text-gray-700 hover:text-[#c9a24a] transition-colors"
            >
              <span className="text-sm font-semibold">Syarat & Ketentuan Layanan</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </a>
          </CardContent>
        </Card>

        {/* Section 4: Hapus Akun */}
        <Card className="rounded-2xl border-rose-100 bg-rose-50/30 shadow-sm overflow-hidden">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-rose-900">Hapus Akun</h4>
                <p className="text-xs text-rose-700/80 mt-0.5">
                  Tindakan ini permanen. Semua data riwayat rekam medis & poin membership akan terhapus.
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              className="rounded-xl px-5 h-10 bg-rose-600 hover:bg-rose-700 font-semibold text-xs text-white"
              onClick={() => setDeleteAccountOpen(true)}
            >
              Hapus Akun Saya
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal Change Password */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Ubah Kata Sandi</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Masukkan password lama dan password baru Anda.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Password Lama</label>
              <Input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Password Baru</label>
              <Input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Konfirmasi Password Baru</label>
              <Input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setChangePasswordOpen(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" className="bg-[#c9a24a] hover:bg-[#a8843a] text-white rounded-xl">
                Simpan Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Change Email */}
      <Dialog open={changeEmailOpen} onOpenChange={setChangeEmailOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Ganti Alamat Email</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Masukkan email baru Anda. Tautan verifikasi akan dikirimkan ke email tersebut.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangeEmail} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Email Baru</label>
              <Input
                type="email"
                required
                placeholder="nama@domain.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setChangeEmailOpen(false)} className="rounded-xl">
                Batal
              </Button>
              <Button type="submit" className="bg-[#c9a24a] hover:bg-[#a8843a] text-white rounded-xl">
                Kirim Verifikasi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Delete Account */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Konfirmasi Hapus Akun
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-600">
              Tindakan ini tidak dapat dibatalkan. Silakan ketik <strong className="text-rose-600">HAPUS</strong> untuk mengonfirmasi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder='Ketik "HAPUS"'
              className="rounded-xl border-rose-200"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteAccountOpen(false)} className="rounded-xl">
              Batal
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteAccount} className="rounded-xl text-white">
              Hapus Permanen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
