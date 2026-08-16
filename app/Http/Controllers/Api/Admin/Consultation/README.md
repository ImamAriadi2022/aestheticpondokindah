# 💬 Controller: Admin Consultation (`Admin/Consultation`)

## 1. File Controller
- `ConsultationAdminController.php`

## 2. Aktor yang Berkomunikasi
- **Administrator Klinik**: Memonitor tiket telekonsultasi masuk, memindahkan (*transfer*) konsultasi ke dokter yang sedang online/tersedia, dan menutup sesi.
- **Pasien & Dokter**: Sesi konsultasi terhubung dengan dokter yang ditugaskan.

## 3. Arah & Alur Data
- **Request**: `GET /api/admin/consultations`, `POST /api/admin/consultations/{id}/transfer`, `POST /api/admin/consultations/{id}/close`.
- **Proses**: Update `doctor_id` atau `status` pada tabel `consultations`.
