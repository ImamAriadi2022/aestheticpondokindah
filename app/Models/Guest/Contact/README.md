# ✉️ Model: Contact Message (`Guest/Contact`)

## 1. File Model
- `ContactMessage.php`: Kotak masuk pesan dan pertanyaan dari form kontak website.

## 2. Aktor yang Berkomunikasi
- **Tamu**: Mengisi nama, email, nomor HP, subjek, dan pertanyaan di form kontak.
- **Admin**: Membaca pesan, membalas via WhatsApp/Email, dan mencatat catatan tindak lanjut.

## 3. Arah & Alur Data
- **Form Kontak Publik ➔ `ContactPublicController` ➔ Model `ContactMessage` ➔ Tabel `contact_messages` ➔ `ContactMessageAdminController` ➔ Notifikasi Inbox Admin.**
