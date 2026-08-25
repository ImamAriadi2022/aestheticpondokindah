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
  fetchApiTestimonials: () => Promise<void>;
  setSearchParams: any;
};

export default function TestimonialEditor({ current, editorId, token, fetchApiTestimonials, setSearchParams }: Props) {
  const isNew = !editorId;

  const [testimonialEditor, setTestimonialEditor] = useState({
    name: current?.name || "",
    rating: current?.rating || 5,
    quote: current?.quote || "",
    photoUrl: current?.photo_url || "",
    photoFile: null as File | null,
  });

  useEffect(() => {
    if (current) {
      setTestimonialEditor({
        name: current.name || "",
        rating: current.rating || 5,
        quote: current.quote || "",
        photoUrl: current.photo_url || "",
        photoFile: null,
      });
    }
  }, [editorId, current]);

  const updateSaved = (patch: Partial<typeof testimonialEditor>) => {
    setTestimonialEditor((prev) => ({ ...prev, ...patch }));
  };

  const handleTestimonialSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", testimonialEditor.name);
      formData.append("rating", String(testimonialEditor.rating));
      formData.append("quote", testimonialEditor.quote);
      if (testimonialEditor.photoFile) {
        formData.append("photo", testimonialEditor.photoFile);
      }

      const url = isNew
        ? `${API_BASE}/admin/testimonials`
        : `${API_BASE}/admin/testimonials/${editorId}`;

      if (!isNew) {
        formData.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        console.error("Gagal simpan testimoni", await res.text());
        return;
      }

      toast({
        title: "Berhasil",
        message: isNew ? "Testimoni berhasil ditambahkan" : "Testimoni diperbarui",
        variant: "success",
      });
      await fetchApiTestimonials();
      setSearchParams((prev: any) => {
        const next = new URLSearchParams(prev);
        next.set("tab", "content-testimonials");
        next.set("view", "list");
        next.delete("id");
        return next;
      });
    } catch (e) {
      console.error("Gagal simpan testimoni", e);
    }
  };

  const saved = testimonialEditor;

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
                next.set("tab", "content-testimonials");
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
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tambah / Edit Testimoni</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm"
            onClick={handleTestimonialSave}
            disabled={!saved.name.trim() || !saved.quote.trim()}
          >
            Simpan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-sm border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Nama</p>
              <Input
                value={saved.name}
                onChange={(e) => updateSaved({ name: e.target.value })}
                className="rounded-sm border-gray-200"
                placeholder="Nama"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500">Testimoni</p>
              <textarea
                value={saved.quote}
                onChange={(e) => updateSaved({ quote: e.target.value })}
                className="w-full min-h-[140px] rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a24a]/25"
                placeholder="Tulis testimoni..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Foto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="group block w-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const { compressImageFileToWebPFile } = await import("@/core/utils/imageCompressor");
                      const compressed = await compressImageFileToWebPFile(file, { maxWidth: 800, maxHeight: 800, quality: 0.85 });
                      const url = URL.createObjectURL(compressed);
                      updateSaved({ photoUrl: url, photoFile: compressed });
                    } catch {
                      const url = URL.createObjectURL(file);
                      updateSaved({ photoUrl: url, photoFile: file });
                    }
                    e.currentTarget.value = "";
                  }}
                />
                <div className="w-full aspect-[4/3] rounded-sm border border-dashed border-emerald-300 bg-emerald-50/40 overflow-hidden flex items-center justify-center relative">
                  {saved.photoUrl ? (
                    <img src={saved.photoUrl} alt={saved.name || "preview"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center px-4">
                      <div className="mx-auto w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 text-lg">↑</span>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-emerald-700">Klik untuk unggah</p>
                      <p className="text-[11px] text-emerald-700/80">PNG, JPG, WEBP (2MB)</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
              </label>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Rating</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <select
                value={saved.rating}
                onChange={(e) => updateSaved({ rating: Number(e.target.value) })}
                className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r}/5
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
