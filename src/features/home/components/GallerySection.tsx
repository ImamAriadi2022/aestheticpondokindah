import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { API_BASE } from "@/lib/apiConfig";


export default function GallerySection() {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [activeCategory, setActiveCategory] = useState<
    "Semua" | "Klien Kami" | "Tindakan Perawatan" | "Solusi Dental" | "Fasilitas"
  >("Semua");
  const [open, setOpen] = useState(false);
  const [apiItems, setApiItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/public/gallery-items`)
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        setApiItems(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const galleryImages = apiItems.map((item: any) => ({ src: item.image_url, title: item.title, category: item.category }));

  const [selected, setSelected] = useState<{ src: string; title: string; category: string } | null>(null);

  const categories = useMemo(
    () => ["Semua", "Klien Kami", "Tindakan Perawatan", "Solusi Dental", "Fasilitas"] as const,
    []
  );

  const filteredImages = useMemo(() => {
    if (activeCategory === "Semua") return galleryImages;
    return galleryImages.filter((x) => x.category === activeCategory);
  }, [activeCategory, galleryImages]);

  const scrollByCards = (direction: "prev" | "next") => {
    const el = sliderRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>("[data-gallery-card]");
    const step = firstCard ? firstCard.offsetWidth : 320;
    el.scrollBy({ left: direction === "next" ? step : -step, behavior: "smooth" });
  };

  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-background rounded-full shadow-sm mb-6 border border-border">
            <ImageIcon className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-semibold text-brand-gold font-body">Galeri</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-charcoal mb-5 sm:mb-6">
            Momen &
            <span className="text-gradient-gold"> Perawatan</span>
          </h2>
          <p className="text-base sm:text-lg text-brand-warm-gray font-body">
            Sekilas suasana klinik dan hasil perawatan yang kami lakukan.
          </p>
        </div>

        <div className="flex flex-nowrap items-center justify-start sm:justify-center gap-1.5 sm:gap-3 mb-10 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 h-7 sm:h-10 px-2.5 sm:px-5 rounded-full text-[10px] sm:text-sm font-bold tracking-wide border transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-brand-gold text-white border-brand-gold shadow-sm"
                  : "bg-white text-brand-charcoal border-border hover:bg-brand-cream"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-brand-warm-gray">Memuat galeri…</div>
        ) : galleryImages.length === 0 ? (
          <div className="text-center py-12 text-brand-warm-gray">Belum ada foto di galeri.</div>
        ) : (
          <>
        <div className="sm:hidden relative">
          <button
            type="button"
            onClick={() => scrollByCards("prev")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 text-brand-charcoal hover:text-brand-gold transition-colors"
            aria-label="Previous gallery image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={() => scrollByCards("next")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1 text-brand-charcoal hover:text-brand-gold transition-colors"
            aria-label="Next gallery image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 px-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {filteredImages.map((img) => (
              <button
                key={img.src}
                type="button"
                data-gallery-card
                className="snap-center shrink-0 basis-[86%] group relative overflow-hidden rounded-3xl bg-brand-cream border border-border shadow-xl shadow-black/5 text-left"
                onClick={() => {
                  setSelected(img);
                  setOpen(true);
                }}
              >
                <img src={img.src} alt={img.title} className="w-full h-72 object-cover" loading="lazy" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
              </button>
            ))}
          </div>
        </div>

        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredImages.map((img) => (
            <button
              key={img.src}
              type="button"
              className="group relative overflow-hidden rounded-3xl bg-brand-cream border border-border shadow-xl shadow-black/5 text-left"
              onClick={() => {
                setSelected(img);
                setOpen(true);
              }}
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setSelected(null);
          }}
        >
          <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
            {selected && (
              <div>
                <div className="w-full bg-black">
                  <img src={selected.src} alt={selected.title} className="w-full max-h-[70vh] object-contain" />
                </div>
                <DialogHeader className="p-5">
                  <DialogTitle className="text-base sm:text-lg font-bold text-gray-900">{selected.title}</DialogTitle>
                </DialogHeader>
              </div>
            )}
          </DialogContent>
        </Dialog>
        </>
        )}
      </div>
    </section>
  );
}
