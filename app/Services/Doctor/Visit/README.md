# 🏥 Service: Kunjungan Medis (`Doctor/Visit`)

## 1. File Service
- `VisitService.php`

## 2. Aktor yang Terlibat
- **Dokter**: Memulai sesi periksa pasien dan menyelesaikan kunjungan.
- **Pasien**: Datang ke klinik berdasarkan nomor antrean reservasi.

## 3. Arah & Alur Logika Data
- **Mulai Kunjungan**: Dokter panggil antrean ➔ `VisitService::startVisit` ➔ Buat record `visits` baru ➔ Inisialisasi otomatis lembar `medical_records` (EMR) pasien jika belum ada.
- **Selesai Kunjungan**: `VisitService::completeVisit` ➔ Status `completed` ➔ Timestamp `completed_at`.
