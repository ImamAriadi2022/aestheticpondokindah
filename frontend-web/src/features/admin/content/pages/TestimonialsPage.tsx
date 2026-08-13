import TestimonialEditor from "../components/TestimonialEditor";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Plus, Edit2, Trash2, Quote } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";

type Props = {
  searchParams: URLSearchParams;
  setSearchParams: any;
  apiTestimonials: any[];
  token: string;
  fetchApiTestimonials: () => Promise<void>;
};

export default function TestimonialsPage({ searchParams, setSearchParams, apiTestimonials, token, fetchApiTestimonials }: Props) {
  const contentView = searchParams.get("view") || "list";
  const editorId = searchParams.get("id");

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Testimoni Pasien</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola ulasan dan kutipan testimoni kepuasan pasien klinik.</p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white font-semibold rounded-xl"
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
            {apiTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-[#8A7B6B]">
                  Belum ada testimoni terdaftar.
                </TableCell>
              </TableRow>
            ) : (
              apiTestimonials.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.photo_url ? (
                      <img src={getStorageUrl(item.photo_url) || item.photo_url} alt="" className="w-10 h-10 rounded-full object-cover border border-[#F0E6D3]" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
                        <Quote className="w-4 h-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-bold text-[#4A3F35]">{item.name}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-[#4A3F35] line-clamp-2">"{item.quote}"</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-[#B8943F]">⭐ {item.rating || 5}/5</span>
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
