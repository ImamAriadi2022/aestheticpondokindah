# 💬 Controller: Patient Consultation (`Patient/Consultation`)

## 1. File Controller
- `ConsultationController.php`

## 2. Aktor yang Berkomunikasi
- **Pasien Terdaftar**: Memulai telekonsultasi dokter, mengirim pesan chat, mengunggah foto keluhan gigi, dan bergabung ke link video meeting.
- **Dokter**: Memberikan advis klinis.

## 3. Arah & Alur Data
- **Request**: `GET/POST /api/user/consultations`, `POST /api/user/consultations/{id}/messages`.
- **Proses**: Simpan ke tabel `consultations` dan `consultation_messages`.
