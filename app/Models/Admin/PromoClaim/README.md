# 🎟️ Model: Promo Claim (`Admin/PromoClaim`)

## 1. File Model
- `PromoClaim.php`: Log validasi dan penukaran voucher diskon/promo oleh pasien.

## 2. Aktor yang Berkomunikasi
- **Pasien**: Memilih kode voucher promo saat booking atau pembayaran.
- **Kasir / Admin**: Memverifikasi eligibilitas promo berdasarkan level membership pasien dan mencatat klaim.

## 3. Arah & Alur Data
- **Kasir/Admin ➔ `PromoClaimController` ➔ Validasi Tier `User::promoEligibleLevel()` ➔ Model `PromoClaim` ➔ Tabel `promo_claims` ➔ Potongan Invoice.**
