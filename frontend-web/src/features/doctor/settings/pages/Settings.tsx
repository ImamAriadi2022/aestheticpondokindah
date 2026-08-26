import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { toast } from "@/shared/ui/toast";
import { clearSession, getSession, updateSessionProfile } from "@/core/auth/services/session";
import { clearSessionStorage } from "@/core/auth/services/sessionTtl";
import {
  Settings,
  Shield,
  Bell,
  Trash2,
  Lock,
  Mail,
  LogOut,
  CheckCircle2,
  BellOff,
} from "lucide-react";
import {
  DoctorChangePasswordModal,
  DoctorChangeEmailModal,
  DoctorDeleteAccountModal,
} from "../components/DoctorSecurityModals";
import {
  changeDoctorPassword,
  changeDoctorEmail,
  logoutAllDoctorDevices,
  deleteDoctorAccount,
} from "../services/doctorSettingsService";

export default function DoctorSettingsPage() {
  const navigate = useNavigate();

  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [browserNotifEnabled, setBrowserNotifEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("doctor_browser_notif_enabled");
    if (saved !== null) {
      return saved === "true";
    }
    return "Notification" in window && Notification.permission === "granted";
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const isBrowserNotifActive = notifPermission === "granted" && browserNotifEnabled;

  const handleToggleBrowserNotif = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      toast({
        title: "Tidak Didukung",
        message: "Browser ini tidak mendukung fitur Web Notification.",
        variant: "error",
      });
      return;
    }

    if (isBrowserNotifActive) {
      setBrowserNotifEnabled(false);
      localStorage.setItem("doctor_browser_notif_enabled", "false");
      toast({
        title: "Notifikasi Dinonaktifkan",
        message: "Preferensi notifikasi browser untuk dokter telah dimatikan.",
        variant: "info",
      });
    } else {
      if (Notification.permission === "granted") {
        setNotifPermission("granted");
        setBrowserNotifEnabled(true);
        localStorage.setItem("doctor_browser_notif_enabled", "true");
        toast({
          title: "Notifikasi Diaktifkan",
          message: "Notifikasi browser aktif untuk jadwal dan reservasi pasien baru.",
          variant: "info",
        });
      } else if (Notification.permission === "denied") {
        toast({
          title: "Izin Notifikasi Diblokir",
          message: "Browser Anda memblokir izin notifikasi. Silakan klik ikon gembok di bilah URL browser untuk mengizinkannya.",
          variant: "error",
        });
      } else {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
        if (perm === "granted") {
          setBrowserNotifEnabled(true);
          localStorage.setItem("doctor_browser_notif_enabled", "true");
          toast({
            title: "Notifikasi Diaktifkan",
            message: "Notifikasi browser aktif untuk jadwal dan reservasi pasien baru.",
            variant: "info",
          });
        } else {
          setBrowserNotifEnabled(false);
          localStorage.setItem("doctor_browser_notif_enabled", "false");
          toast({
            title: "Notifikasi Ditolak",
            message: "Izin notifikasi browser belum diberikan.",
            variant: "error",
          });
        }
      }
    }
  };

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [changeEmailOpen, setChangeEmailOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Gagal",
        message: "Password baru dan konfirmasi password tidak cocok.",
        variant: "error",
      });
      return;
    }
    try {
      await changeDoctorPassword(oldPassword, newPassword);
      toast({
        title: "Password Berhasil Diubah",
        message: "Gunakan password baru Anda untuk login berikutnya.",
        variant: "info",
      });
      setChangePasswordOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({
        title: "Gagal",
        message: err.message || "Gagal mengubah password.",
        variant: "error",
      });
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    try {
      await changeDoctorEmail(newEmail);
      updateSessionProfile({ email: newEmail });
      toast({
        title: "Email Berhasil Diubah",
        message: `Email akun praktik telah berhasil diubah menjadi ${newEmail}.`,
        variant: "info",
      });
      setChangeEmailOpen(false);
      setNewEmail("");
    } catch (err: any) {
      toast({
        title: "Gagal Mengubah Email",
        message: err.message || "Gagal memperbarui alamat email.",
        variant: "error",
      });
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await logoutAllDoctorDevices();
    } catch {
      // Continue clearing local session even if network call has issue
    }
    clearSession();
    clearSessionStorage();
    localStorage.removeItem("apident:token");
    toast({
      title: "Logout Berhasil",
      message: "Sesi Anda pada semua perangkat telah diakhiri.",
      variant: "info",
    });
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "HAPUS") {
      toast({
        title: "Konfirmasi Gagal",
        message: 'Ketik "HAPUS" untuk mengonfirmasi penghapusan akun.',
        variant: "error",
      });
      return;
    }
    try {
      await deleteDoctorAccount();
      clearSession();
      clearSessionStorage();
      localStorage.removeItem("apident:token");
      toast({
        title: "Akun Dihapus",
        message: "Akun praktik Anda telah berhasil dihapus.",
        variant: "info",
      });
      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Gagal Menghapus Akun",
        message: err.message || "Terjadi kesalahan saat menghapus akun.",
        variant: "error",
      });
    }
  };

  const session = getSession();
  const sessionRole = (session?.role as any) || "doctor";

  return (
    <DashboardLayout role={sessionRole}>
      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pengaturan Dokter</h1>
              <p className="text-sm text-gray-500">Kelola preferensi keamanan dan notifikasi akun praktik Anda</p>
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
                  Keluar dari Semua Perangkat
                </p>
                <p className="text-xs text-gray-500 mt-0.5">Akhiri semua sesi login aktif di perangkat lain</p>
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

        {/* Section 2: Notifikasi */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Notifikasi Praktik</h3>
          </div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  {isBrowserNotifActive ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <BellOff className="w-4 h-4 text-gray-400" />
                  )}
                  Notifikasi Browser
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isBrowserNotifActive
                    ? "Notifikasi browser aktif untuk jadwal dan reservasi pasien baru."
                    : "Notifikasi browser nonaktif. Aktifkan untuk menerima pembaruan jadwal dan pasien baru."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-xl border transition-colors ${
                    isBrowserNotifActive
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : "text-gray-500 bg-gray-50 border-gray-200"
                  }`}
                >
                  {isBrowserNotifActive ? "Aktif" : "Nonaktif"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isBrowserNotifActive}
                  onClick={handleToggleBrowserNotif}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A] focus:ring-offset-2 ${
                    isBrowserNotifActive ? "bg-[#C9A24A]" : "bg-gray-200"
                  }`}
                  title={isBrowserNotifActive ? "Nonaktifkan notifikasi browser" : "Aktifkan notifikasi browser"}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isBrowserNotifActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Zona Bahaya */}
        <Card className="rounded-2xl border-rose-100 shadow-sm overflow-hidden">
          <div className="bg-rose-50/80 px-6 py-4 border-b border-rose-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-rose-900 text-base">Zona Bahaya</h3>
          </div>
          <CardContent className="p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-rose-900">Hapus Akun Praktik</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Tindakan ini permanen. Semua data profil praktik & riwayat jadwal praktik akan terhapus.
              </p>
            </div>
            <Button
              variant="destructive"
              className="rounded-xl px-5 h-10 bg-rose-600 hover:bg-rose-700 font-semibold text-xs text-white"
              onClick={() => setDeleteAccountOpen(true)}
            >
              Hapus Akun
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Security Modals */}
      <DoctorChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        oldPassword={oldPassword}
        setOldPassword={setOldPassword}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        confirmPassword={confirmPassword}
        setConfirmPassword={setConfirmPassword}
        onSubmit={handleChangePassword}
      />

      <DoctorChangeEmailModal
        open={changeEmailOpen}
        onOpenChange={setChangeEmailOpen}
        newEmail={newEmail}
        setNewEmail={setNewEmail}
        onSubmit={handleChangeEmail}
      />

      <DoctorDeleteAccountModal
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        deleteConfirmText={deleteConfirmText}
        setDeleteConfirmText={setDeleteConfirmText}
        onConfirm={handleDeleteAccount}
      />
    </DashboardLayout>
  );
}
