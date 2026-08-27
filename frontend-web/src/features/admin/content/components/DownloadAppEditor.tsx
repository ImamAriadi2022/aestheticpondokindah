import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ArrowLeft, Plus, Download, Upload } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE } from "@/core/api/apiConfig";

type Props = {
  current?: any;
  editorId?: string | null;
  token: string;
  fetchApiDownloadApps: () => Promise<void>;
  setSearchParams: any;
};

export default function DownloadAppEditor({ current, editorId, token, fetchApiDownloadApps, setSearchParams }: Props) {
  const isNew = !editorId;

  const [editor, setEditor] = useState({
    title: current?.title || "",
    description: current?.description || "",
    version: current?.version || "",
    platform: current?.platform || "android",
    downloadLink: current?.download_link || "",
    isActive: current?.is_active ?? true,
    isDevelopment: current?.is_development ?? true,
    sortOrder: current?.sort_order ?? 0,
    apkUrl: current?.apk_url || "",
    apkFile: null as File | null,
  });

  useEffect(() => {
    if (current) {
      setEditor({
        title: current.title || "",
        description: current.description || "",
        version: current.version || "",
        platform: current.platform || "android",
        downloadLink: current.download_link || "",
        isActive: current.is_active ?? true,
        isDevelopment: current.is_development ?? true,
        sortOrder: current.sort_order ?? 0,
        apkUrl: current.apk_url || "",
        apkFile: null,
      });
    }
  }, [editorId, current]);

  const updateSaved = (patch: Partial<typeof editor>) => {
    setEditor((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", editor.title);
      formData.append("description", editor.description);
      formData.append("version", editor.version);
      formData.append("platform", editor.platform);
      formData.append("download_link", editor.downloadLink);
      formData.append("is_active", editor.isActive ? "1" : "0");
      formData.append("is_development", editor.isDevelopment ? "1" : "0");
      formData.append("sort_order", String(editor.sortOrder));
      if (editor.apkFile) {
        formData.append("apk_file", editor.apkFile);
      }

      const url = isNew
        ? `${API_BASE}/admin/download-apps`
        : `${API_BASE}/admin/download-apps/${editorId}`;

      if (!isNew) {
        formData.append("_method", "PUT");
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        console.error("Gagal simpan download app", await res.text());
        return;
      }

      toast({
        title: "Berhasil",
        message: isNew ? "Aplikasi berhasil ditambahkan" : "Aplikasi diperbarui",
        variant: "success",
      });
      await fetchApiDownloadApps();
      setSearchParams((prev: any) => {
        const next = new URLSearchParams(prev);
        next.set("tab", "content-download");
        next.set("view", "list");
        next.delete("id");
        return next;
      });
    } catch (e) {
      console.error("Gagal simpan download app", e);
    }
  };

  const saved = editor;

  return (
    <div className="download-app-editor space-y-4">
      <div className="download-app-editor-actions flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-sm border-gray-200 h-9 text-xs"
            onClick={() =>
              setSearchParams((prev: any) => {
                const next = new URLSearchParams(prev);
                next.set("tab", "content-download");
                next.set("view", "list");
                next.delete("id");
                return next;
              })
            }
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
          <h2 className="text-lg font-bold text-gray-900">
            {isNew ? "Tambah Aplikasi" : "Edit Aplikasi"}
          </h2>
        </div>
        <Button
          className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm h-9"
          onClick={handleSave}
        >
          <Plus className="w-4 h-4 mr-1" />
          {isNew ? "Tambah Aplikasi" : "Simpan Perubahan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Informasi Aplikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Judul Aplikasi</label>
                <Input
                  value={saved.title}
                  onChange={(e) => updateSaved({ title: e.target.value })}
                  placeholder="Aesthetic Pondok Indah"
                  className="rounded-sm border-gray-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Deskripsi</label>
                <textarea
                  className="w-full h-20 p-3 rounded-sm border border-gray-200 text-sm outline-none focus:ring-1 focus:ring-[#c9a24a] resize-none"
                  value={saved.description}
                  onChange={(e) => updateSaved({ description: e.target.value })}
                  placeholder="Deskripsi aplikasi..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Versi</label>
                  <Input
                    value={saved.version}
                    onChange={(e) => updateSaved({ version: e.target.value })}
                    placeholder="1.0.0"
                    className="rounded-sm border-gray-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Platform</label>
                  <select
                    value={saved.platform}
                    onChange={(e) => updateSaved({ platform: e.target.value })}
                    className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
                  >
                    <option value="android">Android</option>
                    <option value="ios">iOS</option>
                    <option value="android,ios">Android & iOS</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Link Download Eksternal</label>
                <Input
                  value={saved.downloadLink}
                  onChange={(e) => updateSaved({ downloadLink: e.target.value })}
                  placeholder="https://play.google.com/store/apps/..."
                  className="rounded-sm border-gray-200"
                />
                <p className="text-xs text-gray-400">Opsional. Isi jika aplikasi tersedia di Google Play / App Store.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">File APK</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="group block w-full cursor-pointer">
                <input
                  type="file"
                  accept=".apk,.zip"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    updateSaved({ apkUrl: URL.createObjectURL(file), apkFile: file });
                    e.currentTarget.value = "";
                  }}
                />
                <div className="w-full aspect-[4/3] rounded-sm border border-dashed border-emerald-300 bg-emerald-50/40 overflow-hidden flex items-center justify-center relative">
                  {saved.apkUrl ? (
                    <div className="text-center px-4">
                      <Download className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="mt-2 text-xs font-semibold text-emerald-700">{saved.apkFile?.name || "APK tersedia"}</p>
                      {saved.apkFile && (
                        <p className="text-xs text-emerald-600">{(saved.apkFile.size / 1048576).toFixed(1)} MB</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center px-4">
                      <div className="mx-auto w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-emerald-700">Klik untuk upload APK</p>
                      <p className="text-xs text-emerald-700/70">APK atau ZIP (Maks. 100MB)</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
              </label>
              {saved.apkUrl && !saved.apkFile && (
                <div className="text-xs text-gray-500 text-center">
                  File: {saved.apkUrl.split("/").pop()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Pengaturan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Aktif</label>
                <input
                  type="checkbox"
                  checked={saved.isActive}
                  onChange={(e) => updateSaved({ isActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700">Mode Development</label>
                <input
                  type="checkbox"
                  checked={saved.isDevelopment}
                  onChange={(e) => updateSaved({ isDevelopment: e.target.checked })}
                  className="rounded border-gray-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Urutan</label>
                <Input
                  type="number"
                  min={0}
                  value={saved.sortOrder}
                  onChange={(e) => updateSaved({ sortOrder: Number(e.target.value) })}
                  className="rounded-sm border-gray-200"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
