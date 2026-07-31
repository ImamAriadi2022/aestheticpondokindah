## Aesthetic Pondok Indah

Repository ini memisahkan aplikasi web, API, dan mobile:

- `frontend-web/` — React + Vite web application.
- root repository — Laravel API (`artisan`, `composer.json`, `app/`, `routes/`, dan `vendor/`).
- `mobile-native/` — React Native application yang independen.

### Menjalankan web frontend

```bash
cd frontend-web
npm install
npm run dev
```

Build dari `frontend-web/` menghasilkan aset ke `../public_html/`, sehingga
alur deployment yang ada tetap kompatibel. Lihat [arsitektur frontend](docs/ARCHITECTURE.md).

### Menjalankan Laravel API

```bash
php artisan serve
```

Endpoint API production tersedia pada `/api`; file pengguna tersedia pada `/storage`.
