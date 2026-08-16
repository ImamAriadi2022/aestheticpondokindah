# ✉️ Controller: Guest Contact (`Guest/Contact`)

## 1. File Controller
- `ContactPublicController.php`

## 2. Aktor yang Berkomunikasi
- **Tamu**: Mengirim pesan pertanyaan dari form landing page.
- **Admin**: Menerima pesan di inbox panel admin.

## 3. Arah & Alur Data
- **Request**: `POST /api/public/contact`.
- **Proses**: Simpan ke tabel `contact_messages` dengan status `unread`.
