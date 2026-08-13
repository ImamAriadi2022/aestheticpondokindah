<?php

namespace Database\Seeders;

use App\Models\Promo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class PromoSeeder extends Seeder
{
    public function run(): void
    {
        $this->copyImages();

        $promos = [
            [
                'title' => 'Paket Implant Gigi Spesial',
                'slug' => 'paket-implant-gigi-spesial',
                'description' => 'Dapatkan penawaran istimewa untuk dental implant dengan kualitas terbaik. Senyum sempurna dimulai dari fondasi yang kuat.',
                'content_html' => '<p>Dental implant adalah solusi permanen untuk gigi yang hilang. Dengan teknologi modern dan tim dokter berpengalaman, kami menawarkan paket implant dengan harga spesial.</p><h2>Keunggulan Paket Ini</h2><ul><li>Implant berkualitas dengan garansi</li><li>Konsultasi dan perencanaan gratis</li><li>Pemeriksaan CBCT scan</li><li>Free follow-up selama 1 tahun</li></ul><p><strong>Syarat dan ketentuan:</strong> Berlaku untuk pasien baru dan pasien lama. Promo tidak dapat digabung dengan promo lainnya.</p>',
                'category' => 'Platinum',
                'image_path' => 'promos/Paket-Implant.png',
                'button_label' => 'Klaim Promo',
                'contact_whatsapp' => '+6281234567890',
                'is_active' => true,
                'starts_at' => now()->subMonth(),
                'ends_at' => now()->addMonths(2),
                'sort_order' => 1,
            ],
            [
                'title' => 'Diskon 20% Veneer Gigi',
                'slug' => 'diskon-20-veneer-gigi',
                'description' => 'Percantik senyum Anda dengan veneer gigi berkualitas. Diskon 20% untuk pemasangan veneer gigi depan.',
                'content_html' => '<p>Veneer gigi adalah solusi estetika terbaik untuk mempercantik senyum Anda. Dengan material porselen berkualitas, veneer dapat menyamarkan warna, bentuk, dan celah pada gigi.</p><h2>Detail Promo</h2><ul><li>Diskon 20% untuk 8 veneer gigi depan</li><li>Free konsultasi desain senyum</li><li>Gratis pemutihan gigi pasca veneer</li></ul><p>Jangan lewatkan kesempatan ini untuk mendapatkan senyum impian Anda!</p>',
                'category' => 'Platinum',
                'image_path' => 'promos/veneer-gigi.png',
                'button_label' => 'Daftar Sekarang',
                'contact_whatsapp' => '+6281234567890',
                'is_active' => true,
                'starts_at' => now()->subWeeks(2),
                'ends_at' => now()->addMonths(1),
                'sort_order' => 2,
            ],
            [
                'title' => 'Promo Bleaching Gigi Mulai dari 1,5 Juta',
                'slug' => 'promo-bleaching-gigi',
                'description' => 'Pemutihan gigi profesional dengan harga terjangkau. Hasil instan dan aman untuk email gigi Anda.',
                'content_html' => '<p>Bleaching gigi di klinik kami menggunakan bahan pemutih berkualitas yang aman untuk email gigi. Hasil terlihat sejak sesi pertama.</p><h2>Paket Tersedia</h2><ul><li>Bleaching kantor (office bleaching) — Rp 1.500.000</li><li>Bleaching kantor + kit rumah — Rp 2.500.000</li><li>Free scaling sebelum bleaching</li></ul><p>Booking sekarang dan dapatkan senyum lebih cerah!</p>',
                'category' => 'Gold',
                'image_path' => 'promos/bleaching-gigi.png',
                'button_label' => 'Booking Sekarang',
                'contact_whatsapp' => '+6281234567890',
                'is_active' => true,
                'starts_at' => now(),
                'ends_at' => now()->addMonths(3),
                'sort_order' => 3,
            ],
            [
                'title' => 'Free Scaling untuk Anak di Hari Minggu',
                'slug' => 'free-scaling-anak-hari-minggu',
                'description' => 'Perawatan gigi anak jadi lebih menyenangkan! Free scaling untuk anak di bawah 12 tahun setiap hari Minggu.',
                'content_html' => '<p>Kami percaya bahwa kebiasaan perawatan gigi yang baik harus dimulai sejak dini. Klinik kami menyediakan ruang perawatan khusus anak yang nyaman dan menyenangkan.</p><h2>Syarat dan Ketentuan</h2><ul><li>Berlaku untuk anak usia 3–12 tahun</li><li>Hanya berlaku hari Minggu</li><li>Wajib reservasi minimal H-1</li><li>Termasuk eduksi sikat gigi dan fluoridasi</li></ul><p>Ajak si kecil untuk perawatan gigi tanpa takut!</p>',
                'category' => 'Bronze',
                'image_path' => 'promos/scaling-anak.png',
                'button_label' => 'Reservasi Anak',
                'contact_whatsapp' => '+6281234567890',
                'is_active' => true,
                'starts_at' => now()->subWeek(),
                'ends_at' => now()->addMonths(6),
                'sort_order' => 4,
            ],
            [
                'title' => 'Paket Invisalign Lite Hemat 15%',
                'slug' => 'paket-invisalign-lite-hemat-15',
                'description' => 'Rapikan gigi tanpa kawat dengan Invisalign Lite. Diskon 15% untuk perawatan ortodonti transparan.',
                'content_html' => '<p>Invisalign Lite adalah pilihan ideal untuk perbaikan gigi ringan hingga sedang. Dengan aligner transparan, Anda bisa merapikan gigi tanpa terlihat sedang memakai kawat.</p><h2>Yang Didapat dalam Paket</h2><ul><li>14 set aligner</li><li>Free retainer pasca perawatan</li><li>Konsultasi tracking progress via aplikasi</li><li>Cicilan 0% hingga 6 bulan</li></ul><p>Konsultasi sekarang untuk simulasi senyum gratis!</p>',
                'category' => 'Platinum',
                'image_path' => 'promos/invisalign-lite.png',
                'button_label' => 'Konsultasi Gratis',
                'contact_whatsapp' => '+6281234567890',
                'is_active' => true,
                'starts_at' => now()->subDays(5),
                'ends_at' => now()->addMonths(2),
                'sort_order' => 5,
            ],
        ];

        foreach ($promos as $data) {
            Promo::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }

    private function copyImages(): void
    {
        $source = public_path('popup');
        $dest = storage_path('app/public/promos');

        if (!is_dir($source)) {
            return;
        }

        if (!file_exists($dest)) {
            mkdir($dest, 0755, true);
        }

        foreach (File::files($source) as $file) {
            $target = $dest . '/' . $file->getFilename();
            if (!file_exists($target)) {
                copy($file->getRealPath(), $target);
            }
        }
    }
}
