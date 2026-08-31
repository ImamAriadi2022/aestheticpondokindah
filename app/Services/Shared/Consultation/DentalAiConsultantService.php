<?php

namespace App\Services\Shared\Consultation;

use App\Models\Shared\Consultation\Consultation;
use App\Models\Shared\Consultation\ConsultationMessage;
use App\Services\Shared\Notification\NotificationService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DentalAiConsultantService
{
    /**
     * Check if the consultation has been handed over to a human admin/doctor.
     */
    public static function isConnectedToAdmin(Consultation $consultation): bool
    {
        return $consultation->notes === 'connected_to_human_admin'
            || ($consultation->admin_id !== null && $consultation->status !== 'Menunggu');
    }

    /**
     * Query Zesta LiveChat AI Engine for dynamic, intelligent clinical & clinic knowledge responses.
     */
    public static function queryZestaAi(Consultation $consultation, string $promptText): ?string
    {
        $channelId = config('services.zesta.channel_id', '573eb7f7-b6f0-4957-9778-daf531cd967c');
        $baseUrl = rtrim(config('services.zesta.base_url', 'https://api.zesta.id'), '/');

        if (!str_ends_with($baseUrl, '/api')) {
            $baseUrl .= '/api';
        }

        try {
            $patientName = $consultation->participant_name ?: 'Bapak/Ibu';
            $visitorId = 'lc_cons_' . $consultation->id . '_' . substr(md5($consultation->id . '_' . $consultation->created_at), 0, 8);

            $initPayload = [
                'channelId' => $channelId,
                'visitor' => [
                    'name' => $patientName,
                    'email' => $consultation->guest_email ?: ($consultation->user?->email ?: 'pasien@aestheticpondokindah.com'),
                    'phone' => $consultation->guest_phone ?: ($consultation->user?->phone ?: ''),
                    'metadata' => [
                        'nama_faskes' => 'Aesthetic Pondok Indah Dental Clinic',
                        'topik' => $consultation->topic,
                        'keluhan' => $consultation->chief_complaint,
                        'skala_nyeri' => (string) $consultation->pain_scale,
                    ],
                ],
            ];

            // 1. Ensure Visitor Session
            Http::timeout(3)->post("$baseUrl/livechat/init", $initPayload);

            // 2. Send Message to Zesta AI
            $msgPayload = [
                'channelId' => $channelId,
                'visitorId' => $visitorId,
                'content' => $promptText,
            ];

            $res = Http::timeout(8)->post("$baseUrl/livechat/message", $msgPayload);
            if ($res->successful()) {
                $data = $res->json();
                $reply = $data['data']['aiReply']['content'] ?? null;
                if (!empty($reply)) {
                    // Clean literal \n and asterisks
                    $clean = str_replace(['**', '*'], '', $reply);
                    $clean = preg_replace('/_balasan otomatis AESPI Bot_/i', '', $clean);
                    $clean = preg_replace('/balasan otomatis AESPI Bot/i', '', $clean);
                    $clean = preg_replace('/_balasan otomatis_/i', '', $clean);
                    return trim($clean);
                }
            }
        } catch (\Throwable $e) {
            Log::warning('[DentalAiConsultantService] Zesta AI query fallback: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Generate an automated initial medical assessment when consultation is first created.
     */
    public static function generateInitialAssessment(Consultation $consultation): ?ConsultationMessage
    {
        $patientName = $consultation->participant_name ?: 'Bapak/Ibu';
        $topic = $consultation->topic ?: ($consultation->category ?: 'Keluhan Kesehatan Gigi');
        $chiefComplaint = $consultation->chief_complaint ?: '';
        $painScale = $consultation->pain_scale;

        $analysis = self::analyzeCondition($topic, $chiefComplaint, $painScale);

        // Query Zesta AI for dynamic greeting & assessment
        $initialPrompt = "Halo, saya {$patientName}. Saya sedang konsultasi mengenai keluhan {$topic}"
            . ($chiefComplaint ? ". Keterangan keluhan: {$chiefComplaint}" : "")
            . ($painScale !== null ? ". Tingkat nyeri: {$painScale}/10" : "")
            . ". Mohon berikan analisis awal dan panduan perawatannya di Aesthetic Pondok Indah.";

        $zestaReply = self::queryZestaAi($consultation, $initialPrompt);

        if (!empty($zestaReply)) {
            $body = "Halo {$patientName}, terima kasih telah berkonsultasi di Aesthetic Pondok Indah Dental Clinic! 🌿\n\n"
                . $zestaReply . "\n\n"
                . "──────────────────\n"
                . "⭐ Rekomendasi Layanan Klinik Terkait:\n"
                . "👉 {$analysis['service_name']}\n"
                . "• Dokter Pendamping: {$analysis['doctor_recommendation']}\n\n"
                . "──────────────────\n"
                . "💬 Pilihan Bantuan Lanjutan:\n"
                . "Apakah Anda ingin saya hubungkan langsung untuk berbicara dengan Admin Klinik / Dokter kami?\n"
                . "👉 Ketik 'Hubungkan ke Admin' atau klik tombol di bawah untuk live chat langsung dengan staf klinik kami.";
        } else {
            $body = "Halo {$patientName}, terima kasih telah berkonsultasi di Aesthetic Pondok Indah Dental Clinic! 🌿\n\n"
                . "Saya adalah AESPI AI Dental Assistant yang bertugas mendampingi Anda sebelum tim dokter spesialis dan resepsionis kami membuka sesi pemeriksaan mendalam.\n\n"
                . "──────────────────\n"
                . "📋 Analisis Awal Gejala Anda:\n"
                . "{$analysis['medical_explanation']}\n\n"
                . "💡 Panduan Perawatan Sementara di Rumah:\n"
                . "{$analysis['home_care']}\n\n"
                . "⭐ Rekomendasi Layanan Klinik Terkait:\n"
                . "Untuk mengatasi keluhan ini secara tuntas, kami merekomendasikan:\n"
                . "👉 {$analysis['service_name']}\n"
                . "• Manfaat: {$analysis['service_benefits']}\n"
                . "• Dokter Pendamping: {$analysis['doctor_recommendation']}\n\n"
                . "──────────────────\n"
                . "💬 Pilihan Bantuan Lanjutan:\n"
                . "Apakah Anda ingin saya hubungkan langsung untuk berbicara dengan Admin Klinik / Dokter kami?\n"
                . "👉 Ketik 'Hubungkan ke Admin' atau klik tombol di bawah untuk live chat langsung dengan staf klinik kami.";
        }

        return $consultation->messages()->create([
            'sender_id' => null,
            'sender_role' => 'admin',
            'body' => $body,
            'attachments' => [
                'type' => 'ai_recommendation',
                'service_id' => $analysis['service_id'],
                'service_name' => $analysis['service_name'],
                'doctor_name' => $analysis['doctor_recommendation'],
                'category_title' => $analysis['category_title'],
                'can_handoff' => true,
            ],
            'read_at' => null,
        ]);
    }

    /**
     * Generate an intelligent conversational response when patient sends a message in chat.
     */
    public static function generateChatReply(Consultation $consultation, string $patientMessage): ?ConsultationMessage
    {
        // Guard: If consultation is already handed over to human admin, AI must NOT reply anymore
        if (self::isConnectedToAdmin($consultation)) {
            return null;
        }

        $patientName = $consultation->participant_name ?: 'Bapak/Ibu';
        $topic = $consultation->topic ?: ($consultation->category ?: '');
        $chiefComplaint = $consultation->chief_complaint ?: '';
        $combinedText = $topic . ' ' . $chiefComplaint . ' ' . $patientMessage;

        $analysis = self::analyzeCondition($topic, $combinedText, $consultation->pain_scale);

        $lower = mb_strtolower(trim($patientMessage));

        // Check Handoff Intent (Kata kunci beralih ke Admin / Manusia)
        $isHandoff = str_contains($lower, 'admin')
            || str_contains($lower, 'hubungkan')
            || str_contains($lower, 'manusia')
            || str_contains($lower, 'cs')
            || str_contains($lower, 'customer service')
            || str_contains($lower, 'bicara langsung')
            || str_contains($lower, 'staff')
            || str_contains($lower, 'staf')
            || str_contains($lower, 'dokter asli')
            || str_contains($lower, 'panggil admin')
            || str_contains($lower, 'mau admin')
            || str_contains($lower, 'chat admin');

        if ($isHandoff) {
            // Hand over conversation to human admin
            $consultation->notes = 'connected_to_human_admin';
            if ($consultation->status === 'Menunggu') {
                $consultation->status = 'Dibuka';
            }
            $consultation->save();

            $handoffBody = "🔔 Sesi Percakapan Dialihkan ke Admin Klinik\n\n"
                . "Baik {$patientName}, permintaan Anda telah kami terima. Sesi live chat ini sekarang telah dihubungkan langsung dengan Tim Admin & Resepsionis Klinik kami.\n\n"
                . "🤖 AI Dental Advisor telah dinonaktifkan untuk percakapan ini.\n\n"
                . "Staf pelayanan pasien kami akan segera membalas pesan Anda di sini secara langsung. Silakan sampaikan pertanyaan atau pesan lanjutan Anda.";

            try {
                NotificationService::sendToAdmins(
                    'Pasien Meminta Live Chat Admin',
                    $patientName . ' meminta terhubung langsung dengan Admin di Konsultasi #' . $consultation->id,
                    'consultation',
                    '/dashboard/clinic?tab=konsultasi',
                    ['consultation_id' => (string) $consultation->id]
                );
            } catch (\Throwable $e) {
                // Non-blocking
            }

            return $consultation->messages()->create([
                'sender_id' => null,
                'sender_role' => 'admin',
                'body' => $handoffBody,
                'attachments' => [
                    'type' => 'handoff_confirmed',
                    'is_handed_off' => true,
                ],
                'read_at' => null,
            ]);
        }

        // Try querying Zesta AI for dynamic, contextual conversation
        $zestaReply = self::queryZestaAi($consultation, $patientMessage);

        if (!empty($zestaReply)) {
            $replyBody = $zestaReply . "\n\n"
                . "──────────────────\n"
                . "💬 Ingin berbicara langsung dengan Admin Klinik? Ketik 'Hubungkan ke Admin'.";
        }
        // Check intent: Price inquiry
        elseif (str_contains($lower, 'harga') || str_contains($lower, 'biaya') || str_contains($lower, 'tarif') || str_contains($lower, 'berapa')) {
            $replyBody = "Halo {$patientName}, mengenai estimasi biaya tindakan di klinik kami:\n\n"
                . "💎 Layanan yang Direkomendasikan: {$analysis['service_name']}\n"
                . "• Estimasi Biaya: {$analysis['price_range']}\n"
                . "• Benefit Tambahan: Termasuk konsultasi klinis, sterilisasi berstandar internasional, serta poin reward membership klinik.\n\n"
                . "Tindakan akan disesuaikan dengan kondisi rongga mulut Anda setelah pemeriksaan langsung oleh dokter spesialis kami.\n\n"
                . "──────────────────\n"
                . "💬 Ingin berbicara langsung dengan Admin Klinik? Ketik 'Hubungkan ke Admin'.";
        }
        // Check intent: Booking / Appointment inquiry
        elseif (str_contains($lower, 'booking') || str_contains($lower, 'jadwal') || str_contains($lower, 'daftar') || str_contains($lower, 'janji') || str_contains($lower, 'kapan')) {
            $replyBody = "Tentu {$patientName}! Anda dapat langsung memilih jadwal praktik dokter yang tersedia melalui menu Reservasi di dashboard akun Anda.\n\n"
                . "🩺 Rekomendasi Dokter untuk {$analysis['service_name']}:\n"
                . "{$analysis['doctor_recommendation']}\n\n"
                . "Klinik kami buka Senin s/d Sabtu, pukul 10:00 - 18:00 WIB. Tim resepsionis kami juga akan mengonfirmasi kedatangan Anda melalui WhatsApp resmi klinik setelah reservasi terkirim.\n\n"
                . "──────────────────\n"
                . "💬 Ingin dibantu langsung oleh Admin? Ketik 'Hubungkan ke Admin'.";
        }
        // Check intent: Greeting / General check-in
        elseif (str_contains($lower, 'halo') || str_contains($lower, 'pagi') || str_contains($lower, 'siang') || str_contains($lower, 'malam') || str_contains($lower, 'tes') || str_contains($lower, 'hai')) {
            $replyBody = "Halo {$patientName}! Senang dapat mendampingi Anda di ruang konsultasi Aesthetic Pondok Indah Dental Clinic. 😊\n\n"
                . "Berdasarkan keluhan {$analysis['category_title']}, kami menyarankan tindakan {$analysis['service_name']}.\n\n"
                . "Silakan sampaikan apabila ada gejala lain yang Anda rasakan, atau ketik 'Hubungkan ke Admin' jika ingin langsung mengobrol dengan staf kami.";
        }
        // General conversational clinical consultation
        else {
            $replyBody = "Terima kasih atas informasinya, {$patientName}.\n\n"
                . "🩺 Tinjauan Medis Lanjutan:\n"
                . "{$analysis['medical_explanation']}\n\n"
                . "💡 Langkah Penanganan Disarankan:\n"
                . "{$analysis['home_care']}\n\n"
                . "⭐ Rekomendasi Tindakan Klinik:\n"
                . "Kami sangat menyarankan Anda melakukan {$analysis['service_name']} agar kondisi ini tidak berkembang menjadi masalah yang lebih berat. Layanan ini ditangani langsung oleh {$analysis['doctor_recommendation']}.\n\n"
                . "──────────────────\n"
                . "💬 Ingin berbicara langsung dengan Admin Klinik? Ketik 'Hubungkan ke Admin' kapan saja.";
        }

        return $consultation->messages()->create([
            'sender_id' => null,
            'sender_role' => 'admin',
            'body' => $replyBody,
            'attachments' => [
                'type' => 'ai_recommendation',
                'service_id' => $analysis['service_id'],
                'service_name' => $analysis['service_name'],
                'doctor_name' => $analysis['doctor_recommendation'],
                'category_title' => $analysis['category_title'],
                'can_handoff' => true,
            ],
            'read_at' => null,
        ]);
    }

    /**
     * Clinical knowledge engine to match symptoms to medical explanations, home-care tips, and clinic services.
     */
    private static function analyzeCondition(string $topic, string $complaint, ?int $painScale = null): array
    {
        $topicLower = mb_strtolower($topic);
        $complaintLower = mb_strtolower($complaint);
        $fullText = $topicLower . ' ' . $complaintLower;

        // 1. Gusi Berdarah / Radang Gusi (Gingivitis)
        if (str_contains($topicLower, 'gusi berdarah') || str_contains($topicLower, 'radang gusi') || str_contains($complaintLower, 'gusi berdarah') || str_contains($complaintLower, 'radang gusi')) {
            return [
                'category_title' => 'Gusi Berdarah & Radang Gusi (Gingivitis)',
                'medical_explanation' => 'Gusi yang mudah berdarah saat menyikat gigi atau tersentuh umumnya disebabkan oleh gingivitis (peradangan jaringan gusi). Hal ini dipicu oleh akumulasi plak bakteri di batas leher gigi dan gusi yang menyebabkan jaringan gusi menjadi rentan dan mudah berdarah.',
                'home_care' => "• Sikat gigi secara teratur 2x sehari dengan sikat berbulu lembut (ultra-soft) tanpa menekan terlalu keras.\n• Bersihkan sela-sela gigi menggunakan benang gigi (dental floss) secara perlahan.\n• Berkumur dengan air garam hangat atau obat kumur antiseptik tanpa alkohol.",
                'service_id' => 'perawatan-gusi',
                'service_name' => 'Pembersihan Karang Gigi & Perawatan Gusi (Periodontal Scaling)',
                'service_benefits' => 'Menghilangkan karang gigi & plak subgingiva penyebab utama peradangan serta mengembalikan kesehatan gusi secara optimal.',
                'doctor_recommendation' => 'Dokter Gigi Spesialis Periodonsia (Sp.Perio) & Dokter Gigi Umum',
                'price_range' => 'Rp 450.000 - Rp 950.000 (tergantung tingkat keparahan karang gigi)',
            ];
        }

        // 2. Bau Mulut (Halitosis)
        if (str_contains($topicLower, 'bau mulut') || str_contains($topicLower, 'halitosis') || str_contains($complaintLower, 'bau mulut') || str_contains($complaintLower, 'halitosis')) {
            return [
                'category_title' => 'Bau Mulut (Halitosis)',
                'medical_explanation' => 'Bau mulut menetap umumnya diakibatkan oleh senyawa volatil sulfur yang dihasilkan oleh bakteri anaerob pada sela-sela gigi berlubang, karang gigi tersembunyi, atau lapisan belakang lidah.',
                'home_care' => "• Bersihkan permukaan lidah secara rutin dengan tongue cleaner setiap selesai sikat gigi.\n• Perbanyak konsumsi air putih minimal 2 liter per hari untuk menjaga kelembapan mulut.\n• Hindari merokok dan batasi makanan beraroma menyengat.",
                'service_id' => 'deep-cleaning',
                'service_name' => 'Deep Cleaning, Polishing & Oral Hygiene Therapy',
                'service_benefits' => 'Membersihkan biofilm bakteri di seluruh kuadran mulut secara menyeluruh dan mengembalikan kesegaran napas alami.',
                'doctor_recommendation' => 'Tim Dokter Gigi Spesialis Konservasi Gigi & Kebersihan Mulut',
                'price_range' => 'Rp 500.000 - Rp 850.000',
            ];
        }

        // 3. Gigi Sensitif & Ngilu (Dentin Hypersensitivity)
        if (str_contains($topicLower, 'gigi ngilu') || str_contains($topicLower, 'gigi sensitif') || str_contains($complaintLower, 'ngilu') || str_contains($complaintLower, 'sensitif') || str_contains($complaintLower, 'dingin') || str_contains($complaintLower, 'es')) {
            return [
                'category_title' => 'Gigi Sensitif & Ngilu (Dentin Hypersensitivity)',
                'medical_explanation' => 'Rasa ngilu tajam saat terpapar makanan/minuman dingin, manis, atau asam terjadi karena terbukanya tubulus dentin akibat email gigi yang menipis atau resesi gusi.',
                'home_care' => "• Gunakan pasta gigi khusus gigi sensitif yang mengandung potassium nitrate / fluorida aktif.\n• Hindari menyikat gigi langsung setelah mengonsumsi makanan asam.\n• Gunakan air hangat untuk berkumur.",
                'service_id' => 'desensitizing-fluoride',
                'service_name' => 'Aplikasi Fluoride Varnish & Desensitizing Therapy',
                'service_benefits' => 'Melapisi dan menutup mikrotubulus dentin yang terbuka secara instan untuk meredakan rasa ngilu.',
                'doctor_recommendation' => 'Dokter Gigi Spesialis Konservasi Gigi (Sp.KG)',
                'price_range' => 'Rp 350.000 - Rp 650.000',
            ];
        }

        // 4. Gigi Berlubang / Sakit Gigi Berdenyut (Caries / Pulpitis)
        if (str_contains($topicLower, 'gigi berlubang') || str_contains($topicLower, 'sakit gigi') || str_contains($complaintLower, 'berlubang') || str_contains($complaintLower, 'bolong') || str_contains($complaintLower, 'denyut') || str_contains($complaintLower, 'cenat')) {
            return [
                'category_title' => 'Gigi Berlubang & Nyeri Pulpa (Pulpitis)',
                'medical_explanation' => 'Lubang pada gigi yang mencapai lapisan dentin atau ruang pulpa saraf dapat memicu rasa nyeri spontan dan berdenyut, terutama di malam hari atau saat terkena tekanan makan.',
                'home_care' => "• Hindari mengunyah makanan keras di sisi gigi yang berlubang.\n• Berkumur air garam hangat untuk meredakan pembengkakan sementara.\n• Konsumsi obat pereda nyeri darurat (paracetamol/ibuprofen) bila diperlukan dan segera temui dokter.",
                'service_id' => 'penambalan-estetik',
                'service_name' => 'Penambalan Gigi Komposit Estetik / Perawatan Saluran Akar (PSA)',
                'service_benefits' => 'Menghilangkan jaringan karies, mensterilkan saluran saraf, dan merestorasi anatomi gigi menyerupai gigi asli.',
                'doctor_recommendation' => 'Dokter Gigi Spesialis Konservasi Gigi (Sp.KG)',
                'price_range' => 'Rp 450.000 - Rp 1.500.000 per gigi',
            ];
        }

        // 5. Gigi Goyang / Goyah (Periodontitis Kronis)
        if (str_contains($topicLower, 'gigi goyang') || str_contains($complaintLower, 'goyang') || str_contains($complaintLower, 'goyah') || str_contains($complaintLower, 'longgar')) {
            return [
                'category_title' => 'Gigi Goyang & Penurunan Tulang Alveolar',
                'medical_explanation' => 'Gigi yang terasa goyang merupakan tanda adanya kerusakan pada jaringan periodontal penyangga gigi dan penurunan volume tulang alveolar.',
                'home_care' => "• Jangan memainkan gigi yang goyang dengan lidah atau jari.\n• Konsumsi makanan lunak bertekstur lembut.\n• Jaga kebersihan area sekitar gusi tanpa tekanan agresif.",
                'service_id' => 'splinting-periodontal',
                'service_name' => 'Periodontal Splinting & Bone Regeneration Therapy',
                'service_benefits' => 'Menstabilkan posisi gigi yang goyang serta memperbaiki jaringan penyangga gigi.',
                'doctor_recommendation' => 'Dokter Gigi Spesialis Periodonsia (Sp.Perio)',
                'price_range' => 'Rp 600.000 - Rp 1.800.000',
            ];
        }

        // 6. Gigi Bungsu / Sakit Geraham Belakang (Impaksi Gigi)
        if (str_contains($topicLower, 'gigi bungsu') || str_contains($topicLower, 'geraham belakang') || str_contains($complaintLower, 'bungsu') || str_contains($complaintLower, 'impaksi') || str_contains($complaintLower, 'pipi bengkak')) {
            return [
                'category_title' => 'Impaksi Gigi Bungsu (Wisdom Tooth Impaction)',
                'medical_explanation' => 'Gigi bungsu yang tumbuh miring atau terhalang tulang rahang sering menyebabkan peradangan gusi penutup (perikoronitis), rasa nyeri menjalar ke rahang atau telinga, dan penumpukan sisa makanan.',
                'home_care' => "• Kompres dingin di pipi luar selama 15 menit jika terasa bengkak.\n• Berkumur air garam hangat perlahan.\n• Hindari menyentuh area geraham belakang dengan benda tajam.",
                'service_id' => 'odontektomi',
                'service_name' => 'Odontektomi (Operasi Gigi Bungsu Minim Invasif)',
                'service_benefits' => 'Mengeluarkan gigi bungsu impaksi secara presisi dan aman untuk mencegah kerusakan gigi tetangga.',
                'doctor_recommendation' => 'Dokter Gigi Spesialis Bedah Mulut & Maksilofasial (Sp.BM)',
                'price_range' => 'Rp 2.000.000 - Rp 4.500.000',
            ];
        }

        // 7. Gigi Kuning / Kusam / Noda Rokok / Kopi (Estetika Whitening)
        if (str_contains($topicLower, 'gigi kuning') || str_contains($topicLower, 'memutihkan') || str_contains($topicLower, 'whitening') || str_contains($complaintLower, 'kuning') || str_contains($complaintLower, 'kusam') || str_contains($complaintLower, 'putih') || str_contains($complaintLower, 'bleaching')) {
            return [
                'category_title' => 'Perubahan Warna Gigi (Extrinsic / Intrinsic Discoloration)',
                'medical_explanation' => 'Perubahan warna email gigi menjadi kuning atau kusam diakibatkan oleh konsumsi kopi/teh rutin, noda nikotin rokok, atau penuaan email alami.',
                'home_care' => "• Kurangi minuman berpigmen pekat seperti teh pekat, kopi, atau soda.\n• Gunakan sedotan saat minum minuman berwarna.\n• Hindari produk pemutih abrasif tanpa anjuran dokter.",
                'service_id' => 'dental-whitening',
                'service_name' => 'In-Clinic Laser Dental Whitening (Bleaching Premium)',
                'service_benefits' => 'Mencerahkan warna gigi hingga 4-8 tingkat lebih putih dalam 1 sesi perawatan tanpa merusak email gigi.',
                'doctor_recommendation' => 'Dokter Gigi Spesialis Estetika & Konservasi Gigi',
                'price_range' => 'Rp 2.500.000 - Rp 4.500.000',
            ];
        }

        // 8. Gigi Berantakan / Maju / Renggang (Orthodontic)
        if (str_contains($topicLower, 'behel') || str_contains($topicLower, 'kawat gigi') || str_contains($topicLower, 'gigi berantakan') || str_contains($topicLower, 'gigi maju') || str_contains($topicLower, 'renggang') || str_contains($complaintLower, 'behel') || str_contains($complaintLower, 'kawat') || str_contains($complaintLower, 'berantakan') || str_contains($complaintLower, 'aligner')) {
            return [
                'category_title' => 'Maloklusi & Susunan Gigi Tidak Rata',
                'medical_explanation' => 'Susunan gigi yang berjejal, renggang, atau gigitan tidak selaras dapat memengaruhi fungsi kunyah, estetika senyum, dan mempermudah penumpukan karang gigi.',
                'home_care' => "• Jaga kebersihan gigi secara ekstra di area sela-sela gigi yang berjejal.\n• Gunakan sikat interdental jika ada celah gigi.\n• Hindari kebiasaan menggigit kuku atau benda keras.",
                'service_id' => 'orthodontic-braces',
                'service_name' => 'Pemasangan Behel Estetik / Clear Aligner Transparan',
                'service_benefits' => 'Meratakan posisi gigi dan menyelaraskan gigitan rahang untuk senyum ideal dan estetis.',
                'doctor_recommendation' => 'Dokter Gigi Spesialis Ortodonsia (Sp.Ort)',
                'price_range' => 'Rp 7.500.000 - Rp 25.000.000 (Cicilan 0% tersedia)',
            ];
        }

        // 9. Gigi Patah / Cuil / Retak (Trauma Gigi)
        if (str_contains($topicLower, 'patah') || str_contains($topicLower, 'cuil') || str_contains($topicLower, 'retak') || str_contains($complaintLower, 'patah') || str_contains($complaintLower, 'cuil') || str_contains($complaintLower, 'retak')) {
            return [
                'category_title' => 'Fraktur Mahkota Gigi & Trauma Dental',
                'medical_explanation' => 'Gigi yang patah atau retak akibat benturan atau mengunyah benda keras memerlukan perlindungan segera agar saraf gigi di bawahnya tidak mati atau terinfeksi kuman.',
                'home_care' => "• Simpan patahan gigi dalam wadah berisi susu segar atau saline jika memungkinkan.\n• Hindari makanan keras atau ekstrem panas/dingin di gigi yang patah.\n• Segera kunjungi klinik dalam waktu 24 jam.",
                'service_id' => 'restorasi-veneer-crown',
                'service_name' => 'Restorasi Veneer Porselen / Dental Crown Full Ceramic',
                'service_benefits' => 'Mengembalikan kekuatan struktur gigi dan penampilan estetik secara sempurna seperti sediakala.',
                'doctor_recommendation' => 'Dokter Gigi Spesialis Prostdonsia (Sp.Pros) & Konservasi Gigi',
                'price_range' => 'Rp 1.500.000 - Rp 4.500.000',
            ];
        }

        // 10. Gigi Ompong / Hilang (Pemasangan Gigi Palsu / Implan)
        if (str_contains($topicLower, 'gigi ompong') || str_contains($topicLower, 'gigi hilang') || str_contains($topicLower, 'implan') || str_contains($complaintLower, 'ompong') || str_contains($complaintLower, 'hilang') || str_contains($complaintLower, 'implan') || str_contains($complaintLower, 'palsu')) {
            return [
                'category_title' => 'Kehilangan Gigi (Edentulous Area)',
                'medical_explanation' => 'Gigi yang hilang dapat menyebabkan pergeseran gigi tetangga, penurunan ketebalan tulang rahang, serta gangguan saat mengunyah makanan.',
                'home_care' => "• Jaga kebersihan area gusi yang ompong dengan berkumur antiseptik.\n• Kunyah makanan dengan seimbang di kedua sisi rahang.",
                'service_id' => 'dental-implant',
                'service_name' => 'Dental Implant Titanium Premium / Gigi Tiruan Cekat (Bridge)',
                'service_benefits' => 'Menggantikan akar dan mahkota gigi yang hilang secara permanen dengan stabilitas dan estetika maksimal.',
                'doctor_recommendation' => 'Dokter Gigi Spesialis Bedah Mulut & Spesialis Prostodonsia',
                'price_range' => 'Rp 12.000.000 - Rp 25.000.000 (Implan Titanium)',
            ];
        }

        // Default General Oral Health Assessment
        return [
            'category_title' => 'Pemeriksaan Kesehatan Gigi & Mulut Komprehensif',
            'medical_explanation' => 'Gejala yang Anda rasakan memerlukan evaluasi klinis menyeluruh oleh dokter spesialis gigi kami untuk memastikan diagnosis definitif dan rencana perawatan yang paling tepat.',
            'home_care' => "• Sikat gigi teratur 2x sehari setelah sarapan dan sebelum tidur.\n• Gunakan benang gigi (dental floss) untuk membersihkan plak di sela gigi.\n• Hindari makanan terlalu manis atau keras untuk sementara waktu.",
            'service_id' => 'konsultasi-umum',
            'service_name' => 'Konsultasi Spesialis & Pemeriksaan Gigi Menyeluruh',
            'service_benefits' => 'Pemeriksaan intraoral berteknologi modern untuk mendeteksi potensi masalah gigi sejak dini.',
            'doctor_recommendation' => 'Tim Dokter Gigi Spesialis Aesthetic Pondok Indah Dental Clinic',
            'price_range' => 'Rp 200.000 - Rp 450.000',
        ];
    }
}