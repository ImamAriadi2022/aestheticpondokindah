import { useState, useMemo, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Plus, Edit2, Trash2, Image as ImageIcon, Search, Tag, Camera, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";
import GalleryEditorModal from "../components/GalleryEditorModal";

type Props = {
  searchParams?: URLSearchParams;
  setSearchParams?: any;
  apiGalleryItems?: any[];
  token: string;
  fetchApiGallery: () => Promise<void>;
};

export default function GalleryPage({
  apiGalleryItems = [],
  token,
  fetchApiGallery,
}: Props) {
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);

  useEffect(() => {
    fetchApiGallery();
  }, []);

  const openCreateModal = () => {
    setSelectedGalleryItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setSelectedGalleryItem(item);
    setIsModalOpen(true);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    apiGalleryItems.forEach((g) => {
      if (g.category) set.add(g.category);
    });
    return ["Semua", ...Array.from(set)];
  }, [apiGalleryItems]);

  const filtered = useMemo(() => {
    return apiGalleryItems
      .filter((g) => (activeCategory === "Semua" ? true : g.category === activeCategory))
      .filter((g) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          (g.title || "").toLowerCase().includes(q) ||
          (g.description || "").toLowerCase().includes(q) ||
          (g.category || "").toLowerCase().includes(q)
        );
      });
  }, [apiGalleryItems, activeCategory, search]);

  const handleDelete = async (id: string | number, skipConfirmation = false) => {
    if (!skipConfirmation && !confirm("Apakah Anda yakin ingin menghapus foto galeri ini?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/admin/gallery-items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.ok) {
        toast({
          title: "Berhasil Dihapus",
          message: "Foto galeri berhasil dihapus dari sistem.",
          variant: "success",
        });
        await fetchApiGallery();
      } else {
        // Fallback to alias /gallery/${id}
        const fallbackRes = await fetch(`${API_BASE}/admin/gallery/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (fallbackRes.ok) {
          toast({
            title: "Berhasil Dihapus",
            message: "Foto galeri berhasil dihapus dari sistem.",
            variant: "success",
          });
          await fetchApiGallery();
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Gagal menghapus foto galeri");
        }
      }
    } catch (e: any) {
      console.error("[GalleryPage] Delete error:", e);
      toast({
        title: "Gagal Menghapus",
        message: e.message || "Terjadi kesalahan saat menghapus foto galeri.",
        variant: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelection = (id: string | number) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map((item) => item.id));
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`Hapus ${selectedIds.length} foto galeri yang dipilih?`)) return;

    await Promise.all(selectedIds.map((id) => handleDelete(id, true)));
    setSelectedIds([]);
    await fetchApiGallery();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Galeri Klinik & Fasilitas</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">
            Kelola dokumentasi visual ruangan, fasilitas medis canggih, dan suasana klinik.
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-md shadow-[#C9A24A]/20 cursor-pointer"
          onClick={openCreateModal}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Foto Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
              <Camera className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Total Foto</p>
          </div>
          <p className="text-2xl font-bold text-[#4A3F35]">{apiGalleryItems.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Tag className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Kategori Galeri</p>
          </div>
          <p className="text-2xl font-bold text-[#4A3F35]">{categories.length - 1}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Kategori Aktif</p>
          </div>
          <p className="text-sm font-bold text-[#4A3F35] mt-1">{activeCategory}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === c
                  ? "bg-[#C9A24A] text-white shadow-xs"
                  : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]/60"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89F91] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari foto galeri..."
            className="w-full h-9 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl pl-10 pr-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A] focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#F0E6D3] bg-rose-50/70">
            <span className="text-xs font-semibold text-rose-700">{selectedIds.length} foto dipilih</span>
            <Button size="sm" onClick={handleBulkDelete} className="h-8 px-3 text-xs bg-rose-600 hover:bg-rose-700 text-white">
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus Terpilih
            </Button>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead className="w-10 px-3">
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  onChange={toggleSelectAll}
                  aria-label="Pilih semua foto galeri"
                  className="h-4 w-4 accent-[#C9A24A] cursor-pointer"
                />
              </TableHead>
              <TableHead className="w-16 font-bold text-[#4A3F35]">Foto</TableHead>
              <TableHead className="font-bold text-[#4A3F35]">Judul</TableHead>
              <TableHead className="font-bold text-[#4A3F35]">Kategori</TableHead>
              <TableHead className="font-bold text-[#4A3F35]">Deskripsi</TableHead>
              <TableHead className="text-right font-bold text-[#4A3F35]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-xs text-[#8A7B6B]">
                  Tidak ada foto galeri ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <TableCell className="px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelection(item.id)}
                      aria-label={`Pilih ${item.title || "foto galeri"}`}
                      className="h-4 w-4 accent-[#C9A24A] cursor-pointer"
                    />
                  </TableCell>
                  <TableCell>
                    {item.image_url || item.image_path ? (
                      <img
                        src={getStorageUrl(item.image_url || item.image_path) || item.image_url}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-[#F0E6D3] shadow-2xs"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.webp";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F] border border-[#F0E6D3]">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-bold text-[#4A3F35]">{item.title}</p>
                    {item.sort_order > 0 && (
                      <span className="text-[10px] text-[#8C8272]">Urutan: #{item.sort_order}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] text-[#4A3F35] border border-[#F0E6D3]">
                      {item.category || "Fasilitas"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-[#8A7B6B] line-clamp-1 max-w-md">{item.description || "-"}</p>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Edit Foto Galeri"
                      onClick={() => openEditModal(item)}
                      className="h-8 w-8 p-0 text-[#B8943F] hover:bg-[#FAF4E8] cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title="Hapus Foto Galeri"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Interactive Gallery Editor Modal */}
      <GalleryEditorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        galleryItem={selectedGalleryItem}
        token={token}
        onSaved={fetchApiGallery}
      />
    </div>
  );
}
