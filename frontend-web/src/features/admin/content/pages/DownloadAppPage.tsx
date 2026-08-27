import { useState, useMemo, useEffect } from "react";
import DownloadAppEditor from "../components/DownloadAppEditor";
import { PwaInstallButton } from "@/core/components/PwaInstallButton";
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
    } catch (e) {
      toast({ title: "Gagal Mengubah Status", message: "Gagal memperbarui status rilis aplikasi", variant: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus paket rilis aplikasi ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/download-apps/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: "Berhasil", message: "Rilis aplikasi berhasil dihapus", variant: "success" });
        await fetchApiDownloadApps();
      }
    } catch (e) {
      toast({ title: "Gagal", message: "Gagal menghapus rilis aplikasi", variant: "error" });
    }
  };

  const filtered = useMemo(() => {
    return apiDownloadApps
      .filter((a) => {
        if (filterPlatform === "All") return true;
        return (a.platform || "android").toLowerCase() === filterPlatform;
      })
      .filter((a) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          (a.title || "").toLowerCase().includes(q) ||
          (a.version || "").toLowerCase().includes(q) ||
          (a.platform || "").toLowerCase().includes(q) ||
          (a.description || "").toLowerCase().includes(q)
        );
      });
  }, [apiDownloadApps, filterPlatform, search]);

  const activeCount = useMemo(() => apiDownloadApps.filter((a) => Boolean(a.is_active)).length, [apiDownloadApps]);
  const androidCount = useMemo(() => apiDownloadApps.filter((a) => (a.platform || "android").toLowerCase() === "android").length, [apiDownloadApps]);
  const iosCount = useMemo(() => apiDownloadApps.filter((a) => (a.platform || "").toLowerCase() === "ios").length, [apiDownloadApps]);

  const currentDownloadItem = useMemo(() => {
    return editorId ? apiDownloadApps.find((a) => String(a.id) === editorId) : undefined;
  }, [editorId, apiDownloadApps]);

  // Safe conditional render AFTER all hooks execute!
  if (contentView === "editor") {
    return (
      <DownloadAppEditor
        current={currentDownloadItem}
        editorId={editorId}
        token={token}
        fetchApiDownloadApps={fetchApiDownloadApps}
        setSearchParams={setSearchParams}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Download & Rilis Aplikasi Mobile Pasien</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola file installer APK Android, link App Store iOS, dan riwayat changelog versi.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PwaInstallButton className="rounded-xl bg-[#2C2416] hover:bg-[#443823] text-white text-xs" />
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
            Rilis Versi Baru
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
              <HardDrive className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Total Versi Rilis</p>
          </div>
          <p className="text-2xl font-bold text-[#4A3F35]">{apiDownloadApps.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Check className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Rilis Aktif</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
              <Smartphone className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Distribusi Platform</p>
          </div>
          <p className="text-sm font-bold text-[#4A3F35] mt-1">
            {androidCount} Android • {iosCount} iOS
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {(["All", "android", "ios"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFilterPlatform(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterPlatform === p
                  ? "bg-[#C9A24A] text-white shadow-xs"
                  : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]/60"
              }`}
            >
              {p === "All" ? "Semua Platform" : p === "android" ? "Android (APK)" : "iOS App Store"}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89F91] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari versi / rilis..."
            className="w-full h-9 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl pl-10 pr-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A] focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead>Platform</TableHead>
              <TableHead>Nama Rilis</TableHead>
              <TableHead>Versi</TableHead>
              <TableHead>Tipe Unduhan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-[#8A7B6B]">
                  Tidak ada rilis aplikasi ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const isAndroid = (item.platform || "android").toLowerCase() === "android";
                const isAktif = Boolean(item.is_active);
                return (
                  <TableRow key={item.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isAndroid ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-800"}`}>
                          {isAndroid ? <Smartphone className="w-4 h-4" /> : <Apple className="w-4 h-4" />}
                        </div>
                        <span className="text-xs font-bold text-[#4A3F35] capitalize">{item.platform || "Android"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-bold text-[#4A3F35]">{item.title}</p>
                      <p className="text-[10px] text-[#8A7B6B] line-clamp-1">{item.description || item.changelog}</p>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF5EA] text-[#8C6B1C] border border-[#EADBBD]">
                        v{item.version || "1.0.0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {item.apk_file_path ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Direct APK ({item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(1)} MB` : "File"})
                        </span>
                      ) : item.external_url ? (
                        <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          Store URL
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#8A7B6B]">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all border ${
                          isAktif
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
                        }`}
                        title="Klik untuk mengubah status aktif"
                      >
                        {isAktif ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-500" />}
                        {isAktif ? "🟢 Aktif" : "⚪ Non-aktif"}
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
