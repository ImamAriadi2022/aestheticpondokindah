# 💬 Service: Telekonsultasi (`Shared/Consultation`)

## 1. File Service
- `ConsultationService.php`

## 2. Aktor yang Terlibat
- **Tamu / Pasien**: Membuka konsultasi baru, mengirim pesan obrolan, mengunggah foto kondisi gigi, dan bergabung ke link video meeting.
- **Dokter**: Menerima penugasan (*assign*), memulai konsultasi (*start*), mengirim balasan medis, membuat link Google Meet, dan menyelesaikan sesi (*complete*).
- **Administrator Klinik**: Memonitor antrean tiket konsultasi dan memindahkan (*transfer*) konsultasi ke dokter yang sedang bertugas.

## 3. Arah & Alur Logika Data
- **Inisiasi Konsultasi**: Pasien/Tamu membuat tiket ➔ `ConsultationService::createConsultation` ➔ Generate Token Akses / User ID ➔ Status: `pending` / `assigned`.
- **Pengiriman Pesan**: `ConsultationService::sendMessage` ➔ Simpan ke tabel `consultation_messages` ➔ Update `last_message_at` ➔ Notifikasi ke lawan bicara.
- **Penyelesaian**: Dokter klik selesai ➔ `ConsultationService::completeConsultation` ➔ Status berubah `completed` ➔ Pasien diberi opsi buat reservasi klinik.
