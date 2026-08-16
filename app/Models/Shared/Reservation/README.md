# 📅 Model: Reservation (`Shared/Reservation`)

## 1. File Model
- `Reservation.php`: Entitas janji temu perawatan klinik antara Pasien/Tamu dengan Dokter.
- `ReservationAudit.php`: Riwayat audit pencatatan perubahan status, tanggal, dan waktu reservasi.

## 2. Aktor yang Berkomunikasi
- **Tamu / Pasien**: Mengajukan janji temu tanggal dan jam tertentu.
- **Dokter**: Melihat jadwal pasien yang akan datang pada jam praktiknya.
- **Admin**: Mengonfirmasi, menjadwalkan ulang, atau membatalkan reservasi.

## 3. Arah & Alur Data
- **Pasien Booking ➔ Model `Reservation` (Status: `pending`) ➔ Admin Konfirmasi (`confirmed`) ➔ Masuk Antrean Dokter ➔ Selesai Periksa (`completed`) ➔ Tercatat di `ReservationAudit`.**
