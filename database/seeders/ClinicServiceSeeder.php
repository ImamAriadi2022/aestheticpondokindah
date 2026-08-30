<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Guest\Service\ClinicService;
use Illuminate\Support\Str;

class ClinicServiceSeeder extends Seeder
{
    /**
     * Seed clinic services from layanan.json and maintain flagship packages.
     */
    public function run(): void
    {
        $jsonPath = base_path('layanan.json');
        if (!file_exists($jsonPath)) {
            $jsonPath = dirname(base_path()) . '/layanan.json';
        }

        $items = [];
        if (file_exists($jsonPath)) {
            $raw = file_get_contents($jsonPath);
            $json = json_decode($raw, true);
            $items = $json['layanan'] ?? [];
        }

        $usedSlugs = [];
        $order = 1;

        // Process all 181 items from layanan.json
        foreach ($items as $item) {
            $name = trim($item['nama_prosedur'] ?? '');
            if ($name === '') continue;

            $price = (float) ($item['total_harga'] ?? 0);
            $meta = $this->determineServiceMeta($name, $price);

            $baseSlug = Str::slug($name);
            $slug = $baseSlug;
            $count = 1;
            while (isset($usedSlugs[$slug])) {
                $count++;
                $slug = "{$baseSlug}-{$count}";
            }
            $usedSlugs[$slug] = true;

            ClinicService::query()->updateOrCreate(
                ['title' => $name],
                [
                    'slug' => $slug,
                    'category' => $meta['category'],
                    'price' => $price,
                    'duration' => $meta['duration'],
                    'image' => $meta['image'],
                    'intro' => $meta['intro'],
                    'paragraphs' => $meta['paragraphs'],
                    'steps' => $meta['steps'],
                    'general_dentists' => $meta['general_dentists'],
                    'specialist_label' => $meta['specialist_label'],
                    'specialist_names' => $meta['specialist_names'],
                    'sort_order' => $order++,
                    'is_active' => true,
                ]
            );
        }
    }

