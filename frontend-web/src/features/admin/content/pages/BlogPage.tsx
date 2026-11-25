import { useState, useMemo, useEffect } from "react";
import BlogEditorPanel from "../components/BlogEditorPanel";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Plus, Edit2, Trash2, Eye, Filter, Image as ImageIcon } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { usePageRefresh } from "@/core/events/refreshEvents";

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

  usePageRefresh(fetchApiPosts);

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

  const publishedCount = useMemo(() => apiPosts.filter((p) => isPublishedPost(p.status)).length, [apiPosts]);
  const draftCount = useMemo(() => apiPosts.filter((p) => !isPublishedPost(p.status)).length, [apiPosts]);
  const categoriesUsed = useMemo(() => new Set(apiPosts.map((p) => p.category).filter(Boolean)).size, [apiPosts]);

  const currentPost = useMemo(() => {
    return editorId ? apiPosts.find((p) => String(p.id) === editorId) : undefined;
  }, [editorId, apiPosts]);

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

  // Safe Conditional Render AFTER all Hooks have executed!
  if (contentView === "editor") {
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

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <PageHeader
        title="Daftar Artikel Blog"
        actions={
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari artikel..."
            />
            <FilterDropdown
              value={filterStatus}
              onChange={(v) => setFilterStatus(v as any)}
              icon={Filter}
              labelPrefix="Status"
              options={[
                { value: "All", label: `Semua Status (${apiPosts.length})` },
                { value: "Published", label: `Dipublikasikan (${publishedCount})` },
                { value: "Draft", label: `Draf (${draftCount})` },
              ]}
            />
            {categories.length > 2 && (
              <FilterDropdown
                value={filterCategory}
                onChange={setFilterCategory}
                labelPrefix="Kategori"
                options={categories.map((c) => ({
                  value: c,
                  label: c === "Semua" ? "Semua Kategori" : c,
                }))}
              />
            )}
            <Button
              className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-xs h-9 text-xs cursor-pointer justify-center"
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
              <Plus className="w-4 h-4 mr-1.5" />
              Artikel Baru
            </Button>
          </>
        }
      />

      {/* Table with horizontal scroll */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-x-auto shadow-xs">
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
                    <span className="text-xs font-medium text-[#4A3F35]">
                      {item.category || "Edukasi Gigi"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isPublishedPost(item.status)
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isPublishedPost(item.status) ? "bg-emerald-500" : "bg-amber-500"}`} />
                      {isPublishedPost(item.status) ? "Dipublikasikan" : "Draf"}
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
