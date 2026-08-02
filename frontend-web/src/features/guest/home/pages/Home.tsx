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
import { useEffect, useState } from "react";
import { API_BASE } from "@/core/api/apiConfig";

export default function HomePage() {
  const [popupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem("apident:cached_popup");

    // Buka popup hanya setelah render stabil dan hanya jika ada cache.
    // Ini menghindari race condition Radix Dialog Portal yang kadang bikin blank.
    if (cached) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPopupOpen(true));
      });
    }

    // Tetap fetch untuk sync data terbaru (tanpa memaksa open).
    fetch(`${API_BASE}/public/popup/active`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          localStorage.setItem("apident:cached_popup", JSON.stringify(data));
          // Kalau belum open (misalnya cache kosong), open setelah data siap.
          if (!cached) {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => setPopupOpen(true));
            });
          }
        }
      })
      .catch(() => {});
  }, []);

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
