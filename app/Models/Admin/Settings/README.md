# ⚙️ Model: Clinic Settings (`Admin/Settings`)

## 1. File Model
- `ClinicSetting.php`: Konfigurasi global sistem berupa key-value pair JSON.

## 2. Aktor yang Berkomunikasi
- **Administrator Klinik**: Memperbarui nomor CS WhatsApp, syarat & ketentuan, biaya default layanan, jam kerja.
- **Seluruh Sistem & Pasien**: Membaca setting aktif untuk kontak, integrasi payment gateway, dan kebijakan klinik.

## 3. Arah & Alur Data
- **Admin Update ➔ `ClinicSettingAdminController` ➔ Model `ClinicSetting` ➔ Tabel `clinic_settings` ➔ Public API Cache ➔ Frontend UI.**
