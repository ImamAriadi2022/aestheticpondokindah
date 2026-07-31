import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import InsurancePartnersSection from "@/components/home/InsurancePartnersSection";
import DownloadSection from "@/components/home/DownloadSection";
import PromoCarousel from "@/components/home/PromoCarousel";
import ServicesSection from "@/components/home/ServicesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import GallerySection from "@/components/home/GallerySection";
import CTASection from "@/components/home/CTASection";
import HomeWelcomePopup from "@/components/home/HomeWelcomePopup";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/apiConfig";

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
