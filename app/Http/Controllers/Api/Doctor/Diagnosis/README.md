# 🔍 Controller: Doctor Diagnosis (`Doctor/Diagnosis`)

## 1. File Controller
- `DiagnosisController.php`

## 2. Aktor yang Berkomunikasi
- **Dokter**: Mencari referensi kode ICD-10 gigi dan menetapkan diagnosis primer/sekunder pasien.
- **Pasien**: Mengetahui diagnosis penyakit giginya.

## 3. Arah & Alur Data
- **Request**: `GET /api/icd10?q=...`, `POST /api/doctor/medical-records/{id}/diagnoses`.
- **Proses**: Simpan diagnosis ke tabel `diagnoses`.
