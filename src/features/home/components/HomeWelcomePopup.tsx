import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/apiConfig";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function HomeWelcomePopup({ open, onOpenChange }: Props) {
  const interactedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const [popupData, setPopupData] = useState<any>(() => {
    try {
      const cached = localStorage.getItem("apident:cached_popup");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    fetch(`${API_BASE}/public/popup/active`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setPopupData(data);
          localStorage.setItem("apident:cached_popup", JSON.stringify(data));
        } else {
          setPopupData(null);
          localStorage.removeItem("apident:cached_popup");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) {
      interactedRef.current = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open || !popupData) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      if (!interactedRef.current) onOpenChange(false);
    }, 15000);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [open, onOpenChange]);

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

  if (!open || !popupData) {
    return null;
  }

  const title = popupData.title || "";
  const headline = popupData.headline || "";
  const message = popupData.message || "";
  const buttonLabel = popupData.button_label || "";
  const imageUrl = popupData.image_url || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="p-0 overflow-hidden w-[calc(100vw-32px)] max-w-[320px] sm:max-w-3xl rounded-2xl sm:rounded-3xl border border-border mx-auto my-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2" onMouseDown={markInteracted} onKeyDown={markInteracted}>
          <div className="relative bg-brand-cream">
            <img
              src={imageUrl}
              alt="Aesthetic Pondok Indah Dental"
              className="w-full h-auto object-cover max-h-[200px] sm:max-h-[220px] md:max-h-none md:min-h-[420px]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-black/20" />
          </div>

          <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-center">
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-[10px] sm:text-xs font-semibold tracking-widest text-brand-warm-gray">{title.toUpperCase()}</p>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-charcoal leading-tight" dangerouslySetInnerHTML={{ __html: headline }} />
              <p className="text-xs sm:text-sm text-brand-warm-gray leading-relaxed">
                {message}
              </p>
            </div>

            <div className="mt-4 sm:mt-5 space-y-2.5 sm:space-y-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  markInteracted();
                  onOpenChange(false);
                }}
              >
                <Button
                  type="button"
                  className="w-full bg-gradient-gold hover:opacity-90 text-white font-semibold rounded-xl h-10 sm:h-11 text-sm"
                >
                  {buttonLabel}
                </Button>
              </a>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1.5 sm:pt-2 text-[10px] sm:text-xs text-brand-warm-gray">
                <div className="rounded-lg sm:rounded-xl border border-border bg-background px-2 sm:px-3 py-1.5 sm:py-2 text-center">
                  Respon
                  <div className="font-semibold text-brand-charcoal text-[10px] sm:text-xs">Cepat</div>
                </div>
                <div className="rounded-lg sm:rounded-xl border border-border bg-background px-2 sm:px-3 py-1.5 sm:py-2 text-center">
                  Promo
                  <div className="font-semibold text-brand-charcoal text-[10px] sm:text-xs">Member</div>
                </div>
                <div className="rounded-lg sm:rounded-xl border border-border bg-background px-2 sm:px-3 py-1.5 sm:py-2 text-center">
                  Booking
                  <div className="font-semibold text-brand-charcoal text-[10px] sm:text-xs">Mudah</div>
                </div>
              </div>

              <p className="text-[10px] sm:text-[11px] text-brand-warm-gray pt-1.5 sm:pt-2">
                Klik sekarang untuk konsultasi dan kami bantu pilih perawatan yang paling cocok untuk kebutuhanmu.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
