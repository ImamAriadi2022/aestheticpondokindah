import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/toast";
import {
  Tag,
  Percent,
  Upload,
  Image as ImageIcon,
  Calendar,
  Layers,
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  Globe,
  Users,
  Crown,
  ShieldCheck,
} from "lucide-react";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";

type PromoEditorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promo?: any;
  token: string;
  onSaved: () => Promise<void>;
};

export const PROMO_TARGET_OPTIONS = [
  { value: "public", label: "Publik (Semua Pengunjung & Akun Guest)", badge: "Publik & Guest", icon: Globe, color: "text-sky-700 bg-sky-50 border-sky-200" },
  { value: "all_members", label: "Semua Member Terdaftar (Membership)", badge: "Semua Member", icon: Users, color: "text-amber-800 bg-amber-50 border-amber-200" },
  { value: "Gold", label: "Khusus Member Gold", badge: "Khusus Gold", icon: Crown, color: "text-[#8C6B1C] bg-[#FAF5EA] border-[#EADBBD]" },
  { value: "Platinum", label: "Khusus Member Platinum VIP", badge: "Khusus Platinum VIP", icon: Sparkles, color: "text-purple-700 bg-purple-50 border-purple-200" },
];

export default function PromoEditorModal({ open, onOpenChange, promo, token, onSaved }: PromoEditorModalProps) {
  const isEdit = Boolean(promo && promo.id);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    headline: "",
    description: "",
    discountText: "",
    targetTier: "public",
    startsAt: "",
    endsAt: "",
    imageUrl: "",
    imageFile: null as File | null,
    isActive: true,
  });

  useEffect(() => {
    if (promo && open) {
      let target = promo.target_tier || promo.category || "public";
      if (target.toLowerCase() === "bronze" || target.toLowerCase() === "all" || target.toLowerCase() === "all_members") {
        target = "all_members";
      } else if (target.toLowerCase() === "public") {
        target = "public";
      }

      setForm({
        title: promo.title || "",
        headline: promo.headline || "",
        description: promo.description || "",
        discountText: promo.discount_text || "",
        targetTier: target,
        startsAt: promo.starts_at ? promo.starts_at.slice(0, 10) : "",
        endsAt: promo.ends_at ? promo.ends_at.slice(0, 10) : "",
        imageUrl: promo.image_url || promo.image_path || "",
        imageFile: null,
        isActive: Boolean(promo.is_active ?? promo.enabled ?? true),
      });
    } else if (open) {
      setForm({
        title: "",
        headline: "",
        description: "",
        discountText: "",
        targetTier: "public",
        startsAt: "",
        endsAt: "",
        imageUrl: "",
        imageFile: null,
        isActive: true,
      });
    }
  }, [promo, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Judul Promo Wajib Diisi", message: "Silakan masukkan judul promo klinik.", variant: "warning" });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("slug", form.title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
      formData.append("headline", form.headline.trim());
      formData.append("description", form.description.trim());
      formData.append("discount_text", form.discountText.trim());
      formData.append("category", form.targetTier);
      formData.append("target_tier", form.targetTier);
      formData.append("is_active", form.isActive ? "1" : "0");
      if (form.startsAt) formData.append("starts_at", form.startsAt);
      if (form.endsAt) formData.append("ends_at", form.endsAt);
      if (form.imageFile) formData.append("image", form.imageFile);

      const url = isEdit ? `${API_BASE}/admin/promos/${promo.id}` : `${API_BASE}/admin/promos`;

      if (isEdit) {
        formData.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        toast({ title: "Gagal Menyimpan Promo", message: errText || "Terjadi kesalahan pada server.", variant: "error" });
        return;
      }

      toast({
        title: isEdit ? "Promo Diperbarui" : "Promo Baru Dibuat",
        message: `Promo "${form.title}" berhasil disimpan.`,
        variant: "success",
      });

      onOpenChange(false);
      await onSaved();
    } catch (err: any) {
      toast({ title: "Gagal Menyimpan", message: err?.message || "Koneksi jaringan terganggu.", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!p-0 overflow-hidden w-[calc(100vw-32px)] max-w-2xl sm:max-w-3xl max-h-[90vh] flex flex-col rounded-[28px] border border-[#E8DFC8] bg-white shadow-2xl"
      >
        {/* Modal Top Header Card */}
        <div className="p-6 sm:p-7 pb-4 bg-white border-b border-[#F0E6D3] flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF5EA] text-[#C9A24A] flex items-center justify-center border border-[#F0E6D3] shrink-0 shadow-2xs">
              <Tag className="w-6 h-6 text-[#C9A24A]" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {isEdit ? "Edit Promo Klinik" : "Tambah Promo Baru"}
              </h3>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {isEdit
                  ? "Sesuaikan penawaran diskon, target membership pasien, dan masa berlaku promo."
                  : "Buat penawaran diskon perawatan baru untuk ditampilkan di website dan aplikasi."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-10 h-10 rounded-full border border-stone-200 hover:bg-stone-50 flex items-center justify-center text-stone-500 hover:text-stone-800 transition cursor-pointer shrink-0 shadow-2xs"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Container with Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="p-6 sm:p-7 pt-4 space-y-5 overflow-y-auto flex-1 bg-white min-h-0">
            {/* Seksi 1: INFORMASI UTAMA PROMO */}
            <div className="p-4 sm:p-5 rounded-2xl border border-[#F0E6D3] bg-white space-y-4 shadow-2xs">
              <h4 className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#8C6B1C]" />
                <span>INFORMASI UTAMA PROMO</span>
              </h4>

              {/* Judul Promo */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-600 block">
                  Judul Promo <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Promo Scaling & Whitening Lebaran Estetik"
                  className="bg-white border-[#E8DFC8] rounded-xl text-xs h-10 font-bold text-[#2C2416]"
                />
              </div>

              {/* Headline & Diskon Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    Headline / Sub-judul Singkat
                  </label>
                  <Input
                    value={form.headline}
                    onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    placeholder="Contoh: Dapatkan senyum cerah percaya diri"
                    className="bg-white border-[#E8DFC8] rounded-xl text-xs h-10 text-[#2C2416]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    Teks Diskon / Badge Promo
                  </label>
                  <div className="relative">
                    <Percent className="w-4 h-4 text-[#8C6B1C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <Input
                      value={form.discountText}
                      onChange={(e) => setForm({ ...form, discountText: e.target.value })}
                      placeholder="Contoh: DISC 30% / HEMAT 500RB"
                      className="pl-10 bg-white border-[#E8DFC8] rounded-xl text-xs h-10 font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Target Audiens / Tier Promo */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-stone-600 block">
                  Target Audiens & Tingkatan Pasien <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PROMO_TARGET_OPTIONS.map((opt) => {
                    const TargetIcon = opt.icon;
                    const isSelected = form.targetTier === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, targetTier: opt.value })}
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "border-[#C9A24A] bg-[#FAF5EA] shadow-2xs ring-1 ring-[#C9A24A]"
                            : "border-[#E8DFC8] bg-white hover:bg-[#FAF8F5]"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${opt.color}`}>
                          <TargetIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#2C2416] truncate">{opt.label}</p>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-0.5 ${opt.color}`}>
                            {opt.badge}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#8C6B1C] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Seksi 2: GAMBAR BANNER & DESKRIPSI LENGKAP */}
            <div className="p-4 sm:p-5 rounded-2xl border border-[#F0E6D3] bg-white space-y-4 shadow-2xs">
              <h4 className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#8C6B1C]" />
                <span>BANNER & DETAIL SYARAT KETENTUAN</span>
              </h4>

              {/* Deskripsi Promo */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-600 block">
                  Deskripsi & Syarat Ketentuan Promo
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Jelaskan rincian paket, ketentuan reservasi, dan syarat klaim diskon promo ini..."
                  className="w-full rounded-xl border border-[#E8DFC8] p-3 text-xs text-[#2C2416] outline-hidden focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A]"
                />
              </div>

              {/* Banner Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    Upload Banner Promo
                  </label>
                  <label className="flex items-center justify-center w-full h-11 rounded-xl border-2 border-dashed border-[#E8DFC8] bg-[#FAF8F5] hover:bg-[#FAF5EA] text-xs font-bold text-[#8C6B1C] cursor-pointer transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const { compressImageFileToWebPFile } = await import("@/core/utils/imageCompressor");
                          const compressed = await compressImageFileToWebPFile(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.85 });
                          setForm((p) => ({ ...p, imageUrl: URL.createObjectURL(compressed), imageFile: compressed }));
                        } catch {
                          setForm((p) => ({ ...p, imageUrl: URL.createObjectURL(file), imageFile: file }));
                        }
                      }}
                    />
                    <Upload className="w-4 h-4 mr-2" />
                    {form.imageUrl ? "Ganti Gambar Banner" : "Pilih File Banner"}
                  </label>
                </div>

                {form.imageUrl && (
                  <div className="h-16 w-full rounded-xl overflow-hidden border border-[#E8DFC8] bg-[#FAF8F5] relative group">
                    <img
                      src={getStorageUrl(form.imageUrl) || form.imageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Preview
                    </span>
                  </div>
                )}
              </div>

              {/* Periode Promo (Mulai & Berakhir) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    Tanggal Mulai Promo
                  </label>
                  <Input
                    type="date"
                    value={form.startsAt}
                    onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                    className="bg-white border-[#E8DFC8] rounded-xl text-xs h-10 text-[#2C2416]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-600 block">
                    Tanggal Berakhir Promo
                  </label>
                  <Input
                    type="date"
                    value={form.endsAt}
                    onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                    className="bg-white border-[#E8DFC8] rounded-xl text-xs h-10 text-[#2C2416]"
                  />
                </div>
              </div>
            </div>

            {/* Seksi 3: STATUS KEAKTIFAN */}
            <div className="p-4 rounded-2xl border border-[#F0E6D3] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#2C2416]">Status Publikasi Promo</p>
                <p className="text-[11px] text-[#8C8272] mt-0.5">
                  Jika aktif, promo akan langsung tampil di halaman depan, etalase, dan aplikasi pasien.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          {/* Modal Fixed Footer Card */}
          <div className="p-5 sm:px-7 sm:py-4 bg-[#FAF8F5] border-t border-[#F0E6D3] flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-[#E8DFC8] text-stone-700 hover:bg-stone-100 font-semibold h-10 px-5 text-xs cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white font-bold h-10 px-6 text-xs shadow-md shadow-[#C9A24A]/20 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isEdit ? "Simpan Perubahan Promo" : "Terbitkan Promo Baru"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
