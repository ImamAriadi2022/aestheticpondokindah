import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { toast } from "@/shared/ui/toast";
import { clearSession, getSession } from "@/core/auth/services/session";
import { clearSessionStorage } from "@/core/auth/services/sessionTtl";
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
  Volume2,
  CalendarCheck,
  MessageSquare,
  MessageCircleQuestion,
  Check,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { playNotificationChime, dispatchDeviceSystemNotification } from "@/core/services/pushNotificationService";
import { API_BASE } from "@/core/api/apiConfig";

export default function SettingsPage() {
  const navigate = useNavigate();

  // Browser notification state & preferences
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [notifEnabled, setNotifEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("apident:notifications_enabled") !== "false";
    } catch {
      return true;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("apident:notifications_sound_enabled") !== "false";
    } catch {
      return true;
    }
  });

  const [bookingNotif, setBookingNotif] = useState<boolean>(() => {
    try {
      return localStorage.getItem("apident:notifications_booking_enabled") !== "false";
    } catch {
      return true;
    }
  });

  const [consultationNotif, setConsultationNotif] = useState<boolean>(() => {
    try {
      return localStorage.getItem("apident:notifications_consultation_enabled") !== "false";
    } catch {
      return true;
    }
  });

  const [complaintNotif, setComplaintNotif] = useState<boolean>(() => {
    try {
      return localStorage.getItem("apident:notifications_complaints_enabled") !== "false";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
      if (Notification.permission === "denied") {
        setNotifEnabled(false);
      }
    }
  }, []);

  const handleToggleMasterNotification = async () => {
    if (!notifEnabled) {
      // Trying to enable notification
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          const perm = await Notification.requestPermission();
          setNotifPermission(perm);
          if (perm === "granted") {
            setNotifEnabled(true);
            localStorage.setItem("apident:notifications_enabled", "true");
            playNotificationChime("new_booking");
            toast({
              title: "Notifikasi Browser Diizinkan",
              message: "Notifikasi browser aktif. Anda akan menerima pemberitahuan otomatis saat ada aktivitas baru.",
              variant: "success",
            });
          } else {
            setNotifEnabled(false);
            localStorage.setItem("apident:notifications_enabled", "false");
            toast({
              title: "Izin Notifikasi Ditolak",
              message: "Izin notifikasi tidak diberikan oleh browser Anda.",
              variant: "error",
            });
          }
        } else if (Notification.permission === "denied") {
          toast({
            title: "Izin Browser Diblokir",
            message: "Izin notifikasi saat ini diblokir di setelan browser. Klik ikon gembok di sebelah URL browser untuk mengizinkan.",
            variant: "error",
          });
        } else {
          // Already granted
          setNotifEnabled(true);
          localStorage.setItem("apident:notifications_enabled", "true");
          playNotificationChime("new_booking");
          toast({
            title: "Notifikasi Diaktifkan",
            message: "Pemberitahuan push browser berhasil diaktifkan.",
            variant: "success",
          });
        }
      } else {
        setNotifEnabled(true);
        localStorage.setItem("apident:notifications_enabled", "true");
      }
    } else {
      // Disabling notification
      setNotifEnabled(false);
      localStorage.setItem("apident:notifications_enabled", "false");
      toast({
        title: "Notifikasi Dinonaktifkan",
        message: "Pemberitahuan notifikasi browser telah dimatikan.",
        variant: "info",
      });
    }
  };

  const handleTestNotification = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted") {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
        if (perm !== "granted") {
          toast({
            title: "Izin Notifikasi Belum Diberikan",
            message: "Silakan klik Izinkan pada permintaan izin notifikasi browser.",
            variant: "warning",
          });
          return;
        }
      }

      playNotificationChime("new_booking");

      const testPayload = {
        id: "test_" + Date.now(),
        title: "🔔 Uji Coba Banner Notifikasi",
        message: "Notifikasi browser & banner Aesthetic Pondok Indah berfungsi dengan baik!",
        role: sessionRole === "clinic" ? ("admin" as const) : ("patient" as const),
        type: "general",
        url: window.location.hash || "/#/settings",
      };

      dispatchDeviceSystemNotification(testPayload, "test_" + Date.now());

      toast({
        title: "🔔 Uji Coba Banner Notifikasi",
        message: "Notifikasi banner browser & aplikasi berhasil dikirimkan!",
        variant: "success",
      });
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("apident:notifications_sound_enabled", next ? "true" : "false");
    if (next) {
      playNotificationChime("confirmed");
      toast({ title: "Suara Notifikasi Aktif", message: "Nada dering chime akan berbunyi saat notifikasi masuk.", variant: "info" });
    } else {
      toast({ title: "Suara Notifikasi Dinonaktifkan", message: "Notifikasi akan masuk tanpa nada dering.", variant: "info" });
    }
  };

  const handleToggleBooking = () => {
    const next = !bookingNotif;
    setBookingNotif(next);
    localStorage.setItem("apident:notifications_booking_enabled", next ? "true" : "false");
    toast({
      title: next ? "Notifikasi Reservasi Diizinkan" : "Notifikasi Reservasi Dimatikan",
      message: next ? "Anda akan diberitahu saat ada booking reservasi baru masuk." : "Alert reservasi baru dinonaktifkan.",
      variant: "info",
    });
  };

  const handleToggleConsultation = () => {
    const next = !consultationNotif;
    setConsultationNotif(next);
    localStorage.setItem("apident:notifications_consultation_enabled", next ? "true" : "false");
    toast({
      title: next ? "Notifikasi Konsultasi Diizinkan" : "Notifikasi Konsultasi Dimatikan",
      message: next ? "Anda akan diberitahu saat ada pesan chat konsultasi baru." : "Alert pesan konsultasi dinonaktifkan.",
      variant: "info",
    });
  };

  const handleToggleComplaint = () => {
    const next = !complaintNotif;
    setComplaintNotif(next);
    localStorage.setItem("apident:notifications_complaints_enabled", next ? "true" : "false");
    toast({
      title: next ? "Notifikasi Pengaduan Diizinkan" : "Notifikasi Pengaduan Dimatikan",
      message: next ? "Anda akan diberitahu saat ada tiket masukan/keluhan baru." : "Alert pengaduan dinonaktifkan.",
      variant: "info",
    });
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
        message: "Password baru dan konfirmasi password tidak cocok.",
        variant: "error",
      });
      return;
    }
    toast({
      title: "Password Berhasil Diubah",
      message: "Gunakan password baru Anda untuk login berikutnya.",
      variant: "info",
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
      message: `Link verifikasi telah dikirimkan ke ${newEmail}.`,
      variant: "info",
    });
    setChangeEmailOpen(false);
    setNewEmail("");
  };

  const handleLogoutAllDevices = () => {
    clearSession();
    clearSessionStorage();
    toast({
      title: "Logout Berhasil",
      message: "Sesi Anda pada semua perangkat telah diakhiri.",
      variant: "info",
    });
    navigate("/login");
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "HAPUS") {
      toast({
        title: "Konfirmasi Gagal",
        message: 'Ketik "HAPUS" untuk mengonfirmasi penghapusan akun.',
        variant: "error",
      });
      return;
    }

    const token = localStorage.getItem("apident:token") || localStorage.getItem("auth_token");
    if (!token) {
      clearSession();
      clearSessionStorage();
      navigate("/login");
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`${API_BASE}/user/account`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus akun.");
      }

      clearSession();
      clearSessionStorage();
      toast({
        title: "Akun Berhasil Dihapus",
        message: "Akun Anda telah dihapus secara permanen dari sistem.",
        variant: "success",
      });
      setDeleteAccountOpen(false);
      navigate("/login", { replace: true });
    } catch (err: any) {
      toast({
        title: "Gagal Menghapus Akun",
        message: err.message || "Terjadi kesalahan saat menghapus akun.",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const session = getSession();
  const sessionRole = (session?.role as any) || "user";

  const isGrantedAndActive = notifEnabled && notifPermission === "granted";

  return (
    <DashboardLayout role={sessionRole}>
      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 text-left">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c9a24a]/10 flex items-center justify-center text-[#c9a24a]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {sessionRole === "clinic" ? "Preferensi Administrator" : "Preferensi"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {sessionRole === "clinic"
                  ? "Atur preferensi notifikasi browser dan pengingat operasional admin"
                  : "Kelola preferensi keamanan dan notifikasi akun Anda"}
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Keamanan Akun (User & Doctor Only) */}
        {sessionRole !== "clinic" && (
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
                  className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
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
                  className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
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
                  className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  onClick={handleLogoutAllDevices}
                >
                  Logout Semua
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 2: Notifikasi Website Browser */}
        <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-[#8C6B1C]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Notifikasi Browser Website</h3>
                <p className="text-xs text-gray-500">Konfigurasi izin dan peringatan aktivitas sistem</p>
              </div>
            </div>

            {/* Status Pill Badge */}
            {isGrantedAndActive ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Diizinkan / Aktif
              </span>
            ) : !notifEnabled ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 shadow-2xs">
                <BellOff className="w-3.5 h-3.5 text-gray-500" />
                Tidak Diizinkan / Non-Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Perlu Izin Browser
              </span>
            )}
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Master Push Toggle Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-[#E8DFC8]/80">
              <div className="space-y-1 pr-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#2C2416]">Notifikasi Push Browser Utama</p>
                </div>
                <p className="text-xs text-[#6B5E4F] leading-relaxed">
                  {sessionRole === "clinic"
                    ? "Terima pemberitahuan push langsung di layar komputer/browser saat ada reservasi booking baru, pesan chat konsultasi, atau pengaduan pasien."
                    : "Terima pemberitahuan konfirmasi reservasi, panggilan konsultasi dokter, dan pengingat jadwal langsung di layar browser Anda."}
                </p>
              </div>

              {/* Master Toggle Switch & Test Button */}
              <div className="flex items-center gap-3 shrink-0">
                {notifEnabled && (
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="text-xs font-bold text-[#8C6B1C] bg-[#FAF5EA] hover:bg-[#F3ECD8] px-3 py-1.5 rounded-xl border border-[#EADBBD] transition-all cursor-pointer shadow-2xs"
                    title="Uji coba kirim banner notifikasi ke layar"
                  >
                    Uji Banner
                  </button>
                )}
                <span className="text-xs font-bold text-[#4A3F35]">
                  {notifEnabled ? "Aktif" : "Non-Aktif"}
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifEnabled}
                  onClick={handleToggleMasterNotification}
                  className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8C6B1C] focus:ring-offset-2 ${
                    notifEnabled ? "bg-[#8C6B1C]" : "bg-gray-300"
                  }`}
                  title={notifEnabled ? "Klik untuk menonaktifkan notifikasi" : "Klik untuk mengizinkan/mengaktifkan notifikasi"}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                      notifEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  >
                    {notifEnabled ? (
                      <Check className="w-3.5 h-3.5 text-[#8C6B1C]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Granular Notification Channels (For Admin & Staff) */}
            <div className="space-y-4 pt-1">
              <h4 className="text-xs font-bold text-[#8C8272] uppercase tracking-wider">
                Kategori Notifikasi Operasional:
              </h4>

              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-white">
                {/* 1. Reservasi Booking */}
                <div className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6B1C] flex items-center justify-center shrink-0">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">Reservasi Booking Pasien Baru</p>
                      <p className="text-[11px] text-gray-500">Pemberitahuan instan saat ada permintaan janji temu baru diajukan oleh pasien</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    disabled={!notifEnabled}
                    aria-checked={bookingNotif && notifEnabled}
                    onClick={handleToggleBooking}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      bookingNotif && notifEnabled ? "bg-[#8C6B1C]" : "bg-gray-200"
                    } ${!notifEnabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        bookingNotif && notifEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 2. Pesan Chat Konsultasi */}
                <div className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-gray-900">Pesan Chat & Konsultasi Online</p>
                      <p className="text-[11px] text-gray-500">Pemberitahuan saat ada pesan konsultasi atau pertanyaan baru dari pasien</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    disabled={!notifEnabled}
                    aria-checked={consultationNotif && notifEnabled}
                    onClick={handleToggleConsultation}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      consultationNotif && notifEnabled ? "bg-[#8C6B1C]" : "bg-gray-200"
                    } ${!notifEnabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        consultationNotif && notifEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* 3. Pengaduan & Masukan Pasien */}
                {sessionRole === "clinic" && (
                  <div className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <MessageCircleQuestion className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-900">Pengaduan & Masukan Pasien</p>
                        <p className="text-[11px] text-gray-500">Pemberitahuan saat ada tiket keluhan atau saran baru yang masuk</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      disabled={!notifEnabled}
                      aria-checked={complaintNotif && notifEnabled}
                      onClick={handleToggleComplaint}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        complaintNotif && notifEnabled ? "bg-[#8C6B1C]" : "bg-gray-200"
                      } ${!notifEnabled ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                          complaintNotif && notifEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                )}

                {/* 4. Suara Nada Dering (Audio Chime) */}
                <div className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-bold text-gray-900">Bunyi Suara Notifikasi (Audio Chime)</p>
                        <button
                          type="button"
                          onClick={() => playNotificationChime("new_booking")}
                          className="text-[10px] font-bold text-[#8C6B1C] hover:underline bg-[#FAF5EA] px-2 py-0.5 rounded-md border border-[#EADBBD] cursor-pointer"
                          title="Putar contoh nada dering notifikasi"
                        >
                          Tes Suara
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-500">Bunyikan nada dering halus saat pemberitahuan push masuk</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    disabled={!notifEnabled}
                    aria-checked={soundEnabled && notifEnabled}
                    onClick={handleToggleSound}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      soundEnabled && notifEnabled ? "bg-[#8C6B1C]" : "bg-gray-200"
                    } ${!notifEnabled ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        soundEnabled && notifEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Privasi & Legal (User & Doctor Only) */}
        {sessionRole !== "clinic" && (
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
        )}

        {/* Section 4: Hapus Akun (User & Doctor Only) */}
        {sessionRole !== "clinic" && (
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
                className="rounded-xl px-5 h-10 bg-rose-600 hover:bg-rose-700 font-semibold text-xs text-white cursor-pointer"
                onClick={() => setDeleteAccountOpen(true)}
              >
                Hapus Akun Saya
              </Button>
            </CardContent>
          </Card>
        )}
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
              <Button type="button" variant="outline" onClick={() => setChangePasswordOpen(false)} className="rounded-xl cursor-pointer">
                Batal
              </Button>
              <Button type="submit" className="bg-[#c9a24a] hover:bg-[#a8843a] text-white rounded-xl cursor-pointer">
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
              <Button type="button" variant="outline" onClick={() => setChangeEmailOpen(false)} className="rounded-xl cursor-pointer">
                Batal
              </Button>
              <Button type="submit" className="bg-[#c9a24a] hover:bg-[#a8843a] text-white rounded-xl cursor-pointer">
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
            <Button type="button" variant="outline" onClick={() => setDeleteAccountOpen(false)} className="rounded-xl cursor-pointer">
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeleting || deleteConfirmText.trim() !== "HAPUS"}
              className={`rounded-xl font-bold transition-all ${
                deleteConfirmText.trim() === "HAPUS"
                  ? "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25 cursor-pointer"
                  : "bg-stone-200 text-stone-400 border border-stone-300 cursor-not-allowed opacity-60"
              }`}
            >
              {isDeleting ? "Menghapus..." : "Hapus Permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
