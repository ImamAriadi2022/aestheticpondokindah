import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { getSession, clearSession } from "@/core/auth/services/session";
import { clearSessionStorage } from "@/core/auth/services/sessionTtl";
import { toast } from "@/shared/ui/toast";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { API_BASE } from "@/core/api/apiConfig";
import GoogleAuthButton from "@/shared/components/GoogleAuthButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import {
  Shield,
  Smartphone,
  Lock,
  ShieldCheck,
  AlertCircle,
  Trash2,
  CheckCircle2,
  Unlink,
  Loader2,
} from "lucide-react";

export default function SecurityPage() {
  const navigate = useNavigate();
  const session = getSession();
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [googleLinked, setGoogleLinked] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("apident:user");
      const u = raw ? JSON.parse(raw) : null;
      return Boolean(u?.google_id || u?.has_google || (session as any)?.google_id || (session as any)?.has_google);
    } catch {
      return false;
    }
  });
  const [unlinkingGoogle, setUnlinkingGoogle] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("apident:token");
    if (!token) return;

    fetch(`${API_BASE}/auth/google/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setGoogleLinked(Boolean(data.data.has_google));
        }
      })
      .catch(() => {});
  }, []);

  const handleUnlinkGoogle = async () => {
    if (!window.confirm("Apakah Anda yakin ingin memutuskan hubungan akun Google dari profil ini?")) return;

    const token = localStorage.getItem("apident:token");
    if (!token) return;

    setUnlinkingGoogle(true);
    try {
      const res = await fetch(`${API_BASE}/auth/google/unlink`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal memutuskan koneksi Google.");
      }

      setGoogleLinked(false);
      if (data.user) {
        localStorage.setItem("apident:user", JSON.stringify(data.user));
      }

      toast({
        title: "Koneksi Diputuskan",
        message: "Akun Google berhasil diputuskan dari profil Anda.",
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Gagal",
        message: err.message || "Terjadi kendala saat memutuskan akun Google.",
        variant: "error",
      });
    } finally {
      setUnlinkingGoogle(false);
    }
  };

  const [phoneSecurity, setPhoneSecurity] = useState({
    currentPhone: session?.phone || "",
    newPhone: "",
    otp: "",
    otpSent: false,
    otpVerified: false,
  });

  const handleSendOTP = () => {
    setPhoneSecurity({ ...phoneSecurity, otpSent: true });
  };

  const handleVerifyOTP = () => {
    setPhoneSecurity({ ...phoneSecurity, otpVerified: true });
  };

  const handleDeleteAccount = async () => {
    if (deletingAccount) return;

    const token = localStorage.getItem("apident:token");
    const rawUser = localStorage.getItem("apident:user");
    const currentUser = rawUser ? JSON.parse(rawUser) : null;
    const userId = currentUser?.id || (session as any)?.id;

    if (!token || !userId) {
      toast({
        title: "Gagal",
        message: "Gagal menghapus akun: sesi tidak ditemukan. Silakan login ulang.",
        variant: "error",
      });
      setShowDeleteDialog(false);
      return;
    }

    try {
      setDeletingAccount(true);
      const res = await fetch(`${API_BASE}/user/account`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Gagal menghapus akun");
      }

      clearSession();
      clearSessionStorage();

      toast({
        title: "Berhasil",
        message: "Akun Anda telah berhasil dihapus secara permanen.",
        variant: "success",
      });
      setShowDeleteDialog(false);
      navigate("/login", { replace: true });
    } catch (e: any) {
      toast({
        title: "Gagal",
        message: e?.message || "Terjadi kesalahan saat menghapus akun",
        variant: "error",
      });
      setShowDeleteDialog(false);
    } finally {
      setDeletingAccount(false);
    }
  };

  const sessionRole = (session?.role as any) || "user";

  return (
    <DashboardLayout role={sessionRole}>
      <div className="w-full px-2 sm:px-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c9a24a] to-[#a8843a] flex items-center justify-center text-white shadow-md">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Keamanan</h1>
            <p className="text-xs text-gray-500">Lindungi akun dan data Anda</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Phone Security */}
          <Card className="rounded-xl border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-2 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#c9a24a]/10 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-[#c9a24a]" />
                </div>
                <CardTitle className="text-base font-bold text-gray-900">Nomor WhatsApp</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Nomor Terdaftar</p>
                  <p className="text-base font-bold text-gray-900">{phoneSecurity.currentPhone}</p>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-green-50 border border-green-100 text-green-600 text-[9px] font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Terverifikasi
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Ganti Nomor Baru</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="+62 8xx..." 
                      className="h-10 rounded-lg text-sm border-gray-200 focus:ring-[#c9a24a] font-medium"
                    />
                    <Button 
                      onClick={handleSendOTP}
                      className="h-10 px-4 rounded-lg bg-[#c9a24a]/10 text-[#a8843a] hover:bg-[#c9a24a] hover:text-white text-xs font-bold transition-all border border-[#c9a24a]/20"
                    >
                      OTP
                    </Button>
                  </div>
                </div>

                {phoneSecurity.otpSent && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700">Kode OTP</label>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="000000" 
                        className="h-10 rounded-lg text-sm border-gray-200 focus:ring-[#c9a24a] font-medium tracking-[0.3em] text-center"
                      />
                      <Button 
                        onClick={handleVerifyOTP}
                        className="h-10 px-4 rounded-lg bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white text-xs font-bold shadow-md"
                      >
                        Verifikasi
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Password Security */}
          <Card className="rounded-xl border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-2 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#c9a24a]/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#c9a24a]" />
                </div>
                <CardTitle className="text-base font-bold text-gray-900">Kata Sandi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Sandi Saat Ini</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    className="h-10 rounded-lg text-sm border-gray-200 focus:ring-[#c9a24a] font-medium"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Sandi Baru</label>
                    <Input 
                      type="password" 
                      placeholder="Min. 8 karakter"
                      className="h-10 rounded-lg text-sm border-gray-200 focus:ring-[#c9a24a] font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Konfirmasi</label>
                    <Input 
                      type="password" 
                      placeholder="Ulangi sandi baru"
                      className="h-10 rounded-lg text-sm border-gray-200 focus:ring-[#c9a24a] font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button className="h-12 px-8 rounded-xl bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-bold text-xs shadow-lg hover:scale-[1.01] active:scale-95 transition-all">
                  Update Sandi
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Google Account Integration */}
          <Card className="rounded-xl border-0 shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 sm:p-6 pb-2 border-b border-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E8DFC8] shadow-2xs flex items-center justify-center">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-gray-900">Koneksi Akun Google</CardTitle>
                    <p className="text-xs text-gray-500">Single Sign-On (SSO) 1-klik</p>
                  </div>
                </div>

                {googleLinked ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Terhubung
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-xs font-semibold">
                    Belum Terhubung
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {googleLinked ? (
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Akun Google Aktif</p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Profil ini sudah terhubung dengan Google. Anda dapat masuk langsung menggunakan tombol Google di halaman login.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={unlinkingGoogle}
                      onClick={handleUnlinkGoogle}
                      className="h-10 px-4 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs font-bold shrink-0 cursor-pointer transition-all"
                    >
                      {unlinkingGoogle ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      ) : (
                        <Unlink className="w-4 h-4 mr-1.5" />
                      )}
                      Putuskan Tautan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Hubungkan akun Google Anda untuk menikmati kemudahan login cepat 1-klik tanpa perlu memasukkan kata sandi setiap kali masuk.
                  </p>

                  <div className="max-w-md">
                    <GoogleAuthButton
                      mode="link"
                      onSuccess={() => {
                        setGoogleLinked(true);
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Account - Danger Zone */}
          <Card className="rounded-xl border-0 shadow-sm bg-white overflow-hidden border-l-4 border-l-red-500">
            <CardHeader className="p-4 sm:p-6 pb-2 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <CardTitle className="text-base font-bold text-gray-900">Zona Berbahaya</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">Hapus Akun</h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Menghapus akun akan menghilangkan semua data pribadi, riwayat konsultasi, dan membership Anda. Tindakan ini tidak dapat dibatalkan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deletingAccount}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 h-10 shadow-lg shadow-red-200 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus Akun Saya
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Styled Confirmation Dialog */}
          <AlertDialog open={showDeleteDialog} onOpenChange={(open) => !open && !deletingAccount && setShowDeleteDialog(false)}>
            <AlertDialogContent className="rounded-2xl border-0 shadow-2xl">
              <AlertDialogHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <AlertDialogTitle className="text-center text-gray-900 font-bold">Hapus Akun</AlertDialogTitle>
                <AlertDialogDescription className="text-center text-gray-500">
                  Apakah Anda yakin ingin menghapus akun ini? Tindakan ini <span className="font-bold text-red-600">tidak dapat dibatalkan</span>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-center gap-3 pt-2">
                <AlertDialogCancel className="rounded-xl border-gray-200 text-gray-600 font-semibold px-6 hover:bg-gray-50">
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 shadow-lg shadow-red-200"
                >
                  {deletingAccount ? "Menghapus..." : "Ya, Hapus Akun"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </DashboardLayout>
  );
}
