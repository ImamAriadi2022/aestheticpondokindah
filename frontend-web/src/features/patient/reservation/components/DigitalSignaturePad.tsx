import React, { useRef, useState, useEffect } from "react";
import { PenTool, RotateCcw, Check } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface DigitalSignaturePadProps {
  onSignatureChange: (signatureDataUrl: string | null) => void;
  initialSignature?: string | null;
  disabled?: boolean;
}

export default function DigitalSignaturePad({
  onSignatureChange,
  initialSignature,
  disabled = false,
}: DigitalSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI display
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = "#2C2416"; // Brand charcoal
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSignature(true);
      };
      img.src = initialSignature;
    }
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ("clientX" in e) {
      return {
        x: (e as MouseEvent).clientX - rect.left,
        y: (e as MouseEvent).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSignatureChange(dataUrl);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
    onSignatureChange(null);
  };

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full h-40 sm:h-48 bg-[#FAF8F5] border-2 border-dashed border-[#D9D0BC] rounded-2xl overflow-hidden transition-all duration-200 hover:border-[#C59E3F] focus-within:border-[#C59E3F]">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-4">
            <div className="w-12 h-12 rounded-full bg-[#EFE9DC] flex items-center justify-center text-[#8C6B1C] mb-2 shadow-inner">
              <PenTool className="w-6 h-6 stroke-[1.75]" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#7C7365]">
              Tanda Tangan Digital
            </p>
            <p className="text-[11px] text-[#A0988A] mt-0.5">
              Gunakan mouse atau layar sentuh untuk menandatangani
            </p>
          </div>
        )}

        {hasSignature && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Check className="w-3 h-3" /> Tertandatangani
            </span>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="px-2 py-1 bg-white/90 hover:bg-white text-rose-600 hover:text-rose-700 text-xs rounded-lg shadow-sm border border-rose-200 flex items-center gap-1 transition-all"
              title="Hapus tanda tangan"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Hapus</span>
            </button>
          </div>
        )}
      </div>

      <p className="text-[11px] text-[#8C8272] italic text-center sm:text-left">
        * Tanda tangan digital ini menyatakan persetujuan sah Anda atas rencana perawatan & kebijakan pembatalan klinik.
      </p>
    </div>
  );
}
