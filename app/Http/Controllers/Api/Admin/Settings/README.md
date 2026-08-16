# ⚙️ Controller: Admin Settings (`Admin/Settings`)

## 1. File Controller
- `ClinicSettingAdminController.php`

## 2. Aktor yang Berkomunikasi
- **Administrator Klinik**: Membaca dan memperbarui konfigurasi sistem.
- **Tamu / Pasien**: Menerima dampak pengaturan (WhatsApp CS baru, perubahan jam operasional, dll.).

## 3. Arah & Alur Data
- **Request**: `GET /api/admin/clinic-settings`, `PUT /api/admin/clinic-settings/{key}`.
- **Proses**: Simpan konfigurasi ke tabel `clinic_settings`.
- **Response**: JSON status konfigurasi terbaru.
