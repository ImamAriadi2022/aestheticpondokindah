# 🏥 Model: Clinical Visit (`Doctor/Visit`)

## 1. File Model
- `Visit.php`: Kunjungan fisik pasien ke ruang praktik dokter gigi.

## 2. Aktor yang Berkomunikasi
- **Dokter**: Memulai pemeriksaan fisik, mencatat waktu mulai dan selesai.
- **Pasien**: Melihat riwayat kehadiran dan dokter pemeriksa.
- **Admin**: Memantau status kedatangan pasien di klinik.

## 3. Arah & Alur Data
- **Antrean Reservasi ➔ Dokter Memulai Kunjungan ➔ Model `Visit` ➔ Tabel `visits` ➔ Pembuatan Entitas `MedicalRecord` EMR.**
