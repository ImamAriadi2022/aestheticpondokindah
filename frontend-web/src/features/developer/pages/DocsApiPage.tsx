import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { API_BASE } from "@/core/api/apiConfig";
import { ShieldCheck, Lock, LogOut, ArrowLeft, Terminal, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

declare global {
  interface Window {
    SwaggerUIBundle?: any;
    SwaggerUIStandalonePreset?: any;
    ui?: any;
  }
}

export default function DocsApiPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [devUser, setDevUser] = useState<any>(null);
  const [devToken, setDevToken] = useState<string>("");

  // Login form state
  const [email, setEmail] = useState("imamariadi775@gmail.com");
  const [password, setPassword] = useState("Persib1933");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const swaggerMountedRef = useRef(false);

  // Check existing session on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("apident:token");
      const storedUser = localStorage.getItem("apident:user");

      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.role === "developer" || parsed?.email?.toLowerCase() === "imamariadi775@gmail.com") {
          setDevUser(parsed);
          setDevToken(storedToken);
          setIsAuthenticated(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Mount Swagger UI when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    // Load Swagger UI CSS if not already present
    if (!document.getElementById("swagger-ui-css")) {
      const link = document.createElement("link");
      link.id = "swagger-ui-css";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css";
      document.head.appendChild(link);
    }

    const initSwagger = () => {
      if (!window.SwaggerUIBundle) return;

      const spec = getOpenApiSpec(API_BASE);

      window.ui = window.SwaggerUIBundle({
        spec: spec,
        dom_id: "#swagger-ui-container",
        deepLinking: true,
        presets: [
          window.SwaggerUIBundle.presets.apis,
          window.SwaggerUIStandalonePreset,
        ],
        layout: "StandaloneLayout",
        docExpansion: "list",
        defaultModelsExpandDepth: -1,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
        requestSnippetsEnabled: true,
        requestSnippets: {
          generators: {
            curl_bash: { title: "cURL", syntax: "bash" },
            js_fetch: { title: "JavaScript (Fetch)", syntax: "javascript" },
            js_axios: { title: "JavaScript (Axios)", syntax: "javascript" },
            python_requests: { title: "Python (Requests)", syntax: "python" },
            php_curl: { title: "PHP (cURL)", syntax: "php" },
          },
          defaultExpanded: true,
        },
      });

      if (devToken) {
        setTimeout(() => {
          if (window.ui && window.ui.preauthorizeApiKey) {
            window.ui.preauthorizeApiKey("BearerAuth", devToken);
          }
        }, 600);
      }
    };

    // Load script dependencies
    if (!window.SwaggerUIBundle) {
      const scriptBundle = document.createElement("script");
      scriptBundle.src = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js";
      scriptBundle.onload = () => {
        const scriptPreset = document.createElement("script");
        scriptPreset.src = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js";
        scriptPreset.onload = () => {
          initSwagger();
        };
        document.body.appendChild(scriptPreset);
      };
      document.body.appendChild(scriptBundle);
    } else {
      initSwagger();
    }
  }, [isAuthenticated, devToken]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          login: email.trim(),
          password: password.trim(),
          device_name: "react_developer_docs_console",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Email atau password salah.");
      }

      const userRole = data.user?.role;
      const userEmail = data.user?.email?.toLowerCase();

      if (userRole !== "developer" && userEmail !== "imamariadi775@gmail.com") {
        throw new Error("Akses ditolak: Hanya akun Developer yang berhak membuka API Documentation & Test Console.");
      }

      localStorage.setItem("apident:token", data.token);
      localStorage.setItem("apident:user", JSON.stringify(data.user));

      setDevUser(data.user);
      setDevToken(data.token);
      setIsAuthenticated(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat otentikasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("apident:token");
    localStorage.removeItem("apident:user");
    setIsAuthenticated(false);
    setDevUser(null);
    setDevToken("");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D3748] font-sans antialiased">
      {!isAuthenticated ? (
        /* ================= DEVELOPER LOGIN GATE ================= */
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1612] via-[#2A241E] to-[#120F0D] p-6 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A24A]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C9A24A]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-md bg-[#1A1612]/90 backdrop-blur-xl border border-[#C9A24A]/30 rounded-3xl p-8 shadow-2xl relative z-10">
            <div className="text-center mb-6">
              <img src="/logo/logo-vertikal.webp" alt="Aesthetic Pondok Indah" className="h-16 mx-auto mb-3 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo/Logo-vertikal.png'; }} />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C9A24A]/15 border border-[#C9A24A]/40 text-[#E8D4A2] text-xs font-bold uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-[#C9A24A]" />
                <span>Developer Access Only</span>
              </div>
              <h1 className="text-2xl font-bold text-white mt-3 font-serif">API Documentation</h1>
              <p className="text-xs text-stone-400 mt-1">Dokumentasi REST API & Testing Console dilindungi. Silakan masuk dengan akun Developer.</p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#E8D4A2] mb-1.5">Email Developer</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-stone-700 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 transition"
                  placeholder="imamariadi775@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E8D4A2] mb-1.5">Password Developer</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-stone-700 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 transition pr-11"
                    placeholder="Masukkan password..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#A8843A] text-white font-bold text-sm shadow-lg shadow-[#C9A24A]/25 hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50"
              >
                {isSubmitting ? "Memverifikasi..." : "Masuk & Buka API Documentation ⚡"}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-stone-800 text-center">
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-[#C9A24A] transition">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Beranda Utama</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ================= AUTHENTICATED SWAGGER CONSOLE ================= */
        <div>
          {/* Custom Header Bar */}
          <header className="sticky top-0 z-50 bg-[#1A1612] text-white border-b-2 border-[#C9A24A] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <img src="/logo/logo-vertikal.webp" alt="Logo" className="h-10 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo/Logo-vertikal.png'; }} />
              <div>
                <h1 className="text-base font-bold leading-tight">Aesthetic Pondok Indah Dental Clinic</h1>
                <p className="text-[11px] font-bold text-[#D4AF37] tracking-wider uppercase">REST API Documentation & Interactive Test Console</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-[#C9A24A]/15 border border-[#C9A24A]/35 px-3 py-1.5 rounded-full text-xs text-[#F5E6C8]">
                <Terminal className="w-3.5 h-3.5 text-[#C9A24A]" />
                <span>Dev: <strong>{devUser?.name || "Imam Ariadi"}</strong> ({devUser?.email || "imamariadi775@gmail.com"})</span>
              </div>

              <Link to="/dashboard/clinic" className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-lg font-semibold transition">
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs bg-red-500/20 border border-red-500 text-red-300 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg font-bold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </header>

          {/* Swagger UI Target Container */}
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div id="swagger-ui-container" className="swagger-ui-wrapper" />
          </div>
        </div>
      )}
    </div>
  );
}

