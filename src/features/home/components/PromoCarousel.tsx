import { useEffect, useMemo, useRef, useState } from "react";

type Slide = {
  id: string;
  imageUrl: string;
};

export default function PromoCarousel() {
  const slides = useMemo<Slide[]>(
    () => [
      {
        id: "s1",
        imageUrl: "/carousels/332284087_1668569386907344_8629874387098871495_n-1024x1024.jpg",
      },
      {
        id: "s2",
        imageUrl: "/carousels/354013446_1306049049992222_4361818023443925309_n-1024x1024.jpg",
      },
      {
        id: "s3",
        imageUrl: "/carousels/375243559_625952536399454_3738302235619186163_n-1024x1024.jpg",
      },
      {
        id: "s4",
        imageUrl: "/carousels/391105204_200354099740484_7608698753314950102_n-1024x1024.jpg",
      },
      {
        id: "s5",
        imageUrl: "/carousels/393096476_233847392740779_1759637609764307009_n-1024x1024.jpg",
      },
      {
        id: "s6",
        imageUrl: "/carousels/Before-After-Dental-Bridge-1024x1024.png",
      },
      {
        id: "s7",
        imageUrl: "/carousels/Before-After-Scalling-Reviisi-1024x1024.png",
      },
      {
        id: "s8",
        imageUrl: "/carousels/Dental-Whitening-2-ALIYAH--1024x1024.png",
      },
      {
        id: "s9",
        imageUrl: "/carousels/Penambalan-gigi-depan-1024x1024.png",
      },
    ],
    []
  );

  const [active, setActive] = useState(0);
  const [virtualIndex, setVirtualIndex] = useState(0);
  const timerRef = useRef<number | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [perView, setPerView] = useState(1);
  const interactingRef = useRef(false);
  const stepRef = useRef(0);
  const resumeRef = useRef<number>(0);

  const extendedSlides = useMemo(() => [...slides, ...slides, ...slides], [slides]);

  const goTo = (idx: number) => {
    const next = (idx + slides.length) % slides.length;
    setActive(next);
    setVirtualIndex(slides.length + next);
  };

  useEffect(() => {
    const update = () => {
      setPerView(window.innerWidth >= 1024 ? 4 : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-promo-card]");
    if (!card) return;
    stepRef.current = card.offsetWidth + 16;
    const initial = slides.length + active;
    el.scrollTo({ left: initial * stepRef.current, behavior: "auto" });
    setVirtualIndex(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perView, slides.length]);

  useEffect(() => {
    const start = () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        if (interactingRef.current) return;
        if (Date.now() < resumeRef.current) return;
        setVirtualIndex((v) => v + 1);
      }, 3800);
    };

    start();
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [slides.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const step = stepRef.current || el.clientWidth;
    el.scrollTo({ left: virtualIndex * step, behavior: "smooth" });
  }, [virtualIndex, perView]);

  useEffect(() => {
    if (!slides.length) return;
    const next = ((virtualIndex % slides.length) + slides.length) % slides.length;
    setActive((prev) => (prev === next ? prev : next));
  }, [virtualIndex, slides.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let raf = 0;
    let settleTimer: number | null = null;

    const scheduleResume = () => {
      resumeRef.current = Date.now() + 2200;
    };

    const settleToNearest = () => {
      const step = stepRef.current || el.clientWidth;
      const idx = Math.round(el.scrollLeft / Math.max(step, 1));
      setVirtualIndex(idx);
    };

    const onPointerDown = () => {
      interactingRef.current = true;
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = null;
    };

    const onPointerUp = () => {
      interactingRef.current = false;
      scheduleResume();
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        settleToNearest();
      }, 120);
    };

    const onWheel = () => {
      interactingRef.current = true;
      scheduleResume();
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        interactingRef.current = false;
        settleToNearest();
      }, 160);
    };

    const onScroll = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        const card = el.querySelector<HTMLElement>("[data-promo-card]");
        const step = stepRef.current || (card ? card.offsetWidth + 16 : el.clientWidth);
        const idx = Math.round(el.scrollLeft / Math.max(step, 1));
        setVirtualIndex((prev) => (prev === idx ? prev : idx));

        const len = slides.length;
        if (!len) return;
        if (idx >= len * 2) {
          const normalized = len + (idx % len);
          el.scrollTo({ left: normalized * step, behavior: "auto" });
          setVirtualIndex(normalized);
        } else if (idx < len) {
          const normalized = len + (idx % len);
          el.scrollTo({ left: normalized * step, behavior: "auto" });
          setVirtualIndex(normalized);
        }
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointerup", onPointerUp, { passive: true });
    el.addEventListener("pointercancel", onPointerUp, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      if (settleTimer) window.clearTimeout(settleTimer);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [slides.length]);

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4">
        {/* Before & After Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-gold/10 rounded-full mb-3">
            <span className="w-2 h-2 bg-brand-gold rounded-full"></span>
            <span className="text-sm font-semibold text-brand-gold tracking-wide">Before & After</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-charcoal mb-2">
            Transformasi Senyum Pasien Kami
          </h2>
          <p className="text-brand-warm-gray font-body max-w-xl mx-auto text-sm sm:text-base">
            Lihat perubahan nyata dari hasil perawatan dental estetika di Aesthetic Pondok Indah Dental
          </p>
        </div>

        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain [scrollbar-gutter:stable]"
            style={{ WebkitOverflowScrolling: "auto", scrollBehavior: "smooth" }}
            onMouseEnter={() => {
              interactingRef.current = true;
            }}
            onMouseLeave={() => {
              interactingRef.current = false;
            }}
            onTouchStart={() => {
              interactingRef.current = true;
            }}
            onTouchEnd={() => {
              interactingRef.current = false;
            }}
          >
            {extendedSlides.map((slide, idx) => (
              <div
                key={`${slide.id}-${idx}`}
                data-promo-card
                className="snap-start shrink-0 basis-[88%] sm:basis-[70%] lg:basis-[calc(25%-12px)]"
              >
                <div className="relative overflow-hidden rounded-2xl border border-border shadow-xl shadow-black/5 bg-brand-cream aspect-square">
                  <img
                    src={slide.imageUrl}
                    alt="Promo"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-6 bg-brand-gold" : "w-2 bg-brand-gold/30 hover:bg-brand-gold/50"
                }`}
                aria-label={`Go to promo ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
