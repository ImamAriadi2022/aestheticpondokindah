<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Guest\Service\ClinicService;
use Illuminate\Support\Str;

class ClinicServiceSeeder extends Seeder
{
    /**
     * Seed initial booking & clinic services.
     */
    public function run(): void
    {
        $services = [
            [
                'title' => 'Dental Whitening',
                'slug' => 'dental-whitening',
                'category' => 'Estetik',
                'price' => 1500000,
                'duration' => '60–90 mnt',
                'image' => '/layanan/Dental Whitening.png',
                'intro' => 'Perawatan pemutihan gigi profesional untuk senyum lebih cerah dan percaya diri.',
                'paragraphs' => [
                    'Seiring berjalannya waktu, gigi dapat mengalami perubahan warna akibat konsumsi kopi, teh, merokok, atau penuaan alami.',
                    'Di Aesthetic Pondok Indah, kami menggunakan bahan pemutih klinis bersertifikasi internasional dengan teknologi LED cold-light untuk hasil maksimal dengan sensitivitas minimal.',
                ],
                'steps' => [
                    'Pemeriksaan klinis dan pemetaan shade warna awal gigi.',
                    'Pemasangan pelindung gusi (gingival barrier).',
                    'Aplikasi gel pemutih medis dan aktivasi lampu LED dental.',
                    'Pembersihan akhir dan aplikasi gel pereda sensitivitas.',
                ],
                'general_dentists' => ['drg. Yulita Dora', 'drg. Ryan Jusuf', 'drg. Della Sparringa'],
                'specialist_label' => 'Cosmetic Dentist Specialist:',
                'specialist_names' => ['drg. Ryan Jusuf', 'drg. Yulita Dora'],
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Scaling & Polishing',
                'slug' => 'scaling-polishing',
                'category' => 'Umum',
                'price' => 450000,
                'duration' => '30–45 mnt',
                'image' => '/layanan/Oral Care.png',
                'intro' => 'Pembersihan karang gigi menyeluruh dan pemolesan untuk mencegah masalah gusi dan bau mulut.',
                'paragraphs' => [
                    'Karang gigi yang menumpuk tidak dapat dibersihkan hanya dengan sikat gigi biasa dan berisiko memicu radang gusi (gingivitis) hingga periodontitis.',
                    'Teknologi ultrasonic scaler kami mengangkat karang gigi dengan getaran halus yang nyaman dan aman bagi enamel gigi.',
                ],
                'steps' => [
                    'Pemeriksaan kesehatan rongga mulut dan deteksi plak/karang gigi.',
                    'Pembersihan plak dan karang gigi supra & subgingiva dengan alat ultrasonic.',
                    'Pemolesan permukaan gigi dengan pasta profilaksis (polishing).',
                    'Edukasi teknik menyikat gigi dan penggunaan dental floss.',
                ],
                'general_dentists' => ['drg. Achmad Riwandy', 'drg. Della Sparringa', 'drg. Ryan Jusuf'],
                'specialist_label' => 'Periodontics & Preventive Dentist:',
                'specialist_names' => ['drg. Eric Sulistio, Sp. Perio'],
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Dental Implants',
                'slug' => 'dental-implants',
                'category' => 'Implan',
                'price' => 12000000,
                'duration' => '90–120 mnt',
                'image' => '/layanan/Dental Implants.png',
                'intro' => 'Solusi permanen untuk mengganti gigi yang hilang dengan teknologi implan titanium presisi tinggi.',
                'paragraphs' => [
                    'Implan gigi memberikan kekuatan gigitan dan estetika yang paling mendekati gigi alami Anda, mencegah penyusutan tulang rahang.',
                    'Prosedur dipandu oleh computed tomography (CBCT 3D) dan dikerjakan oleh dokter spesialis bedah mulut & periodonsia.',
                ],
                'steps' => [
                    'Rontgen 3D CBCT dan perencanaan digital surgical guide.',
                    'Penanaman fixture implan titanium grade medis ke dalam tulang rahang.',
                    'Masa osseointegrasi (penyatuan tulang dan implan).',
                    'Pemasangan abutment dan crown mahkota porselen permanen.',
                ],
                'general_dentists' => ['drg. Yudy Ardila Utomo, Sp.BMM', 'drg. Eric Sulistio, Sp. Perio'],
                'specialist_label' => 'Oral Surgeon & Periodontist:',
                'specialist_names' => ['drg. Yudy Ardila Utomo, Sp.BMM, Subsp.I.DM.(K)', 'drg. Eric Sulistio, Sp. Perio'],
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'title' => 'Invisalign & Clear Aligners',
                'slug' => 'invisalign',
                'category' => 'Ortodonti',
                'price' => 18000000,
                'duration' => '45–60 mnt',
                'image' => '/layanan/Invisalign.png',
                'intro' => 'Perataan gigi transparan tanpa behel kawat konvensional, nyaman, higienis, dan nyaris tak terlihat.',
                'paragraphs' => [
                    'Invisalign menggunakan rangkaian aligner transparan custom berteknologi SmartTrack yang dirancang dengan simulasi 3D ClinCheck.',
                    'Dapat dilepas saat makan dan menyikat gigi, menjaga kenyamanan dan gaya hidup aktif Anda.',
                ],
                'steps' => [
                    'Pemindaian digital intraoral 3D iTero tanpa cetak konvensional.',
                    'Simulasi visual pergerakan gigi 3D dari awal hingga senyum sempurna.',
                    'Pencetakan seri aligner custom original dari aligner lab.',
                    'Kontrol berkala setiap 6-8 minggu untuk evaluasi progres.',
                ],
                'general_dentists' => ['drg. Sharah Syam, Sp. Ort', 'drg. Yulita Dora'],
                'specialist_label' => 'Certified Invisalign Provider:',
                'specialist_names' => ['drg. Sharah Syam, Sp. Ort'],
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'title' => 'Porcelain Veneers',
                'slug' => 'veneers',
                'category' => 'Estetik',
                'price' => 4500000,
                'duration' => '90 mnt',
                'image' => '/layanan/Veneers.png',
                'intro' => 'Lapisan porselen tipis presisi tinggi untuk memperbaiki warna, bentuk, dan susunan estetika gigi.',
                'paragraphs' => [
                    'Veneer porselen E-Max memberikan kilau alami, kekuatan tinggi, serta ketahanan luar biasa terhadap noda makanan dan minuman.',
                    'Dirancang secara artistik sesuai proporsi wajah dan karakter senyum pasien.',
                ],
                'steps' => [
                    'Analisis Digital Smile Design (DSD) dan konsultasi bentuk gigi.',
                    'Preparasi minimal pada enamel gigi dan pembuatan cetak presisi.',
                    'Pemasangan veneer sementara (mock-up).',
                    'Sementasi permanen veneer porselen dan evaluasi oklusi.',
                ],
                'general_dentists' => ['drg. Yulita Dora', 'drg. Melati Putri, Sp. Pros'],
                'specialist_label' => 'Prosthodontist & Aesthetic Specialist:',
                'specialist_names' => ['drg. Melati Putri, Sp. Pros', 'drg. Yulita Dora'],
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'title' => 'Root Canal Treatments',
                'slug' => 'root-canal-treatments',
                'category' => 'Umum',
                'price' => 2500000,
                'duration' => '60–90 mnt',
                'image' => '/layanan/Root Canal Treatments.png',
                'intro' => 'Perawatan saluran akar untuk mengatasi infeksi saraf gigi dan menyelamatkan gigi asli dari pencabutan.',
                'paragraphs' => [
                    'Ketika infeksi mencapai pulpa gigi, perawatan endodontik mikroskopik adalah prosedur terbaik untuk meredakan nyeri dan mempertahankan gigi asli.',
                ],
                'steps' => [
                    'Pemeriksaan rontgen periapikal digital untuk mengukur panjang saluran akar.',
                    'Pembersihan dan sterilisasi jaringan saraf yang terinfeksi menggunakan rotary endo files.',
                    'Pengisian saluran akar dengan bahan hermetis biocompatible.',
                    'Restorasi akhir dengan penambalan estetik atau mahkota porselen.',
                ],
                'general_dentists' => ['drg. Pramodanti Jiwanakusuma, Sp.KG', 'drg. Riesta Paluvi, Sp.KG'],
                'specialist_label' => 'Endodontic Specialist:',
                'specialist_names' => ['drg. Pramodanti Jiwanakusuma, Sp.KG', 'drg. Riesta Paluvi, Sp.KG'],
                'sort_order' => 6,
                'is_active' => true,
            ],
            [
                'title' => 'Pediatric Dentistry',
                'slug' => 'pediatric-dentistry',
                'category' => 'Pediatrik',
                'price' => 350000,
                'duration' => '30–45 mnt',
                'image' => '/layanan/Pediatric Dentistry.png',
                'intro' => 'Pemeriksaan dan penanganan gigi ramah anak dengan pendekatan edukatif yang menyenangkan tanpa rasa takut.',
                'paragraphs' => [
                    'Dokter gigi anak kami terlatih secara khusus untuk menciptakan suasana yang menyenangkan, ramah, dan bebas trauma bagi si kecil.',
                ],
                'steps' => [
                    'Sesi perkenalan ramah (Tell-Show-Do) dengan dokter gigi.',
                    'Pemeriksaan gigi susu, aplikasi fluoride pencegah gigi berlubang.',
                    'Penambalan gigi anak atau fissure sealant jika diperlukan.',
                    'Pemberian reward dan edukasi sikat gigi interaktif.',
                ],
                'general_dentists' => ['drg. Della Sparringa', 'drg. Shilvy'],
                'specialist_label' => 'Pediatric Dentist:',
                'specialist_names' => ['drg. Della Sparringa'],
                'sort_order' => 7,
                'is_active' => true,
            ],
            [
                'title' => 'Dental Extraction and Wisdom Tooth Removal',
                'slug' => 'dental-extraction-wisdom-tooth-removal',
                'category' => 'Bedah Mulut',
                'price' => 2000000,
                'duration' => '45–60 mnt',
                'image' => '/layanan/Dental Extraction and Wisdom Teeth Removal.png',
                'intro' => 'Pencabutan dan operasi odontektomi gigi bungsu dengan pembiusan lokal steril, minim rasa sakit, dan cepat pulih.',
                'paragraphs' => [
                    'Gigi bungsu miring (impaksi) dapat menyebabkan kerusakan pada gigi tetangga, infeksi gusi, dan sakit kepala berulang.',
                ],
                'steps' => [
                    'Pemeriksaan foto panoramik / CBCT untuk melihat posisi saraf gigi.',
                    'Anestesi lokal presisi tanpa rasa sakit.',
                    'Pengambilan gigi impaksi dengan teknik bedah mikro minimal invasif.',
                    'Penjahitan luka dan pemberian instruksi pasca operasi lengkap.',
                ],
                'general_dentists' => ['drg. Yudy Ardila Utomo, Sp.BMM'],
                'specialist_label' => 'Oral & Maxillofacial Surgeon:',
                'specialist_names' => ['drg. Yudy Ardila Utomo, Sp.BMM, Subsp.I.DM.(K)'],
                'sort_order' => 8,
                'is_active' => true,
            ],
            [
                'title' => 'Full Mouth Rehabilitations',
                'slug' => 'full-mouth-rehabilitations',
                'category' => 'Estetik',
                'price' => 25000000,
                'duration' => '90–120 mnt',
                'image' => '/layanan/Full Mouth Rehabilitations.png',
                'intro' => 'Rekonstruksi menyeluruh fungsi kunyah, sendi rahang (TMJ), dan estetika senyum secara komprehensif.',
                'paragraphs' => [
                    'Solusi komprehensif untuk pasien dengan keausan gigi berat, kehilangan banyak gigi, atau ketidakseimbangan gigitan.',
                ],
                'steps' => [
                    'Analisis sendi rahang TMJ dan oklusi fungsional.',
                    'Simulasi mock-up dan perbaikan dimensi vertikal gigitan.',
                    'Kombinasi implan, crown, bridge, dan restorasi porselen.',
                    'Evaluasi fungsi kunyah dan stabilitas jangka panjang.',
                ],
                'general_dentists' => ['drg. Melati Putri, Sp. Pros', 'drg. Achmad Riwandy'],
                'specialist_label' => 'Prosthodontist Specialist:',
                'specialist_names' => ['drg. Melati Putri, Sp. Pros'],
                'sort_order' => 9,
                'is_active' => true,
            ],
            [
                'title' => 'Orthodontics (Conventional Braces)',
                'slug' => 'orthodontics',
                'category' => 'Ortodonti',
                'price' => 8500000,
                'duration' => '60 mnt',
                'image' => '/layanan/Orthodontics.png',
                'intro' => 'Perawatan behel metal dan keramik estetik untuk merapikan susunan gigi dan memperbaiki gigitan.',
                'paragraphs' => [
                    'Tersedia pilihan behel metal konvensional, behel keramik transparan, dan sistem self-ligating Damon.',
                ],
                'steps' => [
                    'Pemeriksaan sefalometri dan cetak digital analisis ortodonti.',
                    'Pemasangan bracket presisi pada permukaan gigi.',
                    'Pemasangan kawat NiTi dan karet elastis.',
                    'Kontrol berkala setiap 3-4 minggu.',
                ],
                'general_dentists' => ['drg. Sharah Syam, Sp. Ort', 'drg. Yulita Dora'],
                'specialist_label' => 'Orthodontist Specialist:',
                'specialist_names' => ['drg. Sharah Syam, Sp. Ort'],
                'sort_order' => 10,
                'is_active' => true,
            ],
            [
                'title' => 'Dental Spa',
                'slug' => 'dental-spa',
                'category' => 'Estetik',
                'price' => 650000,
                'duration' => '45–60 mnt',
                'image' => '/layanan/Dental Spa.png',
                'intro' => 'Pengalaman relaksasi pembersihan karang gigi dengan airflow teknologi Swiss dan terapi aromaterapi.',
                'paragraphs' => [
                    'Sensasi perawatan gigi yang rileks, bebas ngilu, dan menghilangkan stain kopi/teh secara tuntas.',
                ],
                'steps' => [
                    'Pemeriksaan awal dengan intraoral camera.',
                    'Pembersihan noda stain dengan Airflow powder halus.',
                    'Pembersihan karang gigi dengan piezon gentle scaler.',
                    'Aplikasi serum pelindung enamel rasa mint/buah.',
                ],
                'general_dentists' => ['drg. Ryan Jusuf', 'drg. Della Sparringa'],
                'specialist_label' => 'Aesthetic Dental Therapist:',
                'specialist_names' => ['drg. Ryan Jusuf'],
                'sort_order' => 11,
                'is_active' => true,
            ],
            [
                'title' => 'Dental Fillings, Inlays & Onlays',
                'slug' => 'dental-fillings-inlays-onlays',
                'category' => 'Umum',
                'price' => 650000,
                'duration' => '45 mnt',
                'image' => '/layanan/Dental Fillings, Inlays & Onlays.png',
                'intro' => 'Penambalan gigi estetik menggunakan komposit nano-hybrid dan restorasi keramik inlay/onlay.',
                'paragraphs' => [
                    'Mengembalikan struktur gigi yang berlubang dengan warna yang menyatu sempurna dengan gigi asli.',
                ],
                'steps' => [
                    'Pembersihan jaringan karies/lubang gigi.',
                    'Aplikasi bonding agent generasi terbaru.',
                    'Penambalan komposit berlapis dan penyinaran LED.',
                    'Finishing dan pemolesan mengkilap alami.',
                ],
                'general_dentists' => ['drg. Achmad Riwandy', 'drg. Riesta Paluvi, Sp.KG'],
                'specialist_label' => 'Conservative Dentist:',
                'specialist_names' => ['drg. Riesta Paluvi, Sp.KG'],
                'sort_order' => 12,
                'is_active' => true,
            ],
        ];

        foreach ($services as $data) {
            ClinicService::query()->updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }
}
