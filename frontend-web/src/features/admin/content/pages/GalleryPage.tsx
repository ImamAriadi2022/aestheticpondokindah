import { useState, useMemo, useEffect } from "react";
import GalleryEditor from "../components/GalleryEditor";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Plus, Edit2, Trash2, Image as ImageIcon, Search, Tag, Camera } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";

type Props = {
  searchParams: URLSearchParams;
  setSearchParams: any;
  apiGalleryItems: any[];
  token: string;
  fetchApiGallery: () => Promise<void>;
};

export default function GalleryPage({ searchParams, setSearchParams, apiGalleryItems = [], token, fetchApiGallery }: Props) {
  const contentView = searchParams.get("view") || "list";
  const editorId = searchParams.get("id");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  useEffect(() => {
    fetchApiGallery();
  }, []);

  if (contentView === "editor") {
    const current = editorId ? apiGalleryItems.find((g) => String(g.id) === editorId) : undefined;
    return (
      <GalleryEditor
        current={current}
        editorId={editorId}
        token={token}
        fetchApiGallery={fetchApiGallery}
        setSearchParams={setSearchParams}
      />
    );
  }

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

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto galeri ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/gallery-items/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: "Berhasil", message: "Foto galeri dihapus", variant: "success" });
        await fetchApiGallery();
      }
    } catch (e) {
      toast({ title: "Gagal", message: "Gagal menghapus foto galeri", variant: "error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Galeri Fasilitas & Suasana Klinik</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola portofolio foto suasana klinik, peralatan dental modern, dan aktivitas perawatan.</p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-md shadow-[#C9A24A]/20 cursor-pointer"
          onClick={() => {
            setSearchParams((prev: any) => {
              const next = new URLSearchParams(prev);
              next.set("tab", "content-gallery");
              next.set("view", "editor");
              next.delete("id");
              return next;
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Foto Galeri
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
              <Camera className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Total Koleksi Foto</p>
          </div>
          <p className="text-2xl font-bold text-[#4A3F35]">{apiGalleryItems.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
              <Tag className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Kategori Galeri</p>
          </div>
          <p className="text-2xl font-bold text-[#4A3F35]">{Math.max(0, categories.length - 1)}</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#C9A24A] text-white shadow-xs"
                  : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A89F91]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari foto galeri..."
            className="w-full h-8.5 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl pl-8.5 pr-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>Judul & Deskripsi</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-xs text-[#8A7B6B]">
                  Belum ada foto di galeri. Klik "Tambah Foto Galeri" di atas.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <TableCell>
                    {item.image_url || item.image_path ? (
                      <img
                        src={getStorageUrl(item.image_url || item.image_path) || item.image_url}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-[#F0E6D3]"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.png"; }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F] border border-[#F0E6D3]">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-bold text-[#4A3F35]">{item.title}</p>
                    {item.description && <p className="text-[10px] text-[#8A7B6B] line-clamp-1 mt-0.5">{item.description}</p>}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDF8F0] text-[#B8943F] border border-[#F5E6C8]">
                      {item.category || "Fasilitas"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSearchParams((prev: any) => {
                          const next = new URLSearchParams(prev);
                          next.set("tab", "content-gallery");
                          next.set("view", "editor");
                          next.set("id", String(item.id));
                          return next;
                        });
                      }}
                      className="h-8 w-8 p-0 text-[#B8943F] hover:bg-[#FAF4E8] cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
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
    </div>
  );
}
