import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Eye, EyeOff, ArrowLeft, ChevronRight, Heart, Lock, Phone } from "lucide-react";
import { getDefaultDashboardPath, getSession } from "@/core/auth/services/session";
import { API_BASE } from "@/core/api/apiConfig";
import { touchSessionLastActive } from "@/core/auth/services/sessionTtl";
import { toast } from "@/shared/ui/toast";
import GoogleAuthButton from "@/shared/components/GoogleAuthButton";

type AuthMode = "welcome" | "login" | "register" | "forgot";

export default function MobileLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form
  const [loginForm, setLoginForm] = useState({
    whatsapp: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register form (streamlined: phone, password, passwordConfirmation)
  const [registerForm, setRegisterForm] = useState({
    whatsapp: "",
    password: "",
    passwordConfirmation: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");

  useEffect(() => {
    const session = getSession();
    const storedUser = localStorage.getItem("apident:user");
    if (session || storedUser) {
      navigate("/dashboard", { replace: true });
    }

    // Check URL params
    const params = new URLSearchParams(location.search);
    if (params.get("mode") === "register") {
      setMode("register");
    }
  }, [navigate, location]);

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const phoneDigits = normalizePhoneInput(loginForm.whatsapp);
    if (!phoneDigits) {
      setLoginError("Nomor WhatsApp / telepon wajib diisi.");
      return;
    }

    setIsLoading(true);

    const finalIdentifier = getFullPhone(loginForm.whatsapp);

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
          password: loginForm.password,
          device_name: "web_browser",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nomor WhatsApp atau password salah");
      }

      // Save session
      localStorage.setItem("apident:token", data.token);
      localStorage.setItem("apident:user", JSON.stringify(data.user));
      touchSessionLastActive();

      toast({ title: "Login Berhasil", message: "Selamat datang kembali! Mengalihkan...", variant: "success" });
      
      setTimeout(() => {
        const dest = getDefaultDashboardPath(data.user?.role);
        window.location.assign(dest);
      }, 400);
    } catch (err: any) {
      setLoginError(err.message || "Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    const phoneDigits = normalizePhoneInput(registerForm.whatsapp);
    if (!phoneDigits) {
      setRegisterError("Nomor WhatsApp / telepon wajib diisi.");
      return;
    }

    if (registerForm.password.length < 6) {
      setRegisterError("Password minimal harus 6 karakter.");
      return;
    }

    if (registerForm.password !== registerForm.passwordConfirmation) {
      setRegisterError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          whatsapp: getFullPhone(registerForm.whatsapp),
          password: registerForm.password,
          password_confirmation: registerForm.passwordConfirmation,
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

      localStorage.setItem("apident:token", data.token);
      localStorage.setItem("apident:user", JSON.stringify(data.user));
      touchSessionLastActive();

      toast({ title: "Pendaftaran Berhasil", message: "Selamat datang! Mengalihkan...", variant: "success" });
      setTimeout(() => {
        const dest = getDefaultDashboardPath(data.user?.role);
        window.location.assign(dest);
      }, 400);
    } catch (err: any) {
      setRegisterError(err.message || "Terjadi kesalahan saat mendaftar");
    } finally {
      setIsLoading(false);
    }
  };

  // Welcome Screen
  if (mode === "welcome") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header with Logo */}
        <div className="pt-16 pb-8 px-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#c9a24a] to-[#a8843a] rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Selamat Datang!</h1>
              <p className="text-sm text-gray-500">Aesthetic Pondok Indah</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 flex flex-col">
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            Senang melihatmu kembali! Masuk untuk melanjutkan perawatan gigi terbaik Anda.
          </p>

          {/* Login Options */}
          <div className="space-y-3">
            <Button
              onClick={() => {
                setLoginError("");
                setMode("login");
              }}
              className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold rounded-xl shadow-lg shadow-[#c9a24a]/20 hover:opacity-90 transition-all cursor-pointer"
            >
              <Phone className="w-5 h-5 mr-2" />
              Masuk dengan WhatsApp
              <ChevronRight className="w-5 h-5 ml-auto" />
            </Button>

            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8DFC8]" />
              </div>
              <span className="relative bg-[#FAF8F5] px-3 text-[10px] text-[#8C8272] uppercase font-bold tracking-wider">
                atau
              </span>
            </div>

            <GoogleAuthButton mode="login" className="h-14 !rounded-xl !text-sm !font-semibold" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 pt-4">
          <p className="text-center text-sm text-gray-500">
            Belum punya akun?{" "}
            <button
              onClick={() => {
                setRegisterError("");
                setMode("register");
              }}
              className="text-[#c9a24a] font-semibold hover:underline cursor-pointer"
            >
              Daftar
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Login Form
  if (mode === "login") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-12 pb-6">
          <button
            onClick={() => setMode("welcome")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Masuk</h1>
            <p className="text-sm text-gray-500">Aesthetic Pondok Indah</p>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 px-6">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* WhatsApp Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nomor WhatsApp
              </label>
              <div className="flex items-center w-full h-14 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#c9a24a]/30 focus-within:border-[#c9a24a] transition-all">
                <div className="flex items-center gap-1 px-3 h-full bg-[#FAF5EA] border-r border-[#EADBBD] text-[#8C6B1C] font-bold text-xs sm:text-sm select-none shrink-0">
                  <span className="text-base leading-none">🇮🇩</span>
                  <span>+62</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="857xxxxxxxx"
                  value={loginForm.whatsapp}
                  onChange={(e) => {
                    const clean = normalizePhoneInput(e.target.value);
                    setLoginForm({ ...loginForm, whatsapp: clean });
                  }}
                  className="w-full h-full px-3.5 text-base font-semibold text-gray-900 bg-transparent outline-none placeholder:text-gray-400 placeholder:font-normal"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full h-14 pl-12 pr-12 bg-gray-50 border-0 rounded-xl text-base focus:ring-2 focus:ring-[#c9a24a]/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold text-lg rounded-xl shadow-lg shadow-[#c9a24a]/20 hover:opacity-90 transition-all cursor-pointer"
            >
              {isLoading ? "Memuat..." : "Masuk"}
            </Button>

            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8DFC8]" />
              </div>
              <span className="relative bg-white px-3 text-[10px] text-[#8C8272] uppercase font-bold tracking-wider">
                atau masuk dengan
              </span>
            </div>

            <GoogleAuthButton mode="login" className="h-14 !rounded-xl !text-sm !font-semibold" />
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 pt-4">
          <p className="text-center text-sm text-gray-500">
            Belum punya akun?{" "}
            <button
              onClick={() => {
                setRegisterError("");
                setMode("register");
              }}
              className="text-[#c9a24a] font-semibold hover:underline cursor-pointer"
            >
              Daftar
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Register Form
  if (mode === "register") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-12 pb-6">
          <button
            onClick={() => setMode("welcome")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Daftar Akun</h1>
            <p className="text-sm text-gray-500">Buat akun baru Anda</p>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 overflow-y-auto">
          <form onSubmit={handleRegister} className="space-y-4 pb-8">
            {/* WhatsApp */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nomor Telepon / WhatsApp</label>
              <div className="flex items-center w-full h-14 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#c9a24a]/30 focus-within:border-[#c9a24a] transition-all">
                <div className="flex items-center gap-1 px-3 h-full bg-[#FAF5EA] border-r border-[#EADBBD] text-[#8C6B1C] font-bold text-xs sm:text-sm select-none shrink-0">
                  <span className="text-base leading-none">🇮🇩</span>
                  <span>+62</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="857xxxxxxxx"
                  value={registerForm.whatsapp}
                  onChange={(e) => setRegisterForm({ ...registerForm, whatsapp: normalizePhoneInput(e.target.value) })}
                  className="w-full h-full px-3.5 text-base font-semibold text-gray-900 bg-transparent outline-none placeholder:text-gray-400 placeholder:font-normal"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showRegisterPassword ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full h-14 pl-12 pr-12 bg-gray-50 border-0 rounded-xl text-base focus:ring-2 focus:ring-[#c9a24a]/30"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                >
                  {showRegisterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Confirmation */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showRegisterConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi kata sandi"
                  value={registerForm.passwordConfirmation}
                  onChange={(e) => setRegisterForm({ ...registerForm, passwordConfirmation: e.target.value })}
                  className="w-full h-14 pl-12 pr-12 bg-gray-50 border-0 rounded-xl text-base focus:ring-2 focus:ring-[#c9a24a]/30"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                >
                  {showRegisterConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {registerError && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <p className="text-sm text-red-600">{registerError}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold text-lg rounded-xl shadow-lg shadow-[#c9a24a]/20 hover:opacity-90 transition-all cursor-pointer"
            >
              {isLoading ? "Memproses..." : "Daftar Sekarang"}
            </Button>

            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8DFC8]" />
              </div>
              <span className="relative bg-white px-3 text-[10px] text-[#8C8272] uppercase font-bold tracking-wider">
                atau daftar dengan
              </span>
            </div>

            <GoogleAuthButton mode="register" className="h-14 !rounded-xl !text-sm !font-semibold" />
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 pt-4">
          <p className="text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <button
              onClick={() => {
                setLoginError("");
                setMode("login");
              }}
              className="text-[#c9a24a] font-semibold hover:underline cursor-pointer"
            >
              Masuk
            </button>
          </p>
        </div>
      </div>
    );
  }

  return null;
}
