<?php

$filePath = 'public/activity_log.json';

$newLog = [
    "id" => "act-168",
    "date" => "2026-08-09",
    "time" => "19:53",
    "category" => "Frontend | Feature | Reservation",
    "type" => "Feature",
    "feature" => "Sinkronisasi Real-Time Jadwal Praktik Dokter & Validasi Ketersediaan Reservasi",
    "description" => "Menyinkronkan fitur tanggal dan jam periksa pada DesktopReservasi.tsx dan BookingNew.tsx dengan data API jadwal praktik dokter (getPublicDoctorSchedules). Menambahkan kartu status jadwal dokter real-time (Indikator 'Jadwal Dokter Tersedia' / 'Tidak Ada Praktik'), peringatan otomatis jika pasien memilih jam di luar jam praktik (misalnya di luar 09:00 - 17:00 WIB) atau pada tanggal yang tidak tersedia, serta melakukan disable otomatis pada tombol 'Lanjut Ke Konfirmasi' & submit.",
    "notes" => "1. DesktopReservasi.tsx: Menambahkan `scheduleStatus` useMemo untuk mengecek rentang jam praktik (timeRange) & tanggal dokter secara presisi. Menampilkan badge status hijau/merah dan men-disable navigasi konfirmasi jika di luar jam praktik.\n2. BookingNew.tsx: Menambahkan sinkronisasi `selectedDoctorObj` & `scheduleStatus`, serta pencegahan submit formulir jika jadwal yang dipilih di luar praktik dokter.\n3. Diverifikasi dengan npx tsc --noEmit (0 errors) & npm run build sukses disajikan ke public/.",
    "reason" => "Memastikan janji temu pasien selalu valid dan sinkron dengan jam kerja aktual dokter agar tidak terjadi bentrok reservasi di luar jam praktik.",
    "files" => [
        "frontend-web/src/features/patient/reservation/components/DesktopReservasi.tsx",
        "frontend-web/src/features/guest/reservation/pages/BookingNew.tsx",
        "deploy.sh",
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
