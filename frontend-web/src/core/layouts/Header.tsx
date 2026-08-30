import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { WA_NUMBER } from "@/features/guest/reservation/services/reservationApi";
import { Menu, X, Mail, Clock, MessageCircle, LogIn, User } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { getSession, getDefaultDashboardPath } from "@/core/auth/services/session";

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

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

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
      return Boolean(token || userRaw);
    };

    const sync = () => setIsLoggedIn(computeIsLoggedIn());
    sync();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "apident:token" || e.key === "apident:user") {
        sync();
      }
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
              <img
                src="/logo/logo-vertikal.webp"
                alt="Aesthetic Pondok Indah"
                className="h-14 w-auto object-contain py-1"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/logo/Logo-vertikal.png";
                }}
              />
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
                asChild
                className="bg-gradient-gold hover:opacity-90 text-white font-semibold px-6 rounded-xl shadow-lg shadow-brand-gold/20 hover:shadow-brand-gold/30 transition-all font-body cursor-pointer"
              >
                <Link to="/booking/new">
                  Book Now
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-xl border-brand-gold/40 text-brand-charcoal hover:text-brand-gold hover:bg-brand-gold-light/60 font-semibold px-5 h-10 text-sm transition-all flex items-center shadow-2xs cursor-pointer"
              >
                <Link to={isLoggedIn ? (getSession()?.role ? getDefaultDashboardPath(getSession()!.role) : "/dashboard/user") : "/login"}>
                  {isLoggedIn ? (
                    <>
                      <User className="w-4 h-4 mr-2 text-brand-gold" />
                      Masuk Dashboard
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2 text-brand-gold" />
                      Login
                    </>
                  )}
                </Link>
              </Button>
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
                asChild
                className="w-full bg-gradient-gold text-white font-semibold rounded-xl mt-4 font-body cursor-pointer"
              >
                <Link to="/booking/new" onClick={() => setMobileMenuOpen(false)}>
                  Book Now
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full rounded-xl mt-3 font-body cursor-pointer">
                <Link
                  to={isLoggedIn ? (getSession()?.role ? getDefaultDashboardPath(getSession()!.role) : "/dashboard/user") : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {isLoggedIn ? (
                    <>
                      <User className="w-4 h-4 mr-2 text-brand-gold" />
                      Masuk Dashboard
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2 text-brand-gold" />
                      Login
                    </>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
