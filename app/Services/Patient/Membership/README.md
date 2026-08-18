# 👑 Service: Keanggotaan Pasien (`Patient/Membership`)

## 1. File Service
- `MembershipService.php`: Kalkulasi progres tier membership, reward poin, penukaran voucher diskon, dan benefit level.
- `MembershipActivationService.php`: Event listener aktivasi level membership pasca-pembayaran berhasil.

## 2. Aktor yang Terlibat
- **Pasien**: Mengumpulkan poin dari transaksi, redeem reward, dan mengajukan upgrade tier.
- **Admin**: Menyetujui permohonan upgrade manual.
- **Midtrans Payment Gateway**: Notifikasi pembayaran otomatis.

## 3. Arah & Alur Logika Data
- **Kalkulasi Progres**: `MembershipService::getProgressToNextLevel` ➔ Hitung total belanja ➔ Bandingkan ambang batas (Gold: Rp 5 Jt, Platinum: Rp 15 Jt) ➔ Kembalikan persentase progres.
- **Aktivasi Tier**: Pembayaran Lunas ➔ `MembershipActivationService::activateTier` ➔ Update `users.membership_level` ➔ Tambahkan poin bonus reward ➔ Kirim notifikasi selamat.
