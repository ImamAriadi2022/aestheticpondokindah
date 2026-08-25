import { useState, useMemo, useEffect } from "react";
import BlogEditorPanel from "../components/BlogEditorPanel";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Plus, Edit2, Trash2, FileText, Eye, Tag, Search, Image as ImageIcon } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";

type Props = {
  searchParams: URLSearchParams;
  setSearchParams: any;
  apiPosts: any[];
  token: string;
  sessionName: string;
  fetchApiPosts: () => Promise<void>;
};

export default function BlogPage({ searchParams, setSearchParams, apiPosts = [], token, sessionName, fetchApiPosts }: Props) {
  const contentView = searchParams.get("view") || "posts";
  const editorId = searchParams.get("id");
  const [filterStatus, setFilterStatus] = useState<"All" | "Published" | "Draft">("All");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchApiPosts();
  }, []);

  if (contentView === "editor") {
    const currentPost = editorId ? apiPosts.find((p) => String(p.id) === editorId) : undefined;
    return (
      <BlogEditorPanel
        editorId={editorId}
        apiPost={currentPost}
        sessionName={sessionName}
        token={token}
        onBack={() =>
          setSearchParams((prev: any) => {
            const next = new URLSearchParams(prev);
            next.set("tab", "content-blog");
            next.set("view", "posts");
            next.delete("id");
            return next;
          })
        }
        onSaved={() => {
          fetchApiPosts();
          setSearchParams((prev: any) => {
            const next = new URLSearchParams(prev);
            next.set("tab", "content-blog");
            next.set("view", "posts");
            next.delete("id");
            return next;
          });
        }}
      />
    );
  }

  const isPublishedPost = (status?: string) => (!status ? true : status.toLowerCase() === "published");

  const categories = useMemo(() => {
    const set = new Set<string>();
    apiPosts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["Semua", ...Array.from(set)];
  }, [apiPosts]);

  const filtered = useMemo(() => {
    return apiPosts
      .filter((p) => {
        if (filterStatus === "Published") return isPublishedPost(p.status);
        if (filterStatus === "Draft") return !isPublishedPost(p.status);
        return true;
      })
      .filter((p) => (filterCategory === "Semua" ? true : p.category === filterCategory))
      .filter((p) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          (p.title || "").toLowerCase().includes(q) ||
          (p.slug || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q)
        );
      });
  }, [apiPosts, filterStatus, filterCategory, search]);

  const publishedCount = apiPosts.filter((p) => isPublishedPost(p.status)).length;
  const draftCount = apiPosts.filter((p) => !isPublishedPost(p.status)).length;
  const categoriesUsed = new Set(apiPosts.map((p) => p.category).filter(Boolean)).size;

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: "Berhasil", message: "Artikel berhasil dihapus", variant: "success" });
        await fetchApiPosts();
      }
    } catch (e) {
      toast({ title: "Gagal", message: "Gagal menghapus artikel", variant: "error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Artikel Blog</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola publikasi edukasi kesehatan gigi dan konten informasi klinik.</p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-md shadow-[#C9A24A]/20 cursor-pointer"
          onClick={() => {
            setSearchParams((prev: any) => {
              const next = new URLSearchParams(prev);
              next.set("tab", "content-blog");
              next.set("view", "editor");
              next.delete("id");
              return next;
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Artikel Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Total Artikel</p>
          </div>
          <p className="text-2xl font-bold text-[#4A3F35]">{apiPosts.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Eye className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Dipublikasikan</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-[#4A3F35]">{publishedCount}</p>
            {draftCount > 0 && <span className="text-xs text-[#8A7B6B]">({draftCount} draft)</span>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
              <Tag className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Kategori Aktif</p>
          </div>
          <p className="text-2xl font-bold text-[#4A3F35]">{categoriesUsed}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {(["All", "Published", "Draft"] as const).map((st) => (
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
              {st === "All" ? "Semua Status" : st === "Published" ? "Dipublikasikan" : "Draft"}
            </button>
          ))}
          {categories.length > 2 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-8 rounded-xl border border-[#E8DFC8] bg-[#FAF8F5] px-2.5 text-xs text-[#4A3F35] font-semibold"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A89F91]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari artikel..."
            className="w-full h-8.5 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl pl-8.5 pr-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead className="w-14">Cover</TableHead>
              <TableHead>Judul Artikel</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-[#8A7B6B]">
                  Tidak ada artikel ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <TableCell>
                    {item.cover_image_url || item.cover_image_path ? (
                      <img
                        src={getStorageUrl(item.cover_image_url || item.cover_image_path) || item.cover_image_url}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover border border-[#F0E6D3]"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.webp"; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#FDF8F0] flex items-center justify-center text-[#B8943F] border border-[#F0E6D3]">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-bold text-[#4A3F35] leading-snug">{item.title}</p>
                    <p className="text-[10px] text-[#8A7B6B] mt-0.5">{item.slug}</p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] text-[#4A3F35] border border-[#F0E6D3]">
                      {item.category || "Edukasi Gigi"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${isPublishedPost(item.status) ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"}`}>
                      {isPublishedPost(item.status) ? "Dipublikasikan" : "Draft"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSearchParams((prev: any) => {
                          const next = new URLSearchParams(prev);
                          next.set("tab", "content-blog");
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
