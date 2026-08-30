# Zesta API Documentation

## Send Message API

API ini digunakan untuk mengirim pesan WhatsApp secara otomatis dari aplikasi atau sistem eksternal melalui Zesta.

API dapat digunakan untuk berbagai kebutuhan, seperti:

* Notifikasi transaksi
* OTP
* Informasi tagihan
* Status pesanan
* Informasi pengiriman
* Notifikasi lainnya

Setiap pesan yang dikirim melalui API ini akan tercatat di **API Broadcasts**.

---

## Endpoint

```http
POST https://api.zesta.id/api/external/messages/send
```

---

## Authentication

Setiap request wajib menyertakan API Key Zesta pada header `X-API-Key`.

API Key dapat dibuat melalui menu **API Keys** dan harus memiliki permission:

```text
messages:send
```

### Headers

| Header         | Type     | Required | Description                                                                        |
| -------------- | -------- | -------: | ---------------------------------------------------------------------------------- |
| `X-API-Key`    | `string` |      Yes | API Key yang dibuat melalui menu API Keys. Membutuhkan permission `messages:send`. |
| `Content-Type` | `string` |      Yes | Harus menggunakan `application/json`.                                              |

### Example

```http
X-API-Key: zsk_your_api_key_here
Content-Type: application/json
```

---

# Request Body

Request body harus menggunakan format JSON.

## Parameters

| Field               | Type       |      Required | Description                                                                                                                                       |
| ------------------- | ---------- | ------------: | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `phone`             | `string`   |  Conditional* | Nomor telepon tujuan. Format bebas, misalnya `+6281234567890`. Jika kontak belum tersedia di Zesta, sistem akan otomatis membuat kontak tersebut. |
| `customerId`        | `string`   |  Conditional* | ID Customer di Zesta. Gunakan parameter ini jika aplikasi Anda menyimpan ID customer Zesta di database.                                           |
| `name`              | `string`   |            No | Nama pelanggan. Digunakan ketika sistem membuat kontak baru dan nomor telepon belum terdaftar.                                                    |
| `messageTemplateId` | `string`   | Conditional** | ID atau nama Meta Template yang sudah di-approve. ID template dapat dilihat pada URL ketika melakukan edit template.                              |
| `text`              | `string`   | Conditional** | Pesan bebas yang akan dikirim jika tidak menggunakan template.                                                                                    |
| `channelId`         | `string`   |            No | UUID channel WhatsApp tertentu. Gunakan parameter ini jika akun memiliki lebih dari satu channel WhatsApp.                                        |
| `variables`         | `string[]` |            No | Array string untuk mengisi variabel pada template seperti `{{1}}`, `{{2}}`, dan seterusnya.                                                       |
| `buttons`           | `object[]` |            No | Parameter dinamis untuk button pada template, misalnya Dynamic URL.                                                                               |

### Conditional Parameters

* **Penerima pesan**

Request harus memiliki salah satu dari:

```text
phone
```

atau

```text
customerId
```

Dengan kata lain:

```text
phone OR customerId
```

** **Isi pesan**

Request harus memiliki salah satu dari:

```text
messageTemplateId
```

atau

```text
text
```

Dengan kata lain:

```text
messageTemplateId OR text
```

---

# Sending Messages with a Template

Gunakan `messageTemplateId` jika ingin mengirim pesan menggunakan Meta WhatsApp Template yang sudah di-approve.

Template dapat memiliki variable seperti:

```text
{{1}}
{{2}}
{{3}}
```

Nilai variable dikirim melalui parameter `variables`.

## Example Template

Misalnya template WhatsApp Anda adalah:

```text
Halo {{1}}, tagihan Anda sebesar {{2}} dan jatuh tempo pada {{3}}.
```

Request dapat dikirim menggunakan:

```json
{
  "phone": "+6281234567890",
  "name": "Budi Santoso",
  "messageTemplateId": "tpl_abc123xyz",
  "variables": [
    "Budi Santoso",
    "Rp 250.000",
    "15 April 2026"
  ]
}
```

Pesan yang diterima pelanggan:

```text
Halo Budi Santoso, tagihan Anda sebesar Rp 250.000 dan jatuh tempo pada 15 April 2026.
```

---

## Template with Dynamic Button

Jika template memiliki dynamic button, gunakan parameter `buttons`.

### Example

```json
{
  "phone": "+6281234567890",
  "name": "Budi Santoso",
  "messageTemplateId": "tpl_abc123xyz",
  "variables": [
    "Budi Santoso",
    "Rp 250.000",
    "15 April 2026"
  ],
  "buttons": [
    {
      "subType": "url",
      "text": "inv-20260415-001"
    }
  ]
}
```

Parameter `text` pada button digunakan sebagai nilai dinamis untuk button yang telah dikonfigurasi pada template.

---

# Complete cURL Example

```bash
curl -X POST https://api.zesta.id/api/external/messages/send \
-H "X-API-Key: zsk_your_api_key_here" \
-H "Content-Type: application/json" \
-d '{
  "phone": "+6281234567890",
  "name": "Budi Santoso",
  "messageTemplateId": "tpl_abc123xyz",
  "channelId": "uuid-channel-anda-disini",
  "variables": [
    "Budi Santoso",
    "Rp 250.000",
    "15 April 2026"
  ],
  "buttons": [
    {
      "subType": "url",
      "text": "inv-20260415-001"
    }
  ]
}'
```

