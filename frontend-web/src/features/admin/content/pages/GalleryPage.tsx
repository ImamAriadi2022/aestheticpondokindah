import GalleryEditor from "../components/GalleryEditor";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Plus, Edit2, Trash2, Image } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";

type Props = {
  searchParams: URLSearchParams;
  setSearchParams: any;
  apiGalleryItems: any[];
  token: string;
  fetchApiGallery: () => Promise<void>;
};

export default function GalleryPage({ searchParams, setSearchParams, apiGalleryItems, token, fetchApiGallery }: Props) {
  const contentView = searchParams.get("view") || "list";
  const editorId = searchParams.get("id");

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Galeri Klinik</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola foto suasana klinik, fasilitas dental, dan aktivitas perawatan.</p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white font-semibold rounded-xl"
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

      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiGalleryItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-xs text-[#8A7B6B]">
                  Belum ada foto di galeri.
                </TableCell>
              </TableRow>
            ) : (
              apiGalleryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.image_url ? (
                      <img src={getStorageUrl(item.image_url) || item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#F0E6D3]" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
                        <Image className="w-5 h-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-bold text-[#4A3F35]">{item.title}</p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] text-[#B8943F] border border-[#F0E6D3]">
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
