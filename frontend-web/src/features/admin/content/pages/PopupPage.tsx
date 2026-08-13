import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/toast";
import { Save, Type, Upload } from "lucide-react";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";

type Props = {
  token: string;
  apiPopups: any[];
  fetchApiPopups: () => Promise<void>;
};

export default function PopupPage({ token, apiPopups, fetchApiPopups }: Props) {
  const [popupPromo, setPopupPromo] = useState({
    title: "",
    headline: "",
    message: "",
    buttonLabel: "",
    imageUrl: "",
    imageFile: null as File | null,
    enabled: false,
  });

  useEffect(() => {
    if (apiPopups && apiPopups.length > 0) {
      const p = apiPopups[0];
      setPopupPromo({
        title: p.title || "",
        headline: p.headline || "",
        message: p.message || "",
        buttonLabel: p.button_label || "",
        imageUrl: p.image_url || "",
        imageFile: null,
        enabled: !!p.enabled,
      });
    }
  }, [apiPopups]);

  const togglePopupStatusDirectly = async (newStatus: boolean) => {
    setPopupPromo((p) => ({ ...p, enabled: newStatus }));
    const firstPopup = apiPopups[0];
    if (firstPopup) {
      try {
        const formData = new FormData();
        formData.append("enabled", newStatus ? "1" : "0");
        formData.append("_method", "PUT");
        const res = await fetch(`${API_BASE}/admin/popups/${firstPopup.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (res.ok) {
          toast({
            title: "Status Pop Up Diperbarui",
            message: `Pop up promo berhasil di-${newStatus ? "aktifkan" : "non-aktifkan"}.`,
            variant: "success",
          });
          await fetchApiPopups();
        } else {
          toast({ title: "Gagal Perbarui Status", message: "Tidak dapat mengubah status di database.", variant: "error" });
        }
      } catch (e) {
        console.error("Gagal toggle status popup", e);
        toast({ title: "Koneksi Error", message: "Gagal terhubung ke server.", variant: "error" });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Pop Up Promo</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola dan aktifkan / non-aktifkan pop up promo yang muncul di halaman utama klinik.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#F0E6D3] bg-white shadow-xs">
            <span className="text-xs font-semibold text-[#4A3F35]">Status:</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${popupPromo.enabled ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {popupPromo.enabled ? "🟢 AKTIF" : "🔴 NON-AKTIF"}
            </span>
          </div>
          <Button
            className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-md shadow-[#C9A24A]/20 h-10"
            onClick={async () => {
              try {
                const firstPopup = apiPopups[0];
                const isNew = !firstPopup;
                const formData = new FormData();
                formData.append("title", popupPromo.title || "Pop Up Promo");
                formData.append("headline", popupPromo.headline || "");
                formData.append("message", popupPromo.message || "");
                formData.append("button_label", popupPromo.buttonLabel || "");
                formData.append("enabled", popupPromo.enabled ? "1" : "0");
                if (popupPromo.imageFile) {
                  formData.append("image", popupPromo.imageFile);
                }
                const url = isNew
                  ? `${API_BASE}/admin/popups`
                  : `${API_BASE}/admin/popups/${firstPopup.id}`;

                const res = await fetch(url, {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                  body: formData,
                });

                if (!res.ok) {
                  const errText = await res.text();
                  console.error("Gagal simpan popup", errText);
                  toast({ title: "Gagal Menyimpan", message: "Terjadi kesalahan saat menyimpan data pop up ke database.", variant: "error" });
                  return;
                }

                const savedPopup = await res.json();
                toast({ title: "Tersimpan Ke Database", message: `Pop up promo berhasil disimpan (${popupPromo.enabled ? "Aktif" : "Non-aktif"})`, variant: "success" });
                await fetchApiPopups();
                if (savedPopup && savedPopup.image_url) {
                  setPopupPromo((p) => ({ ...p, imageUrl: savedPopup.image_url, imageFile: null }));
                } else {
                  setPopupPromo((p) => ({ ...p, imageFile: null }));
                }
              } catch (e) {
                console.error("Gagal simpan popup", e);
                toast({ title: "Gagal Menyimpan", message: "Gagal terhubung ke server saat menyimpan.", variant: "error" });
              }
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            Simpan Perubahan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm lg:col-span-2 overflow-hidden">
          <div className="p-5 border-b border-[#F0E6D3]">
            <h3 className="text-base font-bold text-[#4A3F35] flex items-center gap-2">
              <Type className="w-4 h-4 text-[#B8943F]" />
              Pengaturan & Konten Pop Up
            </h3>
          </div>
          <div className="p-5 space-y-5">
            {/* Status Toggle Card */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF8F5] border border-[#F0E6D3]">
              <div>
                <label className="text-sm font-bold text-[#4A3F35] block">Tampilkan Pop Up Promo di Halaman Utama</label>
                <span className="text-xs text-[#8A7B6B]">
                  {popupPromo.enabled
                    ? "Pop-up sedang AKTIF dan akan muncul saat pasien/pengunjung membuka halaman utama."
                    : "Pop-up NON-AKTIF (disembunyikan dari pengunjung)."}
                </span>
              </div>
              <button
                type="button"
                onClick={() => togglePopupStatusDirectly(!popupPromo.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${popupPromo.enabled ? "bg-emerald-500" : "bg-red-500"}`}
              >
                <span
                  className="inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-xs"
                  style={{ transform: popupPromo.enabled ? "translateX(22px)" : "translateX(2px)" }}
                />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#4A3F35]">Judul Kecil (Sub-heading)</label>
              <Input
                value={popupPromo.title}
                onChange={(e) => setPopupPromo((p) => ({ ...p, title: e.target.value }))}
                className="rounded-xl border-[#F0E6D3] focus-visible:ring-[#C9A24A]/30"
                placeholder="Contoh: PROMO SPESIAL BULAN INI"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#4A3F35]">Headline Utama</label>
              <Input
                value={popupPromo.headline}
                onChange={(e) => setPopupPromo((p) => ({ ...p, headline: e.target.value }))}
                className="rounded-xl border-[#F0E6D3] focus-visible:ring-[#C9A24A]/30"
                placeholder="Contoh: Diskon 20% Veneer & Bleaching Gigi"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#4A3F35]">Deskripsi / Pesan</label>
              <textarea
                value={popupPromo.message}
                onChange={(e) => setPopupPromo((p) => ({ ...p, message: e.target.value }))}
                className="w-full min-h-[120px] rounded-xl border border-[#F0E6D3] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A24A]/25 text-[#4A3F35]"
                placeholder="Masukkan deskripsi promo..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#4A3F35]">Label Tombol WhatsApp / Klaim</label>
              <Input
                value={popupPromo.buttonLabel}
                onChange={(e) => setPopupPromo((p) => ({ ...p, buttonLabel: e.target.value }))}
                className="rounded-xl border-[#F0E6D3] focus-visible:ring-[#C9A24A]/30"
                placeholder="Contoh: Ambil Promo Sekarang"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-[#4A3F35]">Gambar Pop Up</label>
              <label className="inline-flex items-center justify-center w-full h-12 rounded-xl border-2 border-dashed border-[#F0E6D3] bg-[#FDF8F0]/50 text-sm font-medium text-[#B8943F] hover:bg-[#F5E6C8] hover:border-[#C9A24A] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setPopupPromo((p) => ({ ...p, imageUrl: url, imageFile: file }));
                    e.currentTarget.value = "";
                  }}
                />
                <Upload className="w-4 h-4 mr-2" />
                Unggah Gambar Pop Up
              </label>
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-sm overflow-hidden space-y-3 p-4">
          <h4 className="text-sm font-bold text-[#4A3F35]">Preview Tampilan (Mobile/Desktop)</h4>
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-xs">
            {popupPromo.enabled ? (
              <div className="absolute top-2 right-2 z-10 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                AKTIF
              </div>
            ) : (
              <div className="absolute top-2 right-2 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                NON-AKTIF
              </div>
            )}
            <div className="h-36 w-full bg-gray-100 overflow-hidden relative">
              {popupPromo.imageUrl ? (
                <img src={getStorageUrl(popupPromo.imageUrl) || popupPromo.imageUrl} alt="promo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#FDF8F0] text-[#B8943F] text-xs">
                  Belum ada gambar
                </div>
              )}
            </div>
            <div className="p-4 space-y-2">
              <p className="text-[10px] font-semibold tracking-widest text-[#B8943F] uppercase">{popupPromo.title || "WELCOME OFFER"}</p>
              <p className="text-sm font-bold text-[#2C2416]">{popupPromo.headline || "Headline Promo"}</p>
              <p className="text-xs text-[#5C5546] leading-relaxed">{popupPromo.message || "Deskripsi detail promo akan tampil di sini..."}</p>
              <button type="button" className="w-full h-9 rounded-xl text-white text-xs font-semibold bg-gradient-to-r from-[#C9A24A] to-[#A8843A] shadow-xs">
                {popupPromo.buttonLabel || "Ambil Promo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
