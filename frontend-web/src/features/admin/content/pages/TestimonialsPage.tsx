import { useState, useMemo, useEffect } from "react";
import TestimonialEditor from "../components/TestimonialEditor";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Plus, Edit2, Trash2, Quote, Star, Search, MessageSquareHeart } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";

type Props = {
  searchParams: URLSearchParams;
  setSearchParams: any;
  apiTestimonials: any[];
  token: string;
  fetchApiTestimonials: () => Promise<void>;
};

export default function TestimonialsPage({ searchParams, setSearchParams, apiTestimonials = [], token, fetchApiTestimonials }: Props) {
  const contentView = searchParams.get("view") || "list";
  const editorId = searchParams.get("id");
  const [search, setSearch] = useState("");
  const [filterRating, setFilterRating] = useState<number | "All">("All");

  useEffect(() => {
    fetchApiTestimonials();
  }, []);

  if (contentView === "editor") {
    const current = editorId ? apiTestimonials.find((t) => String(t.id) === editorId) : undefined;
    return (
      <TestimonialEditor
        current={current}
        editorId={editorId}
        token={token}
        fetchApiTestimonials={fetchApiTestimonials}
        setSearchParams={setSearchParams}
      />
    );
  }

  const filtered = useMemo(() => {
    return apiTestimonials
      .filter((t) => (filterRating === "All" ? true : Number(t.rating) === filterRating))
      .filter((t) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          (t.name || "").toLowerCase().includes(q) ||
          (t.quote || "").toLowerCase().includes(q) ||
          (t.source || "").toLowerCase().includes(q)
        );
      });
  }, [apiTestimonials, filterRating, search]);

  const avgRating = useMemo(() => {
    if (apiTestimonials.length === 0) return "5.0";
    const sum = apiTestimonials.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0);
    return (sum / apiTestimonials.length).toFixed(1);
  }, [apiTestimonials]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus testimoni ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/testimonials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: "Berhasil", message: "Testimoni dihapus", variant: "success" });
        await fetchApiTestimonials();
      }
    } catch (e) {
      toast({ title: "Gagal", message: "Gagal menghapus testimoni", variant: "error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Testimoni & Ulasan Pasien</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola ulasan kepuasan pasien, rating bintang, dan cerita pengalaman perawatan.</p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-md shadow-[#C9A24A]/20 cursor-pointer"
          onClick={() => {
            setSearchParams((prev: any) => {
              const next = new URLSearchParams(prev);
              next.set("tab", "content-testimonials");
              next.set("view", "editor");
              next.delete("id");
              return next;
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Testimoni Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Total Testimoni</p>
          </div>
          <p className="text-2xl font-bold text-[#4A3F35]">{apiTestimonials.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Rata-Rata Kepuasan</p>
          </div>
          <p className="text-2xl font-bold text-[#4A3F35]">⭐ {avgRating} / 5.0</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {(["All", 5, 4, 3] as const).map((r) => (
            <button
              key={String(r)}
              type="button"
              onClick={() => setFilterRating(r as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterRating === r
                  ? "bg-[#C9A24A] text-white shadow-xs"
                  : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]/60"
              }`}
            >
              {r === "All" ? "Semua Rating" : `⭐ ${r} Bintang`}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A89F91]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama pasien / ulasan..."
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
              <TableHead>Nama Pasien</TableHead>
              <TableHead>Kutipan Testimoni</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-[#8A7B6B]">
                  Belum ada testimoni ditemukan. Klik "Tambah Testimoni Baru" di atas.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <TableCell>
                    {item.photo_url || item.photo_path ? (
                      <img
                        src={getStorageUrl(item.photo_url || item.photo_path) || item.photo_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-[#F0E6D3]"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/dashboard/placeholder.webp"; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#FDF8F0] flex items-center justify-center text-[#B8943F] font-bold text-xs border border-[#F0E6D3]">
                        {item.name ? item.name.slice(0, 2).toUpperCase() : <Quote className="w-4 h-4" />}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-bold text-[#4A3F35]">{item.name}</p>
                    {item.source && <p className="text-[10px] text-[#8A7B6B]">{item.source}</p>}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-[#4A3F35] line-clamp-2 leading-relaxed italic">"{item.quote}"</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: item.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSearchParams((prev: any) => {
                          const next = new URLSearchParams(prev);
                          next.set("tab", "content-testimonials");
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
