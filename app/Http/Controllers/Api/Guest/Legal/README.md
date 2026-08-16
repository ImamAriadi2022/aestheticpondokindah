# ⚖️ Controller: Guest Legal (`Guest/Legal`)

## 1. File Controller
- `LegalPublicController.php`

## 2. Aktor yang Berkomunikasi
- **Tamu / Pasien**: Membaca dokumen hukum resmi klinik: Kebijakan Privasi (`privacy`) dan Syarat Ketentuan Layanan (`terms`).

## 3. Arah & Alur Data
- **Request**: `GET /api/public/legal/{type}` (`type`: `privacy` atau `terms`).
- **Response**: JSON teks hukum resmi dan tanggal revisi terbaru.
