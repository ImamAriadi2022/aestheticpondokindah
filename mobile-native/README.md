# Aesthetic Pondok Indah — Native Android Application

Aplikasi Android Native untuk **Aesthetic Pondok Indah Dental Clinic** yang dibangun menggunakan **React Native + Expo**.

Aplikasi ini adalah frontend client tambahan yang terhubung ke backend Laravel yang sudah ada di:
`https://aestheticpondokindah.com/backend/public/api`

---

## 📁 Struktur Folder

```
mobile-native/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout (AuthProvider)
│   ├── (auth)/
│   │   ├── _layout.tsx     # Auth guard (redirect jika sudah login)
│   │   └── login.tsx       # Halaman Login
│   ├── (tabs)/
│   │   ├── _layout.tsx     # Tab Navigator (5 tabs)
│   │   ├── index.tsx       # Home / Dashboard
│   │   ├── booking.tsx     # Janji Temu
│   │   ├── membership.tsx  # Membership & Poin
│   │   ├── notifications.tsx # Notifikasi
│   │   └── profile.tsx     # Profil & Pengaturan
│   ├── article/[id].tsx    # Detail Artikel
│   └── membership/
│       └── upgrade.tsx     # Upgrade Membership
├── services/
│   ├── apiClient.ts        # HTTP client terpusat
│   ├── authService.ts      # Login, logout, me
│   ├── membershipService.ts
│   ├── bookingService.ts
│   ├── notificationService.ts
│   └── contentService.ts
├── storage/
│   ├── authStorage.ts      # SecureStore token
│   └── cacheStorage.ts     # AsyncStorage TTL cache
├── context/
│   └── AuthContext.tsx     # Global auth state + auto-login
├── types/
│   ├── auth.ts
│   ├── membership.ts
│   └── booking.ts
├── theme/
│   └── colors.ts           # Brand design system
├── constants/
│   └── api.ts              # API_BASE + ENDPOINTS
├── app.json                # Expo config
├── eas.json                # EAS Build config
└── babel.config.js
```

---

## 🚀 Setup & Development

### Prerequisites

- Node.js >= 18
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- Expo Go app di Android (untuk preview)

### Install Dependencies

```bash
cd mobile-native
npm install
```

### Development (Expo Go)

```bash
npm start
# Scan QR code dengan Expo Go di Android
```

### Development (Android Emulator)

```bash
npm run android
# Memerlukan Android Studio dan AVD terinstall
```

---

## 📱 Build APK

### Preview APK (via EAS Cloud — Gratis)

```bash
# Login EAS
eas login

# Build APK untuk testing
eas build --platform android --profile preview
```

### Production APK

```bash
eas build --platform android --profile production
```

APK dapat diunduh dari dashboard EAS setelah build selesai.

---

## 🔑 API Configuration

Development (Android Emulator): `http://10.0.2.2:8000/api`
Production: `https://aestheticpondokindah.com/backend/public/api`

Konfigurasi ada di `constants/api.ts`.

---

## ✨ Features

| Feature | Status | API Endpoint |
|---|---|---|
| Login / Auto-login | ✅ | `POST /auth/login` |
| Home Dashboard | ✅ | Multiple |
| Kirim permintaan Janji Temu | ✅ | `POST /public/reservations` |
| Membership Card | ✅ | `GET /membership` |
| Membership Upgrade | ✅ | `POST /membership/upgrade` |
| Notifikasi | ✅ | `GET /notifications` |
| Profil | ✅ | `GET /auth/me` |
| Artikel Detail | ✅ | `GET /posts/{id}` |
| Pull-to-Refresh | ✅ | All screens |
| Offline Cache | ✅ | AsyncStorage TTL |
| Token Auto-inject | ✅ | All protected routes |
| 401 Auto-logout | ✅ | apiClient.ts |
| FCM Push Notification | 🟡 Setup ready | Device token registration |

---

## 🛡️ Security

- Token Sanctum disimpan di **Expo SecureStore** (Keychain/Keystore level)
- Cache non-sensitif disimpan di AsyncStorage dengan TTL expiry
- Header sensitif tidak pernah di-log

## Catatan kontrak backend

Native client hanya menggunakan endpoint yang tersedia pada `backend/routes/api.php`.
Booking pasien memakai kontrak publik yang sama dengan PWA:
`POST /public/reservations` dengan `name`, `phone`, `complaint`, dan tanggal opsional.
Backend belum menyediakan endpoint riwayat booking per pasien; halaman riwayat native
tidak boleh dianggap selesai sampai kontrak tersebut tersedia atau arsitektur PWA berubah.

---

## 📋 Known Limitations

- **FCM Push Notification**: Memerlukan Firebase project dan `google-services.json` di folder `android/app/`. Setup ready tapi belum dikonfigurasi karena memerlukan Firebase credentials.
- **Android APK Signing**: Memerlukan keystore yang dibuat via `eas credentials` sebelum production build.
- **iOS**: Tidak termasuk dalam scope (iOS memerlukan macOS).
- **Riwayat booking pasien, Gallery, Banner, dan Profile Settings**: Belum dipindahkan ke native app.
