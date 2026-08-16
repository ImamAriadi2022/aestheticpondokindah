# 💬 Controller: Doctor Consultation (`Doctor/Consultation`)

## 1. File Controller
- `DoctorConsultationController.php`: Penerimaan sesi telekonsultasi, penanganan, dan penyelesaian konsultasi.
- `ConsultationMessageController.php`: Kirim dan terima pesan obrolan pasien-dokter.
- `ConsultationMeetingController.php`: Pembuatan dan manajemen tautan Google Meet video call.

## 2. Aktor yang Berkomunikasi
- **Dokter**: Merespons chat keluhan pasien, memberi advis medis, dan mengadakan telekonsultasi video.
- **Pasien / Tamu**: Berkomunikasi langsung dengan dokter.

## 3. Arah & Alur Data
- **Chat & Video Exchange ➔ Controller ➔ Tabel `consultation_messages`, `consultation_meetings`, `consultations` ➔ Notifikasi Realtime.**
