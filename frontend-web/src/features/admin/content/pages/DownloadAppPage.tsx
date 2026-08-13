import DownloadAppEditor from "../components/DownloadAppEditor";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Plus, Edit2, Trash2, Download } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE } from "@/core/api/apiConfig";

type Props = {
  searchParams: URLSearchParams;
  setSearchParams: any;
  apiDownloadApps: any[];
  token: string;
  fetchApiDownloadApps: () => Promise<void>;
};

export default function DownloadAppPage({ searchParams, setSearchParams, apiDownloadApps, token, fetchApiDownloadApps }: Props) {
  const contentView = searchParams.get("view") || "list";
  const editorId = searchParams.get("id");

  if (contentView === "editor") {
    const current = editorId ? apiDownloadApps.find((a) => String(a.id) === editorId) : undefined;
    return (
      <DownloadAppEditor
        current={current}
        editorId={editorId}
        token={token}
        fetchApiDownloadApps={fetchApiDownloadApps}
        setSearchParams={setSearchParams}
      />
    );
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus rilis aplikasi ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/download-apps/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: "Berhasil", message: "Rilis aplikasi dihapus", variant: "success" });
        await fetchApiDownloadApps();
      }
    } catch (e) {
      toast({ title: "Gagal", message: "Gagal menghapus rilis aplikasi", variant: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Download Aplikasi Mobile</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola rilis berkas APK Android & iOS aplikasi klinik untuk pengunjung.</p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] text-white font-semibold rounded-xl"
          onClick={() => {
            setSearchParams((prev: any) => {
              const next = new URLSearchParams(prev);
              next.set("tab", "content-download");
              next.set("view", "editor");
              next.delete("id");
              return next;
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Rilis Aplikasi
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead>Aplikasi</TableHead>
              <TableHead>Versi</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status Rilis</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiDownloadApps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-[#8A7B6B]">
                  Belum ada rilis aplikasi terdaftar.
                </TableCell>
              </TableRow>
            ) : (
              apiDownloadApps.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#4A3F35]">{item.title}</p>
                        <p className="text-[10px] text-[#8A7B6B] line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-[#4A3F35]">{item.version || "1.0.0"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] text-[#4A3F35] border border-[#F0E6D3] uppercase">
                      {item.platform || "Android"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${item.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {item.is_active ? "Aktif" : "Non-aktif"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setSearchParams((prev: any) => {
                          const next = new URLSearchParams(prev);
                          next.set("tab", "content-download");
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
