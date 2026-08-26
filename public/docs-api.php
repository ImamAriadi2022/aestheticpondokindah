<?php
/**
 * Aesthetic Pondok Indah Dental Clinic - Interactive Swagger API Documentation
 * Protected by Developer Authentication Gate (Role: Developer)
 * Accessible at https://aestheticpondokindah.com/doc-api.php & /docs-api.php
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || ($_SERVER['SERVER_PORT'] ?? '') == 443) ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'] ?? 'aestheticpondokindah.com';
$baseUrl = $protocol . $host;
$apiBaseUrl = $baseUrl . '/api';

// Handle Logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    unset($_SESSION['dev_auth_token']);
    unset($_SESSION['dev_user']);
    session_destroy();
    header("Location: " . strtok($_SERVER["REQUEST_URI"], '?'));
    exit;
}

$loginError = null;

// Handle Form Login POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['dev_email'], $_POST['dev_password'])) {
    $email = trim((string) $_POST['dev_email']);
    $password = trim((string) $_POST['dev_password']);

    // Bootstrap Laravel to authenticate cleanly & securely
    $authenticated = false;
    try {
        if (file_exists(__DIR__ . '/../vendor/autoload.php') && file_exists(__DIR__ . '/../bootstrap/app.php')) {
            require_once __DIR__ . '/../vendor/autoload.php';
            /** @var \Illuminate\Foundation\Application $app */
            $app = require_once __DIR__ . '/../bootstrap/app.php';
            $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
            $kernel->bootstrap();

            $user = \App\Models\Shared\User\User::where('email', $email)
                ->orWhere('whatsapp', $email)
                ->first();

            if ($user && \Illuminate\Support\Facades\Hash::check($password, $user->password)) {
                if ($user->role === 'developer' || strtolower($user->email) === 'imamariadi775@gmail.com') {
                    $token = $user->createToken('swagger_dev_session', ['*'], now()->addDays(30))->plainTextToken;
                    $_SESSION['dev_auth_token'] = $token;
                    $_SESSION['dev_user'] = [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                    ];
                    $authenticated = true;
                    header("Location: " . strtok($_SERVER["REQUEST_URI"], '?'));
                    exit;
                } else {
                    $loginError = "Akses ditolak: Akun ini bukan akun Developer. Hanya peran Developer yang berhak mengakses API Docs.";
                }
            } else {
                $loginError = "Email atau password salah.";
            }
        }
    } catch (\Throwable $e) {
        // Fallback to cURL if Laravel bootstrap in-script encountered any issue
        $loginUrl = $apiBaseUrl . '/auth/login';
        $payload = json_encode([
            'login' => $email,
            'password' => $password,
            'device_name' => 'swagger_developer_console'
        ]);

        $ch = curl_init($loginUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json']);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $data = json_decode($response, true);
        if ($httpCode === 200 && !empty($data['token'])) {
            $userRole = $data['user']['role'] ?? '';
            $userEmail = strtolower($data['user']['email'] ?? '');
            if ($userRole === 'developer' || $userEmail === 'imamariadi775@gmail.com') {
                $_SESSION['dev_auth_token'] = $data['token'];
                $_SESSION['dev_user'] = $data['user'];
                header("Location: " . strtok($_SERVER["REQUEST_URI"], '?'));
                exit;
            } else {
                $loginError = "Akses ditolak: Hanya akun Developer yang berhak mengakses API Docs.";
            }
        } else {
            $loginError = $data['message'] ?? 'Email atau password salah.';
        }
    }
}

