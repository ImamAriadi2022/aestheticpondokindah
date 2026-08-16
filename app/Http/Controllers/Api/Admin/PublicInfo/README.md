# ℹ️ Controller: Admin Public Info (`Admin/PublicInfo`)

## 1. File Controller
- `ClinicServiceAdminController.php`: CRUD katalog layanan gigi.
- `FaqAdminController.php`: CRUD tanya jawab umum.
- `ContactMessageAdminController.php`: Manajemen pesan masuk form kontak.
- `AboutAdminController.php`: Profil & sejarah klinik.
- `LegalAdminController.php`: Kebijakan privasi dan syarat ketentuan.

## 2. Aktor yang Berkomunikasi
- **Administrator Klinik**: Memperbarui informasi publik secara real-time melalui CMS Admin.
- **Tamu / Publik**: Membaca informasi terbaru di landing page.

## 3. Arah & Alur Data
- **Admin Input ➔ Controllers PublicInfo ➔ Tabel `clinic_services`, `faqs`, `contact_messages`, `clinic_settings` ➔ Public Landing Page.**
