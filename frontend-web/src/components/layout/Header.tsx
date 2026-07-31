import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { submitPublicReservation, WA_NUMBER } from "@/features/reservation/services/reservationApi";
import { Menu, X, Mail, Clock, MessageCircle, LogIn, User, Phone, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const navItems = [
  { name: "Beranda", path: "/" },
  { name: "Tentang", path: "/about" },
  { name: "Dokter", path: "/doctors" },
  { name: "Layanan", path: "/services" },
  { name: "Blog", path: "/blog" },
  { name: "Promo", path: "/promo" },
  { name: "Download", path: "/download" },
  { name: "Cerita", path: "/cerita" },
];

const complaints = [
  { value: "", label: "Pilih keluhan" },
  { value: "konsultasi-umum", label: "Konsultasi Umum" },
  { value: "veneer", label: "Veneer" },
  { value: "smile-design", label: "Smile Design" },
  { value: "bleaching", label: "Bleaching" },
  { value: "scaling", label: "Scaling" },
  { value: "orthodonti", label: "Orthodonti / Behel" },
  { value: "implan-gigi", label: "Implan Gigi" },
  { value: "lainnya", label: "Lainnya" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    complaint: "",
    time: "",
  });
  const location = useLocation();

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submitPublicReservation({
      name: formData.name,
      phone: formData.phone,
      complaint: formData.complaint,
      date: formData.time,
      source: "header_book_now",
    });
    setBookingOpen(false);
    setFormData({ name: "", phone: "", complaint: "", time: "" });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const computeIsLoggedIn = () => {
      const token = localStorage.getItem("apident:token");
      const userRaw = localStorage.getItem("apident:user");
      const demoSession = localStorage.getItem("apident:demo_session_v1");

      if (token || userRaw || demoSession) return true;
      return false;
    };

    const sync = () => setIsLoggedIn(computeIsLoggedIn());
    sync();

    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "apident:token" ||
        e.key === "apident:user" ||
        e.key === "apident:demo_session_v1"
      )
        sync();
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gradient-gold text-background py-2.5 hidden md:block">
        <div className="container mx-auto px-6 lg:px-12 flex justify-between items-center text-sm">
          <div className="flex items-center gap-8">
            <a
              href={`https://wa.me/${WA_NUMBER}`}
              className="flex items-center gap-2 text-background/90 hover:text-background transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-background" />
              <span className="font-medium">+62 819-9011-4949</span>
            </a>
            <a
              href="mailto:info@aestheticpondokindah.com"
              className="flex items-center gap-2 text-background/90 hover:text-background transition-colors"
            >
              <Mail className="w-4 h-4 text-background" />
              <span>info@aestheticpondokindah.com</span>
            </a>
          </div>
          <div className="flex items-center gap-2 text-background/90">
            <Clock className="w-4 h-4 text-background" />
            <span>Senin - Sabtu: 10:00 - 18:00 WIB</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        className={`bg-background z-50 transition-all duration-300 relative ${
          scrolled ? "shadow-lg shadow-black/5" : "shadow-sm"
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 group">
              <img src="/logo/logo.png" alt="Aesthetic Pondok Indah" className="h-12 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                >
                  <Link
                    to={item.path}
                    className={`relative px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5 font-body after:content-[''] after:absolute after:left-4 after:right-4 after:bottom-1 after:h-[2px] after:bg-brand-gold after:origin-left after:scale-x-0 after:opacity-0 after:transition-all after:duration-300 hover:after:scale-x-100 hover:after:opacity-100 ${
                      isActive(item.path)
                        ? "text-brand-gold after:scale-x-100 after:opacity-100"
                        : "text-brand-charcoal hover:text-brand-gold"
                    }`}
                  >
                    {item.name}
                  </Link>
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Button
                onClick={() => setBookingOpen(true)}
                className="bg-gradient-gold hover:opacity-90 text-white font-semibold px-6 rounded-xl shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/30 transition-all font-body"
              >
                Book Now
              </Button>
              <Link to={isLoggedIn ? "/dashboard" : "/login"} aria-label={isLoggedIn ? "Profile" : "Sign in"}>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-border text-brand-charcoal hover:bg-brand-gold-light"
                >
                  {isLoggedIn ? <User className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2.5 rounded-lg hover:bg-brand-gold-light transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-brand-charcoal" />
              ) : (
                <Menu className="w-6 h-6 text-brand-charcoal" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-background border-t border-border">
            <div className="container mx-auto px-6 lg:px-12 py-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.path}
                    className={`block px-4 py-3.5 rounded-lg text-sm font-medium font-body transition-colors ${
                      isActive(item.path)
                        ? "text-brand-gold bg-brand-gold-light"
                        : "text-brand-charcoal hover:text-brand-gold hover:bg-brand-gold-light/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </div>
              ))}
              <Button
                onClick={() => {
                  setBookingOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-gold text-white font-semibold rounded-xl mt-4 font-body"
              >
                Book Now
              </Button>
              <Button asChild variant="outline" className="w-full rounded-xl mt-3 font-body">
                <Link
                  to={isLoggedIn ? "/dashboard" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {isLoggedIn ? (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      Profil
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Booking Modal */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="w-[calc(100vw-24px)] sm:max-w-[800px] max-w-[400px] p-0 overflow-hidden mx-3 sm:mx-auto rounded-2xl">
          <DialogHeader className="p-4 sm:p-6 pb-0">
            <DialogTitle className="text-lg sm:text-2xl font-bold text-brand-charcoal">
              Book Your <span className="text-brand-gold">Appointment</span>
            </DialogTitle>
            <p className="text-xs sm:text-sm text-brand-warm-gray mt-1">
              Isi formulir berikut untuk melakukan booking konsultasi dengan dokter kami.
            </p>
          </DialogHeader>

          <form onSubmit={handleBookingSubmit} className="p-4 sm:p-6 pt-3 sm:pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
              {/* Nama */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-brand-charcoal">
                  Nama
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold/60" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nama lengkap"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm border-border/50 focus:border-brand-gold focus:ring-brand-gold/20"
                    required
                  />
                </div>
              </div>

              {/* Nomor HP */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm font-medium text-brand-charcoal">
                  Nomor HP
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold/60" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Nomor WhatsApp"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm border-border/50 focus:border-brand-gold focus:ring-brand-gold/20"
                    required
                  />
                </div>
              </div>

              {/* Keluhan */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="complaint" className="text-xs sm:text-sm font-medium text-brand-charcoal">
                  Keluhan
                </Label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold/60" />
                  <select
                    id="complaint"
                    value={formData.complaint}
                    onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                    className="bg-background border border-border h-10 sm:h-12 rounded-xl px-3 py-2 text-sm transition-colors w-full min-w-0 outline-none font-body pl-9 sm:pl-10 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/20"
                    required
                  >
                    {complaints.map((c) => (
                      <option key={c.value} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pilih Waktu */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="time" className="text-xs sm:text-sm font-medium text-brand-charcoal">
                  Pilih Waktu <span className="font-normal text-brand-warm-gray/60">(opsional)</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold/60" />
                  <Input
                    id="time"
                    type="date"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="pl-9 sm:pl-10 h-10 sm:h-12 text-sm border-border/50 focus:border-brand-gold focus:ring-brand-gold/20"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2 lg:col-span-4 pt-1 sm:pt-0">
                <Button
                  type="submit"
                  className="w-full h-10 sm:h-12 bg-gradient-gold hover:opacity-90 text-white font-semibold rounded-xl shadow-lg shadow-brand-gold/20 transition-all text-sm sm:text-base"
                >
                  Book now
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
