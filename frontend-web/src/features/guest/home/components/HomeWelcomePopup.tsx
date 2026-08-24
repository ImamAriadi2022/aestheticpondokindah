import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function HomeWelcomePopup({ open, onOpenChange }: Props) {
  const interactedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const [activePopups, setActivePopups] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    try {
      localStorage.removeItem("apident:cached_popup");
    } catch {}

    fetch(`${API_BASE}/public/popups/active?_t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.id ? [data] : [];
        const validList = list.filter((p: any) => p && (p.enabled === true || p.enabled === 1 || p.enabled === "1"));
        if (validList.length > 0) {
          setActivePopups(validList);
          setCurrentIndex(0);
          onOpenChange(true);
        } else {
          setActivePopups([]);
          onOpenChange(false);
        }
      })
      .catch(() => {
        setActivePopups([]);
        onOpenChange(false);
      });
  }, [onOpenChange]);

  const totalPopups = activePopups.length;
  const currentPopup = activePopups[currentIndex];

  const handleNextOrClose = () => {
    interactedRef.current = true;
    if (currentIndex < totalPopups - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onOpenChange(false);
    }
  };

  const handlePrev = () => {
    interactedRef.current = true;
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const markInteracted = () => {
    interactedRef.current = true;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const whatsappHref =
    "https://wa.me/628198974030?text=" +
    encodeURIComponent(
      "Halo Aesthetic Pondok Indah Dental, saya ingin ambil kesempatan promo dan konsultasi. Mohon info jadwal & cara booking ya."
    );

  if (!open || !currentPopup || totalPopups === 0) {
    return null;
  }

  const title = currentPopup.title || "PROMO SPESIAL";
  const headline = currentPopup.headline || "";
  const message = currentPopup.message || "";
  const buttonLabel = currentPopup.button_label || "Klaim Promo";
  const imageUrl = getStorageUrl(currentPopup.image_url) || currentPopup.image_url || "";

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) {
        handleNextOrClose();
      }
    }}>
      <DialogContent
        showCloseButton={false}
        className="p-0 overflow-hidden w-[calc(100vw-32px)] max-w-[320px] sm:max-w-3xl rounded-2xl sm:rounded-3xl border border-[#E8DFC8] bg-white shadow-2xl mx-auto my-auto relative"
      >
        {/* Custom Header Badge & Sequential (X) Close Button */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          {totalPopups > 1 && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 text-white backdrop-blur-xs shadow-xs">
              {currentIndex + 1} / {totalPopups}
            </span>
          )}
          <button
            type="button"
            onClick={handleNextOrClose}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#2C2416] hover:text-black shadow-md flex items-center justify-center transition-all cursor-pointer border border-[#E8DFC8]/50"
            title={currentIndex < totalPopups - 1 ? "Tutup promo ini & lihat berikutnya" : "Tutup"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <span className="sr-only">
          <h2>{title}</h2>
          <p>{headline}</p>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2" onMouseDown={markInteracted} onKeyDown={markInteracted}>
          {/* Left: Image / Banner */}
          <div className="relative bg-[#FAF8F5] flex items-center justify-center overflow-hidden min-h-[220px] md:min-h-[420px]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover max-h-[240px] sm:max-h-[260px] md:max-h-none md:min-h-[420px]"
              />
            ) : (
              <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#FAF5EA] to-[#F5EFE6]">
                <div className="w-12 h-12 rounded-2xl bg-[#C9A24A]/20 flex items-center justify-center text-[#8C6B1C] font-black text-lg mb-2">
                  %
                </div>
                <p className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider">Aesthetic Pondok Indah</p>
                <p className="text-xs text-[#8C8272] mt-1">Promo Perawatan Gigi Spesial</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-black/20 pointer-events-none" />

            {/* Pagination Controls on Image for Multi-Popups */}
            {totalPopups > 1 && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-20">
                {activePopups.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex ? "w-6 bg-[#C9A24A]" : "w-1.5 bg-white/70 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Content & Action */}
          <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-between bg-white">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#8C6B1C] uppercase">
                  {title}
                </span>
                {totalPopups > 1 && (
                  <span className="text-[10px] font-semibold text-[#8C8272]">
                    Promo {currentIndex + 1} dari {totalPopups}
                  </span>
                )}
              </div>

              <h3
                className="text-lg sm:text-2xl font-bold text-[#2C2416] leading-tight"
                dangerouslySetInnerHTML={{ __html: headline || "Promo Spesial Klinik" }}
              />

              <p className="text-xs sm:text-sm text-[#6B5E4F] leading-relaxed whitespace-pre-wrap">
                {message || "Dapatkan penawaran istimewa perawatan gigi terbaik di Aesthetic Pondok Indah Dental Clinic."}
              </p>
            </div>

            <div className="mt-5 sm:mt-6 space-y-3">
              <div className="grid grid-cols-3 gap-1.5 py-2.5 px-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8] text-center">
                <div>
                  <p className="text-[9px] text-[#8C8272]">Pelayanan</p>
                  <p className="text-[11px] font-bold text-[#2C2416]">Dokter Ahli</p>
                </div>
                <div className="border-x border-[#E8DFC8]">
                  <p className="text-[9px] text-[#8C8272]">Fasilitas</p>
                  <p className="text-[11px] font-bold text-[#8C6B1C]">Modern</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#8C8272]">Reservasi</p>
                  <p className="text-[11px] font-bold text-[#2C2416]">Mudah</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {totalPopups > 1 && currentIndex > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handlePrev}
                    className="h-10 w-10 border-[#E8DFC8] text-[#8C8272] hover:bg-[#FAF8F5] rounded-xl shrink-0 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                )}

                <a
                  href={currentPopup.button_url || whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    markInteracted();
                    if (currentIndex < totalPopups - 1) {
                      setCurrentIndex((prev) => prev + 1);
                    } else {
                      onOpenChange(false);
                    }
                  }}
                  className="flex-1"
                >
                  <Button
                    className="w-full h-10 bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md cursor-pointer"
                  >
                    {buttonLabel}
                  </Button>
                </a>

                {totalPopups > 1 && currentIndex < totalPopups - 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleNextOrClose}
                    className="h-10 w-10 border-[#E8DFC8] text-[#8C6B1C] hover:bg-[#FAF8F5] rounded-xl shrink-0 cursor-pointer"
                    title="Promo Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <p className="text-[10px] text-center text-[#8C8272]">
                {currentIndex < totalPopups - 1
                  ? `Klik (X) untuk lanjut ke promo berikutnya (${totalPopups - currentIndex - 1} tersisa)`
                  : "Klik tombol di atas untuk klaim promo langsung ke WhatsApp klinik"}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
