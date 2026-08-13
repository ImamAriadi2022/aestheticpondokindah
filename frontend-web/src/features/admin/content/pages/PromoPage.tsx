import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { toast } from "@/shared/ui/toast";
import { Plus, Edit2, Trash2, Save, FileText, Image, Upload } from "lucide-react";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";

type Props = {
  token: string;
  apiPromos: any[];
  fetchApiPromos: () => Promise<void>;
};

export default function PromoPage({ token, apiPromos, fetchApiPromos }: Props) {
  const [editorId, setEditorId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const currentPromo = apiPromos.find((p) => p.id === editorId) || null;

  const [promoForm, setPromoForm] = useState({
    title: "",
    headline: "",
    description: "",
    discountText: "",
    targetTier: "Bronze",
    startsAt: "",
    endsAt: "",
    imageUrl: "",
    imageFile: null as File | null,
    enabled: true,
  });

  const openNewForm = () => {
    setEditorId(null);
    setPromoForm({
      title: "",
      headline: "",
      description: "",
      discountText: "",
      targetTier: "Bronze",
      startsAt: "",
      endsAt: "",
      imageUrl: "",
      imageFile: null,
      enabled: true,
    });
    setIsEditing(true);
  };

  const openEditForm = (promo: any) => {
    setEditorId(promo.id);
    setPromoForm({
      title: promo.title || "",
      headline: promo.headline || "",
      description: promo.description || "",
      discountText: promo.discount_text || "",
      targetTier: promo.target_tier || "Bronze",
      startsAt: promo.starts_at ? promo.starts_at.slice(0, 10) : "",
      endsAt: promo.ends_at ? promo.ends_at.slice(0, 10) : "",
      imageUrl: promo.image_url || "",
      imageFile: null,
      enabled: !!promo.enabled,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", promoForm.title);
      formData.append("headline", promoForm.headline);
      formData.append("description", promoForm.description);
      formData.append("discount_text", promoForm.discountText);
      formData.append("target_tier", promoForm.targetTier);
      formData.append("enabled", promoForm.enabled ? "1" : "0");
      if (promoForm.startsAt) formData.append("starts_at", promoForm.startsAt);
      if (promoForm.endsAt) formData.append("ends_at", promoForm.endsAt);
      if (promoForm.imageFile) formData.append("image", promoForm.imageFile);

      const url = editorId
        ? `${API_BASE}/admin/promos/${editorId}`
        : `${API_BASE}/admin/promos`;

      if (editorId) {
        formData.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        toast({ title: "Gagal Menyimpan", message: "Terjadi kesalahan saat menyimpan promo", variant: "error" });
        return;
      }

      toast({ title: "Berhasil", message: editorId ? "Promo berhasil diperbarui" : "Promo baru berhasil ditambahkan", variant: "success" });
      await fetchApiPromos();
      setIsEditing(false);
    } catch (e) {
      toast({ title: "Koneksi Error", message: "Gagal terhubung ke server", variant: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus promo ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/promos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: "Berhasil", message: "Promo berhasil dihapus", variant: "success" });
        await fetchApiPromos();
      }
    } catch (e) {
      toast({ title: "Gagal", message: "Gagal menghapus promo", variant: "error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Katalog Promo Klinik</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola daftar promo spesial, penawaran diskon, dan target membership tier.</p>
        </div>
        <Button
          onClick={openNewForm}
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-md shadow-[#C9A24A]/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Promo Baru
        </Button>
      </div>

      {isEditing ? (
        /* Editor Form */
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#F0E6D3] pb-4">
            <h3 className="text-base font-bold text-[#4A3F35]">
              {editorId ? "Edit Promo" : "Tambah Promo Baru"}
            </h3>
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-xs">
              Batal
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4A3F35]">Judul Promo</label>
              <Input
                value={promoForm.title}
                onChange={(e) => setPromoForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Contoh: Scaling Gigi Disc 50%"
                className="rounded-xl border-[#F0E6D3]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4A3F35]">Headline / Sub-judul</label>
              <Input
                value={promoForm.headline}
                onChange={(e) => setPromoForm((p) => ({ ...p, headline: e.target.value }))}
                placeholder="Contoh: Khusus Member Bronze & Gold"
                className="rounded-xl border-[#F0E6D3]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4A3F35]">Teks Diskon / Badge</label>
              <Input
                value={promoForm.discountText}
                onChange={(e) => setPromoForm((p) => ({ ...p, discountText: e.target.value }))}
                placeholder="Contoh: DISC 50%"
                className="rounded-xl border-[#F0E6D3]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4A3F35]">Target Membership Tier</label>
              <select
                value={promoForm.targetTier}
                onChange={(e) => setPromoForm((p) => ({ ...p, targetTier: e.target.value }))}
                className="w-full h-10 rounded-xl border border-[#F0E6D3] bg-white px-3 text-xs font-semibold text-[#4A3F35]"
              >
                <option value="Bronze">Bronze (Semua Member)</option>
                <option value="Gold">Gold Only</option>
                <option value="Platinum">Platinum VIP Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#4A3F35]">Deskripsi Promo</label>
            <textarea
              value={promoForm.description}
              onChange={(e) => setPromoForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-[#F0E6D3] p-3 text-xs text-[#4A3F35] focus:outline-none focus:ring-2 focus:ring-[#C9A24A]/25"
              placeholder="Jelaskan detail syarat dan ketentuan promo..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#4A3F35]">Gambar Banner Promo</label>
              <label className="flex items-center justify-center w-full h-10 rounded-xl border-2 border-dashed border-[#F0E6D3] bg-[#FDF8F0]/50 text-xs font-medium text-[#B8943F] hover:bg-[#F5E6C8] cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPromoForm((p) => ({ ...p, imageUrl: URL.createObjectURL(file), imageFile: file }));
                  }}
                />
                <Upload className="w-4 h-4 mr-2" />
                Pilih File Gambar
              </label>
            </div>
            {promoForm.imageUrl && (
              <div className="h-16 w-32 rounded-xl overflow-hidden border border-[#F0E6D3]">
                <img src={getStorageUrl(promoForm.imageUrl) || promoForm.imageUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-3">
            <Button onClick={handleSave} className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white rounded-xl text-xs font-semibold">
              <Save className="w-4 h-4 mr-2" />
              Simpan Promo
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl text-xs">
              Batal
            </Button>
          </div>
        </div>
      ) : (
        /* Data Table */
        <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#FAF8F5]">
                <TableHead className="w-16">Banner</TableHead>
                <TableHead>Judul Promo</TableHead>
                <TableHead>Target Tier</TableHead>
                <TableHead>Teks Diskon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiPromos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-[#8A7B6B]">
                    Belum ada promo terdaftar. Klik "Tambah Promo Baru" di atas.
                  </TableCell>
                </TableRow>
              ) : (
                apiPromos.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      {promo.image_url ? (
                        <img src={getStorageUrl(promo.image_url) || promo.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#F0E6D3]" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
                          <Image className="w-5 h-5" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-bold text-[#4A3F35]">{promo.title}</p>
                      <p className="text-[10px] text-[#8A7B6B]">{promo.headline}</p>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF8F0] text-[#B8943F] border border-[#F5E6C8]">
                        {promo.target_tier || "Bronze"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-emerald-700">{promo.discount_text || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${promo.enabled ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {promo.enabled ? "Aktif" : "Non-aktif"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => openEditForm(promo)} className="h-8 w-8 p-0 text-[#B8943F]">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(promo.id)} className="h-8 w-8 p-0 text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
