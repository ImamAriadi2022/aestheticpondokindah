import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import TestimonialsSection from "@/features/guest/home/components/TestimonialsSection";
import GallerySection from "@/features/guest/home/components/GallerySection";
import VideoSection from "@/features/guest/home/components/VideoSection";

export default function CeritaPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <TestimonialsSection />
        <GallerySection />
        <VideoSection youtubeId="JoRro4YqyyU" />
      </main>
      <Footer />
    </div>
  );
}
