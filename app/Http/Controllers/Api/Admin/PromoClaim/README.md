# 🎟️ Controller: Admin Promo Claim (`Admin/PromoClaim`)

## 1. File Controller
- `PromoClaimController.php`

## 2. Aktor yang Berkomunikasi
- **Kasir / Admin**: Mencari pasien berdasarkan nama/WhatsApp, mengecek eligibilitas voucher promo, dan mencatat klaim promo yang digunakan.
- **Pasien**: Menikmati potongan diskon saat pembayaran invoice.

## 3. Arah & Alur Data
- **Request**: `GET /api/admin/users/search`, `GET /api/admin/users/{user}/promo-eligibility`, `POST /api/admin/users/{user}/claim-promo`.
- **Proses**: Cek level membership pasien ➔ Simpan log klaim ke tabel `promo_claims`.
