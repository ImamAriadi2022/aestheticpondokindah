import { useState, useMemo } from "react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Search,
  ExternalLink,
  Loader2,
  Eye,
} from "lucide-react";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";

type Props = {
  token: string;
  apiPopups: any[];
  fetchApiPopups: () => Promise<void>;
};

export default function PopupPage({ token, apiPopups = [], fetchApiPopups }: Props) {
  const [selectedPopup, setSelectedPopup] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Aktif" | "Non-Aktif">("Semua");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "PROMO SPESIAL",
    headline: "",
    message: "",
    buttonLabel: "Klaim Sekarang",
    buttonUrl: "",
    enabled: true,
    imageFile: null as File | null,
    previewUrl: "",
  });

  const openCreateModal = () => {
    setSelectedPopup(null);
    setIsCreating(true);
    setFormData({
      title: "PROMO SPESIAL",
      headline: "",
      message: "",
      buttonLabel: "Klaim Promo",
      buttonUrl: "",
      enabled: true,
      imageFile: null,
      previewUrl: "",
    });
  };

  const openEditModal = (p: any) => {
    setSelectedPopup(p);
    setIsCreating(false);
    setFormData({
      title: p.title || "PROMO SPESIAL",
      headline: p.headline || "",
      message: p.message || "",
      buttonLabel: p.button_label || "Klaim Promo",
      buttonUrl: p.button_url || "",
      enabled: !!p.enabled,
      imageFile: null,
      previewUrl: p.image_url ? (getStorageUrl(p.image_url) || p.image_url) : "",
    });
  };

  const closeModal = () => {
    setSelectedPopup(null);
    setIsCreating(false);
  };

  const handleToggleStatus = async (p: any) => {
    const newStatus = !p.enabled;
    try {
      const form = new FormData();
      form.append("enabled", newStatus ? "1" : "0");
      form.append("_method", "PUT");

      const res = await fetch(`${API_BASE}/admin/popups/${p.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (res.ok) {
        toast({
          title: "Status Diperbarui",
          message: `Pop up "${p.headline || p.title}" berhasil di-${newStatus ? "aktifkan" : "non-aktifkan"}.`,
          variant: "success",
        });
        await fetchApiPopups();
      } else {
        toast({ title: "Gagal Mengubah Status", message: "Tidak dapat mengubah status di database.", variant: "error" });
      }
    } catch {
      toast({ title: "Koneksi Terputus", message: "Gagal terhubung ke server.", variant: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pop up promo ini?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/admin/popups/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({
          title: "Pop Up Dihapus",
          message: "Pop up promo berhasil dihapus.",
          variant: "success",
        });
        await fetchApiPopups();
      } else {
        toast({ title: "Gagal Menghapus", message: "Tidak dapat menghapus data dari database.", variant: "error" });
      }
    } catch {
      toast({ title: "Koneksi Terputus", message: "Gagal terhubung ke server.", variant: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title || "PROMO SPESIAL");
      payload.append("headline", formData.headline || "");
      payload.append("message", formData.message || "");
      payload.append("button_label", formData.buttonLabel || "Klaim Promo");
      payload.append("button_url", formData.buttonUrl || "");
      payload.append("enabled", formData.enabled ? "1" : "0");
      if (formData.imageFile) {
        payload.append("image", formData.imageFile);
      }

      const url = selectedPopup
        ? `${API_BASE}/admin/popups/${selectedPopup.id}`
        : `${API_BASE}/admin/popups`;

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan data ke database");
      }

      toast({
        title: "Tersimpan",
        message: `Pop up promo berhasil ${selectedPopup ? "diperbarui" : "ditambahkan"}.`,
        variant: "success",
      });
      closeModal();
      await fetchApiPopups();
    } catch (err: any) {
      toast({
        title: "Gagal Menyimpan",
        message: err?.message || "Terjadi kesalahan saat menyimpan.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const counts = useMemo(() => {
    return {
      total: apiPopups.length,
      active: apiPopups.filter((p) => !!p.enabled).length,
      inactive: apiPopups.filter((p) => !p.enabled).length,
    };
  }, [apiPopups]);

  const filteredPopups = useMemo(() => {
    return apiPopups.filter((p) => {
      if (statusFilter === "Aktif" && !p.enabled) return false;
      if (statusFilter === "Non-Aktif" && p.enabled) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (p.title || "").toLowerCase();
        const headline = (p.headline || "").toLowerCase();
        const message = (p.message || "").toLowerCase();
        return title.includes(q) || headline.includes(q) || message.includes(q);
      }
      return true;
    });
  }, [apiPopups, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2C2416]">Manajemen Pop Up Promo</h2>
          <p className="text-xs text-[#8C8272] mt-0.5">
            Kelola beberapa pop-up banner promo sekaligus. Pop up yang aktif akan tampil bergantian di halaman utama.
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white font-bold rounded-xl shadow-2xs h-9 px-4 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Pop Up Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#8C8272]">Total Pop Up</span>
            <p className="text-2xl font-black text-[#2C2416] mt-0.5">{counts.total}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C]">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700">Pop Up Aktif</span>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{counts.active}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-700">Pop Up Non-Aktif</span>
            <p className="text-2xl font-black text-rose-600 mt-0.5">{counts.inactive}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <X className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E8DFC8]">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(["Semua", "Aktif", "Non-Aktif"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === tab
                  ? "bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] text-white shadow-2xs"
                  : "text-[#6B5E4F] hover:bg-[#FAF5EA] hover:text-[#8C6B1C]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pop up promo..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8DFC8] focus:border-[#C9A24A] focus:bg-white rounded-xl outline-hidden text-[#2C2416] transition-all"
          />
        </div>
      </div>

      {/* Pop Up Grid */}
      {filteredPopups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPopups.map((p) => {
            const img = getStorageUrl(p.image_url) || p.image_url;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs overflow-hidden flex flex-col justify-between hover:border-[#C9A24A] transition-all"
              >
                {/* Image Banner & Badge */}
                <div className="relative bg-[#FAF8F5] h-44 flex items-center justify-center overflow-hidden border-b border-[#E8DFC8]">
                  {img ? (
                    <img src={img} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[#8C8272] space-y-1">
                      <ImageIcon className="w-8 h-8 text-[#C9A24A]/50" />
                      <span className="text-[11px]">Tidak Ada Gambar</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${
                        p.enabled
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {p.enabled ? "🟢 AKTIF" : "🔴 NON-AKTIF"}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-2 flex-1">
                  <span className="text-[10px] font-bold text-[#8C6B1C] uppercase tracking-wider block">
                    {p.title || "PROMO SPESIAL"}
                  </span>
                  <h4 className="text-sm font-bold text-[#2C2416] line-clamp-2">
                    {p.headline || "Tanpa Judul Headline"}
                  </h4>
                  <p className="text-xs text-[#6B5E4F] line-clamp-3 leading-relaxed">
                    {p.message || "Tidak ada deskripsi rincian."}
                  </p>
                </div>

                {/* Footer Controls */}
                <div className="p-3 bg-[#FAF8F5] border-t border-[#E8DFC8] flex items-center justify-between gap-2">
                  {/* Status Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(p)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      p.enabled
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                        : "bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${p.enabled ? "bg-emerald-500" : "bg-rose-500"}`} />
                    {p.enabled ? "Aktif" : "Non-Aktif"}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setPreviewItem(p)}
                      className="text-[#8C8272] hover:text-[#2C2416] hover:bg-white rounded-lg cursor-pointer"
                      title="Lihat Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(p)}
                      className="h-7 text-xs font-semibold text-[#8C6B1C] border-[#E8DFC8] bg-white hover:bg-[#FAF8F5] rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Hapus"
                    >
                      {deletingId === p.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DFC8] p-12 text-center shadow-2xs space-y-3">
          <Layers className="w-10 h-10 text-[#C9A24A]/60 mx-auto" />
          <h3 className="text-sm font-bold text-[#2C2416]">Belum Ada Pop Up Promo</h3>
          <p className="text-xs text-[#8C8272] max-w-sm mx-auto">
            Klik tombol "Tambah Pop Up Baru" untuk membuat banner promo yang akan muncul saat pengunjung membuka website.
          </p>
          <Button
            onClick={openCreateModal}
            className="mt-2 bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] text-white font-bold rounded-xl text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" />
            Tambah Pop Up Pertama
          </Button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(isCreating || selectedPopup) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl border border-[#E8DFC8] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-[#FAF8F5] via-[#FAF5EA] to-[#F5EFE6] border-b border-[#E8DFC8] flex items-center justify-between gap-3 shrink-0">
              <h3 className="text-sm font-bold text-[#2C2416]">
                {selectedPopup ? "Edit Pop Up Promo" : "Tambah Pop Up Promo Baru"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-xl text-[#8C8272] hover:text-[#2C2416] hover:bg-[#FAF5EA] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Status Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8]">
                <div>
                  <span className="font-bold text-[#2C2416] block">Status Pop Up</span>
                  <span className="text-[11px] text-[#8C8272]">
                    {formData.enabled ? "🟢 Aktif (Akan tampil di halaman utama)" : "🔴 Non-Aktif (Disembunyikan)"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formData.enabled ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Sub-heading / Category */}
              <div>
                <label className="font-bold text-[#2C2416] block mb-1">Judul Kecil (Sub-heading / Kategori)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: PROMO SPESIAL, WELCOME OFFER, EVENT KLINIK"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl focus:border-[#C9A24A] focus:bg-white outline-hidden text-[#2C2416]"
                />
              </div>

              {/* Headline */}
              <div>
                <label className="font-bold text-[#2C2416] block mb-1">Headline Utama (Judul Promo) *</label>
                <input
                  type="text"
                  required
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Contoh: Diskon 20% Veneer & Bleaching Gigi Spesial Hari Kemerdekaan"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl focus:border-[#C9A24A] focus:bg-white outline-hidden text-[#2C2416]"
                />
              </div>

              {/* Message / Description */}
              <div>
                <label className="font-bold text-[#2C2416] block mb-1">Deskripsi / Pesan Promo *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tuliskan rincian promo, syarat dan ketentuan singkat, atau manfaat yang didapat pasien..."
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl focus:border-[#C9A24A] focus:bg-white outline-hidden text-[#2C2416]"
                />
              </div>

              {/* Button Label & URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#2C2416] block mb-1">Teks Tombol Aksi</label>
                  <input
                    type="text"
                    value={formData.buttonLabel}
                    onChange={(e) => setFormData({ ...formData, buttonLabel: e.target.value })}
                    placeholder="Contoh: Klaim Promo, Ambil Diskon"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl focus:border-[#C9A24A] focus:bg-white outline-hidden text-[#2C2416]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#2C2416] block mb-1">Link / URL Tombol (Opsional)</label>
                  <input
                    type="text"
                    value={formData.buttonUrl}
                    onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
                    placeholder="Kosongkan jika default ke WhatsApp Klinik"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl focus:border-[#C9A24A] focus:bg-white outline-hidden text-[#2C2416]"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="font-bold text-[#2C2416] block mb-1">Gambar Banner Pop Up</label>
                <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8]">
                  {formData.previewUrl ? (
                    <img src={formData.previewUrl} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-[#E8DFC8]" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-white border border-[#E8DFC8] flex items-center justify-center text-[#8C8272]">
                      <ImageIcon className="w-6 h-6 text-[#C9A24A]/60" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="popup-img-input"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({
                            ...formData,
                            imageFile: file,
                            previewUrl: URL.createObjectURL(file),
                          });
                        }
                      }}
                      className="hidden"
                    />
                    <label
                      htmlFor="popup-img-input"
                      className="inline-flex items-center px-3 py-1.5 rounded-xl border border-[#EADBBD] bg-white text-[#8C6B1C] font-semibold text-xs hover:bg-[#FAF5EA] transition-colors cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Pilih / Ganti Gambar
                    </label>
                    <p className="text-[10px] text-[#8C8272] mt-1">Format: JPG, PNG, WEBP. Maksimal 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-[#E8DFC8] flex items-center justify-end gap-2 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="text-gray-600 rounded-xl cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white font-bold rounded-xl text-xs px-5 shadow-md cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  {selectedPopup ? "Simpan Perubahan" : "Tambah Pop Up"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-[#E8DFC8] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 bg-[#FAF8F5] border-b border-[#E8DFC8] flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C2416]">Preview Tampilan Pengunjung</span>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-xl text-[#8C8272] hover:text-[#2C2416] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {previewItem.image_url && (
                <img
                  src={getStorageUrl(previewItem.image_url) || previewItem.image_url}
                  alt="preview"
                  className="w-full h-48 object-cover rounded-2xl border border-[#E8DFC8]"
                />
              )}
              <span className="text-[10px] font-bold text-[#8C6B1C] uppercase tracking-wider block">
                {previewItem.title || "PROMO SPESIAL"}
              </span>
              <h3 className="text-lg font-bold text-[#2C2416]">{previewItem.headline}</h3>
              <p className="text-xs text-[#6B5E4F] leading-relaxed whitespace-pre-wrap">{previewItem.message}</p>
              <div className="pt-2">
                <Button className="w-full bg-[#C9A24A] text-white rounded-xl text-xs font-bold pointer-events-none">
                  {previewItem.button_label || "Klaim Promo"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
