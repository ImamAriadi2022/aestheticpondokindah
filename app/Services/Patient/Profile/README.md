# 👤 Service: Kelengkapan Profil (`Patient/Profile`)

## 1. File Service
- `ProfileCompletionService.php`

## 2. Aktor yang Terlibat
- **Pasien**: Mengisi data identitas lengkap saat pendaftaran / onboarding.
- **Sistem Promo**: Pengecekan eligibilitas promo (hanya profil 100% lengkap yang dapat mengklaim promo).

## 3. Arah & Alur Logika Data
- **Validasi Kelengkapan**: `ProfileCompletionService::isProfileComplete` ➔ Cek field Nama, WhatsApp, Alamat, Kota, Kode Pos ➔ Return boolean.