$isDeveloperAuthenticated = !empty($_SESSION['dev_auth_token']) && !empty($_SESSION['dev_user']);
$devUser = $_SESSION['dev_user'] ?? null;
$devToken = $_SESSION['dev_auth_token'] ?? '';
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Documentation & Testing Console — Developer Access</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <!-- Swagger UI CSS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.min.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <style>
    :root {
      --brand-gold: #C9A24A;
      --brand-gold-dark: #A8843A;
      --brand-gold-light: #FDF9F0;
      --brand-charcoal: #1A1612;
      --brand-dark: #120F0D;
      --brand-cream: #FAF8F5;
      --brand-border: #EADBCE;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 0;
      background-color: #F8F9FA;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #2D3748;
    }

    /* Developer Login Gate Styling */
    .gate-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 50% 20%, #2A241E 0%, #120F0D 100%);
      padding: 24px;
      position: relative;
      overflow: hidden;
    }

    .gate-container::before {
      content: '';
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(201, 162, 74, 0.12) 0%, rgba(0,0,0,0) 70%);
      top: -150px;
      right: -150px;
      border-radius: 50%;
    }

    .gate-card {
      width: 100%;
      max-width: 440px;
      background: rgba(26, 22, 18, 0.92);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(201, 162, 74, 0.35);
      border-radius: 24px;
      padding: 36px 32px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
      position: relative;
      z-index: 10;
    }

    .gate-logo {
      text-align: center;
      margin-bottom: 20px;
    }

    .gate-logo img {
      height: 48px;
      width: auto;
      object-fit: contain;
    }

    .gate-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(201, 162, 74, 0.15);
      border: 1px solid rgba(201, 162, 74, 0.4);
      color: #E8D4A2;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 10px;
    }

    .gate-title {
      color: #FFFFFF;
      font-size: 1.35rem;
      font-weight: 700;
      text-align: center;
      margin: 12px 0 4px;
    }

    .gate-desc {
      color: #A39D94;
      font-size: 0.82rem;
      text-align: center;
      margin: 0 0 24px;
      line-height: 1.45;
    }

    .form-group {
      margin-bottom: 18px;
    }

    .form-group label {
      display: block;
      color: #E8D4A2;
      font-size: 0.78rem;
      font-weight: 600;
      margin-bottom: 6px;
      letter-spacing: 0.02em;
    }

    .form-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(234, 219, 206, 0.25);
      border-radius: 12px;
      padding: 12px 16px;
      color: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.88rem;
      outline: none;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      border-color: var(--brand-gold);
      box-shadow: 0 0 0 3px rgba(201, 162, 74, 0.2);
      background: rgba(255, 255, 255, 0.09);
    }

    .btn-submit {
      width: 100%;
      background: linear-gradient(135deg, var(--brand-gold) 0%, var(--brand-gold-dark) 100%);
      color: #FFFFFF;
      border: none;
      border-radius: 12px;
      padding: 13px 20px;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(201, 162, 74, 0.25);
      transition: all 0.2s ease;
      margin-top: 10px;
    }

    .btn-submit:hover {
      filter: brightness(1.08);
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(201, 162, 74, 0.35);
    }

    .alert-error {
      background: rgba(220, 38, 38, 0.15);
      border: 1px solid #EF4444;
      color: #FCA5A5;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 0.8rem;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Top Bar for Authenticated Developer */
    .custom-topbar {
      background: linear-gradient(135deg, #1A1612 0%, #2A241E 100%);
      color: #FFFFFF;
      padding: 14px 24px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 2px solid var(--brand-gold);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .custom-topbar .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .custom-topbar .brand img {
      height: 38px;
      width: auto;
      object-fit: contain;
    }

    .custom-topbar .brand-text h1 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 700;
      color: #FFFFFF;
    }

    .custom-topbar .brand-text p {
      margin: 2px 0 0;
      font-size: 0.72rem;
      color: #D4AF37;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .dev-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(201, 162, 74, 0.15);
      border: 1px solid rgba(201, 162, 74, 0.4);
      padding: 5px 12px;
      border-radius: 20px;
      color: #F5E6C8;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .btn-logout {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #EF4444;
      color: #F87171;
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 0.75rem;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-logout:hover {
      background: #EF4444;
      color: #FFF;
    }

    /* Swagger UI Overrides */
    .swagger-ui .topbar { display: none !important; }
    .swagger-ui .info { margin: 25px 0; }
    .swagger-ui .info .title { font-family: 'Playfair Display', serif; color: var(--brand-charcoal); }
    .swagger-ui .scheme-container { background: #FFFFFF; border-bottom: 1px solid #E2E8F0; padding: 15px 0; box-shadow: none; }
    .swagger-ui .btn.authorize { color: #A8843A; border-color: #A8843A; background-color: #FDF8F0; font-weight: 700; }
    .swagger-ui .btn.authorize svg { fill: #A8843A; }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #0E7090; }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #15803D; }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #B45309; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #B91C1C; }
    .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #6B21A8; }
    .swagger-ui .opblock { border-radius: 12px; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.06); }
    .swagger-ui .opblock-tag { font-size: 1.15rem; font-weight: 700; color: var(--brand-charcoal); border-bottom: 2px solid #EADBCE; margin-top: 24px; padding-bottom: 8px; }
    .swagger-ui pre, .swagger-ui code { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
    .swagger-ui .response-col_status { font-family: 'JetBrains Mono', monospace; font-weight: 700; }
  </style>
</head>
<body>

<?php if (!$isDeveloperAuthenticated): ?>
  <!-- Developer Authentication Gate -->
  <div class="gate-container">
    <div class="gate-card">
      <div class="gate-logo">
        <img src="/logo/logo.webp" alt="Aesthetic Pondok Indah" onerror="this.style.display='none'">
        <div>
          <span class="gate-badge">🔒 Developer Access Only</span>
        </div>
      </div>

      <h2 class="gate-title">API Console Gate</h2>
      <p class="gate-desc">Dokumentasi REST API & Interactive Testing Console dilindungi. Silakan masuk menggunakan akun Developer terdaftar.</p>

      <?php if ($loginError): ?>
        <div class="alert-error">
          <span>⚠️</span>
          <span><?php echo htmlspecialchars($loginError); ?></span>
        </div>
      <?php endif; ?>

      <form method="POST" action="">
        <div class="form-group">
          <label for="dev_email">Email Developer</label>
          <input
            type="email"
            id="dev_email"
            name="dev_email"
            class="form-input"
            placeholder="imamariadi775@gmail.com"
            value="<?php echo htmlspecialchars($_POST['dev_email'] ?? 'imamariadi775@gmail.com'); ?>"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="dev_password">Password Developer</label>
          <input
            type="password"
            id="dev_password"
            name="dev_password"
            class="form-input"
            placeholder="Masukkan password..."
            required
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="btn-submit">
          Masuk & Buka API Documentation ⚡
        </button>
      </form>

      <p style="text-align: center; color: #78716C; font-size: 0.72rem; margin-top: 24px;">
        &copy; <?php echo date('Y'); ?> Aesthetic Pondok Indah Dental Clinic. All Rights Reserved.
      </p>
    </div>
  </div>

<?php else: ?>

  <!-- Authenticated Swagger UI Interface -->
  <header class="custom-topbar">
    <div class="brand">
      <img src="/logo/logo.webp" alt="Aesthetic Pondok Indah" onerror="this.style.display='none'">
      <div class="brand-text">
        <h1>Aesthetic Pondok Indah Dental Clinic</h1>
        <p>Interactive REST API Documentation & Live Test Console</p>
      </div>
    </div>

    <div class="topbar-actions">
      <div class="dev-badge">
        <span>👨‍💻</span>
        <span>Developer: <strong><?php echo htmlspecialchars($devUser['name'] ?? 'Imam Ariadi'); ?></strong> (<?php echo htmlspecialchars($devUser['email'] ?? 'imamariadi775@gmail.com'); ?>)</span>
      </div>

      <a href="?action=logout" class="btn-logout">Keluar Sesi</a>
    </div>
  </header>

  <!-- Swagger UI Container -->
  <div id="swagger-ui"></div>

  <!-- Swagger UI JavaScript Dependencies -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.min.js"></script>

  <script>
    const API_BASE = "<?php echo $apiBaseUrl; ?>";
    const DEV_TOKEN = "<?php echo $devToken; ?>";

    const spec = {
      openapi: "3.0.3",
      info: {
        title: "Aesthetic Pondok Indah Dental Clinic — API Documentation & Testing Console",
        version: "2.0.0",
        description: "Dokumentasi resmi seluruh endpoint REST API Aesthetic Pondok Indah Dental Clinic. Khusus akun Developer. Mendukung uji coba langsung (interactive testing) dengan berbagai metode (Fetch JS, cURL, Axios, Python, PHP) serta otentikasi Sanctum Bearer Token terhubung otomatis.",
        contact: {
          name: "Imam Ariadi (Developer)",
          url: "https://aestheticpondokindah.com",
          email: "imamariadi775@gmail.com"
        }
      },
      servers: [
        {
          url: "<?php echo $apiBaseUrl; ?>",
          description: "Production Server (Plesk / Live Host)"
        },
        {
          url: "http://localhost:8000/api",
          description: "Local Development Server"
        }
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "Sanctum Token",
            description: "Sanctum Bearer Token aktif (otomatis terotorisasi dari sesi Developer login Anda)."
          }
        }
      },
      paths: {
        // =========================================================================
        // 1. AUTHENTICATION
        // =========================================================================
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
                      password: { type: "string", example: "Persib1933", description: "Password akun" }
                    }
                  }
                }
              }
            },
            responses: {
              200: { description: "Login Berhasil", content: { "application/json": { schema: { type: "object", properties: { token: { type: "string", example: "1|3c90abf..." }, user: { type: "object" } } } } } },
              401: { description: "Kredensial Tidak Valid" },
              422: { description: "Validasi Gagal" }
            }
          }
        },
        "/auth/register": {
          post: {
            tags: ["1. Authentication & Session"],
            summary: "Pendaftaran Pasien Baru",
            description: "Mendaftarkan akun pasien baru dengan nama lengkap, nomor WhatsApp, email, dan password.",
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
                      password_confirmation: { type: "string", example: "password123" }
                    }
                  }
                }
              }
            },
            responses: {
              201: { description: "Registrasi Berhasil" },
              422: { description: "Nomor telepon atau email sudah terdaftar" }
            }
          }
        },
        "/auth/me": {
          get: {
            tags: ["1. Authentication & Session"],
            summary: "Cek Sesi User Login Aktif",
            security: [{ BearerAuth: [] }],
            responses: {
              200: { description: "Data user yang sedang login" },
              401: { description: "Unauthenticated" }
            }
          }
        },
        "/auth/logout": {
          post: {
            tags: ["1. Authentication & Session"],
            summary: "Logout & Cabut Token Sesi",
            security: [{ BearerAuth: [] }],
            responses: {
              200: { description: "Berhasil logout" }
            }
          }
        },

        // =========================================================================
        // 2. PUBLIC & GUEST APIS
        // =========================================================================
        "/public/settings": {
          get: {
            tags: ["2. Public & Guest Information"],
            summary: "Pengaturan Publik Klinik (S&K, Kontak WA, Profil)",
            responses: { 200: { description: "Kumpulan key-value pengaturan publik klinik" } }
          }
        },
        "/public/home": {
          get: {
            tags: ["2. Public & Guest Information"],
            summary: "Konten Etalase Beranda (Hero, Tagline, Poin Layanan)",
            responses: { 200: { description: "Objek JSON konten halaman beranda" } }
          }
        },
        "/public/about": {
          get: {
            tags: ["2. Public & Guest Information"],
            summary: "Konten Halaman Tentang Kami (Cerita, Nilai, Statistik)",
            responses: { 200: { description: "Objek JSON konten tentang kami" } }
          }
        },
        "/public/promos": {
          get: {
            tags: ["2. Public & Guest Information"],
            summary: "Daftar Promo Spesial Aktif",
            responses: { 200: { description: "Array daftar promo aktif" } }
          }
        },
        "/public/promos/{slug}": {
          get: {
            tags: ["2. Public & Guest Information"],
            summary: "Detail Promo Berdasarkan Slug",
            parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string", example: "diskon-veneer-ramadhan" } }],
            responses: { 200: { description: "Detail promo" }, 404: { description: "Promo tidak ditemukan" } }
          }
        },
        "/public/posts": {
          get: {
            tags: ["2. Public & Guest Information"],
            summary: "Daftar Artikel & Tips Kesehatan Gigi (Blog)",
            responses: { 200: { description: "Array artikel terpublikasi" } }
          }
        },
        "/public/posts/{slug}": {
          get: {
            tags: ["2. Public & Guest Information"],
            summary: "Detail Artikel Lengkap Berdasarkan Slug",
            parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string", example: "tips-merawat-veneer-gigi" } }],
            responses: { 200: { description: "Detail artikel dan isi HTML" } }
          }
        },
        "/public/doctors": {
          get: {
            tags: ["2. Public & Guest Information"],
            summary: "Daftar Dokter Spesialis Klinik",
            responses: { 200: { description: "Daftar dokter spesialis aktif" } }
          }
        },
        "/public/doctor-schedules": {
          get: {
            tags: ["2. Public & Guest Information"],
            summary: "Jadwal Praktik Dokter & Ketersediaan Slot Janji Temu",
            responses: { 200: { description: "Daftar slot jadwal dokter" } }
          }
        },
        "/public/services": {
          get: {
            tags: ["2. Public & Guest Information"],
            summary: "Daftar Layanan & Treatment Gigi",
            responses: { 200: { description: "Daftar layanan klinik" } }
          }
        },
        "/public/branches": {
          get: {
            tags: ["2. Public & Guest Information"],
            summary: "Daftar Cabang Klinik & Lokasi Maps",
            responses: { 200: { description: "Daftar cabang aktif" } }
          }
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
                      signature_data: { type: "string", example: "data:image/png;base64,..." }
                    }
                  }
                }
              }
            },
            responses: { 200: { description: "Reservasi berhasil dibuat" }, 422: { description: "Data tidak lengkap" } }
          }
        },
        "/public/consultations": {
          post: {
            tags: ["2. Public & Guest Information"],
            summary: "Mulai Konsultasi Online Guest / Tamu",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["name", "phone", "complaint"],
                    properties: {
                      name: { type: "string", example: "Siti Rahma" },
                      phone: { type: "string", example: "+6285678901234" },
                      complaint: { type: "string", example: "Gigi ngilu saat minum dingin" }
                    }
                  }
                }
              }
            },
            responses: { 200: { description: "Sesi konsultasi dimulai" } }
          }
        },

        // =========================================================================
        // 3. ADMIN CLINIC APIS
        // =========================================================================
        "/admin/metrics-summary": {
          get: {
            tags: ["3. Admin Management & CMS"],
            summary: "Ringkasan Metrik Counter Cepat (Ringan & Cepat)",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Total users, posts, schedules, reservations, dll." } }
          }
        },
        "/admin/analytics/summary": {
          get: {
            tags: ["3. Admin Management & CMS"],
            summary: "Ringkasan Analitik Pengunjung & Kunjungan Halaman",
            security: [{ BearerAuth: [] }],
            parameters: [
              { name: "from", in: "query", required: true, schema: { type: "string", example: "2026-08-01" } },
              { name: "to", in: "query", required: true, schema: { type: "string", example: "2026-08-31" } }
            ],
            responses: { 200: { description: "Data analitik grafik dan metrik" } }
          }
        },
        "/admin/clinic-settings": {
          get: {
            tags: ["3. Admin Management & CMS"],
            summary: "Ambil Seluruh Pengaturan Sistem Klinik",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Daftar pengaturan klinik" } }
          }
        },
        "/admin/clinic-settings/{key}": {
          post: {
            tags: ["3. Admin Management & CMS"],
            summary: "Simpan / Perbarui Pengaturan Sistem Klinik (S&K, Kop Surat, WA)",
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
                      value: { type: "object", description: "Nilai string atau JSON struktur pengaturan" }
                    }
                  }
                }
              }
            },
            responses: { 200: { description: "Pengaturan berhasil disimpan ke database" } }
          }
        },
        "/admin/users": {
          get: {
            tags: ["3. Admin Management & CMS"],
            summary: "Daftar Pengguna / Pasien Terdaftar",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Daftar pasien" } }
          }
        },
        "/admin/doctors": {
          get: {
            tags: ["3. Admin Management & CMS"],
            summary: "Daftar Lengkap Dokter & Kredensial Medis",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Daftar dokter" } }
          },
          post: {
            tags: ["3. Admin Management & CMS"],
            summary: "Tambah Dokter Spesialis Baru",
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["name", "email", "phone", "password", "specialization", "str"],
                    properties: {
                      name: { type: "string", example: "drg. Maya Ananda, Sp.Pros" },
                      email: { type: "string", example: "drg.maya@example.com" },
                      phone: { type: "string", example: "+6281234567888" },
                      password: { type: "string", example: "doctor123" },
                      specialization: { type: "string", example: "Spesialis Prosedur Prostodonsia" },
                      str: { type: "string", example: "31.2.1.100.3.21.999888" }
                    }
                  }
                }
              }
            },
            responses: { 201: { description: "Dokter berhasil ditambahkan" } }
          }
        },
        "/admin/doctor-schedules": {
          get: {
            tags: ["3. Admin Management & CMS"],
            summary: "Daftar Seluruh Jadwal Praktik Dokter",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Daftar jadwal" } }
          },
          post: {
            tags: ["3. Admin Management & CMS"],
            summary: "Buat Jadwal Praktik Baru",
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["doctor_id", "day_of_week", "start_time", "end_time", "quota"],
                    properties: {
                      doctor_id: { type: "integer", example: 3 },
                      day_of_week: { type: "string", example: "Senin" },
                      start_time: { type: "string", example: "09:00" },
                      end_time: { type: "string", example: "14:00" },
                      quota: { type: "integer", example: 10 }
                    }
                  }
                }
              }
            },
            responses: { 201: { description: "Jadwal berhasil dibuat" } }
          }
        },
        "/admin/reservations": {
          get: {
            tags: ["3. Admin Management & CMS"],
            summary: "Daftar Reservasi Pasien",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Daftar reservasi" } }
          }
        },
        "/admin/posts": {
          get: {
            tags: ["3. Admin Management & CMS"],
            summary: "Daftar Artikel Blog Admin",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Daftar post" } }
          },
          post: {
            tags: ["3. Admin Management & CMS"],
            summary: "Publikasikan Artikel Baru",
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["title", "category", "content_html"],
                    properties: {
                      title: { type: "string", example: "Keunggulan Veneer Porselen untuk Estetika Senyum" },
                      category: { type: "string", example: "Estetika" },
                      content_html: { type: "string", example: "<p>Veneer porselen memberikan hasil natural...</p>" },
                      excerpt: { type: "string", example: "Panduan lengkap memilih veneer porselen..." },
                      cover_image_url: { type: "string", example: "/blog/veneer.webp" },
                      status: { type: "string", example: "published" }
                    }
                  }
                }
              }
            },
            responses: { 201: { description: "Artikel berhasil dibuat" } }
          }
        },
        "/admin/popups": {
          get: {
            tags: ["3. Admin Management & CMS"],
            summary: "Daftar Pop-Up Banner Promo",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Daftar popup" } }
          },
          post: {
            tags: ["3. Admin Management & CMS"],
            summary: "Buat Pop-Up Promo Baru",
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    required: ["title", "headline"],
                    properties: {
                      title: { type: "string", example: "Promo Liburan Spesial" },
                      headline: { type: "string", example: "Diskon 20% Scaling & Whitening" },
                      image_url: { type: "string", example: "/popup/promo.webp" },
                      enabled: { type: "boolean", example: true },
                      priority: { type: "integer", example: 10 }
                    }
                  }
                }
              }
            },
            responses: { 201: { description: "Pop-up berhasil dibuat" } }
          }
        },

        // =========================================================================
        // 4. DOCTOR PRACTITIONER & EMR
        // =========================================================================
        "/doctor/schedules": {
          get: {
            tags: ["4. Doctor Portal & EMR"],
            summary: "Jadwal Praktik Saya (Dokter Login)",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Daftar jadwal dokter aktif" } }
          }
        },
        "/doctor/queue": {
          get: {
            tags: ["4. Doctor Portal & EMR"],
            summary: "Daftar Antrean Pasien Hari Ini",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Daftar antrean pasien" } }
          }
        },
        "/doctor/medical-records": {
          get: {
            tags: ["4. Doctor Portal & EMR"],
            summary: "Daftar Rekam Medis Pasien (EMR)",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Daftar rekam medis" } }
          }
        },
        "/doctor/medical-records/{id}/soap": {
          get: {
            tags: ["4. Doctor Portal & EMR"],
            summary: "Catatan Medis SOAP (Subjective, Objective, Assessment, Plan)",
            security: [{ BearerAuth: [] }],
            parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } }],
            responses: { 200: { description: "Catatan SOAP" } }
          },
          post: {
            tags: ["4. Doctor Portal & EMR"],
            summary: "Simpan / Update Catatan SOAP",
            security: [{ BearerAuth: [] }],
            parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", example: 1 } }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      subjective: { type: "string", example: "Pasien mengeluhkan ngilu pada gigi geraham kanan bawah." },
                      objective: { type: "string", example: "Kavitas profunda pada gigi 46, tes perkusi positif." },
                      assessment: { type: "string", example: "Karies dentis profunda / Pulpitis reversibel (K02.1)" },
                      plan: { type: "string", example: "Perawatan saluran akar (PSA) kunjungan pertama." }
                    }
                  }
                }
              }
            },
            responses: { 200: { description: "Catatan SOAP berhasil disimpan" } }
          }
        },

        // =========================================================================
        // 5. PATIENT DASHBOARD & FINANCE
        // =========================================================================
        "/user/profile": {
          get: {
            tags: ["5. Patient Dashboard & Finance"],
            summary: "Profil Pasien Lengkap (Biodata, Membership, Poin)",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Data profil pengguna" } }
          },
          post: {
            tags: ["5. Patient Dashboard & Finance"],
            summary: "Perbarui Profil & Biodata Pasien",
            security: [{ BearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: { type: "string", example: "Budi Santoso" },
                      phone: { type: "string", example: "+6281234567890" },
                      gender: { type: "string", example: "male" },
                      birthDate: { type: "string", example: "1990-05-15" },
                      address: { type: "string", example: "Jl. Metro Pondok Indah Blok TB No. 12" }
                    }
                  }
                }
              }
            },
            responses: { 200: { description: "Profil berhasil diperbarui" } }
          }
        },
        "/user/reservations": {
          get: {
            tags: ["5. Patient Dashboard & Finance"],
            summary: "Riwayat & Status Janji Temu Pasien",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Daftar reservasi pasien" } }
          }
        },
        "/user/consultations": {
          get: {
            tags: ["5. Patient Dashboard & Finance"],
            summary: "Daftar Konsultasi Online Pasien",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Daftar konsultasi" } }
          }
        },
        "/user/complaints": {
          get: {
            tags: ["5. Patient Dashboard & Finance"],
            summary: "Daftar Pengaduan & Layanan Suara Pasien",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Daftar komplain dan statusnya" } }
          }
        },

        // =========================================================================
        // 6. MEMBERSHIP & POINTS
        // =========================================================================
        "/membership/tiers": {
          get: {
            tags: ["6. Membership & Points"],
            summary: "Daftar Level Membership (Bronze, Silver, Gold, Platinum)",
            responses: { 200: { description: "Daftar tier dan benefit" } }
          }
        },
        "/membership/points": {
          get: {
            tags: ["6. Membership & Points"],
            summary: "Saldo Poin Reward & Riwayat Transaksi Poin",
            security: [{ BearerAuth: [] }],
            responses: { 200: { description: "Saldo poin dan mutasi" } }
          }
        },

        // =========================================================================
        // 7. WEB PUSH NOTIFICATIONS
        // =========================================================================
        "/push/vapid-public-key": {
          get: {
            tags: ["7. Web Push Notifications"],
            summary: "Ambil VAPID Public Key untuk Web Push Browser",
            responses: { 200: { description: "VAPID Public Key string" } }
          }
        },

        // =========================================================================
        // 8. WILAYAH
        // =========================================================================
        "/wilayah/provinsi": {
          get: {
            tags: ["8. Wilayah (Administrative Areas)"],
            summary: "Daftar Seluruh Provinsi di Indonesia",
            responses: { 200: { description: "Array provinsi ID dan Nama" } }
          }
        },
        "/wilayah/kabupaten/{provinceId}": {
          get: {
            tags: ["8. Wilayah (Administrative Areas)"],
            summary: "Daftar Kabupaten/Kota Berdasarkan ID Provinsi",
            parameters: [{ name: "provinceId", in: "path", required: true, schema: { type: "string", example: "31" } }],
            responses: { 200: { description: "Array kabupaten/kota" } }
          }
        }
      }
    };

    window.onload = () => {
      window.ui = SwaggerUIBundle({
        spec: spec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
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
            php_curl: { title: "PHP (cURL)", syntax: "php" }
          },
          defaultExpanded: true
        }
      });

      // Automatically preauthorize Swagger UI with the active Developer Token
      if (DEV_TOKEN) {
        setTimeout(() => {
          if (window.ui && window.ui.preauthorizeApiKey) {
            window.ui.preauthorizeApiKey("BearerAuth", DEV_TOKEN);
          }
        }, 600);
      }
    };
  </script>
<?php endif; ?>

</body>
</html>
