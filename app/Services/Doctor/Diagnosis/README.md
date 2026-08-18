# 🔍 Service: Diagnosis ICD-10 (`Doctor/Diagnosis`)

## 1. File Service
- `DiagnosisService.php`

## 2. Aktor yang Terlibat
- **Dokter**: Menetapkan diagnosis primer/sekunder pasien berdasarkan standar klasifikasi penyakit ICD-10.

## 3. Arah & Alur Logika Data
- **Pencarian Kode**: `DiagnosisService::searchIcd10` ➔ Query teks / kode pada tabel `icd10_codes`.
- **Penetapan Diagnosis**: `DiagnosisService::assignDiagnosis` ➔ Hubungkan dengan `medical_record_id` ➔ Simpan ke tabel `diagnoses`.
