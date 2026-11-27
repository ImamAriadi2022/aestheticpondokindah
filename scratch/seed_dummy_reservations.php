<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Shared\Reservation\Reservation;

$data = [
    ['name' => 'Siti Rahmawati', 'phone' => '081234567890', 'treatment' => 'Scaling & Pembersihan Karang Gigi', 'doctor_id' => 3, 'date' => '2026-11-23', 'time' => '10:00', 'status' => 'Selesai'],
    ['name' => 'Dimas Wicaksono', 'phone' => '081398765432', 'treatment' => 'Bleaching / Whitening Gigi', 'doctor_id' => 4, 'date' => '2026-11-24', 'time' => '13:30', 'status' => 'Selesai'],
    ['name' => 'Clara Anindita', 'phone' => '082155443322', 'treatment' => 'Konsultasi Behel Gigi (Ortodonti)', 'doctor_id' => 11, 'date' => '2026-11-25', 'time' => '09:00', 'status' => 'Dikonfirmasi'],
    ['name' => 'Reza Fahlevi', 'phone' => '085711223344', 'treatment' => 'Tambal Estetik Gigi Depan', 'doctor_id' => 13, 'date' => '2026-11-25', 'time' => '14:00', 'status' => 'Dikonfirmasi'],
    ['name' => 'Nadia Amanda', 'phone' => '081288776655', 'treatment' => 'Perawatan Saluran Akar (Endodonti)', 'doctor_id' => 14, 'date' => '2026-11-26', 'time' => '11:00', 'status' => 'Baru'],
    ['name' => 'Budi Santoso', 'phone' => '087899887766', 'treatment' => 'Pencabutan Gigi Bungsu (Odontektomi)', 'doctor_id' => 15, 'date' => '2026-11-27', 'time' => '15:30', 'status' => 'Baru'],
    ['name' => 'Maya Kartika', 'phone' => '081312345678', 'treatment' => 'Veneer Porselen Estetik', 'doctor_id' => 7, 'date' => '2026-11-28', 'time' => '10:30', 'status' => 'Baru'],
    ['name' => 'Hendro Prasetyo', 'phone' => '085698761234', 'treatment' => 'Pemeriksaan Rutin & Dental Spa', 'doctor_id' => 5, 'date' => '2026-11-29', 'time' => '16:00', 'status' => 'Baru'],
];

foreach ($data as $i => $d) {
    Reservation::create([
        'code' => 'RSV-2611' . str_pad($i + 1, 3, '0', STR_PAD_LEFT),
        'name' => $d['name'],
        'phone' => $d['phone'],
        'treatment_interest' => $d['treatment'],
        'doctor_id' => $d['doctor_id'],
        'date' => $d['date'],
        'preferred_time' => $d['time'],
        'branch_name' => 'Aesthetic Pondok Indah Main Branch',
        'source' => $i % 2 === 0 ? 'guest_web_flow' : 'member_app',
        'status' => $d['status'],
        'payment_status' => $d['status'] === 'Selesai' ? 'Sudah Bayar' : 'Belum Bayar',
        'complaint' => 'Reservasi janji temu ' . $d['treatment'],
    ]);
}

echo "Berhasil menambahkan 8 data dummy reservasi mingguan!\n";
