# 🔗 Domain Model: Shared

Menyimpan entitas inti yang berelasi dengan banyak domain dan menjadi fondasi utama sistem.

## 📁 Subfolder & File Model:
- **`User/User.php`**: Entitas autentikasi utama (Admin, Dokter, Pasien) dengan relasi lengkap ke reservasi, rekam medis, konsultasi, dan membership.
- **`Branch/Branch.php`**: Cabang fisik klinik gigi.
- **`Reservation/Reservation.php` & `ReservationAudit.php`**: Janji temu perawatan gigi beserta log riwayat perubahannya.
- **`Consultation/Consultation.php`, `ConsultationMessage.php`, `ConsultationMeeting.php`**: Sesi telekonsultasi, pesan obrolan, dan jadwal video call.
