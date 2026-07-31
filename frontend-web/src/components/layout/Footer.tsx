import { Link } from "react-router";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube, FileText, Shield } from "lucide-react";

const quickLinks = [
  { name: "Beranda", path: "/" },
  { name: "Tentang Kami", path: "/about" },
  { name: "Layanan", path: "/services" },
  { name: "Blog", path: "/blog" },
  { name: "Kontak", path: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 pb-20 sm:pb-24 lg:pb-0">
      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-6 lg:gap-4 items-start">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1 space-y-2 sm:space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="https://019caa26-b43a-74ce-b207-4a397d517d3f.mochausercontent.com/image.png_9613.png"
                alt="Aesthetic Pondok Indah"
                className="h-10 sm:h-12 w-auto"
              />
            </Link>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-[280px]">
              Klinik gigi premium di Pondok Indah, Jakarta yang menghadirkan solusi dental profesional.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <a 
                href="https://www.facebook.com/aesthetic.pondokindah/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-gold rounded-full flex items-center justify-center text-white hover:bg-brand-gold/80 transition-all"
              >
                <Facebook className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a 
                href="https://www.instagram.com/aesthetic.pondokindah/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-gold rounded-full flex items-center justify-center text-white hover:bg-brand-gold/80 transition-all"
              >
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a 
                href="https://youtube.com/@aestheticpondokindah" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-gold rounded-full flex items-center justify-center text-white hover:bg-brand-gold/80 transition-all"
              >
                <Youtube className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a 
                href="https://www.tiktok.com/@aestheticpondokindah" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-gold rounded-full flex items-center justify-center text-white hover:bg-brand-gold/80 transition-all"
              >
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.31-.75.42-1.24 1.21-1.35 2.06-.11.97.31 1.99 1.1 2.51.62.45 1.44.6 2.18.41 1.09-.24 1.98-1.17 2.18-2.26.04-.32.04-.64.04-.96-.01-4.08-.01-8.17-.01-12.25z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">Menu Cepat</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-500 text-xs sm:text-sm hover:text-brand-gold transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-brand-gold text-[10px] sm:text-xs">•</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-2 sm:space-y-3 lg:-ml-10">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">Hubungi Kami</h3>
            <div className="space-y-2 text-xs sm:text-sm text-gray-500">
              <a href="tel:0217695948" className="flex items-start gap-2 hover:text-brand-gold transition-colors">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                <span className="break-all">021-7695948</span>
              </a>
              <a href="mailto:aesthetic.pondokindah@gmail.com" className="flex items-start gap-2 hover:text-brand-gold transition-colors">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                <span className="break-all">aesthetic.pondokindah@gmail.com</span>
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold flex-shrink-0 mt-0.5" />
                <span>Jl. Niaga Hijau Raya No.49, Pd. Pinang, Kec. Kby. Lama, Kota Jakarta Selatan, DKI Jakarta 12310</span>
              </p>
            </div>
          </div>

          {/* Map - Full width on mobile */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2 h-28 sm:h-32 lg:h-36 bg-gray-200 rounded-lg overflow-hidden">
            <a
              href="https://maps.app.goo.gl/DDRkJMn5S1M5fqYC7"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <iframe
                src="https://www.google.com/maps?q=Klinik+Gigi+Aesthetic+Pondok+Indah&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, pointerEvents: "none" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Klinik"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-sm text-gray-600">
            <div className="flex flex-col items-start gap-1">
              <p>© 2026 Aesthetic Pondok Indah. All rights reserved.</p>
              <div className="flex flex-row gap-4">
                <Link to="/privacy-policy" className="hover:text-brand-gold transition-colors flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="hover:text-brand-gold transition-colors flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

