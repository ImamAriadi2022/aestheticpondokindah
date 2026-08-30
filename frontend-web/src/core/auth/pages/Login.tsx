import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/ui/input-group";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { getDefaultDashboardPath, getSession } from "@/core/auth/services/session";
import { touchSessionLastActive } from "@/core/auth/services/sessionTtl";
import { API_BASE } from "@/core/api/apiConfig";
import GoogleAuthButton from "@/shared/components/GoogleAuthButton";

type LoginRole = "user" | "clinic" | "doctor";
type UserMode = "login" | "register";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const session = getSession();
    if (session && session.role && (session.role as string) !== "guest") {
      const dest = getDefaultDashboardPath(session.role) || "/dashboard/user";
      navigate(dest, { replace: true });
    }
  }, [navigate]);

  const isClinicLogin = location.pathname === "/klinik";

  const [form, setForm] = useState<Record<LoginRole, { identifier: string; password: string }>>({
    user: { identifier: "", password: "" },
    clinic: { identifier: "", password: "" },
    doctor: { identifier: "", password: "" },
  });

  const [showPassword, setShowPassword] = useState<Record<LoginRole, boolean>>({
    user: false,
    clinic: false,
    doctor: false,
  });

  const [userMode, setUserMode] = useState<UserMode>("login");
  const [registerForm, setRegisterForm] = useState({
    phone: "",
    password: "",
    passwordConfirmation: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  // OTP State for WhatsApp Verification via Zesta
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizePhoneInput = (val: string) => {
    let cleaned = val.replace(/[^\d]/g, "");
    if (cleaned.startsWith("62")) {
      cleaned = cleaned.slice(2);
    } else if (cleaned.startsWith("0")) {
      cleaned = cleaned.replace(/^0+/, "");
    }
    return cleaned;
  };

  const getFullPhone = (val: string) => {
    const digits = normalizePhoneInput(val);
    return digits ? `+62${digits}` : "";
  };

  const onSubmit = (role: LoginRole) => async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const { identifier, password } = form[role];
    const finalIdentifier = getFullPhone(identifier);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          whatsapp: finalIdentifier,
          identifier: finalIdentifier,
          password: password,
          device_name: "web_browser",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nomor WhatsApp atau password salah.");
      }

      // Berhasil login
      localStorage.setItem("apident:token", data.token);
      localStorage.setItem("apident:user", JSON.stringify(data.user));
      touchSessionLastActive();

      setSuccess("Login berhasil! Mengalihkan...");
      
      setTimeout(() => {
        const dest = getDefaultDashboardPath(data.user?.role);
        window.location.assign(dest);
      }, 400);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccess(null);

    const phoneDigits = normalizePhoneInput(registerForm.phone);
    if (!phoneDigits || phoneDigits.length < 8) {
      setError("Nomor WhatsApp tidak valid. Masukkan nomor WhatsApp yang aktif.");
      return;
    }

    if (registerForm.password.length < 6) {
      setError("Password minimal harus 6 karakter.");
      return;
    }

    if (registerForm.password !== registerForm.passwordConfirmation) {
      setError("Konfirmasi password tidak cocok dengan password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/auth/otp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          whatsapp: getFullPhone(registerForm.phone),
          type: "register",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors?.whatsapp) {
          throw new Error(data.errors.whatsapp[0]);
        }
        throw new Error(data.message || "Gagal mengirim kode OTP");
      }

      setOtpStep(true);
      setResendTimer(60);
      setSuccess("Kode OTP 6-digit telah dikirimkan ke WhatsApp Anda.");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mengirim OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanOtp = otpCode.replace(/[^\d]/g, "").trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError("Masukkan 6 digit kode OTP yang diterima di WhatsApp Anda.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          whatsapp: getFullPhone(registerForm.phone),
          password: registerForm.password,
          password_confirmation: registerForm.passwordConfirmation,
          otp: cleanOtp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0] as string[];
          throw new Error(firstError[0] || "Gagal mendaftar");
        }
        throw new Error(data.message || "Gagal mendaftar");
      }

      // Berhasil daftar
      localStorage.setItem("apident:token", data.token);
      localStorage.setItem("apident:user", JSON.stringify(data.user));
      touchSessionLastActive();

      setSuccess("Pendaftaran berhasil! Mengalihkan ke dashboard...");
      setTimeout(() => {
        const dest = getDefaultDashboardPath(data.user?.role);
        window.location.assign(dest);
      }, 400);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat verifikasi pendaftaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLoginForm = (role: LoginRole) => {
    return (
      <form className="mt-7 space-y-4" onSubmit={onSubmit(role)}>
        <div className="space-y-2">
          <Label htmlFor={`${role}-identifier`}>Nomor WhatsApp</Label>
          <div className="relative flex items-center w-full rounded-xl border border-[#E8DFC8] bg-white focus-within:border-[#C9A24A] focus-within:ring-2 focus-within:ring-[#C9A24A]/20 transition-all overflow-hidden h-12 shadow-xs">
            <div className="flex items-center gap-1.5 px-3.5 h-full bg-[#FAF5EA] border-r border-[#EADBBD] text-[#8C6B1C] font-bold text-xs sm:text-sm select-none shrink-0">
              <span className="text-base leading-none">🇮🇩</span>
              <span>+62</span>
            </div>
            <input
              id={`${role}-identifier`}
              type="tel"
              inputMode="numeric"
              placeholder="857xxxxxxxx"
              value={form[role].identifier}
              onChange={(e) => {
                const clean = normalizePhoneInput(e.target.value);
                setForm((prev) => ({ ...prev, [role]: { ...prev[role], identifier: clean } }));
              }}
              className="w-full h-full px-3.5 text-sm font-semibold text-[#2C2416] bg-transparent outline-none placeholder:text-[#A89F91] placeholder:font-normal font-body"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${role}-password`}>Password</Label>
          <InputGroup>
            <InputGroupInput
              id={`${role}-password`}
              type={showPassword[role] ? "text" : "password"}
              placeholder="Password"
              value={form[role].password}
              onChange={(e) => setForm((prev) => ({ ...prev, [role]: { ...prev[role], password: e.target.value } }))}
              required
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-sm"
                aria-label={showPassword[role] ? "Sembunyikan password" : "Lihat password"}
                onClick={() => setShowPassword((prev) => ({ ...prev, [role]: !prev[role] }))}
              >
                {showPassword[role] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <Button type="submit" className="w-full h-12 bg-gradient-gold hover:opacity-90 text-white font-semibold rounded-xl font-body">
          Login
        </Button>
        {error && (
          <div className="text-xs text-red-600 font-body" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="text-xs text-[#8a6b2b] font-body" role="status">
            {success}
          </div>
        )}
        {(role === "user" || role === "doctor") && (
          <div className="space-y-4 pt-2">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8DFC8]" />
              </div>
              <span className="relative bg-white px-3 text-[10px] text-[#8C8272] uppercase font-bold tracking-wider">
                atau masuk dengan
              </span>
            </div>

            <GoogleAuthButton mode="login" />

            {role === "user" && (
              <div className="text-xs text-center text-brand-warm-gray font-body pt-1">
                Belum punya akun?{" "}
                <button
                  type="button"
                  className="text-brand-gold font-bold hover:opacity-80 underline underline-offset-4 cursor-pointer"
                  onClick={() => {
                    setError(null);
                    setSuccess(null);
                    setUserMode("register");
                  }}
                >
                  Daftar Sekarang
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    );
  };

  const renderRegisterForm = () => {
    if (otpStep) {
      return (
        <form className="mt-7 space-y-4" onSubmit={onRegister}>
          <div className="flex items-center justify-between mb-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl px-2 text-[#7A6E60] hover:text-[#2C2416] text-xs cursor-pointer"
              onClick={() => {
                setError(null);
                setSuccess(null);
                setOtpStep(false);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Ubah Nomor
            </Button>
            <span className="text-xs font-bold text-[#8C6B1C] bg-[#FAF5EA] px-2.5 py-1 rounded-full border border-[#EADBBD]">
              Verifikasi WhatsApp
            </span>
          </div>

          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DFC8] space-y-1">
            <p className="text-xs font-bold text-[#4A3F35]">Masukkan Kode OTP</p>
            <p className="text-[11px] text-[#8A7B6B] leading-relaxed">
              Kode OTP 6-digit telah dikirimkan otomatis via WhatsApp ke nomor <strong className="text-[#2C2416]">{getFullPhone(registerForm.phone)}</strong>.
            </p>
          </div>

          {/* Input OTP 6 Digit */}
          <div className="space-y-2">
            <Label htmlFor="register-otp">Kode OTP (6 Digit)</Label>
            <input
              id="register-otp"
              type="tel"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              placeholder="123456"
              value={otpCode}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, "").slice(0, 6);
                setOtpCode(val);
              }}
              className="w-full h-14 px-4 text-center tracking-[0.4em] font-mono text-2xl font-bold text-[#2C2416] bg-white border border-[#E8DFC8] rounded-xl focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 transition-all outline-none shadow-xs placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:text-gray-400 placeholder:font-normal"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#8A7B6B]">Tidak menerima kode?</span>
            {resendTimer > 0 ? (
              <span className="text-xs text-[#A89F91] font-medium">
                Kirim ulang ({resendTimer}s)
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSubmitting}
                className="text-xs font-bold text-[#8C6B1C] hover:text-[#C9A24A] underline cursor-pointer"
              >
                Kirim Ulang OTP
              </button>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || otpCode.length < 6}
            className="w-full h-12 bg-gradient-gold hover:opacity-90 text-white font-semibold rounded-xl font-body mt-2 cursor-pointer shadow-md shadow-[#C9A24A]/20"
          >
            {isSubmitting ? "Memverifikasi..." : "Verifikasi & Selesaikan Pendaftaran"}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-body" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-body" role="status">
              {success}
            </div>
          )}
        </form>
      );
    }

    return (
      <form className="mt-7 space-y-4" onSubmit={handleSendOtp}>
        <div className="flex items-center gap-2 mb-2">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl px-2 text-[#7A6E60] hover:text-[#2C2416]"
            onClick={() => {
              setError(null);
              setSuccess(null);
              setUserMode("login");
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <div className="text-sm font-bold text-brand-charcoal">Daftar Akun Baru</div>
        </div>

        {/* Nomor WhatsApp / Telepon */}
        <div className="space-y-2">
          <Label htmlFor="register-phone">Nomor Telepon / WhatsApp</Label>
          <div className="relative flex items-center w-full rounded-xl border border-[#E8DFC8] bg-white focus-within:border-[#C9A24A] focus-within:ring-2 focus-within:ring-[#C9A24A]/20 transition-all overflow-hidden h-12 shadow-xs">
            <div className="flex items-center gap-1.5 px-3.5 h-full bg-[#FAF5EA] border-r border-[#EADBBD] text-[#8C6B1C] font-bold text-xs sm:text-sm select-none shrink-0">
              <span className="text-base leading-none">🇮🇩</span>
              <span>+62</span>
            </div>
            <input
              id="register-phone"
              type="tel"
              inputMode="numeric"
              placeholder="857xxxxxxxx"
              value={registerForm.phone}
              onChange={(e) => {
                const clean = normalizePhoneInput(e.target.value);
                setRegisterForm((p) => ({ ...p, phone: clean }));
              }}
              className="w-full h-full px-3.5 text-sm font-semibold text-[#2C2416] bg-transparent outline-none placeholder:text-[#A89F91] placeholder:font-normal font-body"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <InputGroup>
            <InputGroupInput
              id="register-password"
              type={showRegisterPassword ? "text" : "password"}
              placeholder="Minimal 6 karakter"
              value={registerForm.password}
              onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
              required
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-sm"
                aria-label={showRegisterPassword ? "Sembunyikan password" : "Lihat password"}
                onClick={() => setShowRegisterPassword((prev) => !prev)}
              >
                {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* Konfirmasi Password */}
        <div className="space-y-2">
          <Label htmlFor="register-password-confirmation">Konfirmasi Password</Label>
          <InputGroup>
            <InputGroupInput
              id="register-password-confirmation"
              type={showRegisterConfirmPassword ? "text" : "password"}
              placeholder="Ulangi kata sandi"
              value={registerForm.passwordConfirmation}
              onChange={(e) => setRegisterForm((p) => ({ ...p, passwordConfirmation: e.target.value }))}
              required
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-sm"
                aria-label={showRegisterConfirmPassword ? "Sembunyikan konfirmasi password" : "Lihat konfirmasi password"}
                onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
              >
                {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-12 bg-gradient-gold hover:opacity-90 text-white font-semibold rounded-xl font-body mt-2 cursor-pointer shadow-md shadow-[#C9A24A]/20"
        >
          {isSubmitting ? "Mengirim OTP..." : "Kirim OTP WhatsApp & Lanjutkan"}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-body" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-body" role="status">
            {success}
          </div>
        )}

        <div className="space-y-4 pt-2">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8DFC8]" />
            </div>
            <span className="relative bg-white px-3 text-[10px] text-[#8C8272] uppercase font-bold tracking-wider">
              atau daftar dengan
            </span>
          </div>

          <GoogleAuthButton mode="register" />
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24 lg:pb-0">
        <section className="pt-6 pb-10 sm:pt-8 sm:pb-14 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 rounded-[2.5rem] border border-border bg-background shadow-2xl shadow-black/5">
              <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-brand-gold/30 via-brand-cream to-brand-gold-light/40 p-10 rounded-l-[2.5rem]">
                <div className="w-full max-w-md flex flex-col items-center text-center">
                  <img
                    src="/logo/logo-vertikal.webp"
                    alt="Aesthetic Pondok Indah"
                    className="h-24 w-auto object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/logo/Logo-vertikal.png";
                    }}
                  />
                  <div className="mt-8 text-5xl font-bold text-brand-charcoal leading-tight">Selamat datang</div>
                  <div className="mt-4 text-lg text-brand-warm-gray font-body">
                    Masuk untuk melanjutkan.
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10">
                <div className="text-2xl sm:text-3xl font-bold text-brand-charcoal">Sign in</div>

                {isClinicLogin ? (
                  <div className="mt-6">{renderLoginForm("clinic")}</div>
                ) : (
                  <Tabs defaultValue="user" className="mt-6">
                    <TabsList variant="line" className="w-full justify-start border-b border-border rounded-none px-0">
                      <TabsTrigger value="user" className="rounded-none px-0 mr-8">User</TabsTrigger>
                      <TabsTrigger value="doctor" className="rounded-none px-0">Doctor</TabsTrigger>
                    </TabsList>

                    <TabsContent value="user">
                      {userMode === "login"
                        ? renderLoginForm("user")
                        : renderRegisterForm()}
                    </TabsContent>
                    <TabsContent value="doctor">{renderLoginForm("doctor")}</TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
