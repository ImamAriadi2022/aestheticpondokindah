import { useRef, useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import { ArrowRight, ChevronLeft, ChevronRight, X, MessageCircle, Tag, Calendar, Percent } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";
import { logger } from "@/core/utils/logger";

type ServiceSpecialistSection = {
  label: string;
  names: string[];
};

type ServiceDetail = {
  id: string;
  title: string;
  image: string;
  intro: string;
  paragraphs: string[];
  steps: string[];
  generalDentists: string[];
  specialistSection?: ServiceSpecialistSection;
};

type PromoItem = {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  image_path?: string;
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
  created_at?: string;
};

const generalDentists = [
  "Yulita Dora",
  "Della Sparringa",
  "Nola Lolita",
  "Shivly",
  "Rannyani Ramli",
  "Ryan Jusuf",
  "Ryan Jusuf",
];

const services: ServiceDetail[] = [
  {
    id: "dental-whitening",
    title: "Dental Whitening",
    image: "/layanan/Dental Whitening.png",
    intro:
      "Dental whitening is a professional cosmetic treatment designed to brighten your smile safely and effectively.",
    paragraphs: [
      "Over time, teeth can become stained due to coffee, tea, smoking, and natural aging. Professional whitening helps lift stains and restore a more radiant appearance.",
      "At Aesthetic Pondok Indah, we use clinically tested materials and a careful approach to minimize sensitivity while maximizing results.",
    ],
    steps: [
      "Shade assessment and oral examination to ensure whitening is suitable.",
      "Protection of gums and soft tissue prior to the procedure.",
      "Application of whitening gel and activation (if needed), followed by final polishing.",
    ],
    generalDentists,
    specialistSection: {
      label: "Our Cosmetic Dentist:",
      names: ["Ryan Jusuf"],
    },
  },
  {
    id: "root-canal-treatments",
    title: "Root Canal Treatments",
    image: "/layanan/Root Canal Treatments.png",
    intro:
      "Root canal treatment is an essential dental procedure designed to save a tooth that has been severely damaged by infection or decay.",
    paragraphs: [
      "When the soft inner tissue of the tooth (pulp) becomes inflamed or infected—often due to deep cavities, cracks, or trauma—it can cause intense pain and swelling.",
      "Our goal is to remove the infected tissue, disinfect the canals, and seal the tooth to prevent reinfection, restoring comfort and function.",
    ],
    steps: [
      "Gently removing the infected or damaged pulp.",
      "Thoroughly cleaning and disinfecting the inner tooth canals.",
      "Sealing the canals to prevent reinfection and restoring the tooth’s structure.",
    ],
    generalDentists,
    specialistSection: {
      label: "Our Specialist Endodontist:",
      names: ["Pramodanti Jiwanakusuma, Sp.KG", "Riesta Paluvi, Sp.KG"],
    },
  },
  {
    id: "pediatric-dentistry",
    title: "Pediatric Dentistry",
    image: "/layanan/Pediatric Dentistry.png",
    intro:
      "Pediatric dentistry focuses on gentle, age-appropriate dental care for infants, children, and teens.",
    paragraphs: [
      "We help children build healthy habits early through preventive care, education, and a friendly clinic experience.",
      "Treatments are tailored to a child’s stage of growth to support long-term oral health.",
    ],
    steps: [
      "Dental check-up, risk assessment, and oral hygiene education.",
      "Preventive treatments such as fluoride and sealants when indicated.",
      "Restorative care if needed, with comfort-first techniques.",
    ],
    generalDentists,
    specialistSection: {
      label: "Our Pediatric Dentist:",
      names: ["Nola Lolita"],
    },
  },
  {
    id: "full-mouth-rehabilitations",
    title: "Full Mouth Rehabilitations",
    image: "/layanan/Full Mouth Rehabilitations.png",
    intro:
      "Full mouth rehabilitation is a comprehensive plan combining restorative and aesthetic treatments to rebuild function, comfort, and smile harmony.",
    paragraphs: [
      "It is typically recommended for extensive tooth wear, multiple missing teeth, bite issues, or complex dental problems affecting chewing and appearance.",
      "We design a phased plan that prioritizes health first, then function, and finally aesthetics.",
    ],
    steps: [
      "Comprehensive assessment (clinical exam, imaging, bite analysis).",
      "Customized treatment plan: restorations, crowns/bridges, implants, and gum care as needed.",
      "Final rehabilitation and maintenance plan for long-term stability.",
    ],
    generalDentists,
    specialistSection: {
      label: "Our Specialist Team:",
      names: ["Pramodanti Jiwanakusuma, Sp.KG", "Riesta Paluvi, Sp.KG"],
    },
  },
  {
    id: "emergency-dental-services",
    title: "Emergency Dental Services",
    image: "/layanan/Emergency Dental Services.png",
    intro:
      "Emergency dental services help manage urgent issues such as severe toothache, swelling, broken teeth, or dental trauma.",
    paragraphs: [
      "Fast and accurate diagnosis is crucial to relieve pain and prevent complications.",
      "We focus on stabilizing the condition first, then planning definitive treatment.",
    ],
    steps: [
      "Urgent assessment and pain management.",
      "Immediate care (temporary filling, drainage, splinting, etc.) as indicated.",
      "Follow-up plan for definitive treatment and prevention.",
    ],
    generalDentists,
  },
  {
    id: "dentures",
    title: "Dentures",
    image: "/layanan/Dentures.png",
    intro:
      "Dentures are removable appliances designed to replace missing teeth and restore chewing, speech, and facial support.",
    paragraphs: [
      "Options include full dentures and partial dentures, depending on how many teeth are missing.",
      "We ensure proper fit, comfort, and natural-looking aesthetics.",
    ],
    steps: [
      "Oral examination, measurements, and denture design selection.",
      "Try-in sessions to refine fit, bite, and appearance.",
      "Final delivery with adjustment and care instructions.",
    ],
    generalDentists,
  },
  {
    id: "dental-implants",
    title: "Dental Implants",
    image: "/layanan/Dental Implants.png",
    intro:
      "Dental implants are a long-term solution to replace missing teeth using a titanium root and a natural-looking crown.",
    paragraphs: [
      "Implants help preserve jawbone and allow you to chew comfortably without affecting adjacent teeth.",
      "Treatment is planned carefully with imaging and bite evaluation.",
    ],
    steps: [
      "Evaluation and implant planning (including imaging).",
      "Implant placement and healing period (osseointegration).",
      "Crown/bridge attachment and final bite adjustment.",
    ],
    generalDentists,
    specialistSection: {
      label: "Our Implant Specialist:",
      names: ["Rannyani Ramli"],
    },
  },
  {
    id: "dental-extraction-wisdom-tooth-removal",
    title: "Dental Extraction and Wisdom Tooth Removal",
    image: "/layanan/Dental Extraction and Wisdom Teeth Removal.png",
    intro:
      "Tooth extraction removes a problematic tooth safely, including impacted or painful wisdom teeth.",
    paragraphs: [
      "Extractions may be needed due to severe decay, infection, crowding, or impaction.",
      "We use careful techniques and anesthesia options to keep you comfortable.",
    ],
    steps: [
      "Clinical exam and imaging to assess root position and difficulty.",
      "Local anesthesia and gentle extraction technique.",
      "Post-operative instructions and follow-up for healing.",
    ],
    generalDentists,
    specialistSection: {
      label: "Our Oral Surgery Specialist:",
      names: ["Shivly"],
    },
  },
  {
    id: "oral-care",
    title: "Oral Care",
    image: "/layanan/Oral Care.png",
    intro:
      "Oral care includes routine check-ups, professional cleaning, and personalized guidance to keep your teeth and gums healthy.",
    paragraphs: [
      "Preventive care is the most effective way to reduce cavities, gum disease, and bad breath.",
      "We tailor recommendations based on your oral condition and lifestyle.",
    ],
    steps: [
      "Oral examination and plaque/tartar assessment.",
      "Professional scaling/polishing for a cleaner, fresher mouth.",
      "Home care plan: brushing technique, flossing, and recommended products.",
    ],
    generalDentists,
  },
  {
    id: "dental-bridges",
    title: "Dental Bridges",
    image: "/layanan/Dental Bridges.png",
    intro:
      "Dental bridges replace one or more missing teeth by anchoring an artificial tooth to neighboring teeth or implants.",
    paragraphs: [
      "A well-made bridge restores chewing, speech, and aesthetics while preventing teeth from shifting.",
      "We design bridges that look natural and feel comfortable.",
    ],
    steps: [
      "Assessment and bridge design selection.",
      "Tooth preparation and impressions.",
      "Try-in and final cementation with bite refinement.",
    ],
    generalDentists,
  },
  {
    id: "bone-grafting",
    title: "Bone Grafting",
    image: "/layanan/Bone Grafting.png",
    intro:
      "Bone grafting adds or regenerates bone in the jaw to support implants or improve long-term stability.",
    paragraphs: [
      "When bone volume is insufficient, grafting helps create a stronger foundation for future treatments.",
      "The procedure is planned carefully with imaging and healing time consideration.",
    ],
    steps: [
      "Assessment of bone volume and treatment planning.",
      "Bone graft placement with appropriate materials.",
      "Healing period and re-evaluation before implants or restoration.",
    ],
    generalDentists,
  },
  {
    id: "dental-spa",
    title: "Dental Spa",
    image: "/layanan/Dental Spa.png",
    intro:
      "Dental spa services combine professional oral care with a calm, comfortable experience—focused on relaxation and wellness.",
    paragraphs: [
      "Ideal for patients who want a more soothing dental visit with comfort-first care.",
      "We prioritize gentle techniques and a relaxing environment.",
    ],
    steps: [
      "Personalized consultation to understand comfort preferences.",
      "Professional cleaning and supportive care.",
      "Optional add-ons depending on availability (whitening, polish, etc.).",
    ],
    generalDentists,
  },
  {
    id: "veneers",
    title: "Veneers",
    image: "/layanan/Veneers.png",
    intro:
      "Veneers are thin shells placed on the front surface of teeth to improve shape, color, and overall smile aesthetics.",
    paragraphs: [
      "They can help address stains, gaps, chips, and mild misalignment while maintaining a natural look.",
      "We aim for a balanced, harmonious result tailored to your facial features.",
    ],
    steps: [
      "Smile design consultation and shade selection.",
      "Minimal tooth preparation and impression.",
      "Veneer placement and final polishing.",
    ],
    generalDentists,
    specialistSection: {
      label: "Our Cosmetic Dentist:",
      names: ["Yulita Dora"],
    },
  },
  {
    id: "invisalign",
    title: "Invisalign",
    image: "/layanan/Invisalign.png",
    intro:
      "Invisalign uses clear aligners to straighten teeth with a discreet, comfortable approach.",
    paragraphs: [
      "Aligners are custom-made and replaced periodically to gradually move teeth into the planned position.",
      "It’s suitable for many mild-to-moderate alignment cases.",
    ],
    steps: [
      "Digital scan and treatment simulation.",
      "Aligner fitting and wear schedule guidance.",
      "Regular check-ins and refinement until completion.",
    ],
    generalDentists,
    specialistSection: {
      label: "Our Orthodontic Team:",
      names: ["Della Sparringa"],
    },
  },
  {
    id: "orthodontics",
    title: "Orthodontics",
    image: "/layanan/Orthodontics.png",
    intro:
      "Orthodontics corrects tooth alignment and bite problems to improve function, comfort, and aesthetics.",
    paragraphs: [
      "Treatment options may include braces or clear aligners, depending on your case.",
      "A proper bite helps reduce excessive wear and supports better oral hygiene.",
    ],
    steps: [
      "Assessment of bite, spacing, and jaw relationship.",
      "Treatment plan selection (braces/aligners) and timeline estimate.",
      "Periodic adjustments and retention planning.",
    ],
    generalDentists,
    specialistSection: {
      label: "Our Orthodontic Team:",
      names: ["Della Sparringa"],
    },
  },
  {
    id: "dental-fillings-inlays-onlays",
    title: "Dental Fillings, Inlays & Onlays",
    image: "/layanan/Dental Fillings, Inlays & Onlays.png",
    intro:
      "Fillings, inlays, and onlays restore teeth damaged by decay or fractures while preserving healthy tooth structure.",
    paragraphs: [
      "Direct fillings are typically completed in one visit, while inlays/onlays are custom restorations for larger cavities.",
      "We focus on precise fit, strong bite, and natural appearance.",
    ],
    steps: [
      "Removal of decay and tooth preparation.",
      "Placement of filling or impression for an inlay/onlay.",
      "Final fitting, bonding, and bite adjustment.",
    ],
    generalDentists,
  },
  {
    id: "gum-ablation",
    title: "Gum Ablation",
    image: "/layanan/Gum Ablation.png",
    intro:
      "Gum ablation is a procedure to remove or contour gum tissue for improved gum health or smile aesthetics.",
    paragraphs: [
      "It can help address excessive gum tissue, irregular gum lines, or certain gum conditions.",
      "We use careful techniques for a clean contour and comfortable healing.",
    ],
    steps: [
      "Evaluation of gum line and tissue condition.",
      "Precise ablation/contouring under local anesthesia.",
      "Healing guidance and follow-up checks.",
    ],
    generalDentists,
    specialistSection: {
      label: "Our Periodontal Team:",
      names: ["Pramodanti Jiwanakusuma, Sp.KG"],
    },
  },
  {
    id: "lip-repositioning",
    title: "Lip Repositioning",
    image: "/layanan/Lip Repositioning.png",
    intro:
      "Lip repositioning is a procedure aimed at reducing excessive gum display by limiting upper lip movement when smiling.",
    paragraphs: [
      "It may be an option for certain gummy smile cases based on facial and lip anatomy.",
      "A thorough evaluation is needed to determine the best approach.",
    ],
    steps: [
      "Smile analysis and candidacy evaluation.",
      "Minor surgical repositioning under local anesthesia.",
      "Post-procedure care and monitoring.",
    ],
    generalDentists,
  },
  {
    id: "crown-lengthening",
    title: "Crown lengthening",
    image: "/layanan/Crown lengthening.png",
    intro:
      "Crown lengthening reshapes gum and sometimes bone tissue to expose more of the tooth structure.",
    paragraphs: [
      "It can be performed for restorative needs (to place a crown) or cosmetic improvements.",
      "We focus on balanced gum contours and predictable healing.",
    ],
    steps: [
      "Assessment and planning based on gum/tooth proportions.",
      "Reshaping of gum tissue (and bone if required).",
      "Healing period and final restoration planning.",
    ],
    generalDentists,
  },
  {
    id: "gummy-smile-correction",
    title: "Gummy Smile Correction",
    image: "/layanan/Gummy Smile Correction.png",
    intro:
      "Gummy smile correction improves smile proportions by reducing excessive gum display.",
    paragraphs: [
      "The right approach depends on the cause—gum tissue, tooth size, lip movement, or jaw factors.",
      "We customize treatment options to suit your facial structure and expectations.",
    ],
    steps: [
      "Diagnosis to identify the cause of gummy smile.",
      "Treatment plan selection (contouring, crown lengthening, lip repositioning, etc.).",
      "Follow-up and maintenance to preserve results.",
    ],
    generalDentists,
  },
  {
    id: "frenectomy",
    title: "Frenectomy",
    image: "/layanan/Frenectomy.png",
    intro:
      "Frenectomy is a minor procedure to release a tight frenum (tissue band) that may affect speech, gum health, or tooth spacing.",
    paragraphs: [
      "It can be indicated for lip-tie or tongue-tie cases after proper evaluation.",
      "The procedure is quick and typically has a smooth recovery.",
    ],
    steps: [
      "Evaluation of frenum attachment and functional impact.",
      "Release procedure under local anesthesia.",
      "Post-care guidance and healing follow-up.",
    ],
    generalDentists,
  },
];

export default function ServicesSection() {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);

  // Fetch promos on mount
  useEffect(() => {
    const fetchPromos = async () => {
      setLoadingPromos(true);
      try {
        const res = await fetch(`${API_BASE}/admin/promos`, {
          headers: { "Accept": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          // Filter only active promos and sort by newest
          const activePromos = data
            .filter((p: PromoItem) => p.is_active)
            .sort((a: PromoItem, b: PromoItem) => {
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateB - dateA;
            })
            .slice(0, 3); // Take only 3 latest
          setPromos(activePromos);
        }
      } catch (e) {
        logger.error("Gagal fetch promos", e);
      } finally {
        setLoadingPromos(false);
      }
    };
    fetchPromos();
  }, []);

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return services.find((s) => s.id === selectedServiceId) ?? null;
  }, [selectedServiceId]);

  const scrollByCards = (direction: "prev" | "next") => {
    const el = sliderRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-service-card]");
    const step = firstCard ? firstCard.offsetWidth + 16 : 320;
    el.scrollBy({ left: direction === "next" ? step : -step, behavior: "smooth" });
  };

  const openServiceModal = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setModalOpen(true);
  };

  return (
    <section className="bg-background">
      <div className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <div className="text-xs font-bold tracking-widest text-brand-warm-gray font-body">OUR SERVICES</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal leading-tight mt-2">
                A Wide Range of Services
                <span className="block">for Your Best Smile</span>
              </h2>
            </div>
            <Link to="/services">
              <Button
                variant="outline"
                className="border-2 border-brand-gold/25 text-brand-gold hover:bg-brand-gold-light font-semibold px-6 rounded-xl font-body"
              >
                Explore All Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => scrollByCards("prev")}
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-background rounded-xl shadow-lg items-center justify-center text-brand-charcoal hover:text-brand-gold hover:shadow-xl transition-all border border-border"
              aria-label="Previous services"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => scrollByCards("next")}
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-background rounded-xl shadow-lg items-center justify-center text-brand-charcoal hover:text-brand-gold hover:shadow-xl transition-all border border-border"
              aria-label="Next services"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div
              ref={sliderRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {services.map((service) => (
                <div
                  key={service.id}
                  data-service-card
                  className="snap-start shrink-0 basis-[85%] sm:basis-[60%] md:basis-[45%] lg:basis-[calc(33.333%-11px)] xl:basis-[calc(25%-12px)] group rounded-2xl bg-background border border-border shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 transition-shadow overflow-hidden"
                >
                  <div className="flex flex-row h-full">
                    {/* Square Image on Left */}
                    <div className="w-24 sm:w-28 flex-shrink-0 bg-brand-cream">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover aspect-square"
                        loading="lazy"
                      />
                    </div>
                    {/* Content on Right */}
                    <div className="flex flex-col justify-between p-4 flex-1 min-w-0">
                      <div>
                        <h3 className="text-sm font-bold text-brand-charcoal leading-tight line-clamp-1 mb-1">
                          {service.title}
                        </h3>
                        <p className="text-xs text-brand-warm-gray font-body leading-relaxed line-clamp-2">
                          {service.intro}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openServiceModal(service.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-gold mt-3 font-body hover:underline"
                      >
                        Selengkapnya
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Promo Section */}
      <div className="py-12 sm:py-16 bg-brand-gold/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <div className="text-xs font-bold tracking-widest text-brand-warm-gray font-body">PROMO SPESIAL</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal leading-tight mt-2">
                Penawaran Terbatas
                <span className="block">Untuk Anda</span>
              </h2>
            </div>
            <Link to="/promo">
              <Button
                variant="outline"
                className="border-2 border-brand-gold/25 text-brand-gold hover:bg-brand-gold-light font-semibold px-6 rounded-xl font-body"
              >
                Lihat Semua Promo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loadingPromos ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold"></div>
            </div>
          ) : promos.length === 0 ? (
            <div className="text-center py-12 text-brand-warm-gray">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-body">Belum ada promo tersedia saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promos.map((promo) => (
                <div
                  key={promo.id}
                  className="group rounded-2xl bg-white border border-brand-gold/20 shadow-lg shadow-brand-gold/5 hover:shadow-xl hover:shadow-brand-gold/10 transition-all overflow-hidden"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-brand-cream">
                    <img
                      src={getStorageUrl(promo.image_url || promo.image_path) || "/dashboard/placeholder.png"}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="w-4 h-4 text-brand-gold" />
                      <span className="text-xs font-bold text-brand-gold uppercase tracking-wide">Promo</span>
                    </div>
                    <h3 className="text-lg font-bold text-brand-charcoal mb-2 line-clamp-1">
                      {promo.title}
                    </h3>
                    <p className="text-sm text-brand-warm-gray font-body line-clamp-2 mb-4">
                      {promo.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-brand-warm-gray">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {promo.starts_at && promo.ends_at
                          ? `${new Date(promo.starts_at).toLocaleDateString("id-ID")} - ${new Date(promo.ends_at).toLocaleDateString("id-ID")}`
                          : "Periode terbatas"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Detail Modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={(nextOpen) => {
          setModalOpen(nextOpen);
          if (!nextOpen) setSelectedServiceId(null);
        }}
      >
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-6xl p-0 max-h-[calc(100vh-2rem)] overflow-y-auto lg:overflow-hidden rounded-[2.5rem]">
          {selectedService && (
            <div className="grid lg:grid-cols-2">
              <div className="relative bg-brand-cream aspect-square sm:aspect-video lg:aspect-auto">
                <img
                  src={selectedService.image}
                  alt={selectedService.title}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center text-brand-charcoal transition-colors z-20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 sm:p-10 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-cream rounded-full mb-5">
                  <span className="text-xs font-semibold text-brand-gold font-body">Aesthetic Pondok Indah</span>
                </div>

                <DialogTitle asChild>
                  <h3 className="text-2xl sm:text-3xl font-bold text-brand-gold">
                    {selectedService.title}
                  </h3>
                </DialogTitle>

                <div className="h-px bg-brand-gold/25 my-6" />

                <div className="space-y-4">
                  <p className="text-sm text-brand-charcoal font-body leading-relaxed font-semibold">
                    {selectedService.intro}
                  </p>
                  {selectedService.paragraphs.map((p) => (
                    <p key={p} className="text-sm text-brand-warm-gray font-body leading-relaxed">
                      {p}
                    </p>
                  ))}

                  <div className="pt-2">
                    <h4 className="text-sm font-bold text-brand-charcoal font-body">
                      The treatment involves:
                    </h4>
                    <ol className="list-decimal pl-5 mt-3 space-y-2 text-sm text-brand-warm-gray font-body">
                      {selectedService.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-4">
                    <h4 className="text-sm font-bold text-brand-gold font-body">Our General Dentist :</h4>
                    <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-brand-warm-gray font-body">
                      {selectedService.generalDentists.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  </div>

                  {selectedService.specialistSection && (
                    <div className="pt-4">
                      <h4 className="text-sm font-bold text-brand-gold font-body">
                        {selectedService.specialistSection.label}
                      </h4>
                      <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-brand-warm-gray font-body">
                        {selectedService.specialistSection.names.map((name) => (
                          <li key={name}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-8 flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-background pb-4 mt-auto">
                    <Link to="/services" className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full h-12 border-brand-gold/30 text-brand-gold hover:bg-brand-gold-light rounded-2xl font-semibold"
                      >
                        Lihat Semua Layanan
                      </Button>
                    </Link>
                    <a href="https://wa.me/6281990114949" target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button
                        className="w-full h-12 bg-gradient-gold hover:opacity-90 text-white rounded-2xl font-semibold shadow-lg shadow-brand-gold/20"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Booking Sekarang
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
