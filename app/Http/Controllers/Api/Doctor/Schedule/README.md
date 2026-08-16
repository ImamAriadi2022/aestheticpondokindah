# 📅 Controller: Doctor Schedule (`Doctor/Schedule`)

## 1. File Controller
- `DoctorScheduleController.php`

## 2. Aktor yang Berkomunikasi
- **Dokter Praktik**: Mengatur ketersediaan jam praktik harian dan kuota per shift.
- **Pasien & Admin**: Membaca jadwal dokter aktif untuk pendaftaran periksa.

## 3. Arah & Alur Data
- **Request**: `GET/POST/PUT/DELETE /api/doctor/schedules`.
- **Proses**: Kelola slot di tabel `doctor_schedules`.
