# 👑 Model: Membership & Points (`Patient/Membership`)

## 1. File Model
- `MembershipProfile.php`: Profil kriteria membership dan survei kesehatan gigi pasien.
- `MembershipPoint.php`: Riwayat saldo dan transaksi poin loyalitas pasien.
- `MembershipHistory.php`: Log riwayat perubahan level tier keanggotaan.
- `MembershipTransaction.php`: Transaksi pembayaran upgrade level membership via Midtrans.

## 2. Aktor yang Berkomunikasi
- **Pasien**: Mengumpulkan poin, melakukan redeem voucher, dan mengajukan upgrade level (Gold / Platinum).
- **Admin**: Menyetujui upgrade manual, memvalidasi bukti pembayaran, dan melihat laporan analitik.
- **Midtrans Payment Gateway**: Mengirim notifikasi webhook status pembayaran otomatis.

## 3. Arah & Alur Data
- **Pasien Bayar Upgrade ➔ Midtrans Webhook ➔ `MembershipPaymentController` ➔ Model `MembershipTransaction` & `MembershipHistory` ➔ Update Tier `User::membership_level`.**
