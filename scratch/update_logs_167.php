<?php

$filePath = 'public/activity_log.json';

$newLog = [
    "id" => "act-167",
    "date" => "2026-08-09",
    "time" => "19:43",
    "category" => "Frontend | UX/UI | Reservation",
    "type" => "Refactor",
    "feature" => "Refactor Pemilihan Tanggal & Jam Reservasi Pasien ke Murni Calendar Date Picker & Time Picker Dropdown",
    "description" => "Menghapus seluruh tampilan card grid (tombol tanggal horizontal & slot jam berbentuk card) sesuai instruksi pengguna. Mengganti antarmuka dengan kontrol Calendar Date Picker (input date resmi yang membuka tampilan kalender interaktif browser/OS saat diklik) dan Time Picker Dropdown (dropdown pilihan jam periksa 09:00 - 19:00 WIB yang dikelompokkan berdasarkan sesi pagi, siang, dan sore/malam + kustom time picker).",
    "notes" => "1. DesktopReservasi.tsx (Dashboard User Step 3): Dirombak total menjadi form card bersih dengan kontrol Calendar Date Picker & Dropdown Time Picker.\n2. BookingNew.tsx: Dirombak menjadi kontrol Calendar Date Picker & Dropdown Time Picker.\n3. Diverifikasi dengan npx tsc --noEmit (0 errors) & npm run build sukses disajikan ke public/.",
    "reason" => "Memenuhi permintaan pengguna untuk pengalaman memilih tanggal melalui kalender interaktif dan memilih jam via dropdown / time picker murni tanpa card grid.",
    "files" => [
        "frontend-web/src/features/patient/reservation/components/DesktopReservasi.tsx",
        "frontend-web/src/features/guest/reservation/pages/BookingNew.tsx",
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
