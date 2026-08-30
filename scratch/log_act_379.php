<?php
$entry = [
    "id" => "act-379",
    "timestamp" => gmdate("Y-m-d\TH:i:s.000\Z"),
    "category" => "auth-google-oauth-sso-integration",
    "title" => "Integrasi Google OAuth 2.0 (Login by Google, Daftar by Google, & Tautkan Akun Google)",
    "description" => "Mengimplementasikan fitur autentikasi Google OAuth 2.0 lengkap di backend Laravel dan frontend React: 1) Backend: Menambahkan kolom google_id pada tabel users (migration 2026_08_29_200000_add_google_id_to_users_table.php), membuat GoogleAuthController untuk menangani login/pendaftaran otomatis (POST /api/auth/google), menghubungkan akun Google (POST /api/auth/google/link), memutuskan koneksi Google (POST /api/auth/google/unlink), dan status koneksi (GET /api/auth/google/status), 2) Frontend: Membuat komponen GoogleAuthButton yang bersih dan elegan dengan logo resmi Google SVG dan tipografi Poppins, mendukung Google Identity Services (GIS) One Tap & Popup fallback, 3) Integrasi Halaman: Menambahkan tombol 'Masuk dengan Google' di halaman Login (Login.tsx & MobileLogin.tsx), tombol 'Daftar dengan Google' di tab Registrasi, serta kartu 'Koneksi Akun Google' di halaman Pengaturan Keamanan Pasien (Security.tsx) yang mendukung penautan akun dan pemutusan tautan instan.",
    "details" => [
        "Seamless Google Single Sign-On: Autentikasi 1-klik untuk login dan pembuatan akun pasien baru secara otomatis.",
        "Account Linking & Unlinking: Pengguna yang login via WhatsApp/Password dapat menautkan akun Google-nya di menu Keamanan (Security.tsx) dan memutusnya kapan saja.",
        "Unified Token & Session Management: Mengintegrasikan token Sanctum dengan masa aktif 10 hari dan serialisasi data profil lengkap.",
        "Zero Build Errors: Kompilasi npm run build sukses 100% tanpa error."
    ],
    "author" => "Antigravity Assistant",
    "version" => "1.0.0"
];

$files = ["public/activity_log.json", "frontend-web/public/activity_log.json"];
foreach ($files as $f) {
    if (file_exists($f)) {
        $json = json_decode(file_get_contents($f), true) ?: [];
        if (!isset($json[0]["id"]) || $json[0]["id"] !== "act-379") {
            array_unshift($json, $entry);
            file_put_contents($f, json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
            echo "Successfully updated {$f}\n";
        } else {
            echo "Already updated {$f}\n";
        }
    }
}