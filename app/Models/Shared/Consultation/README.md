# 💬 Model: Consultation (`Shared/Consultation`)

## 1. File Model
- `Consultation.php`: Sesi telekonsultasi gigi online (bisa dimulai oleh Tamu via token atau Pasien terdaftar).
- `ConsultationMessage.php`: Pesan obrolan teks dan lampiran foto kondisi gigi.
- `ConsultationMeeting.php`: Tautan video call tatap muka (Google Meet) dengan dokter.

## 2. Aktor yang Berkomunikasi
- **Tamu / Pasien**: Membuka konsultasi, mengirim keluhan, mengunggah foto gigi, dan mengobrol dengan dokter.
- **Dokter**: Membaca keluhan, memberikan edukasi, mengirim pesan, dan membuat tautan video call.
- **Admin**: Memantau antrean konsultasi, memindahkan tiket ke dokter yang tersedia, atau menutup sesi.

## 3. Arah & Alur Data
- **Pasien Kirim Chat ➔ `ConsultationMessageController` ➔ Model `ConsultationMessage` ➔ Tabel `consultation_messages` ➔ Dokter Membaca & Membalas ➔ Pasien Menerima Respons Realtime.**
