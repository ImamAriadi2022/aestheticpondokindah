# 🦷 Controller: Doctor Procedure (`Doctor/Procedure`)

## 1. File Controller
- `ProcedureController.php`

## 2. Aktor yang Berkomunikasi
- **Dokter**: Mencari tindakan gigi dari katalog master dan mencatat tindakan medis yang dilakukan pada gigi pasien.
- **Kasir / Billing**: Menerima daftar tindakan untuk kalkulasi biaya.

## 3. Arah & Alur Data
- **Request**: `GET /api/procedure-catalog`, `POST /api/doctor/medical-records/{id}/procedures`.
- **Proses**: Simpan tindakan ke tabel `clinical_procedures`.
