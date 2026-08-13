import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE } from "@/core/api/apiConfig";

type Props = {
  current?: any;
  editorId?: string | null;
  token: string;
  fetchApiGallery: () => Promise<void>;
  setSearchParams: any;
};

export default function GalleryEditor({ current, editorId, token, fetchApiGallery, setSearchParams }: Props) {
  const isNew = !editorId;

  const [galleryEditor, setGalleryEditor] = useState({
    title: current?.title || "",
    imageUrl: current?.image_url || "",
    imageFile: null as File | null,
    category: current?.category || "Fasilitas",
  });

  useEffect(() => {
    if (current) {
      setGalleryEditor({
        title: current.title || "",
        imageUrl: current.image_url || "",
        imageFile: null,
        category: current.category || "Fasilitas",
      });
    }
  }, [editorId, current]);

  const updateSaved = (patch: Partial<typeof galleryEditor>) => {
    setGalleryEditor((prev) => ({ ...prev, ...patch }));
  };

  const handleGallerySave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", galleryEditor.title);
      formData.append("category", galleryEditor.category);
      if (galleryEditor.imageFile) {
        formData.append("image", galleryEditor.imageFile);
      }

      const url = isNew
        ? `${API_BASE}/admin/gallery-items`
        : `${API_BASE}/admin/gallery-items/${editorId}`;
      
      if (!isNew) {
        formData.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        console.error("Gagal simpan galeri", await res.text());
        return;
      }

      toast({ title: "Berhasil", message: isNew ? "Galeri berhasil ditambahkan" : "Galeri diperbarui", variant: "success" });
      await fetchApiGallery();
      setSearchParams((prev: any) => {
        const next = new URLSearchParams(prev);
        next.set("tab", "content-gallery");
        next.set("view", "list");
        next.delete("id");
        return next;
      });
    } catch (e) {
      console.error("Gagal simpan galeri", e);
    }
  };

  const saved = galleryEditor;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-sm border-gray-200"
            onClick={() => {
              setSearchParams((prev: any) => {
                const next = new URLSearchParams(prev);
                next.set("tab", "content-gallery");
                next.set("view", "list");
                next.delete("id");
                return next;
              });
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tambah / Edit Galeri</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm"
            onClick={handleGallerySave}
            disabled={!saved.title.trim() || (!saved.imageUrl && !saved.imageFile)}
          >
            Simpan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-sm border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Judul</p>
              <Input
                value={saved.title}
                onChange={(e) => updateSaved({ title: e.target.value })}
                className="rounded-sm border-gray-200"
                placeholder="Judul galeri"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Upload Gambar</p>
              <label className="group block w-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    updateSaved({ imageUrl: url, imageFile: file });
                    e.currentTarget.value = "";
                  }}
                />
                <div className="w-full aspect-[16/9] rounded-sm border border-dashed border-emerald-300 bg-emerald-50/40 overflow-hidden flex items-center justify-center relative">
                  {saved.imageUrl ? (
                    <img src={saved.imageUrl} alt={saved.title || "preview"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center px-4">
                      <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 text-xl">↑</span>
                      </div>
                      <p className="mt-3 text-sm font-semibold text-emerald-700">Klik untuk mengunggah gambar</p>
                      <p className="text-xs text-emerald-700/80">PNG, JPG, WEBP (Maks. 2MB)</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Kategori</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <select
                value={saved.category}
                onChange={(e) => updateSaved({ category: e.target.value })}
                className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
              >
                {[
                  "Semua",
                  "Klien Kami",
                  "Tindakan Perawatan",
                  "Solusi Dental",
                  "Fasilitas",
                ].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
