# 🦷 Service: Visual Odontogram (`Doctor/Odontogram`)

## 1. File Service
- `OdontogramService.php`

## 2. Aktor yang Terlibat
- **Dokter**: Memetakan kondisi anatomis 32 gigi pasien secara interaktif.
- **Pasien**: Melihat representasi grafis kondisi giginya di rekam medis.

## 3. Arah & Alur Logika Data
- **Update Gigi**: `OdontogramService::updateToothState` ➔ Validasi nomor gigi (11-48 FDI World Dental Federation notation) ➔ Simpan kondisi permukaan (Oklusal, Mesial, Distal, Bukal/Labial, Palatal/Lingual) ke tabel `tooth_states`.
