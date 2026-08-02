import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { API_BASE } from "@/core/api/apiConfig";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import {
  Tag,
  Gift,
  Calendar,
  Copy,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Percent,
} from "lucide-react";

export default function DesktopUserPromo() {
  const navigate = useNavigate();
  const [promos, setPromos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fallback default promos if API database doesn't have custom promos yet
  const defaultPromos = [
    {
      id: "promo-1",
      title: "Diskon 25% Scaling & Pemutihan Gigi (Bleaching)",
      description: "Dapatkan senyum bersih dan berkilau dengan diskon spesial 25% untuk paket pembersihan karang dan bleaching gigi.",
      category: "Perawatan Estetik",
      code: "SMILE25",
      discount: "25% OFF",
      ends_at: "2026-12-31",
      image_url: "/dashboard/gigi.png",
    },
    {
      id: "promo-2",
      title: "Voucher Potongan Rp 500.000 Pemasangan Behel",
      description: "Nikmati potongan harga langsung Rp 500.000 untuk perawatan perataan gigi (Orthodontic) dengan berbagai pilihan behel premium.",
      category: "Orthodontik",
      code: "BEHEL500K",
      discount: "Rp 500.000",
      ends_at: "2026-12-31",
      image_url: "/logo/logo.png",
    },
    {
      id: "promo-3",
      title: "Veneer Gigi Premium - Diskon Member 20%",
      description: "Ubah bentuk dan warna gigi impian Anda dengan Veneer Porselen Estetik kualitas tertinggi dari lab terakreditasi.",
      category: "Veneer Estetik",
      code: "VENEERGOLD",
      discount: "20% OFF",
      ends_at: "2026-12-31",
      image_url: "/dashboard/sapadokter.png",
    },
  ];

  useEffect(() => {
    fetch(`${API_BASE}/public/promos`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPromos(data);
        } else {
          setPromos(defaultPromos);
        }
        setLoading(false);
      })
      .catch(() => {
        setPromos(defaultPromos);
        setLoading(false);
      });
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Kode Promo Disalin!",
      message: `Kode "${code}" berhasil disalin ke clipboard.`,
      variant: "info",
    });
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const handleUsePromo = (code: string) => {
    handleCopyCode(code);
    navigate("/dashboard/user?tab=reservasi");
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a1612] via-[#2a2319] to-[#1a1612] p-8 text-white border border-[#c9a24a]/30 shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#c9a24a]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c9a24a]/20 text-[#e8c547] text-xs font-semibold border border-[#c9a24a]/30">
              <Gift className="w-3.5 h-3.5" />
              <span>Promo & Voucher Eksklusif</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Penawaran Spesial Untuk Anda
            </h1>
            <p className="text-sm text-[#d4c5b0] max-w-xl">
              Gunakan kode voucher promo di bawah ini saat melakukan booking jadwal periksa atau perawatan di Aesthetic Pondok Indah Dental Clinic.
            </p>
          </div>

          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#e8c547] to-[#c9a24a] p-0.5 shadow-lg shrink-0">
            <div className="w-full h-full bg-[#1a1612] rounded-[14px] flex items-center justify-center text-[#e8c547]">
              <Percent className="w-9 h-9" />
            </div>
          </div>
        </div>
      </div>

      {/* Promo Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 font-medium">Memuat penawaran promo...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promos.map((promo, idx) => (
            <Card
              key={promo.id || idx}
              className="rounded-2xl border-gray-100 shadow-sm overflow-hidden bg-white hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full text-xs font-bold uppercase tracking-wider">
                      {promo.category || "Promo Spesial"}
                    </span>
                    {promo.discount && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-extrabold">
                        {promo.discount}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {promo.description}
                  </p>

                  {/* Validity */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-[#c9a24a]" />
                    <span>
                      Berlaku s/d{" "}
                      {promo.ends_at
                        ? new Date(promo.ends_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "31 Desember 2026"}
                    </span>
                  </div>
                </div>

                {/* Promo Code Copy & Action */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-dashed border-amber-300/80">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Kode Voucher</p>
                      <p className="text-sm font-black text-[#c9a24a] tracking-wider font-mono">
                        {promo.code || "AESTHETIC25"}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCode(promo.code || "AESTHETIC25")}
                      className="rounded-lg text-xs font-bold border-gray-200 hover:bg-amber-50 hover:text-[#c9a24a]"
                    >
                      {copiedCode === (promo.code || "AESTHETIC25") ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1 text-gray-500" />
                          Salin Kode
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleUsePromo(promo.code || "AESTHETIC25")}
                    className="w-full bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-xl h-10 text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Gunakan Promo & Booking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
