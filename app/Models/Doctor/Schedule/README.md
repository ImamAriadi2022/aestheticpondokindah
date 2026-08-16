# 📅 Model: Doctor Schedule (`Doctor/Schedule`)

## 1. File Model
- `DoctorSchedule.php`: Data slot jadwal kerja, jam praktik, dan kuota pasien dokter gigi.

## 2. Aktor yang Berkomunikasi
- **Dokter**: Mengatur ketersediaan jadwal praktik mandiri.
- **Admin**: Memantau dan mengonfigurasi jadwal dokter klinik.
- **Pasien / Tamu**: Memilih tanggal dan jam dokter saat reservasi.

## 3. Arah & Alur Data
- **Dokter/Admin ➔ `DoctorScheduleController` ➔ Model `DoctorSchedule` ➔ Tabel `doctor_schedules` ➔ Booking Calendar UI.**