---

# Sending Free Text Messages

Jika tidak menggunakan Meta WhatsApp Template, Anda dapat mengirim pesan secara langsung menggunakan parameter `text`.

## Example Request

```json
{
  "phone": "+6281234567890",
  "name": "Budi Santoso",
  "text": "Halo Budi, terima kasih telah berbelanja di toko kami! Pesanan Anda sedang diproses."
}
```

## cURL Example

```bash
curl -X POST https://api.zesta.id/api/external/messages/send \
-H "X-API-Key: zsk_your_api_key_here" \
-H "Content-Type: application/json" \
-d '{
  "phone": "+6281234567890",
  "name": "Budi Santoso",
  "text": "Halo Budi, terima kasih telah berbelanja di toko kami! Pesanan Anda sedang diproses."
}'
```

---

# Using `customerId`

Jika aplikasi Anda sudah menyimpan ID customer Zesta, Anda dapat menggunakan `customerId` sebagai pengganti `phone`.

### Example

```json
{
  "customerId": "cmr_123456789",
  "text": "Halo Budi, pesanan Anda sudah diproses."
}
```

Dengan pendekatan ini, Anda tidak perlu mengirim nomor telepon setiap kali mengirim pesan selama customer tersebut sudah terdaftar di Zesta.

---

# Using `channelId`

Jika akun Zesta memiliki lebih dari satu channel WhatsApp, gunakan `channelId` untuk menentukan channel yang digunakan untuk mengirim pesan.

### Example

```json
{
  "phone": "+6281234567890",
  "messageTemplateId": "tpl_abc123xyz",
  "channelId": "uuid-channel-anda-disini",
  "variables": [
    "Budi Santoso"
  ]
}
```

Jika `channelId` tidak diberikan, sistem akan menggunakan channel yang sesuai berdasarkan konfigurasi Zesta.

---

# Success Response

Jika pesan berhasil diproses, API akan mengembalikan response berikut:

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "customerId": "cmr_123456789",
    "campaignId": "cmp_987654321"
  }
}
```

## Response Parameters

| Field             | Type      | Description                                               |
| ----------------- | --------- | --------------------------------------------------------- |
| `success`         | `boolean` | Menunjukkan apakah request berhasil diproses.             |
| `message`         | `string`  | Pesan status dari API.                                    |
| `data.customerId` | `string`  | ID customer yang terkait dengan pesan.                    |
| `data.campaignId` | `string`  | ID campaign/broadcast yang dibuat untuk pengiriman pesan. |

---

# Message Flow

Secara umum, proses pengiriman pesan melalui API adalah:

```text
┌─────────────────────┐
│   External App      │
│  / Your Application │
└──────────┬──────────┘
           │
           │ POST /api/external/messages/send
           │ X-API-Key
           ▼
┌─────────────────────┐
│     Zesta API       │
└──────────┬──────────┘
           │
           │ Process Message
           ▼
┌─────────────────────┐
│  WhatsApp Channel   │
└──────────┬──────────┘
           │
           │ WhatsApp Message
           ▼
┌─────────────────────┐
│      Customer       │
└─────────────────────┘
```

Pesan yang dikirim melalui API juga dicatat di **API Broadcasts** sehingga aktivitas pengiriman dapat dilacak melalui sistem Zesta.

---

# Use Cases

## OTP

```json
{
  "phone": "+6281234567890",
  "text": "Kode OTP Anda adalah 483921. Jangan berikan kode ini kepada siapa pun."
}
```

## Order Notification

```json
{
  "phone": "+6281234567890",
  "text": "Halo Budi, pesanan #INV-001 sedang diproses."
}
```

## Invoice Notification

```json
{
  "phone": "+6281234567890",
  "messageTemplateId": "invoice_notification",
  "variables": [
    "Budi Santoso",
    "Rp 250.000",
    "15 April 2026"
  ]
}
```

---

# Request Rules

Sebelum mengirim request, pastikan:

* `X-API-Key` valid.
* API Key memiliki permission `messages:send`.
* `Content-Type` menggunakan `application/json`.
* Salah satu `phone` atau `customerId` tersedia.
* Salah satu `messageTemplateId` atau `text` tersedia.
* Jika menggunakan template, jumlah dan urutan `variables` sesuai dengan variable pada template.
* Jika menggunakan dynamic button, struktur `buttons` sesuai dengan konfigurasi template.

---

# Quick Reference

### Endpoint

```text
POST https://api.zesta.id/api/external/messages/send
```

### Authentication

```text
X-API-Key: <YOUR_API_KEY>
```

### Recipient

```text
phone OR customerId
```

### Message

```text
messageTemplateId OR text
```

### Template Variables

```json
{
  "variables": [
    "Variable 1",
    "Variable 2",
    "Variable 3"
  ]
}
```

### Dynamic Button

```json
{
  "buttons": [
    {
      "subType": "url",
      "text": "dynamic-value"
    }
  ]
}
```
