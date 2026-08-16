# 👤 Domain Model: Patient

Menyimpan model data terkait akun pasien, profil kesehatan personal, loyalitas keanggotaan, serta tagihan.

## 📁 Subfolder & File Model:
- **`Profile/UserProfile.php` & `UserDeviceToken.php`**: Data pelengkap pasien (pekerjaan, riwayat merokok/kopi) dan token push notification.
- **`Membership/`**:
  - `MembershipProfile.php`: Kuisioner kondisi gigi dan kebiasaan pasien.
  - `MembershipPoint.php`: Mutasi saldo poin loyalty (reward reservasi & review).
  - `MembershipHistory.php`: Log upgrade/downgrade level membership (Bronze, Gold, Platinum).
  - `MembershipTransaction.php`: Transaksi pembayaran upgrade level membership via Midtrans.
- **`Billing/Invoice.php` & `Payment.php`**: Tagihan pembayaran biaya perawatan dan bukti transfer.
- **`Complaint/Complaint.php`**: Tiket pengaduan layanan pasien.
- **`Notification/Notification.php`**: Notifikasi notifikasi in-app untuk pasien.
