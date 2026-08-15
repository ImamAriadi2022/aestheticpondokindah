<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClinicService;
use App\Models\Faq;
use App\Models\ClinicSetting;

class PublicInfoSeeder extends Seeder
{
    public function run(): void
    {
        $generalDentists = [
            "Yulita Dora",
            "Della Sparringa",
            "Nola Lolita",
            "Shivly",
            "Rannyani Ramli",
            "Ryan Jusuf",
        ];

        $services = [
            [
                'id' => 1,
                'title' => 'Dental Whitening',
                'slug' => 'dental-whitening',
                'image' => '/layanan/Dental Whitening.png',
                'intro' => 'Dental whitening is a professional cosmetic treatment designed to brighten your smile safely and effectively.',
                'paragraphs' => [
                    'Over time, teeth can become stained due to coffee, tea, smoking, and natural aging. Professional whitening helps lift stains and restore a more radiant appearance.',
                    'At Aesthetic Pondok Indah, we use clinically tested materials and a careful approach to minimize sensitivity while maximizing results.',
                ],
                'steps' => [
                    'Shade assessment and oral examination to ensure whitening is suitable.',
                    'Protection of gums and soft tissue prior to the procedure.',
                    'Application of whitening gel and activation (if needed), followed by final polishing.',
                ],
                'general_dentists' => $generalDentists,
                'specialist_label' => 'Our Cosmetic Dentist:',
                'specialist_names' => ['Ryan Jusuf'],
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'id' => 2,
                'title' => 'Root Canal Treatments',
                'slug' => 'root-canal-treatments',
                'image' => '/layanan/Root Canal Treatments.png',
                'intro' => 'Root canal treatment is an essential dental procedure designed to save a tooth that has been severely damaged by infection or decay.',
                'paragraphs' => [
                    'When the soft inner tissue of the tooth (pulp) becomes inflamed or infected—often due to deep cavities, cracks, or trauma—it can cause intense pain and swelling.',
                    'Our goal is to remove the infected tissue, disinfect the canals, and seal the tooth to prevent reinfection, restoring comfort and function.',
                ],
                'steps' => [
                    'Gently removing the infected or damaged pulp.',
                    'Thoroughly cleaning and disinfecting the inner tooth canals.',
                    'Sealing the canals to prevent reinfection and restoring the tooth’s structure.',
                ],
                'general_dentists' => $generalDentists,
                'specialist_label' => 'Our Specialist Endodontist:',
                'specialist_names' => ['Pramodanti Jiwanakusuma, Sp.KG', 'Riesta Paluvi, Sp.KG'],
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'id' => 3,
                'title' => 'Pediatric Dentistry',
                'slug' => 'pediatric-dentistry',
                'image' => '/layanan/Pediatric Dentistry.png',
                'intro' => 'Pediatric dentistry focuses on gentle, age-appropriate dental care for infants, children, and teens.',
                'paragraphs' => [
                    'We help children build healthy habits early through preventive care, education, and a friendly clinic experience.',
                    'Treatments are tailored to a child’s stage of growth to support long-term oral health.',
                ],
                'steps' => [
                    'Dental check-up, risk assessment, and oral hygiene education.',
                    'Preventive treatments such as fluoride and sealants when indicated.',
                    'Restorative care if needed, with comfort-first techniques.',
                ],
                'general_dentists' => $generalDentists,
                'specialist_label' => 'Our Pediatric Dentist:',
                'specialist_names' => ['Nola Lolita'],
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'id' => 4,
                'title' => 'Full Mouth Rehabilitations',
                'slug' => 'full-mouth-rehabilitations',
                'image' => '/layanan/Full Mouth Rehabilitations.png',
                'intro' => 'Full mouth rehabilitation is a comprehensive plan combining restorative and aesthetic treatments to rebuild function, comfort, and smile harmony.',
                'paragraphs' => [
                    'It is typically recommended for extensive tooth wear, multiple missing teeth, bite issues, or complex dental problems affecting chewing and appearance.',
                    'We design a phased plan that prioritizes health first, then function, and finally aesthetics.',
                ],
                'steps' => [
                    'Comprehensive assessment (clinical exam, imaging, bite analysis).',
                    'Customized treatment plan: restorations, crowns/bridges, implants, and gum care as needed.',
                    'Final rehabilitation and maintenance plan for long-term stability.',
                ],
                'general_dentists' => $generalDentists,
                'specialist_label' => 'Our Specialist Team:',
                'specialist_names' => ['Pramodanti Jiwanakusuma, Sp.KG', 'Riesta Paluvi, Sp.KG'],
                'sort_order' => 4,
                'is_active' => true,
            ],
            [
                'id' => 5,
                'title' => 'Emergency Dental Services',
                'slug' => 'emergency-dental-services',
                'image' => '/layanan/Emergency Dental Services.png',
                'intro' => 'Emergency dental services help manage urgent issues such as severe toothache, swelling, broken teeth, or dental trauma.',
                'paragraphs' => [
                    'Fast and accurate diagnosis is crucial to relieve pain and prevent complications.',
                    'We focus on stabilizing the condition first, then planning definitive treatment.',
                ],
                'steps' => [
                    'Urgent assessment and pain management.',
                    'Immediate care (temporary filling, drainage, splinting, etc.) as indicated.',
                    'Follow-up plan for definitive treatment and prevention.',
                ],
                'general_dentists' => $generalDentists,
                'sort_order' => 5,
                'is_active' => true,
            ],
            [
                'id' => 6,
                'title' => 'Dentures',
                'slug' => 'dentures',
                'image' => '/layanan/Dentures.png',
                'intro' => 'Dentures are removable appliances designed to replace missing teeth and restore chewing, speech, and facial support.',
                'paragraphs' => [
                    'Options include full dentures and partial dentures, depending on how many teeth are missing.',
                    'We ensure proper fit, comfort, and natural-looking aesthetics.',
                ],
                'steps' => [
                    'Oral examination, measurements, and denture design selection.',
                    'Try-in sessions to refine fit, bite, and appearance.',
                    'Final delivery with adjustment and care instructions.',
                ],
                'general_dentists' => $generalDentists,
                'sort_order' => 6,
                'is_active' => true,
            ],
            [
                'id' => 7,
                'title' => 'Dental Implants',
                'slug' => 'dental-implants',
                'image' => '/layanan/Dental Implants.png',
                'intro' => 'Dental implants are a long-term solution to replace missing teeth using a titanium root and a natural-looking crown.',
                'paragraphs' => [
                    'Implants help preserve jawbone and allow you to chew comfortably without affecting adjacent teeth.',
                    'Treatment is planned carefully with imaging and bite evaluation.',
                ],
                'steps' => [
                    'Evaluation and implant planning (including imaging).',
                    'Implant placement and healing period (osseointegration).',
                    'Crown/bridge attachment and final bite adjustment.',
                ],
                'general_dentists' => $generalDentists,
                'specialist_label' => 'Our Implant Specialist:',
                'specialist_names' => ['Rannyani Ramli'],
                'sort_order' => 7,
                'is_active' => true,
            ],
            [
                'id' => 8,
                'title' => 'Dental Extraction and Wisdom Tooth Removal',
                'slug' => 'dental-extraction-wisdom-tooth-removal',
                'image' => '/layanan/Dental Extraction and Wisdom Teeth Removal.png',
                'intro' => 'Tooth extraction removes a problematic tooth safely, including impacted or painful wisdom teeth.',
                'paragraphs' => [
                    'Extractions may be needed due to severe decay, infection, crowding, or impaction.',
                    'We use careful techniques and anesthesia options to keep you comfortable.',
                ],
                'steps' => [
                    'Clinical exam and imaging to assess root position and difficulty.',
                    'Local anesthesia and gentle extraction technique.',
                    'Post-operative instructions and follow-up for healing.',
                ],
                'general_dentists' => $generalDentists,
                'specialist_label' => 'Our Oral Surgery Specialist:',
                'specialist_names' => ['Shivly'],
                'sort_order' => 8,
                'is_active' => true,
            ],
            [
                'id' => 9,
                'title' => 'Oral Care',
                'slug' => 'oral-care',
                'image' => '/layanan/Oral Care.png',
                'intro' => 'Oral care includes routine check-ups, professional cleaning, and personalized guidance to keep your teeth and gums healthy.',
                'paragraphs' => [
                    'Preventive care is the most effective way to reduce cavities, gum disease, and bad breath.',
                    'We tailor recommendations based on your oral condition and lifestyle.',
                ],
                'steps' => [
                    'Oral examination and plaque/tartar assessment.',
                    'Professional scaling/polishing for a cleaner, fresher mouth.',
                    'Home care plan: brushing technique, flossing, and recommended products.',
                ],
                'general_dentists' => $generalDentists,
                'sort_order' => 9,
                'is_active' => true,
            ],
            [
                'id' => 10,
                'title' => 'Dental Bridges',
                'slug' => 'dental-bridges',
                'image' => '/layanan/Dental Bridges.png',
                'intro' => 'Dental bridges replace one or more missing teeth by anchoring an artificial tooth to neighboring teeth or implants.',
                'paragraphs' => [
                    'A well-made bridge restores chewing, speech, and aesthetics while preventing teeth from shifting.',
                    'We design bridges that look natural and feel comfortable.',
                ],
                'steps' => [
                    'Assessment and bridge design selection.',
                    'Tooth preparation and impressions.',
                    'Try-in and final cementation with bite refinement.',
                ],
                'general_dentists' => $generalDentists,
                'sort_order' => 10,
                'is_active' => true,
            ],
            [
                'id' => 11,
                'title' => 'Bone Grafting',
                'slug' => 'bone-grafting',
                'image' => '/layanan/Bone Grafting.png',
                'intro' => 'Bone grafting adds or regenerates bone in the jaw to support implants or improve long-term stability.',
                'paragraphs' => [
                    'When bone volume is insufficient, grafting helps create a stronger foundation for future treatments.',
                    'The procedure is planned carefully with imaging and healing time consideration.',
                ],
                'steps' => [
                    'Assessment of bone volume and treatment planning.',
                    'Bone graft placement with appropriate materials.',
                    'Healing period and re-evaluation before implants or restoration.',
                ],
                'general_dentists' => $generalDentists,
                'sort_order' => 11,
                'is_active' => true,
            ],
            [
                'id' => 12,
                'title' => 'Dental Spa',
                'slug' => 'dental-spa',
                'image' => '/layanan/Dental Spa.png',
                'intro' => 'Dental spa services combine professional oral care with a calm, comfortable experience—focused on relaxation and wellness.',
                'paragraphs' => [
                    'Ideal for patients who want a more soothing dental visit with comfort-first care.',
                    'We prioritize gentle techniques and a relaxing environment.',
                ],
                'steps' => [
                    'Personalized consultation to understand comfort preferences.',
                    'Professional cleaning and supportive care.',
                    'Optional add-ons depending on availability (whitening, polish, etc.).',
                ],
                'general_dentists' => $generalDentists,
                'sort_order' => 12,
                'is_active' => true,
            ],
            [
                'id' => 13,
                'title' => 'Veneers',
                'slug' => 'veneers',
                'image' => '/layanan/Veneers.png',
                'intro' => 'Veneers are thin shells placed on the front surface of teeth to improve shape, color, and overall smile aesthetics.',
                'paragraphs' => [
                    'They can help address stains, gaps, chips, and mild misalignment while maintaining a natural look.',
                    'We aim for a balanced, harmonious result tailored to your facial features.',
                ],
                'steps' => [
                    'Smile design consultation and shade selection.',
                    'Minimal tooth preparation and impression.',
                    'Veneer placement and final polishing.',
                ],
                'general_dentists' => $generalDentists,
                'specialist_label' => 'Our Cosmetic Dentist:',
                'specialist_names' => ['Yulita Dora'],
                'sort_order' => 13,
                'is_active' => true,
            ],
            [
                'id' => 14,
                'title' => 'Invisalign',
                'slug' => 'invisalign',
                'image' => '/layanan/Invisalign.png',
                'intro' => 'Invisalign uses clear aligners to straighten teeth with a discreet, comfortable approach.',
                'paragraphs' => [
                    'Aligners are custom-made and replaced periodically to gradually move teeth into the planned position.',
                    'It’s suitable for many mild-to-moderate alignment cases.',
                ],
                'steps' => [
                    'Digital scan and treatment simulation.',
                    'Aligner fitting and wear schedule guidance.',
                    'Regular check-ins and refinement until completion.',
                ],
                'general_dentists' => $generalDentists,
                'specialist_label' => 'Our Orthodontic Team:',
                'specialist_names' => ['Della Sparringa'],
                'sort_order' => 14,
                'is_active' => true,
            ],
            [
                'id' => 15,
                'title' => 'Orthodontics',
                'slug' => 'orthodontics',
                'image' => '/layanan/Orthodontics.png',
                'intro' => 'Orthodontics corrects tooth alignment and bite problems to improve function, comfort, and aesthetics.',
                'paragraphs' => [
                    'Treatment options may include braces or clear aligners, depending on your case.',
                    'A proper bite helps reduce excessive wear and supports better oral hygiene.',
                ],
                'steps' => [
                    'Assessment of bite, spacing, and jaw relationship.',
                    'Treatment plan selection (braces/aligners) and timeline estimate.',
                    'Periodic adjustments and retention planning.',
                ],
                'general_dentists' => $generalDentists,
                'specialist_label' => 'Our Orthodontic Team:',
                'specialist_names' => ['Della Sparringa'],
                'sort_order' => 15,
                'is_active' => true,
            ],
            [
                'id' => 16,
                'title' => 'Dental Fillings, Inlays & Onlays',
                'slug' => 'dental-fillings-inlays-onlays',
                'image' => '/layanan/Dental Fillings, Inlays & Onlays.png',
                'intro' => 'Fillings, inlays, and onlays restore teeth damaged by decay or fractures while preserving healthy tooth structure.',
                'paragraphs' => [
                    'Direct fillings are typically completed in one visit, while inlays/onlays are custom restorations for larger cavities.',
                    'We focus on precise fit, strong bite, and natural appearance.',
                ],
                'steps' => [
                    'Removal of decay and tooth preparation.',
                    'Placement of filling or impression for an inlay/onlay.',
                    'Final fitting, bonding, and bite adjustment.',
                ],
                'general_dentists' => $generalDentists,
                'sort_order' => 16,
                'is_active' => true,
            ],
            [
                'id' => 17,
                'title' => 'Gum Ablation',
                'slug' => 'gum-ablation',
                'image' => '/layanan/Gum Ablation.png',
                'intro' => 'Gum ablation is a procedure to remove or contour gum tissue for improved gum health or smile aesthetics.',
                'paragraphs' => [
                    'It can help address excessive gum tissue, irregular gum lines, or certain gum conditions.',
                    'We use careful techniques for a clean contour and comfortable healing.',
                ],
                'steps' => [
                    'Evaluation of gum line and tissue condition.',
                    'Precise ablation/contouring under local anesthesia.',
                    'Healing guidance and follow-up checks.',
                ],
                'general_dentists' => $generalDentists,
                'specialist_label' => 'Our Periodontal Team:',
                'specialist_names' => ['Pramodanti Jiwanakusuma, Sp.KG'],
                'sort_order' => 17,
                'is_active' => true,
            ],
            [
                'id' => 18,
                'title' => 'Lip Repositioning',
                'slug' => 'lip-repositioning',
                'image' => '/layanan/Lip Repositioning.png',
                'intro' => 'Lip repositioning is a procedure aimed at reducing excessive gum display by limiting upper lip movement when smiling.',
                'paragraphs' => [
                    'It may be an option for certain gummy smile cases based on facial and lip anatomy.',
                    'A thorough evaluation is needed to determine the best approach.',
                ],
                'steps' => [
                    'Smile analysis and candidacy evaluation.',
                    'Minor surgical repositioning under local anesthesia.',
                    'Post-procedure care and monitoring.',
                ],
                'general_dentists' => $generalDentists,
                'sort_order' => 18,
                'is_active' => true,
            ],
            [
                'id' => 19,
                'title' => 'Crown lengthening',
                'slug' => 'crown-lengthening',
                'image' => '/layanan/Crown lengthening.png',
                'intro' => 'Crown lengthening reshapes gum and sometimes bone tissue to expose more of the tooth structure.',
                'paragraphs' => [
                    'It can be performed for restorative needs (to place a crown) or cosmetic improvements.',
                    'We focus on balanced gum contours and predictable healing.',
                ],
                'steps' => [
                    'Assessment and planning based on gum/tooth proportions.',
                    'Reshaping of gum tissue (and bone if required).',
                    'Healing period and final restoration planning.',
                ],
                'general_dentists' => $generalDentists,
                'sort_order' => 19,
                'is_active' => true,
            ],
            [
                'id' => 20,
                'title' => 'Gummy Smile Correction',
                'slug' => 'gummy-smile-correction',
                'image' => '/layanan/Gummy Smile Correction.png',
                'intro' => 'Gummy smile correction improves smile proportions by reducing excessive gum display.',
                'paragraphs' => [
                    'The right approach depends on the cause—gum tissue, tooth size, lip movement, or jaw factors.',
                    'We customize treatment options to suit your facial structure and expectations.',
                ],
                'steps' => [
                    'Diagnosis to identify the cause of gummy smile.',
                    'Treatment plan selection (contouring, crown lengthening, lip repositioning, etc.).',
                    'Follow-up and maintenance to preserve results.',
                ],
                'general_dentists' => $generalDentists,
                'sort_order' => 20,
                'is_active' => true,
            ],
            [
                'id' => 21,
                'title' => 'Frenectomy',
                'slug' => 'frenectomy',
                'image' => '/layanan/Frenectomy.png',
                'intro' => 'Frenectomy is a minor procedure to release a tight frenum (tissue band) that may affect speech, gum health, or tooth spacing.',
                'paragraphs' => [
                    'It can be indicated for lip-tie or tongue-tie cases after proper evaluation.',
                    'The procedure is quick and typically has a smooth recovery.',
                ],
                'steps' => [
                    'Evaluation of frenum attachment and functional impact.',
                    'Release procedure under local anesthesia.',
                    'Post-care guidance and healing follow-up.',
                ],
                'general_dentists' => $generalDentists,
                'sort_order' => 21,
                'is_active' => true,
            ],
        ];

        foreach ($services as $srv) {
            ClinicService::updateOrCreate(
                ['slug' => $srv['slug']],
                $srv
            );
        }

        // FAQs
        $faqs = [
            [
                'question' => 'Bagaimana cara melakukan reservasi?',
                'answer' => 'Anda dapat melakukan reservasi melalui menu "Reservasi" di website atau aplikasi, atau menghubungi nomor WhatsApp resmi klinik kami di 0819-9011-4949.',
                'category' => 'Reservasi',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'question' => 'Apakah ada biaya pembatalan?',
                'answer' => 'Tidak ada biaya pembatalan jika dilakukan minimal 24 jam sebelum jadwal konsultasi/tindakan yang telah disepakati.',
                'category' => 'Kebijakan',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'question' => 'Apa keuntungan menjadi member?',
                'answer' => 'Member mendapatkan potongan harga khusus, poin reward di setiap transaksi perawatan, prioritas reservasi jadwal, dan promo eksklusif bulanan.',
                'category' => 'Membership',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'question' => 'Metode pembayaran apa saja yang diterima?',
                'answer' => 'Kami menerima pembayaran Tunai, Debit Card, Kartu Kredit (Visa/Mastercard), QRIS, Transfer Bank, dan cicilan 0% untuk perawatan tertentu.',
                'category' => 'Pembayaran',
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::updateOrCreate(
                ['question' => $faq['question']],
                $faq
            );
        }
    }
}
