# 🔐 Fitur: Autentikasi Bersama (`Shared/Auth`)

## 1. Deskripsi Fitur
Menyediakan mekanisme autentikasi berbasis token Sanctum untuk seluruh aktor (`clinic_admin`, `doctor`, `patient`) serta pendaftaran mandiri pasien baru.

## 2. Aktor yang Berkomunikasi
- **Pasien / Pengguna Baru**: Melakukan registrasi akun via nomor WhatsApp dan password.
- **Seluruh Pengguna (Admin, Dokter, Pasien)**: Melakukan login, pengecekan sesi aktif (`/me`), dan logout.
- **Sistem Backend (Laravel Sanctum)**: Memvalidasi kredensial, hashing password (`bcrypt`), dan menerbitkan `PersonalAccessToken`.

## 3. Alur & Arah Data (Data Flow)
1. **Registrasi (`POST /api/auth/register`)**:
   - **Input Data**: Nama, Email (opsional), WhatsApp, Password, Alamat, Tanggal Lahir.
   - **Arah Data**: Client ➔ `RegistrationController` ➔ Model `User` & `UserProfile` ➔ Tabel `users` & `user_profiles` ➔ Inisialisasi Membership Bronze (Otomatis).
   - **Output Data**: Token Sanctum & Serialisasi Profil User.
2. **Login (`POST /api/auth/login`)**:
   - **Input Data**: WhatsApp, Password, Device Name.
   - **Arah Data**: Client ➔ `AuthController` ➔ Validasi Hash ➔ Tabel `personal_access_tokens` ➔ Client.
3. **Session Me (`GET /api/auth/me`)**:
   - **Arah Data**: Client (Header Bearer Token) ➔ Sanctum Middleware ➔ Model `User` (Eager load `profile`) ➔ Client JSON.
