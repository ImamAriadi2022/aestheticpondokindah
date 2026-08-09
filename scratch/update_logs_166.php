<?php

$filePath = 'public/activity_log.json';

$newLog = [
    "id" => "act-166",
    "date" => "2026-08-09",
    "time" => "19:30",
    "category" => "Frontend | UX/UI | Reservation",
    "type" => "Feature",
    "feature" => "Pemberian Time Picker & Date Selection UI pada Fitur Reservasi Guest",
    "description" => "Memperbarui antarmuka pemilihan jadwal reservasi pasien guest pada BookingNew.tsx, Header.tsx, dan HeroSection.tsx. Memisahkan pemilihan Tanggal Periksa dan Jam Periksa ke dalam format Time Picker interaktif dengan tombol shortcut cepat (Hari Ini, Besok, Lusa, +3 Hari) serta Grid Slot Jam Periksa (Sesi Pagi, Siang, Sore/Malam) dan kustom time input.",
    "notes" => "1. BookingNew.tsx: Menambahkan Quick Date Shortcut Chips (Hari Ini, Besok, Lusa, +3 Hari) dan Grid Jam Periksa interaktif berdasarkan sesi (🌅 Pagi 09:00-11:30, ☀️ Siang 13:00-15:30, 🌙 Sore 16:00-19:00 WIB) plus kustom input time.\n2. Header.tsx & HeroSection.tsx: Memisahkan field 'Pilih Waktu' lama menjadi 2 field terpisah: 📅 Pilih Tanggal (type=date) & ⏰ Pilih Jam (Time Pick dropdown 09:00-19:00 WIB).\n3. Diverifikasi dengan npx tsc --noEmit (0 errors) & npm run build sukses disajikan ke public/.",
    "reason" => "Meningkatkan User Experience (UX) calon pasien dalam memilih tanggal dan jam reservasi secara terpisah dan intuitif.",
    "files" => [
        "frontend-web/src/features/guest/reservation/pages/BookingNew.tsx",
        "frontend-web/src/core/layouts/Header.tsx",
        "frontend-web/src/features/guest/home/components/HeroSection.tsx",
        "public/activity_log.json"
    ],
    "before_progress" => 99,
    "after_progress" => 100,
    "status" => "🟢 Complete",
    "author" => "Antigravity AI | Developer"
];

if (file_exists($filePath)) {
    $content = file_get_contents($filePath);
    $logs = json_decode($content, true) ?: [];
    array_unshift($logs, $newLog);
    file_put_contents($filePath, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    echo "Updated $filePath successfully!\n";
}
