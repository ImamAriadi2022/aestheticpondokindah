# 👤 Model: Patient Profile (`Patient/Profile`)

## 1. File Model
- `UserProfile.php`: Biodata detail pasien (kebiasaan minum kopi, merokok, asuransi).
- `UserDeviceToken.php`: Token registrasi perangkat mobile untuk notifikasi push.

## 2. Aktor yang Berkomunikasi
- **Pasien**: Mengisi dan memperbarui preferensi personal.
- **Dokter**: Membaca riwayat kebiasaan pasien untuk pertimbangan diagnosis.

## 3. Arah & Alur Data
- **Pasien ➔ `UserController` ➔ Model `UserProfile` ➔ Tabel `user_profiles` ➔ Anamnesis Dokter.**
