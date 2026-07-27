import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";
import TestimonialsSection from "@/react-app/components/home/TestimonialsSection";
import GallerySection from "@/react-app/components/home/GallerySection";
import VideoSection from "@/react-app/components/home/VideoSection";

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
