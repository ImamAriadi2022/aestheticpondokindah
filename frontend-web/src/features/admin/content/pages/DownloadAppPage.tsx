import { useState, useMemo, useEffect } from "react";
import DownloadAppEditor from "../components/DownloadAppEditor";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Plus, Edit2, Trash2, Download, Smartphone, Apple, Search, Check, X, HardDrive } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";

type Props = {
  searchParams: URLSearchParams;
  setSearchParams: any;
  apiDownloadApps: any[];
  token: string;
  fetchApiDownloadApps: () => Promise<void>;
};

export default function DownloadAppPage({ searchParams, setSearchParams, apiDownloadApps = [], token, fetchApiDownloadApps }: Props) {
  const contentView = searchParams.get("view") || "list";
  const editorId = searchParams.get("id");
  const [search, setSearch] = useState("");
  const [filterPlatform, setFilterPlatform] = useState<"All" | "android" | "ios">("All");

  useEffect(() => {
    fetchApiDownloadApps();
  }, []);

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

  const handleToggleStatus = async (item: any) => {
    const nextStatus = !Boolean(item.is_active);
    try {
      const form = new FormData();
      form.append("is_active", nextStatus ? "1" : "0");
      form.append("_method", "PUT");

      const res = await fetch(`${API_BASE}/admin/download-apps/${item.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (res.ok) {
        toast({
          title: "Status Rilis Diperbarui",
          message: `Rilis "${item.title}" (${item.version || "1.0.0"}) kini ${nextStatus ? "Aktif" : "Non-aktif"}.`,
          variant: "success",
        });
        await fetchApiDownloadApps();
      }
    } catch {
      toast({ title: "Gagal", message: "Gagal mengubah status rilis", variant: "error" });
    }
  };

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

  const filtered = useMemo(() => {
    return apiDownloadApps
      .filter((a) => {
        if (filterPlatform === "android") return (a.platform || "android").toLowerCase().includes("android");
        if (filterPlatform === "ios") return (a.platform || "").toLowerCase().includes("ios") || (a.platform || "").toLowerCase().includes("apple");
        return true;
      })
      .filter((a) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          (a.title || "").toLowerCase().includes(q) ||
          (a.description || "").toLowerCase().includes(q) ||
          (a.version || "").toLowerCase().includes(q) ||
          (a.platform || "").toLowerCase().includes(q)
        );
      });
  }, [apiDownloadApps, filterPlatform, search]);

  const androidCount = apiDownloadApps.filter((a) => (a.platform || "android").toLowerCase().includes("android")).length;
  const iosCount = apiDownloadApps.filter((a) => (a.platform || "").toLowerCase().includes("ios")).length;
  const activeCount = apiDownloadApps.filter((a) => Boolean(a.is_active)).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Rilis Aplikasi Mobile</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola berkas APK Android, link App Store iOS, nomor versi, dan catatan rilis untuk pengguna.</p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-md shadow-[#C9A24A]/20 cursor-pointer"
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
              <HardDrive className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Total Rilis</p>
          </div>
          <p className="text-2xl font-bold text-[#4A3F35]">{apiDownloadApps.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Paket Android APK</p>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{androidCount}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] flex items-center justify-center text-[#4A3F35]">
              <Apple className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Rilis Aktif Publik</p>
          </div>
          <p className="text-2xl font-bold text-[#4A3F35]">{activeCount}</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {(["All", "android", "ios"] as const).map((plat) => (
            <button
              key={plat}
              type="button"
              onClick={() => setFilterPlatform(plat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterPlatform === plat
                  ? "bg-[#C9A24A] text-white shadow-xs"
                  : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]/60"
              }`}
            >
              {plat === "All" ? "Semua Platform" : plat === "android" ? "Android (APK)" : "iOS (App Store)"}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A89F91]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari versi / rilis..."
            className="w-full h-8.5 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl pl-8.5 pr-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead>Aplikasi & Versi</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Berkas / Link</TableHead>
              <TableHead>Status Rilis</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-xs text-[#8A7B6B]">
                  Belum ada rilis aplikasi terdaftar. Klik "Tambah Rilis Aplikasi" di atas.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const isActive = Boolean(item.is_active);
                const isAndroid = (item.platform || "android").toLowerCase().includes("android");
                return (
                  <TableRow key={item.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F] border border-[#F0E6D3]">
                          {isAndroid ? <Smartphone className="w-5 h-5" /> : <Apple className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#4A3F35]">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-semibold text-[#B8943F] bg-[#FDF8F0] px-2 py-0.5 rounded-full border border-[#F5E6C8]">
                              v{item.version || "1.0.0"}
                            </span>
                            {item.description && (
                              <span className="text-[10px] text-[#8A7B6B] line-clamp-1 max-w-[200px]">{item.description}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF8F5] text-[#4A3F35] border border-[#F0E6D3] uppercase">
                        {isAndroid ? "Android" : "iOS"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.apk_url || item.apk_path ? (
                        <a
                          href={getStorageUrl(item.apk_url || item.apk_path) || item.apk_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#B8943F] hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Unduh APK
                        </a>
                      ) : item.download_link ? (
                        <a
                          href={item.download_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Link Store
                        </a>
                      ) : (
                        <span className="text-xs text-[#8A7B6B]">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                          isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                        title="Klik untuk mengubah status rilis"
                      >
                        {isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {isActive ? "Aktif" : "Non-aktif"}
                      </button>
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
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
