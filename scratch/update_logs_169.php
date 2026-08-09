<?php

$filePath = 'public/activity_log.json';

$newLog = [
    "id" => "act-169",
    "date" => "2026-08-09",
    "time" => "19:57",
    "category" => "Frontend | Feature | Reservation",
    "type" => "Feature",
    "feature" => "Fitur Filtering Dokter Spesialis Berdasarkan Tanggal Jadwal Ready",
    "description" => "Menambahkan fitur penyaringan (filtering) dokter spesialis pada Langkah 2 (Pilih Dokter Spesialis) berdasarkan tanggal jadwal praktik dokter. Dilengkapi dengan Pencarian Nama/Lokasi, Picker Kalender Filter Tanggal, dan Chip Pintas Tanggal ('Semua Tanggal', 'Hari Ini', 'Besok', 'Lusa'). Saat pasien memilih filter tanggal, daftar dokter akan langsung tersaring sesuai ketersediaan jadwal pada tanggal tersebut.",
    "notes" => "1. DesktopReservasi.tsx: Menambahkan state doctorSearch, doctorFilterDate, dan useMemo filteredDoctorSchedules.\n2. Menambahkan Date Picker Filter + Chip Pintas ('Semua Tanggal', 'Hari Ini', 'Besok', 'Lusa') serta empty state ramah saat dokter tidak berpraktik pada tanggal filter tertentu.\n3. Ketika dokter dipilih setelah difilter, parameter &date=doctorFilterDate otomatis diteruskan ke Langkah 3 (Pilih Tanggal & Jam).\n4. Kompilasi tsc 0 error & npm run build sukses di public/.",
    "reason" => "Memudahkan pasien menemukan dokter spesialis yang siap berpraktik pada tanggal yang mereka harapkan secara cepat dan fleksibel.",
    "files" => [
        "frontend-web/src/features/patient/reservation/components/DesktopReservasi.tsx",
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
    // Remove previous act-169 if exists
    $logs = array_values(array_filter($logs, fn($l) => ($l['id'] ?? '') !== 'act-169'));
    array_unshift($logs, $newLog);
    file_put_contents($filePath, json_encode($logs, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    echo "Updated $filePath successfully!\n";
}
