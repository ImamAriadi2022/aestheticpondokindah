import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import HeroSection from "@/features/guest/home/components/HeroSection";
import FeaturesSection from "@/features/guest/home/components/FeaturesSection";
import InsurancePartnersSection from "@/features/guest/home/components/InsurancePartnersSection";
import DownloadSection from "@/features/guest/home/components/DownloadSection";
import PromoCarousel from "@/features/guest/home/components/PromoCarousel";
import ServicesSection from "@/features/guest/home/components/ServicesSection";
import TestimonialsSection from "@/features/guest/home/components/TestimonialsSection";
import GallerySection from "@/features/guest/home/components/GallerySection";
import CTASection from "@/features/guest/home/components/CTASection";
import HomeWelcomePopup from "@/features/guest/home/components/HomeWelcomePopup";
import { useState } from "react";

export default function HomePage() {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24 lg:pb-0">
        <HomeWelcomePopup open={popupOpen} onOpenChange={setPopupOpen} />
        <HeroSection />
        <FeaturesSection />
        <PromoCarousel />
        <ServicesSection />
        <TestimonialsSection />
        <GallerySection />
        <DownloadSection />
        <InsurancePartnersSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
