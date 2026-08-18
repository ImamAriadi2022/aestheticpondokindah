import React, { useRef, useState, useEffect } from "react";
import {
  PenTool,
  RotateCcw,
  Check,
  X,
  Palette,
  Eraser,
  Sparkles,
  Info,
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Brush settings
  const [brushMode, setBrushMode] = useState<"pen" | "brush" | "eraser">("pen");
  const [brushColor, setBrushColor] = useState<string>("#2C2416");
  const [brushSize, setBrushSize] = useState<number>(3);

  const colors = [
    { name: "Charcoal", hex: "#2C2416" },
    { name: "Gold", hex: "#8C6B1C" },
    { name: "Deep Navy", hex: "#1E3A8A" },
    { name: "Royal Blue", hex: "#2563EB" },
  ];

  const brushSizes = [
    { label: "Halus", size: 2 },
    { label: "Sedang", size: 4 },
    { label: "Tebal", size: 7 },
    { label: "Kuas", size: 11 },
  ];

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

    ctx.strokeStyle = brushMode === "eraser" ? "#FFFFFF" : brushColor;
    ctx.lineWidth = brushMode === "eraser" ? brushSize * 3 : brushSize;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#EADBBD] overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 text-left">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE5D6] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD]">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-[#2C2416]">
                Tanda Tangan Digital
              </h3>
              <p className="text-[11px] text-[#7C7365]">
                Goreskan tanda tangan persetujuan resmi Anda
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#D9D0BC] flex items-center justify-center text-[#7C7365] hover:text-[#2C2416] hover:bg-[#EFE9DC] transition-all"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
          {/* Tool Controls Bar (Brush / Kuas / Warna / Ukuran) */}
          <div className="bg-[#FAF8F5] border border-[#E6DECB] rounded-2xl p-3 space-y-2.5">
            {/* Row 1: Brush Mode & Sizes */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Mode Kuas / Pen / Eraser */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D9D0BC]">
                <button
                  type="button"
                  onClick={() => setBrushMode("pen")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    brushMode === "pen"
                      ? "bg-[#8C6B1C] text-white shadow-xs"
                      : "text-[#5C5546] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <PenTool className="w-3 h-3" />
                  <span>Pulpen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBrushMode("brush")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    brushMode === "brush"
                      ? "bg-[#8C6B1C] text-white shadow-xs"
                      : "text-[#5C5546] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Kuas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBrushMode("eraser")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    brushMode === "eraser"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-[#5C5546] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <Eraser className="w-3 h-3" />
                  <span>Penghapus</span>
                </button>
              </div>

              {/* Reset/Clear Button */}
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Hapus Canvas</span>
              </button>
            </div>

            {/* Row 2: Brush Size & Colors */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#EDE5D6]">
              {/* Brush Sizes */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-medium text-[#8C8272]">
                  Ketebalan:
                </span>
                <div className="flex items-center gap-1">
                  {brushSizes.map((b) => (
                    <button
                      key={b.size}
                      type="button"
                      onClick={() => setBrushSize(b.size)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                        brushSize === b.size
                          ? "bg-[#2C2416] text-white"
                          : "bg-white text-[#5C5546] border border-[#D9D0BC] hover:border-[#8C6B1C]"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brush Colors */}
              {brushMode !== "eraser" && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-[#8C8272]">
                    Tinta:
                  </span>
                  <div className="flex items-center gap-1">
                    {colors.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setBrushColor(c.hex)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          brushColor === c.hex
                            ? "ring-2 ring-[#8C6B1C] scale-110"
                            : "border-white hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Canvas Pad */}
          <div className="relative w-full h-56 sm:h-64 bg-[#FAF8F5] border-2 border-dashed border-[#D9D0BC] rounded-3xl overflow-hidden shadow-inner focus-within:border-[#8C6B1C]">
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
                <div className="w-12 h-12 rounded-full bg-[#EFE9DC] flex items-center justify-center text-[#8C6B1C] mb-2 shadow-inner">
                  <PenTool className="w-6 h-6 stroke-[1.75]" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#5C5546]">
                  Gunakan Mouse atau Layar Sentuh di Sini
                </p>
                <p className="text-[11px] text-[#A0988A] mt-0.5">
                  Pilih mode Kuas / Pulpen di atas untuk menyesuaikan goresan
                </p>
              </div>
            )}
          </div>

          {/* Patient Name Under Canvas */}
          <div className="bg-[#FAF5EA] border border-[#EADBBD] rounded-xl p-2.5 flex items-center justify-between text-xs">
            <span className="text-[#7C7365]">Nama Tertanda:</span>
            <span className="font-bold text-[#2C2416]">{patientName}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#EDE5D6] bg-white flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-11 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs sm:text-sm font-semibold"
          >
            Batal
          </Button>

          <Button
            type="button"
            disabled={!hasDrawn}
            onClick={handleSave}
            className="h-11 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Simpan Tanda Tangan</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
