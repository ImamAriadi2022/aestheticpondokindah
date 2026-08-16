# 👤 Model: User (`Shared/User`)

## 1. File Model
- `User.php`: Entitas pengguna utama sistem (Authenticatable) yang mewakili ketiga aktor: Admin (`clinic_admin`), Dokter (`doctor`), dan Pasien (`patient`).

## 2. Aktor yang Berkomunikasi
- **Admin, Dokter, Pasien**: Autentikasi sesi, otorisasi role, dan relasi data induk.

## 3. Arah & Alur Data
- **Pusat relasi ke seluruh model transaksi: Reservasi, Rekam Medis, Kunjungan, Notifikasi, Pembayaran, dan Membership.**