    private function determineServiceMeta(string $name, float $price): array
    {
        $lower = strtolower($name);

        // 1. Ortodonti / Behel / Aligner
        if (Str::contains($lower, ['orto', 'ortho', 'braces', 'bracket', 'invisalign', 'klar', 'twin block', 'retainer', 'expander', 'aligner', 'ties', 'windowing'])) {
            return [
                'category' => 'Ortodonti',
                'duration' => '45–60 mnt',
                'image' => Str::contains($lower, ['invisalign', 'klar', 'aligner']) ? '/layanan/Invisalign.webp' : '/layanan/Orthodontics.webp',
                'intro' => "Layanan perawatan ortodonti profesional {$name} untuk merapikan susunan gigi dan memperbaiki oklusi rahang.",
                'paragraphs' => [
                    "Perawatan {$name} dirancang khusus untuk mengoreksi posisi gigi yang tidak rata, renggang, atau berjejal demi senyum harmonis.",
                    "Ditangani langsung oleh tim dokter gigi spesialis ortodonti bersertifikasi dengan alat dan material standar internasional."
                ],
                'steps' => [
                    'Pemeriksaan klinis, foto rontgen sefalometri/panoramik, dan pencetakan model studi.',
                    'Pemasangan atau penyesuaian piranti ortodonti sesuai rencana perawatan.',
                    'Edukasi pemeliharaan kebersihan mulut dan penjadwalan kontrol rutin.'
                ],
                'general_dentists' => ['drg. Yulita Dora', 'drg. Della Sparringa'],
                'specialist_label' => 'Dokter Spesialis Ortodonti (Sp.Ort):',
                'specialist_names' => ['drg. Ryan Jusuf', 'drg. Yulita Dora'],
            ];
        }

        // 2. Estetik Dental (Veneer, Whitening, Bleaching)
        if (Str::contains($lower, ['veneer', 'veener', 'whitening', 'bleaching', 'estetik', 'diamond', 'smile', 'gummy', 'ablation'])) {
            return [
                'category' => 'Estetik Dental',
                'duration' => '60–90 mnt',
                'image' => Str::contains($lower, ['veneer', 'veener']) ? '/layanan/Veneers.webp' : '/layanan/Dental Whitening.webp',
                'intro' => "Layanan estetika gigi premium {$name} untuk senyum cerah, proporsional, dan percaya diri.",
                'paragraphs' => [
                    "Prosedur {$name} menggunakan material berkualitas tinggi seperti porcelain/zirconia untuk memberikan tampilan senyum yang natural dan memukau.",
                    "Dikerjakan dengan ketelitian tingkat tinggi dan teknologi digital smile design untuk hasil yang presisi dan tahan lama."
                ],
                'steps' => [
                    'Analisis estetika senyum dan pemilihan shade warna gigi.',
                    'Preparasi minimal dan aplikasi material estetik sesuai prosedur standar medis.',
                    'Finishing, pemolesan akhir, dan evaluasi hasil estetika bersama pasien.'
                ],
                'general_dentists' => ['drg. Ryan Jusuf', 'drg. Yulita Dora'],
                'specialist_label' => 'Dokter Spesialis Konservasi Gigi / Cosmetic Specialist:',
                'specialist_names' => ['drg. Ryan Jusuf', 'drg. Riesta Paluvi, Sp.KG'],
            ];
        }

        // 3. Konservasi Gigi & Saluran Akar (Endodontik & Tambalan)
        if (Str::contains($lower, ['saluran akar', 'saluan akar', 'spkg', 'endodontic', 'tambal', 'tambalan', 'penambalan', 'pulp', 'gic', 'komposit', 'inlay', 'onlay', 'pasak', 'ledge', 'obtruksi', 'open access', 'rewaling', 'perfor', 'retreatment'])) {
            return [
                'category' => 'Konservasi Gigi',
                'duration' => '45–60 mnt',
                'image' => Str::contains($lower, ['saluran akar', 'saluan akar', 'pulp', 'endodontic', 'retreatment']) ? '/layanan/Root Canal Treatments.webp' : '/layanan/Dental Fillings, Inlays & Onlays.webp',
                'intro' => "Perawatan konservasi dan pemulihan gigi {$name} untuk mempertahankan gigi asli tetap sehat dan berfungsi optimal.",
                'paragraphs' => [
                    "Tindakan {$name} bertujuan menyelamatkan jaringan gigi yang rusak atau terinfeksi sehingga tidak perlu dicabut.",
                    "Menggunakan teknologi dental microscope dan instrumen mutakhir untuk presisi pembersihan dan penambalan maksimal."
                ],
                'steps' => [
                    'Pemeriksaan rontgen periapikal untuk mengevaluasi kondisi kamar pulpa dan saluran akar.',
                    'Isolasi area kerja, pembersihan jaringan karies/infeksi, dan preparasi kamar pulpa.',
                    'Obturasi pengisian saluran akar atau penambalan estetik nano-komposit berdaya tahan tinggi.'
                ],
                'general_dentists' => ['drg. Achmad Riwandy', 'drg. Della Sparringa'],
                'specialist_label' => 'Dokter Spesialis Konservasi Gigi (Sp.KG):',
                'specialist_names' => ['drg. Riesta Paluvi, Sp.KG', 'drg. Achmad Riwandy'],
            ];
        }

        // 4. Bedah Mulut & Implan (Odontektomi, Pencabutan, Sinus, Bone Graft, Implan)
        if (Str::contains($lower, ['odontektomi', 'sinus', 'implant', 'implan', 'bm', 'bedah', 'pencabutan', 'cabut', 'flap', 'operculectomy', 'bone graft', 'membrane', 'socket', 'ridge', 'vestibuloplasty'])) {
            return [
                'category' => 'Bedah Mulut & Implan',
                'duration' => '60–90 mnt',
                'image' => Str::contains($lower, ['implant', 'implan']) ? '/layanan/Dental Implants.webp' : (Str::contains($lower, ['bone', 'graft', 'sinus', 'ridge']) ? '/layanan/Bone Grafting.webp' : '/layanan/Dental Extraction and Wisdom Teeth Removal.webp'),
                'intro' => "Prosedur bedah mulut dan implan terpadu {$name} dengan standar sterilisasi tinggi dan kenyamanan optimal.",
                'paragraphs' => [
                    "Tindakan {$name} dilakukan oleh dokter gigi spesialis bedah mulut dengan anestesi lokal/sedasi untuk memastikan prosedur berlangsung nyaman dan aman.",
                    "Mendukung pemulihan cepat dan pemeliharaan struktur tulang alveolar secara maksimal."
                ],
                'steps' => [
                    'Pemeriksaan CBCT 3D / rontgen panoramik dan evaluasi kondisi anatomi rahang.',
                    'Pemberian anestesi lokal yang nyaman dan pelaksanaan prosedur bedah secara higienis.',
                    'Penjahitan luka operasi bila diperlukan dan pemberian instruksi pasca-tindakan.'
                ],
                'general_dentists' => ['drg. Achmad Riwandy', 'drg. Ryan Jusuf'],
                'specialist_label' => 'Dokter Spesialis Bedah Mulut (Sp.BM):',
                'specialist_names' => ['drg. Achmad Riwandy', 'drg. Ryan Jusuf'],
            ];
        }

        // 5. Periodonsia & Pembersihan (Scaling, Gingivektomi, Splinting, Airflow)
        if (Str::contains($lower, ['scaling', 'scalling', 'polishing', 'gingivektomi', 'periodontic', 'kuretase', 'splinting', 'splint', 'aquacare', 'airflow', 'root planning', 'frenectomy', 'gum', 'night guard'])) {
            return [
                'category' => 'Periodonsia & Oral Care',
                'duration' => '30–45 mnt',
                'image' => Str::contains($lower, ['gum', 'gingivektomi', 'frenectomy']) ? '/layanan/Gummy Smile Correction.webp' : '/layanan/Oral Care.webp',
                'intro' => "Perawatan kesehatan gusi dan jaringan periodontal {$name} untuk mencegah radang dan menjaga kesegaran rongga mulut.",
                'paragraphs' => [
                    "Layanan {$name} membersihkan plak, karang gigi, dan bakteri hingga di bawah garis gusi untuk menjaga gigi tetap kokoh.",
                    "Menggunakan teknologi ultrasonic scaler dan airflow modern yang lembut dan bebas rasa ngilu berlebih."
                ],
                'steps' => [
                    'Pemeriksaan kedalaman poket gusi dan pemetaan kalkulus gigi.',
                    'Pembersihan supra dan subgingiva secara menyeluruh dengan instrumen khusus.',
                    'Polishing pemolesan permukaan enamel dan aplikasi fluoridasi perlindungan.'
                ],
                'general_dentists' => ['drg. Della Sparringa', 'drg. Yulita Dora'],
                'specialist_label' => 'Dokter Gigi Spesialis Periodonsia (Sp.Perio):',
                'specialist_names' => ['drg. Della Sparringa', 'drg. Yulita Dora'],
            ];
        }

        // 6. Kedokteran Gigi Anak (Pedodonti)
        if (Str::contains($lower, ['anak', 'pedodontic', 'pediatric', 'kids'])) {
            return [
                'category' => 'Kedokteran Gigi Anak',
                'duration' => '30–45 mnt',
                'image' => '/layanan/Pediatric Dentistry.webp',
                'intro' => "Layanan perawatan gigi ramah anak {$name} dengan pendekatan psikologis yang menyenangkan dan bebas trauma.",
                'paragraphs' => [
                    "Perawatan {$name} diformulasikan khusus untuk kesehatan gigi susu dan pertumbuhan gigi permanen si kecil.",
                    "Dilakukan dengan suasana klinik yang hangat dan dokter yang sabar serta berpengalaman menangani anak."
                ],
                'steps' => [
                    'Sesi perkenalan ramah (tell-show-do) agar anak merasa nyaman dan tenang.',
                    'Pemeriksaan dan tindakan medis gigi anak dengan instrumen khusus.',
                    'Edukasi cara menyikat gigi menyenangkan dan pemberian reward motivasi.'
                ],
                'general_dentists' => ['drg. Della Sparringa', 'drg. Yulita Dora'],
                'specialist_label' => 'Dokter Spesialis Kedokteran Gigi Anak (Sp.KGA):',
                'specialist_names' => ['drg. Della Sparringa', 'drg. Yulita Dora'],
            ];
        }

        // 7. Prostodonsia & Gigi Tiruan (Crown, Bridge, Denture, Valplast, Landasan)
        if (Str::contains($lower, ['crown', 'bridge', 'prostodontic', 'denture', 'valplast', 'landasan', 'akrilik', 'gigi tiruan', 'overdenture', 'magnet attachment'])) {
            return [
                'category' => 'Prostodonsia & Restorasi',
                'duration' => '45–60 mnt',
                'image' => Str::contains($lower, ['bridge']) ? '/layanan/Dental Bridges.webp' : (Str::contains($lower, ['crown', 'onlay', 'inlay']) ? '/layanan/Crown lengthening.webp' : '/layanan/Dentures.webp'),
                'intro' => "Pembuatan restorasi mahkota dan gigi tiruan presisi {$name} untuk mengembalikan fungsi kunyah dan estetika wajar.",
                'paragraphs' => [
                    "Prosedur {$name} menggantikan struktur gigi yang hilang dengan protesa berkualitas tinggi yang nyaman dipakai.",
                    "Dicetak secara presisi menggunakan bahan elastomeric berkualitas untuk memastikan kenyamanan pas dan stabil."
                ],
                'steps' => [
                    'Pemeriksaan rongga mulut dan pencetakan anatomis rahang.',
                    'Fabrikasi di laboratorium dental berstandar tinggi dengan material biocompatible.',
                    'Pemasangan, penyesuaian oklusi, dan evaluasi kenyamanan pemakaian.'
                ],
                'general_dentists' => ['drg. Ryan Jusuf', 'drg. Achmad Riwandy'],
                'specialist_label' => 'Dokter Spesialis Prostodonsia (Sp.Pros):',
                'specialist_names' => ['drg. Ryan Jusuf', 'drg. Achmad Riwandy'],
            ];
        }

        // 8. Radiologi Dental / Rontgen
        if (Str::contains($lower, ['rontgen', 'panoramic', 'cbct', 'foto', 'dental scan'])) {
            return [
                'category' => 'Radiologi & Diagnostik',
                'duration' => '15–30 mnt',
                'image' => '/layanan/Oral Care.webp',
                'intro' => "Pemeriksaan penunjang radiologi gigi digital {$name} dengan radiasi ultra-rendah untuk diagnosa akurat.",
                'paragraphs' => [
                    "Pemeriksaan {$name} memberikan gambaran detail struktur tulang, akar gigi, dan jaringan penyangga secara tajam.",
                    "Hasil instan terdigitalisasi langsung tersimpan dalam rekam medis elektronik pasien."
                ],
                'steps' => [
                    'Pemasangan apron pelindung radiasi berstandar medis.',
                    'Pengambilan citra radiografis digital dalam hitungan detik.',
                    'Interpretasi dan penjelasan hasil diagnosa langsung oleh dokter.'
                ],
                'general_dentists' => ['drg. Achmad Riwandy', 'drg. Della Sparringa'],
                'specialist_label' => 'Tim Diagnostik & Radiologi Dental:',
                'specialist_names' => ['drg. Achmad Riwandy', 'drg. Ryan Jusuf'],
            ];
        }

        // 9. Default / Konsultasi & Pemeriksaan
        return [
            'category' => 'Konsultasi & Pemeriksaan',
            'duration' => '30–45 mnt',
            'image' => '/layanan/Oral Care.webp',
            'intro' => "Layanan medis dokter gigi {$name} dengan standar pelayanan paripurna di Aesthetic Pondok Indah.",
            'paragraphs' => [
                "Prosedur {$name} dilakukan dengan cermat menggunakan instrumen steril dan teknologi kedokteran gigi terkini.",
                "Konsultasikan kebutuhan perawatan kesehatan gigi Anda bersama tim dokter profesional kami."
            ],
            'steps' => [
                'Pemeriksaan komprehensif rongga mulut dan rekam medis.',
                'Penjelasan rencana perawatan dan estimasi tindakan secara transparan.',
                'Pelaksanaan tindakan medis sesuai standar operasional prosedur klinis.'
            ],
            'general_dentists' => ['drg. Yulita Dora', 'drg. Ryan Jusuf', 'drg. Della Sparringa'],
            'specialist_label' => 'Tim Dokter Gigi Aesthetic Pondok Indah:',
            'specialist_names' => ['drg. Yulita Dora', 'drg. Ryan Jusuf'],
        ];
    }
}
