# 👤 Fitur: Pengelolaan Akun Pengguna (`Shared/User`)

## 1. Deskripsi Fitur
Menyediakan pengelolaan profil mandiri bagi pasien/dokter yang login, serta antarmuka CRUD pengguna dan dokter oleh Administrator Klinik.

## 2. Aktor yang Berkomunikasi
- **Pasien / Dokter**: Melihat dan memperbarui biodata, alamat, preferensi gigi, dan avatar profil.
- **Administrator Klinik**: Mencari, melihat daftar pasien, membuat akun dokter baru, memperbarui hak akses, dan me-reset password.

## 3. Alur & Arah Data (Data Flow)
1. **Profil Mandiri Pasien (`GET/PUT /api/user/profile`)**:
   - **Arah Data**: Pasien ➔ `UserController` ➔ Model `User` (`app/Models/Shared/User/User.php`) ➔ Tabel `users` & `user_profiles`.
2. **Admin User Management (`GET/PUT/DELETE /api/admin/users`, `/api/admin/doctors`)**:
   - **Arah Data**: Admin ➔ `UserController` ➔ Query filtering role (`patient` / `doctor`) ➔ Response list dan audit log.
