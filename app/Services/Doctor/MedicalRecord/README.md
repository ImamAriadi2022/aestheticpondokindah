# 📋 Service: EMR & SOAP (`Doctor/MedicalRecord`)

## 1. File Service
- `MedicalRecordService.php`: Siklus hidup EMR, finalisasi, dan penguncian (*locking*).
- `SoapService.php`: Pengelolaan catatan SOAP (Subjective, Objective, Assessment, Plan).

## 2. Aktor yang Terlibat
- **Dokter**: Menginput anamnesis, temuan klinis objektif, asesmen, rencana terapi, lalu mengunci EMR agar tidak dapat diubah (kepatuhan medikolegal).

## 3. Arah & Alur Logika Data
- **Input SOAP**: `SoapService::saveSoap` ➔ Validasi struktur JSON ➔ Simpan ke tabel `soap_notes`.
- **Finalisasi & Lock**: `MedicalRecordService::lockRecord` ➔ Validasi kelengkapan SOAP, diagnosis, dan tindakan ➔ Status: `locked` ➔ Kunci permanen.
