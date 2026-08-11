<?php

namespace Database\Seeders;

use App\Models\GalleryItem;
use App\Models\Popup;
use App\Models\Post;
use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        $this->copyImages();
        $this->seedPosts();
        $this->seedPopup();
        $this->seedGalleryItems();
        $this->seedTestimonials();
    }

    private function copyImages(): void
    {
        $maps = [
            public_path('galeri') => storage_path('app/public/galeri'),
            public_path('testi') => storage_path('app/public/testi'),
            public_path('popup') => storage_path('app/public/popup'),
        ];

        foreach ($maps as $source => $dest) {
            if (!is_dir($source)) continue;
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

    private function seedPosts(): void
    {
        $author = User::query()->where('role', 'clinic_admin')->first();

        $posts = [
            [
                'title' => '5 Manfaat Veneer Gigi yang Perlu Anda Ketahui',
                'slug' => 'manfaat-veneer-gigi',
                'excerpt' => 'Veneer gigi bukan hanya tentang estetika. Temukan berbagai manfaat veneer untuk kesehatan dan kepercayaan diri Anda.',
                'category' => 'Estetika',
                'cover_image_path' => 'post/ketahui-manfaat-veneer-gigi-dan-efek-sampingnya-80-1661481823.jpeg',
                'content_html' => '<p>Veneer gigi adalah lapisan tipis (umumnya porselen atau resin komposit) yang ditempelkan pada permukaan depan gigi untuk memperbaiki bentuk, warna, atau proporsi senyum. Perawatan ini sering dipilih karena hasilnya terlihat natural dan dapat mengubah tampilan gigi secara signifikan.</p><h2>Apa Itu Veneer Gigi?</h2><p>Veneer bekerja seperti “kulit” baru untuk gigi. Dokter akan mengevaluasi kondisi gigi, memilih warna yang sesuai, lalu menempelkan veneer menggunakan sistem bonding khusus agar kuat dan menyatu dengan gigi.</p><h2>5 Manfaat Veneer Gigi</h2><h3>1. Memperbaiki Tampilan Gigi yang Tidak Rata</h3><p>Veneer bisa membantu menyamarkan bentuk gigi yang kecil, aus, bergerigi, atau memiliki celah ringan.</p><h3>2. Menyamarkan Perubahan Warna yang Sulit Hilang</h3><p>Untuk noda yang tidak mudah hilang dengan bleaching, veneer dapat menjadi solusi.</p><h3>3. Memberikan Hasil yang Natural</h3><p>Material veneer modern dirancang menyerupai email gigi asli.</p><h3>4. Tahan Lama dengan Perawatan yang Benar</h3><p>Veneer porselen dapat bertahan bertahun-tahun bila dirawat dengan baik.</p><h3>5. Meningkatkan Kepercayaan Diri</h3><p>Senyum yang rapi dan cerah sering kali membuat seseorang lebih percaya diri.</p><h2>Siapa yang Cocok Menggunakan Veneer?</h2><ul><li>Gigi depan dengan noda membandel</li><li>Gigi retak kecil atau tepi gigi terkikis</li><li>Celah kecil antar gigi</li><li>Gigi dengan bentuk tidak proporsional</li></ul><p><strong>Ingin tahu veneer cocok untuk kondisi gigi Anda?</strong> Jadwalkan konsultasi.</p>',
                'reading_time_minutes' => 5,
                'status' => 'published',
                'published_at' => now()->subMonths(4),
                'is_featured' => true,
            ],
            [
                'title' => 'Cara Merawat Gigi Setelah Bleaching agar Tetap Putih',
                'slug' => 'cara-merawat-gigi-setelah-bleaching',
                'excerpt' => 'Setelah melakukan bleaching, perawatan yang tepat sangat penting untuk menjaga hasil pemutihan gigi Anda.',
                'category' => 'Tips',
                'cover_image_path' => 'post/800x600bleaching.webp',
                'content_html' => '<p>Bleaching gigi dapat membuat warna gigi tampak lebih cerah dalam waktu singkat. Namun, hasil bleaching sangat dipengaruhi oleh kebiasaan sehari-hari setelah perawatan.</p><h2>Kenapa Gigi Lebih Rentan Noda Setelah Bleaching?</h2><p>Setelah bleaching, pori-pori mikro pada email gigi bisa lebih “terbuka” sementara waktu.</p><h2>Checklist Perawatan Setelah Bleaching</h2><h3>1. Terapkan “White Diet” 48 Jam Pertama</h3><p>Pilih makanan/minuman berwarna terang dan minim pigmen.</p><h3>2. Gunakan Sedotan untuk Minuman Berpigmen</h3><p>Gunakan sedotan untuk mengurangi kontak langsung dengan permukaan gigi.</p><h3>3. Sikat Gigi dengan Teknik yang Lembut</h3><p>Sikat gigi minimal 2 kali sehari dengan teknik lembut.</p><h3>4. Gunakan Dental Floss</h3><p>Membersihkan sela gigi membantu mempertahankan warna sekaligus menjaga kesehatan gusi.</p><h3>5. Kontrol dan Pembersihan Profesional</h3><p>Lakukan scaling/polishing sesuai jadwal (umumnya setiap 6 bulan).</p><p><strong>Butuh saran perawatan pasca-bleaching?</strong> Konsultasi singkat bisa membantu.</p>',
                'reading_time_minutes' => 4,
                'status' => 'published',
                'published_at' => now()->subMonths(3),
            ],
            [
                'title' => 'Invisalign vs Kawat Gigi: Mana yang Lebih Baik?',
                'slug' => 'invisalign-vs-kawat-gigi',
                'excerpt' => 'Bingung memilih antara Invisalign dan kawat gigi tradisional? Simak perbandingan lengkapnya di sini.',
                'category' => 'Ortodonti',
                'cover_image_path' => 'post/Invisalign-vs-Traditional-Braces.webp',
                'content_html' => '<p>Meratakan gigi bukan hanya soal estetika, tetapi juga fungsi mengunyah, kebersihan, dan kesehatan gusi. Dua pilihan yang sering dibandingkan adalah Invisalign dan kawat gigi tradisional.</p><h2>Perbedaan Utama</h2><ul><li><strong>Invisalign</strong>: menggunakan serangkaian aligner transparan yang dapat dilepas-pasang.</li><li><strong>Kawat gigi</strong>: menggunakan bracket dan kawat yang menempel pada gigi selama perawatan.</li></ul><h2>Kelebihan Invisalign</h2><ul><li>Hampir tidak terlihat saat dipakai</li><li>Dapat dilepas saat makan dan menyikat gigi</li><li>Lebih nyaman bagi sebagian pasien</li></ul><h2>Kelebihan Kawat Gigi Tradisional</h2><ul><li>Efektif untuk berbagai tingkat kompleksitas kasus</li><li>Tidak bergantung pada kedisiplinan pemakaian</li><li>Biaya cenderung lebih terjangkau</li></ul><p><strong>Saran terbaik:</strong> lakukan konsultasi ortodonti agar dokter dapat menentukan pilihan yang paling tepat.</p>',
                'reading_time_minutes' => 6,
                'status' => 'published',
                'published_at' => now()->subMonths(2),
            ],
            [
                'title' => 'Pentingnya Perawatan Gigi Anak Sejak Dini',
                'slug' => 'pentingnya-perawatan-gigi-anak-sejak-dini',
                'excerpt' => 'Membangun kebiasaan perawatan gigi yang baik sejak kecil adalah investasi untuk kesehatan gigi seumur hidup.',
                'category' => 'Anak',
                'cover_image_path' => 'post/Sampul-dental-kids-1536x829.png',
                'content_html' => '<p>Kesehatan gigi anak berpengaruh besar terhadap kenyamanan makan, perkembangan bicara, kualitas tidur, hingga rasa percaya diri.</p><h2>Kapan Perawatan Gigi Anak Harus Dimulai?</h2><ul><li>Mulai sejak <strong>gigi pertama</strong> tumbuh (sekitar usia 6 bulan)</li><li>Kunjungan pertama ke dokter gigi disarankan sebelum usia <strong>1 tahun</strong></li></ul><h2>Kenapa Gigi Susu Harus Dijaga?</h2><ul><li>Membantu makan dan nutrisi</li><li>Mendukung bicara dan pengucapan yang jelas</li><li>Menjaga ruang untuk gigi permanen</li><li>Mencegah infeksi yang dapat memengaruhi gigi permanen di bawahnya</li></ul><h2>Rutinitas Harian yang Disarankan</h2><h3>1. Bersihkan mulut bayi</h3><p>Sebelum gigi tumbuh, bersihkan gusi menggunakan kain lembut yang dibasahi.</p><h3>2. Sikat gigi 2x sehari</h3><p>Gunakan sikat berbulu halus dan ajarkan teknik menyikat yang benar.</p><h3>3. Gunakan pasta gigi berfluoride sesuai usia</h3><h3>4. Batasi makanan/minuman manis</h3><p><strong>Tips praktis:</strong> Jadikan menyikat gigi aktivitas menyenangkan agar anak terbiasa.</p>',
                'reading_time_minutes' => 5,
                'status' => 'published',
                'published_at' => now()->subMonth(),
            ],
            [
                'title' => 'Dental Implant: Solusi Permanen untuk Gigi yang Hilang',
                'slug' => 'dental-implant-solusi-gigi-hilang',
                'excerpt' => 'Dental implant menawarkan solusi permanen dan natural untuk mengganti gigi yang hilang. Pelajari lebih lanjut tentang prosedur ini.',
                'category' => 'Restoratif',
                'cover_image_path' => 'post/Sampul-Implant-1-1-1536x829.png',
                'content_html' => '<p>Kehilangan gigi dapat memengaruhi fungsi mengunyah, bentuk wajah, dan kepercayaan diri. Dental implant adalah solusi modern untuk mengganti gigi yang hilang.</p><h2>Apa Itu Dental Implant?</h2><p>Dental implant adalah “akar gigi” buatan, biasanya terbuat dari titanium, yang ditanam pada tulang rahang. Setelah menyatu, implant akan dipasangi abutment dan mahkota gigi (crown) sehingga tampilannya natural.</p><h2>Keunggulan Dental Implant</h2><ul><li>Stabil dan nyaman saat mengunyah</li><li>Tampilan natural seperti gigi asli</li><li>Menjaga tulang rahang agar tidak menyusut</li><li>Tidak mengganggu gigi sebelah</li><li>Perawatan mudah seperti gigi biasa</li></ul><h2>Tahapan Perawatan</h2><ol><li>Pemeriksaan dan perencanaan</li><li>Pemasangan implant</li><li>Masa penyembuhan</li><li>Pemasangan mahkota</li></ol><p><strong>Ingin tahu apakah Anda kandidat implant?</strong> Konsultasi diperlukan untuk menilai kondisi gusi dan tulang rahang.</p>',
                'reading_time_minutes' => 7,
                'status' => 'published',
                'published_at' => now()->subWeeks(3),
            ],
            [
                'title' => 'Cara Mengatasi Gigi Sensitif yang Mengganggu',
                'slug' => 'mengatasi-gigi-sensitif',
                'excerpt' => 'Gigi sensitif dapat sangat mengganggu aktivitas sehari-hari. Ketahui penyebab dan cara mengatasinya.',
                'category' => 'Tips',
                'cover_image_path' => 'post/Sampul-Veneer-1536x829.png',
                'content_html' => '<p>Gigi sensitif biasanya terasa ngilu saat terkena rangsang dingin, panas, manis, atau asam. Kondisi ini bisa terjadi sesekali, tetapi bila sering kambuh dapat mengganggu aktivitas sehari-hari.</p><h2>Penyebab Umum Gigi Sensitif</h2><ul><li>Penipisan email akibat menyikat terlalu keras</li><li>Gusi turun (resesi) sehingga akar gigi terekspos</li><li>Karies atau retakan halus pada gigi</li><li>Bruxism (kebiasaan menggertakkan gigi)</li><li>Erosi asam dari minuman asam/bersoda</li></ul><h2>Langkah Praktis Mengatasi Gigi Sensitif</h2><h3>1. Gunakan pasta gigi khusus sensitif</h3><h3>2. Ganti sikat gigi menjadi bulu halus</h3><h3>3. Batasi makanan/minuman pemicu</h3><h3>4. Pertimbangkan penggunaan mouthguard bila bruxism</h3><h3>5. Periksa ke dokter gigi bila nyeri menetap</h3><p><strong>Ingin gigi tidak mudah ngilu lagi?</strong> Pemeriksaan singkat membantu mengetahui penyebab utamanya.</p>',
                'reading_time_minutes' => 4,
                'status' => 'published',
                'published_at' => now()->subWeeks(2),
            ],
            [
                'title' => 'Aesthetic Pondok Indah Membuka Layanan Digital Odontogram Baru',
                'slug' => 'layanan-digital-odontogram-baru',
                'excerpt' => 'Kami bangga memperkenalkan teknologi Odontogram Digital terbaru untuk pencatatan rekam medis gigi Anda yang lebih presisi.',
                'category' => 'Informasi',
                'cover_image_path' => 'post/Sampul-Veneer-1536x829.png',
                'content_html' => '<p>Aesthetic Pondok Indah Dental Clinic berkomitmen untuk terus meningkatkan pelayanan kesehatan gigi Anda dengan menghadirkan teknologi medis terdepan. Kali ini, kami meluncurkan fitur **Digital Odontogram** yang terintegrasi secara langsung ke sistem rekam medis Anda.</p><h2>Manfaat Digital Odontogram bagi Pasien</h2><ul><li>Pencatatan kondisi gigi yang jauh lebih cepat dan akurat</li><li>Riwayat penanganan gigi terstruktur dan dapat diakses kapan saja</li><li>Mempermudah dokter gigi dalam menganalisis keluhan jangka panjang Anda</li></ul><p>Semua informasi rekam medis dilindungi dengan protokol keamanan data pasien yang ketat.</p>',
                'reading_time_minutes' => 3,
                'status' => 'published',
                'published_at' => now()->subDays(2),
            ],
        ];

        foreach ($posts as $data) {
            // Keep a cover uploaded by an admin. The previous implementation
            // overwrote every existing cover with null on each deploy/seed.
            $existing = Post::query()->where('slug', $data['slug'])->first();
            $coverImagePath = $existing?->cover_image_path ?: $data['cover_image_path'];

            Post::updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, [
                    'author_id' => $author?->id,
                    'cover_image_path' => $coverImagePath,
                ])
            );
        }
    }

    private function seedPopup(): void
    {
        Popup::updateOrCreate(
            ['title' => 'Welcome Offer'],
            [
                'headline' => 'Mau voucher diskon <strong>10%</strong>?',
                'message' => 'Jangan lewatkan kesempatan—klik tombol di bawah untuk langsung chat admin kami dan klaim penawaran khusus pengguna baru.',
                'button_label' => 'Ambil Kesempatan',
                'image_path' => 'popup/Paket-Implant.png',
                'enabled' => true,
                'starts_at' => now()->subMonth(),
                'ends_at' => now()->addYear(),
            ]
        );
    }

    private function seedGalleryItems(): void
    {
        $items = [
            ['title' => 'Aquacare', 'category' => 'Solusi Dental', 'image_path' => 'galeri/Aquacare-2.png', 'sort_order' => 1],
            ['title' => 'Ruang Anak', 'category' => 'Fasilitas', 'image_path' => 'galeri/Ruang-Anak-2.png', 'sort_order' => 2],
            ['title' => 'Ruang Anak', 'category' => 'Fasilitas', 'image_path' => 'galeri/Ruang-Anak-3.png', 'sort_order' => 3],
            ['title' => 'Scan', 'category' => 'Tindakan Perawatan', 'image_path' => 'galeri/Scan-1-1.png', 'sort_order' => 4],
            ['title' => 'Klinik', 'category' => 'Fasilitas', 'image_path' => 'galeri/clinic-15-2048x1612.jpg', 'sort_order' => 5],
            ['title' => 'Klinik', 'category' => 'Fasilitas', 'image_path' => 'galeri/clinic-17-1-1-2048x1928.jpg', 'sort_order' => 6],
            ['title' => 'Klinik', 'category' => 'Fasilitas', 'image_path' => 'galeri/clinic-2-1-2048x1635.jpg', 'sort_order' => 7],
            ['title' => 'Klinik', 'category' => 'Fasilitas', 'image_path' => 'galeri/clinic-5-2048x1562.jpg', 'sort_order' => 8],
        ];

        foreach ($items as $item) {
            GalleryItem::updateOrCreate(
                ['image_path' => $item['image_path']],
                array_merge($item, ['is_published' => true])
            );
        }
    }

    private function seedTestimonials(): void
    {
        $items = [
            [
                'name' => 'Rezky Aditya',
                'quote' => 'Saya menyukai senyum baru saya berkat veneer di Aesthetic Pondok Indah! Timnya luar biasa, dan hasilnya melebihi ekspektasi saya. Saya tersenyum dengan percaya diri setiap hari.',
                'rating' => 5,
                'photo_path' => 'testi/REZKY-scaled.jpg',
                'sort_order' => 1,
            ],
            [
                'name' => 'Marshanda',
                'quote' => 'Perawatan untuk kesehatan gigi dan mulut di Aesthetic Pondok Indah luar biasa! Dokter gigi tidak hanya memberikan perawatan yang tidak menyakitkan tetapi juga meluangkan waktu untuk mengedukasi saya mengenai teknik perawatan dan pembersihan gigi yang tepat. Sangat direkomendasikan!',
                'rating' => 5,
                'photo_path' => 'testi/MARSHANDA-scaled.jpg',
                'sort_order' => 2,
            ],
            [
                'name' => 'Debby Sahertian',
                'quote' => 'Aesthetic Pondok Indah menawarkan perawatan gigi yang luar biasa untuk semua orang. Dokter giginya profesional, ramah, dan meluangkan waktu untuk mengedukasi pasien tentang kesehatan gigi dan mulut yang baik. Klinik ini terletak di daerah yang strategis, sehingga nyaman untuk dikunjungi. Sangat direkomendasikan untuk perawatan gigi yang nyaman dan berkualitas!',
                'rating' => 5,
                'photo_path' => 'testi/DEBBY-2-scaled.jpg',
                'sort_order' => 3,
            ],
            [
                'name' => 'Mazaya Mania',
                'quote' => 'Sangat menyenangkan! Dokter giginya sangat baik dan saya tidak takut sama sekali. Perawatannya tidak sakit, dan saya bisa bermain di ruang bermain setelahnya. Saya suka pergi ke dokter gigi sekarang!',
                'rating' => 5,
                'photo_path' => 'testi/MAZAYA-scaled.jpg',
                'sort_order' => 4,
            ],
        ];

        foreach ($items as $item) {
            Testimonial::updateOrCreate(
                ['name' => $item['name'], 'sort_order' => $item['sort_order']],
                array_merge($item, ['is_published' => true])
            );
        }
    }
}
