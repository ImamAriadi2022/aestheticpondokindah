import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ArrowLeft, Plus, Image } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";
import WpEditor from "./WpEditor";

type Props = {
  current?: any;
  editorId?: string | null;
  token: string;
  fetchApiPromos: () => Promise<void>;
  setSearchParams: any;
};

export default function PromoEditor({ current, editorId, token, fetchApiPromos, setSearchParams }: Props) {
  const isNew = !editorId;

  const [promoEditor, setPromoEditor] = useState({
    title: current?.title || "",
    slug: current?.slug || "",
    description: current?.description || "",
    contentHtml: current?.content_html || "",
    category: current?.category || "Bronze",
    buttonLabel: current?.button_label || "Hubungi Admin",
    contactWhatsapp: current?.contact_whatsapp || "",
    isActive: current?.is_active ?? true,
    startsAt: current?.starts_at ? current.starts_at.slice(0, 10) : "",
    endsAt: current?.ends_at ? current.ends_at.slice(0, 10) : "",
    sortOrder: current?.sort_order ?? 0,
    imageUrl: getStorageUrl(current?.image_url || current?.image_path) || "",
    imageFile: null as File | null,
  });

  useEffect(() => {
    if (current) {
      setPromoEditor({
        title: current.title || "",
        slug: current.slug || "",
        description: current.description || "",
        contentHtml: current.content_html || "",
        category: current.category || "Bronze",
        buttonLabel: current.button_label || "Hubungi Admin",
        contactWhatsapp: current.contact_whatsapp || "",
        isActive: current.is_active ?? true,
        startsAt: current.starts_at ? current.starts_at.slice(0, 10) : "",
        endsAt: current.ends_at ? current.ends_at.slice(0, 10) : "",
        sortOrder: current.sort_order ?? 0,
        imageUrl: getStorageUrl(current.image_url || current.image_path) || "",
        imageFile: null,
      });
    }
  }, [editorId, current]);

  const updateSaved = (patch: Partial<typeof promoEditor>) => {
    setPromoEditor((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", promoEditor.title);
      formData.append("slug", promoEditor.slug || promoEditor.title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
      formData.append("description", promoEditor.description);
      formData.append("content_html", promoEditor.contentHtml);
      formData.append("category", promoEditor.category);
      formData.append("button_label", promoEditor.buttonLabel);
      formData.append("contact_whatsapp", promoEditor.contactWhatsapp);
      formData.append("is_active", promoEditor.isActive ? "1" : "0");
      if (promoEditor.startsAt) formData.append("starts_at", promoEditor.startsAt);
      if (promoEditor.endsAt) formData.append("ends_at", promoEditor.endsAt);
      formData.append("sort_order", String(promoEditor.sortOrder));
      if (promoEditor.imageFile) {
        formData.append("image", promoEditor.imageFile);
      }

      const url = isNew
        ? `${API_BASE}/admin/promos`
        : `${API_BASE}/admin/promos/${editorId}`;

      if (!isNew) {
        formData.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        console.error("Gagal simpan promo", await res.text());
        return;
      }

      toast({
        title: "Berhasil",
        message: isNew ? "Promo berhasil ditambahkan" : "Promo diperbarui",
        variant: "success",
      });
      await fetchApiPromos();
      setSearchParams((prev: any) => {
        const next = new URLSearchParams(prev);
        next.set("tab", "content-promo");
        next.set("view", "list");
        next.delete("id");
        return next;
      });
    } catch (e) {
      console.error("Gagal simpan promo", e);
    }
  };

  const saved = promoEditor;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-sm border-gray-200 h-9 text-xs"
            onClick={() =>
              setSearchParams((prev: any) => {
                const next = new URLSearchParams(prev);
                next.set("tab", "content-promo");
                next.set("view", "list");
                next.delete("id");
                return next;
              })
            }
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <h2 className="text-lg font-bold text-gray-900">
            {isNew ? "Tambah Promo" : "Edit Promo"}
          </h2>
        </div>
        <Button
          className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm h-9"
          onClick={handleSave}
        >
          <Plus className="w-4 h-4 mr-1" />
          {isNew ? "Tambah Promo" : "Simpan Perubahan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Informasi Promo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Judul Promo</label>
                <Input
                  value={saved.title}
                  onChange={(e) => updateSaved({ title: e.target.value })}
                  placeholder="Masukkan judul promo"
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Slug</label>
                <Input
                  value={saved.slug}
                  onChange={(e) => updateSaved({ slug: e.target.value })}
                  placeholder="auto-generated-slug"
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Deskripsi Singkat</label>
                <textarea
                  className="w-full h-20 p-3 rounded-sm border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] resize-none"
                  value={saved.description}
                  onChange={(e) => updateSaved({ description: e.target.value })}
                  placeholder="Deskripsi singkat promo..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Konten Lengkap</label>
                <WpEditor
                  value={saved.contentHtml}
                  onChange={(html) => updateSaved({ contentHtml: html })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Pengaturan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Label Button</label>
                <Input
                  value={saved.buttonLabel}
                  onChange={(e) => updateSaved({ buttonLabel: e.target.value })}
                  placeholder="Hubungi Admin"
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Kategori Promo</label>
                <select
                  value={saved.category}
                  onChange={(e) => updateSaved({ category: e.target.value })}
                  className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
                >
                  {["Bronze", "Gold", "Platinum"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Nomor WhatsApp</label>
                <Input
                  value={saved.contactWhatsapp}
                  onChange={(e) => updateSaved({ contactWhatsapp: e.target.value })}
                  placeholder="+6281234567890"
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Urutan</label>
                <Input
                  type="number"
                  value={saved.sortOrder}
                  onChange={(e) => updateSaved({ sortOrder: Number(e.target.value) })}
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#F0E6D3]">
                <div>
                  <label className="text-xs font-bold text-[#4A3F35] block">Status Promo</label>
                  <span className="text-[11px] text-[#8A7B6B]">
                    {saved.isActive ? "🟢 Promo Aktif & Tampil di Publik" : "🔴 Promo Non-aktif (Disembunyikan)"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateSaved({ isActive: !saved.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${saved.isActive ? "bg-emerald-500" : "bg-red-500"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${saved.isActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Tanggal Mulai</label>
                <Input
                  type="date"
                  value={saved.startsAt}
                  onChange={(e) => updateSaved({ startsAt: e.target.value })}
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Tanggal Berakhir</label>
                <Input
                  type="date"
                  value={saved.endsAt}
                  onChange={(e) => updateSaved({ endsAt: e.target.value })}
                  className="rounded-sm border-gray-200"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Gambar Promo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="cursor-pointer block">
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
                      const url = URL.createObjectURL(compressed);
                      updateSaved({ imageUrl: url, imageFile: compressed });
                    } catch {
                      const url = URL.createObjectURL(file);
                      updateSaved({ imageUrl: url, imageFile: file });
                    }
                    e.currentTarget.value = "";
                  }}
                />
                <div className="w-full aspect-[16/9] rounded-sm border border-dashed border-[#c9a24a]/40 bg-[#c9a24a]/5 overflow-hidden flex items-center justify-center relative">
                  {saved.imageUrl ? (
                    <img src={saved.imageUrl} alt={saved.title || "preview"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center px-4">
                      <div className="mx-auto w-10 h-10 rounded-full bg-[#c9a24a]/10 flex items-center justify-center">
                        <Image className="w-5 h-5 text-[#a8843a]" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-[#a8843a]">Klik untuk mengunggah gambar</p>
                      <p className="text-xs text-[#a8843a]/70">PNG, JPG, WEBP (Maks. 2MB)</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
