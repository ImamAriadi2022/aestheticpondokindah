import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getSession } from "@/features/auth/services/demoAuth";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles, Shield, Clock, Heart } from "lucide-react";

const slides = [
  {
    icon: Sparkles,
    title: "Senyum Sehat",
    subtitle: "Percaya Diri Meningkat",
    description: "Layanan perawatan gigi modern untuk senyum terbaik Anda",
    bgColor: "from-[#1a1a2e] to-[#16213e]",
  },
  {
    icon: Shield,
    title: "Dokter Profesional",
    subtitle: "Berpengalaman",
    description: "Tim dokter gigi berpengalaman dan tersertifikasi",
    bgColor: "from-[#16213e] to-[#1a1a2e]",
  },
  {
    icon: Clock,
    title: "Mudah & Cepat",
    subtitle: "Reservasi Online",
    description: "Booking janji temu kapan saja, di mana saja",
    bgColor: "from-[#1a1a2e] to-[#0f3460]",
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const session = getSession();
    const storedUser = localStorage.getItem("apident:user");
    if (session || storedUser) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Check if onboarding was already shown
    const hasSeenOnboarding = localStorage.getItem("apident:onboarding_seen");
    if (hasSeenOnboarding) {
      setShowWelcome(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (showWelcome) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showWelcome]);

  const handleSkip = () => {
    localStorage.setItem("apident:onboarding_seen", "true");
    setShowWelcome(false);
  };

  const handleGetStarted = () => {
    localStorage.setItem("apident:onboarding_seen", "true");
    navigate("/login");
  };

  // Welcome Screen (First Time)
  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex flex-col relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a24a]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#c9a24a]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Logo */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-20">
          <div className="w-24 h-24 bg-gradient-to-br from-[#c9a24a] to-[#a8843a] rounded-3xl flex items-center justify-center shadow-2xl shadow-[#c9a24a]/30 mb-8">
            <Heart className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            Aesthetic
          </h1>
          <h2 className="text-2xl font-medium text-[#c9a24a] mb-6 text-center">
            Pondok Indah
          </h2>
          
          <p className="text-white/70 text-center text-base max-w-xs leading-relaxed">
            Senyum sehat, percaya diri meningkat. Layanan perawatan gigi modern untuk Anda.
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="px-6 pb-12 pt-8">
          <div className="flex gap-2 mb-6 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === 0 ? "bg-[#c9a24a] w-6" : "bg-white/30"
                }`}
              />
            ))}
          </div>
          
          <Button
            onClick={handleSkip}
            className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold text-lg rounded-2xl shadow-lg shadow-[#c9a24a]/30 hover:opacity-90 transition-all"
          >
            Mulai Sekarang
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-white/50 text-xs text-center mt-4">
            Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan
          </p>
        </div>
      </div>
    );
  }

  // Slider Screen
  const current = slides[currentSlide];
  const Icon = current.icon;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${current.bgColor} flex flex-col relative overflow-hidden transition-all duration-700`}>
      {/* Decorative Elements */}
      <div className="absolute top-20 right-0 w-48 h-48 bg-[#c9a24a]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-0 w-64 h-64 bg-[#c9a24a]/5 rounded-full blur-3xl" />
      
      {/* Skip Button */}
      <button
        onClick={handleGetStarted}
        className="absolute top-12 right-6 text-white/60 text-sm font-medium hover:text-white transition-colors"
      >
        Lewati
      </button>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-20">
        <div className="w-32 h-32 bg-gradient-to-br from-[#c9a24a]/20 to-[#c9a24a]/5 rounded-full flex items-center justify-center mb-8 border border-[#c9a24a]/20">
          <Icon className="w-16 h-16 text-[#c9a24a]" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          {current.title}
        </h1>
        <h2 className="text-xl font-medium text-[#c9a24a] mb-4 text-center">
          {current.subtitle}
        </h2>
        <p className="text-white/60 text-center text-sm max-w-xs leading-relaxed">
          {current.description}
        </p>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-12 pt-8">
        {/* Slide Indicators */}
        <div className="flex gap-2 mb-8 justify-center">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentSlide 
                  ? "bg-[#c9a24a] w-8" 
                  : "bg-white/30 w-1.5 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {currentSlide < slides.length - 1 ? (
            <>
              <Button
                variant="outline"
                onClick={handleGetStarted}
                className="flex-1 h-14 border-white/20 text-white bg-white/5 hover:bg-white/10 rounded-2xl"
              >
                Login
              </Button>
              <Button
                onClick={() => setCurrentSlide(prev => prev + 1)}
                className="flex-1 h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold rounded-2xl shadow-lg shadow-[#c9a24a]/30"
              >
                Lanjut
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </>
          ) : (
            <Button
              onClick={handleGetStarted}
              className="w-full h-14 bg-gradient-to-r from-[#c9a24a] to-[#a8843a] text-white font-semibold text-lg rounded-2xl shadow-lg shadow-[#c9a24a]/30"
            >
              Masuk Aplikasi
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
        
        {currentSlide === slides.length - 1 && (
          <button
            onClick={() => navigate("/login?mode=register")}
            className="w-full text-center mt-4 text-white/60 text-sm hover:text-white transition-colors"
          >
            Belum punya akun? <span className="text-[#c9a24a] font-medium">Daftar</span>
          </button>
        )}
      </div>
    </div>
  );
}
