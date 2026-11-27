import { useState, useMemo, useEffect } from "react";
import TestimonialEditor from "../components/TestimonialEditor";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Plus, Edit2, Trash2, Star, Filter } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";

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

  const currentTestimonial = useMemo(() => {
    return editorId ? apiTestimonials.find((t) => String(t.id) === editorId) : undefined;
  }, [editorId, apiTestimonials]);

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

  // Safe conditional render AFTER all hooks execute!
  if (contentView === "editor") {
    return (
      <TestimonialEditor
        current={currentTestimonial}
        editorId={editorId}
        token={token}
        fetchApiTestimonials={fetchApiTestimonials}
        setSearchParams={setSearchParams}
      />
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <PageHeader
        title="Testimoni & Ulasan Pasien"
        actions={
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari nama pasien / ulasan..."
            />
            <FilterDropdown
              value={String(filterRating)}
              onChange={(v) => setFilterRating(v === "All" ? "All" : Number(v))}
              icon={Filter}
              labelPrefix="Rating"
              options={[
                { value: "All", label: "Semua Rating" },
                { value: "5", label: "★ 5 Bintang" },
                { value: "4", label: "★ 4 Bintang" },
                { value: "3", label: "★ 3 Bintang" },
              ]}
            />
            <Button
              className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-xs h-9 text-xs cursor-pointer justify-center"
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
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Testimoni
            </Button>
          </>
        }
      />

      {/* Table with horizontal scroll */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-x-auto shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>Nama Pasien</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Kutipan Ulasan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-[#8A7B6B]">
                  Tidak ada testimoni ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <TableCell>
                    {item.photo_url ? (
                      <img
                        src={getStorageUrl(item.photo_url) || item.photo_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-[#F0E6D3]"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.webp"; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#FAF5EA] flex items-center justify-center font-bold text-[#8C6B1C] text-xs border border-[#F0E6D3]">
                        {(item.name || "P").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-bold text-[#4A3F35]">{item.name}</p>
                    <p className="text-[10px] text-[#8A7B6B]">{item.treatment || item.source || "Pasien Klinik"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5 text-[#B8943F]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < (Number(item.rating) || 5) ? "fill-[#B8943F] text-[#B8943F]" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-[#5C5546] line-clamp-2 max-w-md italic">"{item.quote || item.content || item.comment}"</p>
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
