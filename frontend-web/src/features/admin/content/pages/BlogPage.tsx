import { useState } from "react";
import BlogEditorPanel from "../components/BlogEditorPanel";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Plus, Edit2, Trash2, FileText, Eye, Tag } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE } from "@/core/api/apiConfig";

type Props = {
  searchParams: URLSearchParams;
  setSearchParams: any;
  apiPosts: any[];
  token: string;
  sessionName: string;
  fetchApiPosts: () => Promise<void>;
};

export default function BlogPage({ searchParams, setSearchParams, apiPosts, token, sessionName, fetchApiPosts }: Props) {
  const contentView = searchParams.get("view") || "posts";
  const editorId = searchParams.get("id");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [search, setSearch] = useState("");

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

  const filtered = apiPosts
    .filter((p) => (filterStatus === "All" ? true : filterStatus === "Published" ? isPublishedPost(p.status) : !isPublishedPost(p.status)))
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Artikel Blog</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola artikel edukasi gigi dan estetika untuk pengunjung web.</p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white font-semibold rounded-xl"
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
          <p className="text-2xl font-bold text-[#4A3F35]">{publishedCount}</p>
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

      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead>Judul Artikel</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-xs text-[#8A7B6B]">
                  Tidak ada artikel ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="text-xs font-bold text-[#4A3F35]">{item.title}</p>
                    <p className="text-[10px] text-[#8A7B6B]">{item.slug}</p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] text-[#4A3F35] border border-[#F0E6D3]">
                      {item.category || "Informasi"}
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
                      className="h-8 w-8 p-0 text-[#B8943F]"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)} className="h-8 w-8 p-0 text-red-600">
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
