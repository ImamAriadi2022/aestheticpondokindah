# 💬 Controller: Guest Consultation (`Guest/Consultation`)

## 1. File Controller
- `GuestConsultationController.php`

## 2. Aktor yang Berkomunikasi
- **Tamu Non-Login**: Memulai telekonsultasi menggunakan token akses unik tanpa perlu login akun.
- **Dokter**: Menjawab keluhan konsultasi tamu via dashboard dokter.

## 3. Arah & Alur Data
- **Request**: `POST /api/public/consultations`, `GET /api/public/consultations/{token}`, `POST /api/public/consultations/{token}/messages`.
- **Proses**: Identifikasi sesi menggunakan UUID `access_token`.
