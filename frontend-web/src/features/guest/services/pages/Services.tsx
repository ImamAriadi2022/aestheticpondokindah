import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Card } from "@/shared/ui/card";
import {
  MessageCircle,
  ArrowRight,
  X,
  QrCode,
  ShieldCheck,
  Banknote,
  Info,
  Calendar,
  Search,
  Sparkles,
  Clock,
  Tag,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  fetchPublicServices,
  defaultServices,
  type ServiceDetail,
} from "../services/servicesService";

export default function ServicesPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  // Dynamic Services with LocalStorage Cache-First Strategy
  const [servicesList, setServicesList] = useState<ServiceDetail[]>(() => {
    try {
      const cached = localStorage.getItem("apig_public_cached_services");
      return cached ? JSON.parse(cached) : defaultServices;
    } catch {
      return defaultServices;
    }
  });

  useEffect(() => {
    let isMounted = true;
    fetchPublicServices().then((data) => {
      if (isMounted && Array.isArray(data) && data.length > 0) {
        setServicesList(data);
        try {
          localStorage.setItem("apig_public_cached_services", JSON.stringify(data));
        } catch {}
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Categories extracted dynamically
  const categories = useMemo(() => {
    const set = new Set<string>();
    servicesList.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ["Semua", ...Array.from(set)];
  }, [servicesList]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return servicesList.filter((s) => {
      const matchCat = activeCategory === "Semua" || s.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.intro.toLowerCase().includes(q) ||
        (s.category && s.category.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [servicesList, activeCategory, searchQuery]);

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return servicesList.find((s) => s.id === selectedServiceId || String(s.rawId) === selectedServiceId) ?? null;
  }, [selectedServiceId, servicesList]);

  const openService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setOpen(true);
  };

  const handleBookingRedirect = (serviceTitle: string) => {
    setOpen(false);
    navigate(`/booking/new?service=${encodeURIComponent(serviceTitle)}`);
  };

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-[#3D332A]">
      <Header />
      <main className="pb-24 lg:pb-0">
        {/* Hero Section */}
        <section className="relative py-14 sm:py-20 bg-gradient-to-br from-[#F8F3EA] via-white to-[#F5ECE0] overflow-hidden border-b border-[#EADBBD]/40">
          <div className="max-w-4xl mx-auto text-center px-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FAF4E8] rounded-full text-xs font-bold text-[#8A6B2B] border border-[#E8D4A2]/60 mb-4 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A24A]" />
              Katalog Layanan & Tindakan Medis Terlengkap
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#3D332A] mb-5 tracking-tight">
              Layanan Dental
              <span className="text-[#C9A24A]"> Premium</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-[#7A6E60] font-body leading-relaxed max-w-2xl mx-auto">
              Kami menyediakan berbagai layanan dental komprehensif dengan teknologi terkini 
              dan dokter spesialis berpengalaman untuk memenuhi semua kebutuhan perawatan gigi Anda.
            </p>
          </div>
        </section>

        {/* Filter & Search Bar Section */}
        <section className="py-6 bg-white border-b border-[#F0E6D3] sticky top-0 z-20 shadow-xs backdrop-blur-md bg-white/95">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#C9A24A] text-white shadow-xs"
                          : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]/60"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89F91]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari perawatan gigi..."
                  className="w-full h-10 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl pl-9 pr-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 bg-[#FCFAF7]">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs sm:text-sm font-semibold text-[#8A7B6B]">
                Menampilkan <strong className="text-[#3D332A]">{filteredServices.length}</strong> layanan perawatan gigi
              </p>
              {activeCategory !== "Semua" && (
                <button
                  onClick={() => setActiveCategory("Semua")}
                  className="text-xs font-semibold text-[#C9A24A] hover:underline"
                >
                  Reset Filter
                </button>
              )}
            </div>

            {filteredServices.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#F0E6D3] max-w-lg mx-auto space-y-3">
                <Info className="w-10 h-10 text-[#C9A24A] mx-auto opacity-40" />
                <h4 className="text-base font-bold text-[#3D332A]">Layanan Tidak Ditemukan</h4>
                <p className="text-xs text-[#8A7B6B]">
                  Tidak ada layanan perawatan gigi yang sesuai dengan pencarian atau filter Anda.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("Semua");
                  }}
                  className="bg-[#FAF4E8] text-[#8A6B2B] hover:bg-[#F5E6C8] rounded-xl text-xs font-semibold"
                >
                  Tampilkan Semua Layanan
                </Button>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredServices.map((service) => (
                  <Card
                    key={service.id}
                    className="border border-[#F0E6D3] bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#C9A24A]/60 transition-all duration-300 flex flex-col group"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#FAF4E8]">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.webp";
                        }}
                      />
                      {service.category && (
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#8A6B2B] border border-[#E8D4A2]/50 shadow-xs flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5 text-[#C9A24A]" />
                          {service.category}
                        </div>
                      )}
                      {service.price && (
                        <div className="absolute bottom-3 right-3 bg-[#3D332A]/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white shadow-xs">
                          {service.price}
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-[#3D332A] group-hover:text-[#8A6B2B] transition-colors leading-snug line-clamp-1">
                          {service.title}
                        </h3>
                        <p className="text-xs text-[#7A6E60] font-body leading-relaxed line-clamp-2 mt-1.5">
                          {service.intro}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#F5ECE0] flex items-center justify-between gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="px-0 py-0 h-auto text-[#8A6B2B] hover:bg-transparent hover:text-[#70541C] font-bold text-xs gap-1 cursor-pointer"
                          onClick={() => openService(service.id)}
                        >
                          Selengkapnya
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>

                        <Link
                          to={`/booking/new?service=${encodeURIComponent(service.title)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C9A24A] hover:bg-[#B8943F] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Booking
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Payment Methods Section */}
        <section className="py-14 sm:py-20 bg-white border-t border-[#F0E6D3]">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="relative bg-gradient-to-br from-[#FAF5EC] via-[#F6EDE0] to-[#EFE2CE] rounded-[2.5rem] p-8 md:p-14 overflow-hidden border border-[#EADBBD] shadow-xs">
              <div className="relative z-10 max-w-4xl mx-auto">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-full text-xs font-bold text-[#8A6B2B] border border-[#EADBBD] mb-3">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C9A24A]" />
                    Kemudahan Pembayaran di Klinik
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#3D332A] mb-3">
                    Metode Pembayaran Klinik
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A6E60] max-w-2xl mx-auto font-body leading-relaxed">
                    Kami mendukung berbagai pilihan pembayaran resmi untuk memudahkan transaksi perawatan Anda di Aesthetic Pondok Indah Dental Clinic.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-3 mb-10">
                  {/* Digital & Card */}
                  <div className="bg-white/90 backdrop-blur-xs p-6 rounded-3xl border border-[#EADBBD] shadow-xs">
                    <div className="w-11 h-11 bg-[#FAF4E8] rounded-2xl flex items-center justify-center mb-4 border border-[#E8D4A2]/50">
                      <QrCode className="w-5 h-5 text-[#8A6B2B]" />
                    </div>
                    <h3 className="font-bold text-[#3D332A] text-sm mb-2">Digital & Kartu</h3>
                    <ul className="space-y-1.5 text-xs text-[#7A6E60] font-body">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A24A] mt-1.5 shrink-0" />
                        <span>QRIS (GoPay, OVO, Dana, ShopeePay)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A24A] mt-1.5 shrink-0" />
                        <span>Kartu Debit & Kredit (Visa, Mastercard, GPN)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A24A] mt-1.5 shrink-0" />
                        <span>Transfer Bank / Virtual Account</span>
                      </li>
                    </ul>
                  </div>

                  {/* Insurance & Health */}
                  <div className="bg-white/90 backdrop-blur-xs p-6 rounded-3xl border border-[#EADBBD] shadow-xs">
                    <div className="w-11 h-11 bg-[#FAF4E8] rounded-2xl flex items-center justify-center mb-4 border border-[#E8D4A2]/50">
                      <ShieldCheck className="w-5 h-5 text-[#8A6B2B]" />
                    </div>
                    <h3 className="font-bold text-[#3D332A] text-sm mb-2">Asuransi & Jaminan</h3>
                    <ul className="space-y-1.5 text-xs text-[#7A6E60] font-body">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A24A] mt-1.5 shrink-0" />
                        <span>BPJS Kesehatan (JKN-KIS Mitra)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A24A] mt-1.5 shrink-0" />
                        <span>Asuransi Swasta (Cashless & Reimbursement)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A24A] mt-1.5 shrink-0" />
                        <span>Kerjasama Perusahaan</span>
                      </li>
                    </ul>
                  </div>

                  {/* Cash */}
                  <div className="bg-white/90 backdrop-blur-xs p-6 rounded-3xl border border-[#EADBBD] shadow-xs">
                    <div className="w-11 h-11 bg-[#FAF4E8] rounded-2xl flex items-center justify-center mb-4 border border-[#E8D4A2]/50">
                      <Banknote className="w-5 h-5 text-[#8A6B2B]" />
                    </div>
                    <h3 className="font-bold text-[#3D332A] text-sm mb-2">Pembayaran Tunai</h3>
                    <ul className="space-y-1.5 text-xs text-[#7A6E60] font-body">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A24A] mt-1.5 shrink-0" />
                        <span>Pembayaran tunai langsung di kasir klinik</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A24A] mt-1.5 shrink-0" />
                        <span>Kuitansi & struk resmi berstempel</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white/80 rounded-2xl p-4 mb-8 flex items-start gap-3 border border-[#EADBBD]">
                  <Info className="w-5 h-5 text-[#C9A24A] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#7A6E60] font-body leading-relaxed">
                    <strong>Catatan Kasir:</strong> Untuk tindakan bedah mulut dan implan tertentu, penjadwalan dapat dikonfirmasi terlebih dahulu melalui reservasi online. Pembayaran dilakukan saat kedatangan di klinik.
                  </p>
                </div>

                <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link to="/booking/new">
                    <Button size="lg" className="bg-[#C9A24A] hover:bg-[#B8943F] text-white font-bold px-8 rounded-2xl shadow-md h-12 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      Buat Janji Temu (Guest Booking)
                    </Button>
                  </Link>
                  <a 
                    href={`https://wa.me/6281990114949?text=${encodeURIComponent(
                      "Halo Admin Aesthetic Pondok Indah, saya ingin bertanya seputar layanan dan jadwal konsultasi klinik."
                    )}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" variant="outline" className="bg-white text-[#8A6B2B] hover:bg-[#FAF8F5] border-[#EADBBD] font-bold px-6 rounded-2xl h-12 text-sm">
                      <MessageCircle className="w-4 h-4 mr-2 text-[#25D366]" />
                      Konsultasi WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Detail Modal */}
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) setSelectedServiceId(null);
          }}
        >
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-4xl p-0 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-[2.5rem] bg-white border border-[#EADBBD] shadow-2xl">
            {selectedService && (
              <div className="grid lg:grid-cols-2">
                {/* Left Side: Image & Meta */}
                <div className="relative bg-[#FAF4E8] aspect-square sm:aspect-video lg:aspect-auto">
                  <img
                    src={selectedService.image}
                    alt={selectedService.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.webp";
                    }}
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    {selectedService.category && (
                      <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#8A6B2B] border border-[#E8D4A2]/60 shadow-xs">
                        {selectedService.category}
                      </span>
                    )}
                  </div>
                  <DialogPrimitive.Close asChild>
                    <button
                      type="button"
                      className="absolute top-4 right-4 w-8 h-8 bg-black/30 hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-colors z-20 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </DialogPrimitive.Close>
                </div>

                {/* Right Side: Information & Action */}
                <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF4E8] rounded-full">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A24A]" />
                      <span className="text-xs font-bold text-[#8A6B2B]">Aesthetic Pondok Indah Dental Clinic</span>
                    </div>

                    <DialogTitle asChild>
                      <h3 className="text-2xl sm:text-3xl font-bold text-[#3D332A] tracking-tight">
                        {selectedService.title}
                      </h3>
                    </DialogTitle>

                    {/* Price & Duration Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {selectedService.price && (
                        <span className="px-3 py-1 bg-[#FAF4E8] rounded-xl text-xs font-bold text-[#8A6B2B] border border-[#E8D4A2]/50">
                          {selectedService.price}
                        </span>
                      )}
                      {selectedService.duration && (
                        <span className="px-3 py-1 bg-[#F5ECE0] rounded-xl text-xs font-semibold text-[#7A6E60] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#B8943F]" />
                          {selectedService.duration}
                        </span>
                      )}
                    </div>

                    <div className="h-px bg-[#F0E6D3] my-4" />

                    <div className="space-y-3 text-xs text-[#5C5245] font-body leading-relaxed">
                      <p className="font-semibold text-[#3D332A]">
                        {selectedService.intro}
                      </p>
                      {selectedService.paragraphs.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}

                      {selectedService.steps.length > 0 && (
                        <div className="pt-2">
                          <h4 className="text-xs font-bold text-[#3D332A] uppercase tracking-wider text-[#B8943F]">
                            Tahapan Prosedur Medis:
                          </h4>
                          <ol className="list-decimal pl-4 mt-2 space-y-1 text-xs text-[#6B6053]">
                            {selectedService.steps.map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {selectedService.generalDentists.length > 0 && (
                        <div className="pt-2">
                          <h4 className="text-xs font-bold text-[#3D332A]">Dokter Penanggung Jawab:</h4>
                          <p className="text-xs text-[#8A7B6B] mt-1">
                            {selectedService.generalDentists.slice(0, 4).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Booking Action Buttons */}
                  <div className="pt-6 border-t border-[#F0E6D3] flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => handleBookingRedirect(selectedService.title)}
                      className="flex-1 h-12 bg-[#C9A24A] hover:bg-[#B8943F] text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-4 h-4" />
                      Booking Layanan Ini (Guest)
                    </Button>
                    <a
                      href={`https://wa.me/6281990114949?text=${encodeURIComponent(
                        `Halo Aesthetic Pondok Indah, saya ingin reservasi untuk layanan ${selectedService.title}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 px-4 rounded-2xl border-[#E8DFC8] text-[#8A6B2B] hover:bg-[#FAF8F5] text-xs font-bold flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-4 h-4 text-[#25D366]" />
                        Tanya Admin
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
