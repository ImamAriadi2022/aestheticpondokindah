import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/toast";
import {
  Camera,
  Tag,
  Upload,
  Image as ImageIcon,
  Layers,
  X,
  Loader2,
  CheckCircle2,
  Check,
  Globe,
  Sliders,
} from "lucide-react";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";

type GalleryEditorModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  galleryItem?: any;
  token: string;
  onSaved: () => Promise<void>;
};

export const GALLERY_CATEGORY_PRESETS = [
  "Solusi Dental",
  "Fasilitas",
  "Tindakan Perawatan",
  "Teknologi Medis",
  "Suasana Klinik",
];

export default function GalleryEditorModal({
  open,
  onOpenChange,
  galleryItem,
  token,
  onSaved,
}: GalleryEditorModalProps) {
  const isEdit = Boolean(galleryItem && galleryItem.id);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "Fasilitas",
    description: "",
    sortOrder: 0,
    isPublished: true,
    imageUrl: "",
    imageFile: null as File | null,
  });

  useEffect(() => {
    if (galleryItem && open) {
      setForm({
        title: galleryItem.title || "",
        category: galleryItem.category || "Fasilitas",
        description: galleryItem.description || "",
        sortOrder: typeof galleryItem.sort_order === "number" ? galleryItem.sort_order : 0,
        isPublished: Boolean(galleryItem.is_published ?? true),
        imageUrl: galleryItem.image_url || galleryItem.image_path || "",
        imageFile: null,
      });
    } else if (open) {
      setForm({
        title: "",
        category: "Fasilitas",
        description: "",
        sortOrder: 0,
        isPublished: true,
        imageUrl: "",
        imageFile: null,
      });
    }
  }, [galleryItem, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Judul Wajib Diisi", message: "Silakan masukkan judul foto galeri.", variant: "error" });
      return;
    }

    if (!isEdit && !form.imageFile) {
      toast({ title: "Foto Wajib Diunggah", message: "Silakan pilih foto galeri untuk diunggah.", variant: "error" });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("category", form.category.trim());
      formData.append("description", form.description.trim());
      formData.append("sort_order", String(form.sortOrder || 0));
      formData.append("is_published", form.isPublished ? "1" : "0");

      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      const url = isEdit
        ? `${API_BASE}/admin/gallery-items/${galleryItem.id}`
        : `${API_BASE}/admin/gallery-items`;

      if (isEdit) {
        formData.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || "Gagal menyimpan foto galeri");
      }

      toast({
        title: "Berhasil",
        message: isEdit ? "Foto galeri berhasil diperbarui!" : "Foto galeri baru berhasil ditambahkan!",
        variant: "success",
      });

      onOpenChange(false);
      await onSaved();
    } catch (err: any) {
      console.error("[GalleryEditor] Error:", err);
      toast({
        title: "Gagal Menyimpan",
        message: err.message || "Terjadi kesalahan saat menyimpan foto galeri.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { compressImageFileToWebPFile } = await import("@/core/utils/imageCompressor");
      const compressed = await compressImageFileToWebPFile(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.85,
      });
      const previewUrl = URL.createObjectURL(compressed);
      setForm((prev) => ({
        ...prev,
        imageUrl: previewUrl,
        imageFile: compressed,
      }));
    } catch (err) {
      console.warn("Image compression failed, using original file", err);
      const previewUrl = URL.createObjectURL(file);
      setForm((prev) => ({
        ...prev,
        imageUrl: previewUrl,
        imageFile: file,
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border border-[#E8DFC8] bg-white shadow-2xl text-left">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#FAF6EE] to-[#F5ECE0] p-5 sm:p-6 border-b border-[#E8DFC8] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A24A]/15 border border-[#C9A24A]/30 flex items-center justify-center text-[#8C6B1C] shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2C2416]">
                {isEdit ? "Edit Foto Galeri" : "Tambah Foto Galeri Baru"}
              </h2>
              <p className="text-xs text-[#8C8272]">
                {isEdit
                  ? "Perbarui detail, deskripsi, atau ganti foto dokumentasi klinik"
                  : "Unggah dokumentasi foto fasilitas, tindakan, atau suasana klinik"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-gray-700 flex items-center justify-center border border-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          {/* Judul & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#4A3F35] flex items-center gap-1.5">
                Judul Foto / Fasilitas <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Aquacare Dental Air Abrasion"
                className="h-10 rounded-xl border-[#E8DFC8] focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#4A3F35] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#8C6B1C]" />
                Kategori Galeri
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {GALLERY_CATEGORY_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, category: preset }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      form.category === preset
                        ? "bg-[#C9A24A] text-white shadow-2xs font-bold"
                        : "bg-[#FAF5EA] text-[#8C6B1C] border border-[#EADBBD] hover:bg-[#F5ECE0]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <Input
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Atau ketik kategori kustom..."
                className="h-9 rounded-xl border-[#E8DFC8] text-xs"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#4A3F35] flex items-center gap-1.5">
              Deskripsi Foto (Opsional)
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Jelaskan kegunaan fasilitas, kenyamanan ruangan, atau teknologi yang digunakan..."
              className="w-full rounded-xl border border-[#E8DFC8] p-3 text-xs text-[#2C2416] focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] outline-none transition-all resize-none"
            />
          </div>

          {/* Upload Foto & Preview */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#4A3F35] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#8C6B1C]" />
                Foto Galeri {!isEdit && <span className="text-rose-500">*</span>}
              </span>
              {form.imageUrl && (
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Foto Terpilih
                </span>
              )}
            </label>

            {form.imageUrl ? (
              <div className="relative group rounded-2xl overflow-hidden border border-[#E8DFC8] bg-[#FAF8F5] max-h-56 flex items-center justify-center">
                <img
                  src={form.imageUrl.startsWith("blob:") ? form.imageUrl : (getStorageUrl(form.imageUrl) || form.imageUrl)}
                  alt="Preview"
                  className="w-full h-52 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="px-3 py-1.5 rounded-xl bg-white text-gray-900 text-xs font-bold shadow-md cursor-pointer hover:bg-gray-100 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" /> Ganti Foto
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, imageUrl: "", imageFile: null }))}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md hover:bg-rose-700 cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Hapus
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#C9A24A]/40 hover:border-[#C9A24A] bg-[#FAF8F5] hover:bg-[#F5ECE0]/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#C9A24A]/10 flex items-center justify-center text-[#8C6B1C]">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-[#2C2416]">Klik untuk memilih foto atau seret ke sini</p>
                  <p className="text-[10px] text-[#8C8272] mt-0.5">Mendukung format JPG, PNG, WEBP (Otomatis terkompresi cepat)</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            )}
          </div>

          {/* Urutan & Status Publikasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#4A3F35] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-gray-500" />
                Urutan Tampil (Sort Order)
              </label>
              <Input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                className="h-9 rounded-xl border-[#E8DFC8] text-xs font-semibold"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8]">
              <div>
                <p className="text-xs font-bold text-[#2C2416]">Publikasikan di Website</p>
                <p className="text-[10px] text-[#8C8272]">Tampilkan foto ini di galeri publik</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={form.isPublished}
                onClick={() => setForm((prev) => ({ ...prev, isPublished: !prev.isPublished }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  form.isPublished ? "bg-[#8C6B1C]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    form.isPublished ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-gray-200 text-xs px-4 h-10 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold rounded-xl text-xs px-6 h-10 shadow-md shadow-[#C9A24A]/20 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : isEdit ? (
                "Perbarui Foto"
              ) : (
                "Simpan Foto Baru"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
