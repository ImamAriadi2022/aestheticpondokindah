import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowLeft, ChevronRight, Heart, Lock, Mail, Phone, Chrome } from "lucide-react";
import { getDefaultDashboardPath, getSession } from "@/lib/demoAuth";
import { API_BASE } from "@/lib/apiConfig";
import { touchSessionLastActive } from "@/lib/sessionTtl";
import { toast } from "@/components/ui/toast";

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

  // Register form
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    password: "",
  });
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          whatsapp: loginForm.whatsapp,
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

      // Map role
      let targetRole = data.user.role;
      if (targetRole === "clinic_admin") targetRole = "clinic";
      if (targetRole === "patient") targetRole = "user";

      const sessionData = {
        ...data.user,
        role: targetRole,
        id: data.user.id.toString(),
        phone: data.user.whatsapp || "",
      };
      localStorage.setItem("apident:demo_session_v1", JSON.stringify(sessionData));
      touchSessionLastActive();

      toast({ title: "Login Berhasil", message: "Selamat datang kembali!", variant: "success" });
      
      navigate(getDefaultDashboardPath(targetRole), { replace: true });
    } catch (err: any) {
      setLoginError(err.message || "Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email || null,
          whatsapp: registerForm.whatsapp,
          password: registerForm.password,
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

      const sessionData = {
        ...data.user,
        role: "user",
        id: data.user.id.toString(),
        phone: data.user.whatsapp || "",
      };
      localStorage.setItem("apident:demo_session_v1", JSON.stringify(sessionData));
      touchSessionLastActive();

      toast({ title: "Pendaftaran Berhasil", message: "Selamat datang!", variant: "success" });
      navigate("/dashboard/user", { replace: true });
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
              onClick={() => setMode("login")}
              className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold rounded-xl shadow-lg shadow-[#c9a24a]/20 hover:opacity-90 transition-all"
            >
              <Phone className="w-5 h-5 mr-2" />
              Masuk dengan WhatsApp
              <ChevronRight className="w-5 h-5 ml-auto" />
            </Button>

            <Button
              variant="outline"
              onClick={() => {}}
              className="w-full h-14 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
            >
              <Chrome className="w-5 h-5 mr-2 text-red-500" />
              Masuk dengan Google
            </Button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">atau masuk dengan</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Email Option */}
          <Button
            variant="outline"
            onClick={() => setMode("login")}
            className="w-full h-14 border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
          >
            <Mail className="w-5 h-5 mr-2 text-gray-500" />
            Masuk dengan Email
          </Button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 pt-4">
          <p className="text-center text-sm text-gray-500">
            Belum punya akun?{" "}
            <button
              onClick={() => setMode("register")}
              className="text-[#c9a24a] font-semibold hover:underline"
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
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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
                Email atau No. WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={loginForm.whatsapp}
                  onChange={(e) => setLoginForm({ ...loginForm, whatsapp: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 border-0 rounded-xl text-base focus:ring-2 focus:ring-[#c9a24a]/30"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-sm text-[#c9a24a] font-medium hover:underline"
              >
                Lupa kata sandi?
              </button>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold text-lg rounded-xl shadow-lg shadow-[#c9a24a]/20 hover:opacity-90 transition-all"
            >
              {isLoading ? "Memuat..." : "Masuk"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 pt-4">
          <p className="text-center text-sm text-gray-500">
            Belum punya akun?{" "}
            <button
              onClick={() => setMode("register")}
              className="text-[#c9a24a] font-semibold hover:underline"
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
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
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
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
              <Input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                className="w-full h-14 px-4 bg-gray-50 border-0 rounded-xl text-base focus:ring-2 focus:ring-[#c9a24a]/30"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email (Opsional)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="email@contoh.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 border-0 rounded-xl text-base focus:ring-2 focus:ring-[#c9a24a]/30"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">No. WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  value={registerForm.whatsapp}
                  onChange={(e) => setRegisterForm({ ...registerForm, whatsapp: e.target.value })}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 border-0 rounded-xl text-base focus:ring-2 focus:ring-[#c9a24a]/30"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Kata Sandi</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Buat kata sandi"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full h-14 pl-12 pr-12 bg-gray-50 border-0 rounded-xl text-base focus:ring-2 focus:ring-[#c9a24a]/30"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400">Minimal 6 karakter</p>
            </div>

            {/* Error Message */}
            {registerError && (
              <div className="p-3 bg-red-50 rounded-xl">
                <p className="text-sm text-red-600">{registerError}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold text-lg rounded-xl shadow-lg shadow-[#c9a24a]/20 hover:opacity-90 transition-all"
            >
              {isLoading ? "Mendaftar..." : "Daftar"}
            </Button>

            {/* Terms */}
            <p className="text-xs text-center text-gray-400">
              Dengan mendaftar, Anda menyetujui{" "}
              <Link to="/terms-of-service" className="text-[#c9a24a]">Syarat</Link>
              {" "}&{" "}
              <Link to="/privacy-policy" className="text-[#c9a24a]">Ketentuan</Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 pt-4 bg-white border-t border-gray-100">
          <p className="text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <button
              onClick={() => setMode("login")}
              className="text-[#c9a24a] font-semibold hover:underline"
            >
              Masuk
            </button>
          </p>
        </div>
      </div>
    );
  }

  // Forgot Password
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center gap-3 px-6 pt-12 pb-6">
        <button
          onClick={() => setMode("login")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Lupa Password</h1>
          <p className="text-sm text-gray-500">Reset kata sandi Anda</p>
        </div>
      </div>

      <div className="flex-1 px-6">
        <p className="text-gray-600 text-sm mb-6">
          Masukkan email atau nomor WhatsApp Anda. Kami akan mengirimkan instruksi reset password.
        </p>

        <form className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email atau No. WhatsApp</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Masukkan email atau WhatsApp"
                className="w-full h-14 pl-12 pr-4 bg-gray-50 border-0 rounded-xl text-base focus:ring-2 focus:ring-[#c9a24a]/30"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold text-lg rounded-xl shadow-lg shadow-[#c9a24a]/20 hover:opacity-90 transition-all"
          >
            Kirim Instruksi
          </Button>
        </form>
      </div>
    </div>
  );
}
