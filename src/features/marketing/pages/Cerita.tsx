import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import GallerySection from "@/components/home/GallerySection";
import VideoSection from "@/components/home/VideoSection";

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
