import { useState, useMemo, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Plus, Edit2, Trash2, Image as ImageIcon, CheckCircle2, Eye, EyeOff, Filter } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";
import GalleryEditorModal from "../components/GalleryEditorModal";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";

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
    <div className="space-y-5 animate-in fade-in duration-150 text-left">
      <PageHeader
        title="Galeri Klinik & Fasilitas"
        actions={
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari foto galeri..."
            />
            <FilterDropdown
              value={activeCategory}
              onChange={setActiveCategory}
              icon={Filter}
              labelPrefix="Kategori"
              options={categories.map((c) => ({
                value: c,
                label: c === "Semua" ? "Semua Kategori" : c,
              }))}
            />
            <Button
              className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-xs h-9 text-xs cursor-pointer justify-center"
              onClick={openCreateModal}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Foto
            </Button>
          </>
        }
      />

      {/* Table with horizontal scroll */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-x-auto shadow-xs">
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
