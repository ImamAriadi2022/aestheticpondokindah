import { useState, useMemo, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { toast } from "@/shared/ui/toast";
import { Plus, Edit2, Trash2, Save, Tag, Percent, Image as ImageIcon, Upload, Search, Check, X } from "lucide-react";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";

type Props = {
  token: string;
  apiPromos: any[];
  fetchApiPromos: () => Promise<void>;
};

export default function PromoPage({ token, apiPromos = [], fetchApiPromos }: Props) {
  const [editorId, setEditorId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All");

  useEffect(() => {
    fetchApiPromos();
  }, []);

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
    isActive: true,
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
      isActive: true,
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
      targetTier: promo.target_tier || promo.category || "Bronze",
      startsAt: promo.starts_at ? promo.starts_at.slice(0, 10) : "",
      endsAt: promo.ends_at ? promo.ends_at.slice(0, 10) : "",
      imageUrl: promo.image_url || promo.image_path || "",
      imageFile: null,
      isActive: Boolean(promo.is_active ?? promo.enabled ?? true),
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!promoForm.title.trim()) {
      toast({ title: "Judul Wajib Diisi", message: "Silakan masukkan judul promo", variant: "error" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", promoForm.title);
      formData.append("slug", promoForm.title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
      formData.append("headline", promoForm.headline);
      formData.append("description", promoForm.description);
      formData.append("discount_text", promoForm.discountText);
      formData.append("category", promoForm.targetTier);
      formData.append("target_tier", promoForm.targetTier);
      formData.append("is_active", promoForm.isActive ? "1" : "0");
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

  const handleToggleStatus = async (promo: any) => {
    const nextStatus = !Boolean(promo.is_active ?? promo.enabled);
    try {
      const form = new FormData();
      form.append("is_active", nextStatus ? "1" : "0");
      form.append("_method", "PUT");

      const res = await fetch(`${API_BASE}/admin/promos/${promo.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (res.ok) {
        toast({
          title: "Status Promo Diperbarui",
          message: `Promo "${promo.title}" kini ${nextStatus ? "Aktif" : "Non-aktif"}.`,
          variant: "success",
        });
        await fetchApiPromos();
      }
    } catch {
      toast({ title: "Gagal", message: "Gagal mengubah status promo", variant: "error" });
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

  const filtered = useMemo(() => {
    return apiPromos.filter((p) => {
      const isActive = Boolean(p.is_active ?? p.enabled);
      if (filterStatus === "Active" && !isActive) return false;
      if (filterStatus === "Inactive" && isActive) return false;

      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        (p.title || "").toLowerCase().includes(q) ||
        (p.headline || "").toLowerCase().includes(q) ||
        (p.target_tier || p.category || "").toLowerCase().includes(q) ||
        (p.discount_text || "").toLowerCase().includes(q)
      );
    });
  }, [apiPromos, filterStatus, search]);

  const activeCount = apiPromos.filter((p) => Boolean(p.is_active ?? p.enabled)).length;
  const inactiveCount = apiPromos.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Katalog Promo Klinik</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola penawaran promo spesial, diskon perawatan, dan target membership tier.</p>
        </div>
        <Button
          onClick={openNewForm}
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-md shadow-[#C9A24A]/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Promo Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
              <Percent className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Total Promo</p>
          </div>
          <p className="text-2xl font-bold text-[#4A3F35]">{apiPromos.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Promo Aktif</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{activeCount}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
              <Tag className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Non-Aktif / Selesai</p>
          </div>
          <p className="text-2xl font-bold text-[#4A3F35]">{inactiveCount}</p>
        </div>
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
              <label className="text-xs font-semibold text-[#4A3F35]">Judul Promo *</label>
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
              className="w-full rounded-xl border border-[#F0E6D3] p-3 text-xs text-[#4A3F35] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]/25"
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

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="promoIsActive"
              checked={promoForm.isActive}
              onChange={(e) => setPromoForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="rounded border-[#F0E6D3] text-[#C9A24A] focus:ring-[#C9A24A]"
            />
            <label htmlFor="promoIsActive" className="text-xs font-semibold text-[#4A3F35] cursor-pointer">
              Aktifkan promo ini langsung di website dan aplikasi
            </label>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <Button onClick={handleSave} className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white rounded-xl text-xs font-semibold cursor-pointer">
              <Save className="w-4 h-4 mr-2" />
              Simpan Promo
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-xl text-xs cursor-pointer">
              Batal
            </Button>
          </div>
        </div>
      ) : (
        /* Data Table */
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {(["All", "Active", "Inactive"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === st
                      ? "bg-[#C9A24A] text-white shadow-xs"
                      : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]/60"
                  }`}
                >
                  {st === "All" ? "Semua Promo" : st === "Active" ? "Promo Aktif" : "Non-Aktif"}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A89F91]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari promo..."
                className="w-full h-8.5 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl pl-8.5 pr-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
              />
            </div>
          </div>

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
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-[#8A7B6B]">
                      Tidak ada promo ditemukan. Klik "Tambah Promo Baru" di atas.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((promo) => {
                    const isActive = Boolean(promo.is_active ?? promo.enabled);
                    return (
                      <TableRow key={promo.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <TableCell>
                          {promo.image_url || promo.image_path ? (
                            <img
                              src={getStorageUrl(promo.image_url || promo.image_path) || promo.image_url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-[#F0E6D3]"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.png"; }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#FDF8F0] flex items-center justify-center text-[#B8943F] border border-[#F0E6D3]">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-xs font-bold text-[#4A3F35]">{promo.title}</p>
                          <p className="text-[10px] text-[#8A7B6B] line-clamp-1">{promo.headline || promo.description}</p>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF8F0] text-[#B8943F] border border-[#F5E6C8]">
                            {promo.target_tier || promo.category || "Bronze"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-emerald-700">{promo.discount_text || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(promo)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                              isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                            }`}
                            title="Klik untuk mengubah status aktif"
                          >
                            {isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            {isActive ? "Aktif" : "Non-aktif"}
                          </button>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => openEditForm(promo)} className="h-8 w-8 p-0 text-[#B8943F] hover:bg-[#FAF4E8] cursor-pointer">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(promo.id)} className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
