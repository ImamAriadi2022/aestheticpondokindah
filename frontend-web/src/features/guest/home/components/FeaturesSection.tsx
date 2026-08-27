import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  fetchPublicHome,
  type HomeContentData,
  DEFAULT_HOME_CONTENT,
} from "@/features/admin/etalase/services/etalaseService";

interface FeaturesSectionProps {
  content?: HomeContentData;
}

export default function FeaturesSection({ content: propContent }: FeaturesSectionProps) {
  const [content, setContent] = useState<HomeContentData>(
    propContent || DEFAULT_HOME_CONTENT
  );

  useEffect(() => {
    if (propContent) {
      setContent(propContent);
      return;
    }

    fetchPublicHome()
      .then((data) => {
        if (data) setContent(data);
      })
      .catch(() => {});
  }, [propContent]);

  const tag = content.about_tag || DEFAULT_HOME_CONTENT.about_tag || "ABOUT US";
  const title1 =
    content.about_title_line1 ||
    DEFAULT_HOME_CONTENT.about_title_line1 ||
    "15 Years of Expertise";
  const title2 =
    content.about_title_line2 ||
    DEFAULT_HOME_CONTENT.about_title_line2 ||
    "in Dental Care";
  const description =
    content.about_description ||
    DEFAULT_HOME_CONTENT.about_description ||
    "Kami menghadirkan pengalaman perawatan gigi yang nyaman, modern, dan aman dengan tim dokter profesional.";
  const points =
    content.about_points && content.about_points.length > 0
      ? content.about_points
      : DEFAULT_HOME_CONTENT.about_points || [];
  const ctaText =
    content.about_cta_text || DEFAULT_HOME_CONTENT.about_cta_text || "Learn More";
  const ctaLink =
    content.about_cta_link || DEFAULT_HOME_CONTENT.about_cta_link || "/about";
  const image1 =
    content.about_image1 ||
    DEFAULT_HOME_CONTENT.about_image1 ||
    "/about/tentang1.webp";
  const image2 =
    content.about_image2 ||
    DEFAULT_HOME_CONTENT.about_image2 ||
    "/about/tentang2.webp";

  return (
    <section className="py-14 sm:py-20 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-brand-gold/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute top-1/2 right-0 w-72 h-72 bg-brand-gold-light/40 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="absolute -top-8 -left-8 w-16 h-16 rounded-3xl bg-brand-gold/10" />
            <div className="absolute -top-2 left-10 w-10 h-10 rounded-2xl bg-brand-gold/15" />
            <div className="grid grid-cols-[1.25fr_1fr] gap-5 items-end">
              <div className="relative overflow-hidden rounded-[2.25rem] bg-brand-cream border border-border shadow-xl shadow-black/5">
                <img
                  src={image1}
                  alt="Dokter & Fasilitas Klinik"
                  className="w-full h-[340px] object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-[2.25rem] bg-brand-cream border border-border shadow-xl shadow-black/5">
                <img
                  src={image2}
                  alt="Perawatan Pasien"
                  className="w-full h-[260px] object-cover"
                />
              </div>
            </div>

            <div className="absolute -bottom-6 left-10">
              <div className="bg-background rounded-2xl border border-border shadow-xl shadow-black/10 px-6 py-4 flex items-center gap-3">
                <img src="/logo/logo.webp" alt="Aesthetic Pondok Indah" className="h-10 w-auto" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-sm font-semibold text-brand-gold tracking-wide uppercase">
              {tag}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal leading-tight">
              {title1}
              {title2 && <span className="block">{title2}</span>}
            </h2>
            <p className="text-brand-warm-gray font-body leading-relaxed">
              {description}
            </p>

            <div className="space-y-3">
              {points.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded-full bg-brand-gold/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                  </div>
                  <span className="text-brand-charcoal font-body">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              {ctaLink.startsWith("http") ? (
                <a href={ctaLink} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-gradient-gold hover:opacity-90 text-white font-semibold px-6 rounded-xl shadow-lg shadow-brand-gold/20 font-body cursor-pointer">
                    {ctaText}
                  </Button>
                </a>
              ) : (
                <Link to={ctaLink}>
                  <Button className="bg-gradient-gold hover:opacity-90 text-white font-semibold px-6 rounded-xl shadow-lg shadow-brand-gold/20 font-body cursor-pointer">
                    {ctaText}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
