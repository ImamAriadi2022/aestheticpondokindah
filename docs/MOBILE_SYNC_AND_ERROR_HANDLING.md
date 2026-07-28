# Panduan Sinkronisasi Data Mobile & Mobile Error Handling — Aesthetic Pondok Indah

Dokumen ini menjelaskan arsitektur **Sinkronisasi Data Terpusat** dan **Penanganan Error Mobile** yang digunakan oleh seluruh halaman mobile dalam aplikasi.

---

## 1. MobileSyncManager (`mobileSyncManager.ts`)

Kelas singleton terpusat yang menangani sinkronisasi data di seluruh siklus hidup aplikasi:

### Channel Sinkronisasi yang Didukung:
- `profile` — Perubahan profil pengguna.
- `membership` — Perubahan tier & saldo poin membership.
- `appointments` — Perubahan jadwal reservasi.
- `notifications` — Perubahan notifikasi & unread count.
- `settings` — Perubahan preferensi aplikasi.
- `all` — Siaran sinkronisasi ke seluruh halaman.

### Fitur:
- **Pub/Sub Pattern**: Setiap halaman mobile dapat `subscribe` dan `unsubscribe` dari event sinkronisasi tanpa coupling langsung antar komponen.
- **Deduplikasi Event**: Mencegah event sinkronisasi ganda dalam window 2 detik menggunakan `MIN_SYNC_INTERVAL_MS`.
- **App Lifecycle**: Otomatis memicu `syncAll()` saat dokumen kembali ke foreground (`visibilitychange: visible`).
- **Online Recovery**: Mendeteksi `window.online` event dan memicu sinkronisasi data lengkap secara otomatis.
- **Offline Detection**: Mendeteksi `window.offline` dan menyampaikan notifikasi ramah.

### Contoh Penggunaan:
```typescript
// Di halaman yang mengeluarkan mutation:
import { mobileSyncManager } from "@/react-app/lib/mobileSyncManager";
mobileSyncManager.notify("membership"); // Trigger resync di semua subscriber

// Di halaman yang ingin mendengarkan:
useEffect(() => {
  const unsubscribe = mobileSyncManager.subscribe((channel) => {
    if (channel === "all" || channel === "appointments") {
      loadData(); // Refresh data lokal
    }
  });
  return () => unsubscribe();
}, []);
```

---

## 2. PullToRefresh (`PullToRefresh.tsx`)

Komponen gesture-based pull-down refresh untuk halaman mobile:

- Mendukung gesture sentuh (`touchstart`, `touchmove`, `touchend`).
- Threshold **70px** sebelum aksi refresh terpicu.
- Memperlihatkan animasi indicator bertuliskan "Tarik untuk Memperbarui" → "Lepaskan untuk Memperbarui" → "Memperbarui Data...".
- Terintegrasi dengan `mobileSyncManager.syncAll(true)` sebagai handler refresh.

### Halaman yang Mendukung Pull to Refresh:
- `MobileHome.tsx`
- `MobileBooking.tsx`
- `MobileRiwayat.tsx`

---

## 3. Skeleton Loading (`Skeleton.tsx`)

Komponen skeleton placeholder untuk standar loading indicator pada seluruh tampilan mobile, menggantikan spinner tunggal dengan animasi shimmer gradient yang lebih estetis.

---

## 4. Mobile Error Handling (Terpusat via `apiClient.ts`)

Seluruh error API mobile ditangani terpusat melalui `apiClient.ts`:

| HTTP Status | Pesan ke Pengguna |
|---|---|
| 400 | Permintaan tidak valid. |
| 401 | Sesi Anda telah berakhir → Auto logout + redirect login. |
| 403 | Anda tidak memiliki hak akses. |
| 404 | Data tidak ditemukan. |
| 409 | Konflik data. |
| 422 | Data tidak valid (Laravel validation). |
| 429 | Terlalu banyak permintaan. |
| 500 | Kesalahan server. |
| 502/503/504 | Server sedang pemeliharaan. |
| Network Error | Koneksi internet terputus. |
| Timeout | Waktu permintaan berakhir. |

---

## 5. Retry Strategy

Hanya request GET yang di-retry secara otomatis (1x retry, exponential backoff).

POST, PUT, PATCH, DELETE **tidak** di-retry secara otomatis untuk mencegah duplikasi mutasi data.

---

## 6. Known Limitations

- **Native Android Push**: Memerlukan Flutter / React Native SDK untuk push notification asli ke device bukan browser.
- **Background Sync di iOS Safari**: Service Worker Background Sync tidak fully supported di iOS. Menggunakan polling terbatas sebagai fallback.
