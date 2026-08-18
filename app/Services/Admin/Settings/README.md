# ⚙️ Service: Clinic Settings (`Admin/Settings`)

## 1. File Service
- `ClinicSettingAdminService.php`

## 2. Aktor yang Terlibat
- **Administrator Klinik**: Memperbarui konfigurasi sistem.
- **Seluruh Sistem**: Membaca parameter operasional aktif.

## 3. Arah & Alur Logika Data
- **Update Setting** ➔ `ClinicSettingAdminService::updateKey` ➔ Upsert ke tabel `clinic_settings` ➔ Mengembalikan objek setting terbaru.