function getOpenApiSpec(apiBaseUrl: string) {
  return {
    openapi: "3.0.3",
    info: {
      title: "Aesthetic Pondok Indah Dental Clinic — REST API Documentation & Test Console",
      version: "2.0.0",
      description: "Dokumentasi resmi seluruh endpoint REST API Aesthetic Pondok Indah Dental Clinic. Khusus akun Developer. Mendukung uji coba langsung (interactive testing) dengan berbagai metode (Fetch JS, cURL, Axios, Python, PHP) serta otentikasi Sanctum Bearer Token terhubung otomatis.",
      contact: {
        name: "Imam Ariadi (Developer)",
        url: "https://aestheticpondokindah.com",
        email: "imamariadi775@gmail.com",
      },
    },
    servers: [
      {
        url: apiBaseUrl,
        description: "Active API Host",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "Sanctum Token",
          description: "Sanctum Bearer Token aktif (otomatis terotorisasi dari sesi Developer login Anda).",
        },
      },
    },
    paths: {
      "/auth/login": {
        post: {
          tags: ["1. Authentication & Session"],
          summary: "Login Pengguna, Dokter, Developer, atau Admin Klinik",
          description: "Otentikasi kredensial (WhatsApp / Email + Password) untuk mendapatkan Sanctum Bearer Token.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["login", "password"],
                  properties: {
                    login: { type: "string", example: "imamariadi775@gmail.com", description: "Nomor WhatsApp (+62...) atau alamat email" },
                    password: { type: "string", example: "Persib1933", description: "Password akun" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login Berhasil" },
            401: { description: "Kredensial Tidak Valid" },
          },
        },
      },
      "/auth/register": {
        post: {
          tags: ["1. Authentication & Session"],
          summary: "Pendaftaran Pasien Baru",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "phone", "email", "password", "password_confirmation"],
                  properties: {
                    name: { type: "string", example: "Ahmad Wijaya" },
                    phone: { type: "string", example: "+6281234567890" },
                    email: { type: "string", example: "ahmad@example.com" },
                    password: { type: "string", example: "password123" },
                    password_confirmation: { type: "string", example: "password123" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Registrasi Berhasil" } },
        },
      },
      "/auth/me": {
        get: {
          tags: ["1. Authentication & Session"],
          summary: "Cek Sesi User Login Aktif",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Data user login" } },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["1. Authentication & Session"],
          summary: "Logout & Cabut Token Sesi",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Berhasil logout" } },
        },
      },
      "/public/settings": {
        get: {
          tags: ["2. Public & Guest Information"],
          summary: "Pengaturan Publik Klinik (S&K, Kontak WA, Profil)",
          responses: { 200: { description: "Kumpulan key-value pengaturan publik klinik" } },
        },
      },
      "/public/home": {
        get: {
          tags: ["2. Public & Guest Information"],
          summary: "Konten Etalase Beranda (Hero, Tagline, Poin Layanan)",
          responses: { 200: { description: "Konten halaman beranda" } },
        },
      },
      "/public/about": {
        get: {
          tags: ["2. Public & Guest Information"],
          summary: "Konten Halaman Tentang Kami (Cerita, Nilai, Statistik)",
          responses: { 200: { description: "Konten tentang kami" } },
        },
      },
      "/public/promos": {
        get: {
          tags: ["2. Public & Guest Information"],
          summary: "Daftar Promo Spesial Aktif",
          responses: { 200: { description: "Daftar promo aktif" } },
        },
      },
      "/public/posts": {
        get: {
          tags: ["2. Public & Guest Information"],
          summary: "Daftar Artikel & Tips Kesehatan Gigi (Blog)",
          responses: { 200: { description: "Daftar artikel" } },
        },
      },
      "/public/doctors": {
        get: {
          tags: ["2. Public & Guest Information"],
          summary: "Daftar Dokter Spesialis Klinik",
          responses: { 200: { description: "Daftar dokter" } },
        },
      },
      "/public/doctor-schedules": {
        get: {
          tags: ["2. Public & Guest Information"],
          summary: "Jadwal Praktik Dokter & Ketersediaan Slot Janji Temu",
          responses: { 200: { description: "Daftar slot jadwal" } },
        },
      },
      "/public/services": {
        get: {
          tags: ["2. Public & Guest Information"],
          summary: "Daftar Layanan & Treatment Gigi",
          responses: { 200: { description: "Daftar layanan" } },
        },
      },
      "/public/branches": {
        get: {
          tags: ["2. Public & Guest Information"],
          summary: "Daftar Cabang Klinik & Lokasi Maps",
          responses: { 200: { description: "Daftar cabang" } },
        },
      },
      "/public/reservations": {
        post: {
          tags: ["2. Public & Guest Information"],
          summary: "Kirim Reservasi Tamu / Pasien Publik",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "phone", "date", "preferred_time"],
                  properties: {
                    name: { type: "string", example: "Budi Santoso" },
                    phone: { type: "string", example: "+6281234567890" },
                    complaint: { type: "string", example: "Konsultasi Veneer Gigi Depan" },
                    date: { type: "string", example: "2026-08-30" },
                    preferred_time: { type: "string", example: "14:00" },
                    branch_id: { type: "string", example: "1" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Reservasi berhasil dibuat" } },
        },
      },
      "/admin/metrics-summary": {
        get: {
          tags: ["3. Admin Management & CMS"],
          summary: "Ringkasan Metrik Counter Cepat",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Metrik counter klinik" } },
        },
      },
      "/admin/clinic-settings": {
        get: {
          tags: ["3. Admin Management & CMS"],
          summary: "Ambil Seluruh Pengaturan Sistem Klinik",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Daftar pengaturan" } },
        },
      },
      "/admin/clinic-settings/{key}": {
        post: {
          tags: ["3. Admin Management & CMS"],
          summary: "Simpan / Perbarui Pengaturan Sistem Klinik",
          security: [{ BearerAuth: [] }],
          parameters: [{ name: "key", in: "path", required: true, schema: { type: "string", example: "pdf_terms_and_conditions" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["value"],
                  properties: {
                    value: { type: "object", description: "Nilai string atau struktur JSON" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Pengaturan berhasil disimpan" } },
        },
      },
      "/admin/users": {
        get: {
          tags: ["3. Admin Management & CMS"],
          summary: "Daftar Pengguna / Pasien Terdaftar",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Daftar pasien" } },
        },
      },
      "/admin/doctors": {
        get: {
          tags: ["3. Admin Management & CMS"],
          summary: "Daftar Lengkap Dokter & Kredensial Medis",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Daftar dokter" } },
        },
      },
      "/admin/doctor-schedules": {
        get: {
          tags: ["3. Admin Management & CMS"],
          summary: "Daftar Seluruh Jadwal Praktik Dokter",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Daftar jadwal" } },
        },
      },
      "/admin/reservations": {
        get: {
          tags: ["3. Admin Management & CMS"],
          summary: "Daftar Reservasi Pasien",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Daftar reservasi" } },
        },
      },
      "/doctor/schedules": {
        get: {
          tags: ["4. Doctor Portal & EMR"],
          summary: "Jadwal Praktik Dokter Login",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Jadwal dokter" } },
        },
      },
      "/doctor/queue": {
        get: {
          tags: ["4. Doctor Portal & EMR"],
          summary: "Daftar Antrean Pasien Hari Ini",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Antrean pasien" } },
        },
      },
      "/doctor/medical-records": {
        get: {
          tags: ["4. Doctor Portal & EMR"],
          summary: "Daftar Rekam Medis Pasien (EMR)",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Rekam medis" } },
        },
      },
      "/user/profile": {
        get: {
          tags: ["5. Patient Dashboard & Finance"],
          summary: "Profil Pasien Lengkap",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Profil pasien" } },
        },
      },
      "/user/reservations": {
        get: {
          tags: ["5. Patient Dashboard & Finance"],
          summary: "Riwayat & Status Janji Temu Pasien",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Daftar reservasi" } },
        },
      },
      "/membership/tiers": {
        get: {
          tags: ["6. Membership & Points"],
          summary: "Daftar Level Membership",
          responses: { 200: { description: "Daftar tier" } },
        },
      },
      "/membership/points": {
        get: {
          tags: ["6. Membership & Points"],
          summary: "Saldo Poin Reward & Riwayat Transaksi Poin",
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: "Saldo poin" } },
        },
      },
      "/push/vapid-public-key": {
        get: {
          tags: ["7. Web Push Notifications"],
          summary: "Ambil VAPID Public Key untuk Web Push Browser",
          responses: { 200: { description: "VAPID Public Key" } },
        },
      },
      "/wilayah/provinsi": {
        get: {
          tags: ["8. Wilayah (Administrative Areas)"],
          summary: "Daftar Seluruh Provinsi di Indonesia",
          responses: { 200: { description: "Daftar provinsi" } },
        },
      },
    },
  };
}
