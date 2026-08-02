# Konfigurasi Plesk yang wajib

Untuk deployment ini, Git repository tetap dideploy ke `httpdocs`, tetapi
**Document root** domain harus diarahkan ke `httpdocs/public`.

1. Buka **Websites & Domains** → domain `aestheticpondokindah.com`.
2. Pilih **Hosting Settings**.
3. Ubah **Document root** dari `httpdocs` menjadi `httpdocs/public`.
4. Simpan dengan **OK/Apply**, lalu jalankan **Deploy now** pada Git repository.

Jangan mengarahkan document root ke `httpdocs/public_html` dan jangan memakai
`BACKEND_INSIDE_PUBLIC_HTML`; keduanya adalah struktur deployment lama.

Dengan setting ini, Nginx/Plesk akan menjalankan Laravel melalui
`public/index.php` untuk `/api/*`, sedangkan `index.html`, `/assets/*`, dan
gambar tetap dilayani sebagai file statis. Folder `.env`, `app`, `vendor`, dan
`storage` tidak lagi berada dalam document root.
