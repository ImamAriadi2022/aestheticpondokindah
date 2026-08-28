import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  PenTool,
  RotateCcw,
  Check,
  X,
  Eraser,
} from "lucide-react";
import { Button } from "@/shared/ui/button";

interface DigitalSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (signatureDataUrl: string) => void;
  initialSignature?: string | null;
  patientName?: string;
}

export default function DigitalSignatureModal({
  isOpen,
  onClose,
  onSaveSignature,
  initialSignature,
  patientName = "Pasien Aesthetic Pondok Indah",
}: DigitalSignatureModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Simplified settings: Pen vs Eraser, fixed black charcoal color, fixed medium thickness
  const [brushMode, setBrushMode] = useState<"pen" | "eraser">("pen");
  const brushColor = "#1A1A1A";
  const brushSize = 3;

  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure modal DOM is fully mounted
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (initialSignature) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          setHasDrawn(true);
        };
        img.src = initialSignature;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen]);

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
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = brushMode === "eraser" ? "#FAF8F5" : brushColor;
    ctx.lineWidth = brushMode === "eraser" ? brushSize * 4 : brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSaveSignature(dataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl lg:max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#EADBBD] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-2xs">
              <PenTool className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-[#2C2416]">
                Tanda Tangan Digital Pasien *
              </h3>
              <p className="text-xs text-[#7C7365]">
                Goreskan tanda tangan persetujuan resmi Anda pada canvas di bawah
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white border border-[#D9D0BC] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#FAF5EA] transition-all shadow-2xs cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Simple Tool Controls: Pulpen vs Penghapus & Hapus Canvas */}
          <div className="flex items-center justify-between gap-3 bg-[#FAF8F5] border border-[#E6DECB] rounded-2xl p-2.5 sm:px-3.5">
            {/* Mode: Pulpen vs Penghapus */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#D9D0BC] shadow-2xs">
              <button
                type="button"
                onClick={() => setBrushMode("pen")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  brushMode === "pen"
                    ? "bg-[#2C2416] text-white shadow-xs"
                    : "text-[#5C5546] hover:bg-[#FAF8F5]"
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Pulpen</span>
              </button>

              <button
                type="button"
                onClick={() => setBrushMode("eraser")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  brushMode === "eraser"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-[#5C5546] hover:bg-[#FAF8F5]"
                }`}
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Penghapus</span>
              </button>
            </div>

            {/* Reset/Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Hapus Canvas</span>
            </button>
          </div>

          {/* Spacious Interactive Canvas Pad */}
          <div className="relative w-full h-64 sm:h-72 bg-[#FAF8F5] border-2 border-dashed border-[#D9D0BC] hover:border-[#8C6B1C] rounded-3xl overflow-hidden shadow-inner transition-all focus-within:border-[#8C6B1C]">
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

            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center p-4">
                <div className="w-14 h-14 rounded-2xl bg-[#EFE9DC] flex items-center justify-center text-[#8C6B1C] mb-2.5 shadow-inner">
                  <PenTool className="w-7 h-7 stroke-[1.75]" />
                </div>
                <p className="text-sm sm:text-base font-bold text-[#2C2416]">
                  Gunakan Mouse atau Layar Sentuh di Sini
                </p>
                <p className="text-xs text-[#7C7365] mt-0.5">
                  Tanda tangan otomatis tersimpan dengan tinta resmi hitam
                </p>
              </div>
            )}
          </div>

          {/* Patient Name Under Canvas */}
          <div className="bg-[#FAF5EA] border border-[#EADBBD] rounded-xl p-3 flex items-center justify-between text-xs sm:text-sm">
            <span className="text-[#7C7365] font-medium">Nama Tertanda:</span>
            <span className="font-bold text-[#2C2416]">{patientName}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 border-t border-[#EDE5D6] bg-white flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-11 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs sm:text-sm font-semibold cursor-pointer"
          >
            Batal
          </Button>

          <Button
            type="button"
            disabled={!hasDrawn}
            onClick={handleSave}
            className="h-11 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735716] text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Simpan Tanda Tangan</span>
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
