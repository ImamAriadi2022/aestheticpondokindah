import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/shared/ui/input-group";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { getDefaultDashboardPath } from "@/core/auth/services/session";
import { GENDER_OPTIONS, BLOOD_TYPE_OPTIONS, JOB_OPTIONS } from "@/core/constants/regionData";
import { getDistricts, getProvinces, getRegencies } from "@/core/api/wilayahApi";
import { touchSessionLastActive } from "@/core/auth/services/sessionTtl";
import { API_BASE } from "@/core/api/apiConfig";

type LoginRole = "user" | "clinic" | "doctor";
type UserMode = "login" | "register";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

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
    name: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    bloodType: "",
    job: "",
    provinceId: "",
    province: "",
    cityId: "",
    city: "",
    districtId: "",
    district: "",
  });

  const provinceOptions = getProvinces();
  const regencyOptions = registerForm.provinceId ? getRegencies(registerForm.provinceId) : [];
  const districtOptions = registerForm.cityId ? getDistricts(registerForm.cityId) : [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const onSubmit = (role: LoginRole) => async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const { identifier, password } = form[role];

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          whatsapp: identifier,
          password: password,
          device_name: "web_browser",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "WhatsApp atau password salah.");
      }

      // Berhasil login
      localStorage.setItem("apident:token", data.token);
      localStorage.setItem("apident:user", JSON.stringify(data.user));
      touchSessionLastActive();

      setSuccess("Login berhasil! Mengalihkan...");

      let targetRole = data.user.role;
      if (targetRole === "clinic_admin") targetRole = "clinic";
      if (targetRole === "patient") targetRole = "user";

      const targetPath = getDefaultDashboardPath(targetRole);
      
      setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 1000);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

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
          whatsapp: registerForm.phone,
          password: registerForm.password,
          province: registerForm.province,
          city: registerForm.city,
          district: registerForm.district,
          gender: registerForm.gender,
          blood_type: registerForm.bloodType,
          job: registerForm.job,
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
        navigate("/dashboard/user", { replace: true });
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLoginForm = (role: LoginRole) => {
    const isUser = role === "user";
    const isClinic = role === "clinic";
    const isDoctor = role === "doctor";
    
    return (
      <form className="mt-7 space-y-4" onSubmit={onSubmit(role)}>
        <div className="space-y-2">
          <Label htmlFor={`${role}-identifier`}>{(isUser || isClinic || isDoctor) ? "Nomor WhatsApp" : "Alamat Email"}</Label>
          <Input
            id={`${role}-identifier`}
            type={(isUser || isClinic || isDoctor) ? "tel" : "email"}
            placeholder={(isUser || isClinic || isDoctor) ? "Contoh: +62812xxxxxx" : "Alamat Email"}
            value={form[role].identifier}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, [role]: { ...prev[role], identifier: e.target.value } }))
            }
            required
          />
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
        {role === "user" && (
          <div className="text-xs text-brand-warm-gray font-body">
            Belum punya akun?{" "}
            <button
              type="button"
              className="text-brand-gold hover:opacity-80 underline underline-offset-4"
              onClick={() => setUserMode("register")}
            >
              Daftar
            </button>
          </div>
        )}
      </form>
    );
  };

  const renderRegisterForm = () => {
    return (
      <form className="mt-7 space-y-4" onSubmit={onRegister}>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl px-2"
            onClick={() => setUserMode("login")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <div className="text-sm font-medium text-brand-charcoal">Daftar akun pengguna</div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-name">Nama Pengguna</Label>
          <Input
            id="register-name"
            value={registerForm.name}
            onChange={(e) => setRegisterForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-email">Email (opsional)</Label>
          <Input
            id="register-email"
            type="email"
            placeholder="Email (opsional)"
            value={registerForm.email}
            onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-phone">Nomor WhatsApp</Label>
          <Input
            id="register-phone"
            placeholder="Contoh: +62812xxxxxx"
            value={registerForm.phone}
            onChange={(e) => setRegisterForm((p) => ({ ...p, phone: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Jenis Kelamin</Label>
            <select
              className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-body"
              value={registerForm.gender}
              onChange={(e) => setRegisterForm((p) => ({ ...p, gender: e.target.value }))}
            >
              <option value="" disabled>Pilih jenis kelamin</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Golongan Darah</Label>
            <select
              className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-body"
              value={registerForm.bloodType}
              onChange={(e) => setRegisterForm((p) => ({ ...p, bloodType: e.target.value }))}
            >
              <option value="" disabled>Pilih golongan darah</option>
              {BLOOD_TYPE_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Pekerjaan</Label>
          <select
            className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-body"
            value={registerForm.job}
            onChange={(e) => setRegisterForm((p) => ({ ...p, job: e.target.value }))}
          >
            <option value="" disabled>Pilih pekerjaan</option>
            {JOB_OPTIONS.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Provinsi</Label>
            <select
              className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-body"
              value={registerForm.provinceId}
              onChange={(e) => {
                const value = e.target.value;
                const selected = provinceOptions.find((x) => x.id === value);
                setRegisterForm((p) => ({
                  ...p,
                  provinceId: value,
                  province: selected?.name ?? "",
                  cityId: "",
                  city: "",
                  districtId: "",
                  district: "",
                }));
              }}
            >
              <option value="" disabled>Pilih Provinsi</option>
              {provinceOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Kabupaten / Kota</Label>
            <select
              className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-body"
              value={registerForm.cityId}
              onChange={(e) => {
                const value = e.target.value;
                const selected = regencyOptions.find((x) => x.id === value);
                setRegisterForm((p) => ({
                  ...p,
                  cityId: value,
                  city: selected?.name ?? "",
                  districtId: "",
                  district: "",
                }));
              }}
              disabled={!registerForm.provinceId}
            >
              <option value="" disabled>
                {!registerForm.provinceId
                  ? "Pilih Kabupaten/Kota"
                  : "Pilih Kabupaten/Kota"}
              </option>
              {regencyOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Kecamatan</Label>
          <select
            className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-body"
            value={registerForm.districtId}
            onChange={(e) => {
              const value = e.target.value;
              const selected = districtOptions.find((x) => x.id === value);
              setRegisterForm((p) => ({
                ...p,
                districtId: value,
                district: selected?.name ?? "",
              }));
            }}
            disabled={!registerForm.cityId}
          >
            <option value="" disabled>
              {!registerForm.cityId
                ? "Pilih Kecamatan"
                : "Pilih Kecamatan"}
            </option>
            {districtOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="register-password">Password</Label>
          <InputGroup>
            <InputGroupInput
              id="register-password"
              type={showPassword.user ? "text" : "password"}
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
              required
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-sm"
                aria-label={showPassword.user ? "Sembunyikan password" : "Lihat password"}
                onClick={() => setShowPassword((prev) => ({ ...prev, user: !prev.user }))}
              >
                {showPassword.user ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-12 bg-gradient-gold hover:opacity-90 text-white font-semibold rounded-xl font-body"
        >
          {isSubmitting ? "Mendaftar..." : "Daftar"}
        </Button>
        {error && (
          <div className="text-xs text-red-600 font-body" role="alert">
            {error}
          </div>
        )}
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
                    src="/logo/logo.png"
                    alt="Aesthetic Pondok Indah"
                    className="h-20 w-auto"
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
