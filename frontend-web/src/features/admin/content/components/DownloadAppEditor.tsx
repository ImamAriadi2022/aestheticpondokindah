import { useState, useEffect, useRef } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  ArrowLeft,
  Save,
  Upload,
  Download,
  CheckCircle2,
  Loader2,
  Sparkles,
  Smartphone,
  FileCode,
  HardDrive,
} from "lucide-react";
import { toast } from "@/shared/ui/toast";
import { API_BASE } from "@/core/api/apiConfig";

type Props = {
  current?: any;
  editorId?: string | null;
  token: string;
  fetchApiDownloadApps: () => Promise<void>;
  setSearchParams: any;
};

export default function DownloadAppEditor({
  current,
  editorId,
  token,
  fetchApiDownloadApps,
  setSearchParams,
}: Props) {
  const isNew = !editorId;

  const [editor, setEditor] = useState({
    title: current?.title || "",
    description: current?.description || "",
    version: current?.version || "",
    platform: current?.platform || "android",
    downloadLink: current?.download_link || "",
    isActive: current?.is_active ?? true,
    isDevelopment: current?.is_development ?? false,
    sortOrder: current?.sort_order ?? 0,
    apkUrl: current?.apk_url || current?.apk_path || "",
    apkFile: null as File | null,
    fileSize: current?.file_size || null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<"idle" | "uploading" | "processing" | "success">("idle");
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  useEffect(() => {
    if (current) {
      setEditor({
        title: current.title || "",
        description: current.description || "",
        version: current.version || "",
        platform: current.platform || "android",
        downloadLink: current.download_link || "",
        isActive: current.is_active ?? true,
        isDevelopment: current.is_development ?? false,
        sortOrder: current.sort_order ?? 0,
        apkUrl: current.apk_url || current.apk_path || "",
        apkFile: null,
        fileSize: current.file_size || null,
      });
    }
  }, [editorId, current]);

  const updateSaved = (patch: Partial<typeof editor>) => {
    setEditor((prev) => ({ ...prev, ...patch }));
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) {
      toast({
        title: "File Terlalu Besar",
        message: "Ukuran berkas APK maksimal adalah 200 MB.",
        variant: "error",
      });
      return;
    }
    updateSaved({
      apkFile: file,
      apkUrl: URL.createObjectURL(file),
      fileSize: file.size,
    });
    setUploadProgress(null);
    setUploadPhase("idle");
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes || bytes <= 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  const handleSave = async () => {
    if (!editor.title.trim()) {
      toast({
        title: "Judul Wajib Diisi",
        message: "Silakan masukkan nama atau judul aplikasi terlebih dahulu.",
        variant: "error",
      });
      return;
    }

    setIsSaving(true);
    setUploadPhase(editor.apkFile ? "uploading" : "processing");
    setUploadProgress(editor.apkFile ? 0 : 50);

    const formData = new FormData();
    formData.append("title", editor.title);
    formData.append("description", editor.description || "");
    formData.append("version", editor.version || "");
    formData.append("platform", editor.platform);
    formData.append("download_link", editor.downloadLink || "");
    formData.append("is_active", editor.isActive ? "1" : "0");
    formData.append("is_development", editor.isDevelopment ? "1" : "0");
    formData.append("sort_order", String(editor.sortOrder || 0));

    if (editor.apkFile) {
      formData.append("apk_file", editor.apkFile);
    }

    const url = isNew
      ? `${API_BASE}/admin/download-apps`
      : `${API_BASE}/admin/download-apps/${editorId}`;

    if (!isNew) {
      formData.append("_method", "PUT");
    }

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
        setUploadProgress(percent);
        setUploadedBytes(event.loaded);
        setTotalBytes(event.total);
        if (percent >= 98) {
          setUploadPhase("processing");
        }
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setUploadProgress(100);
        setUploadPhase("success");
        toast({
          title: "Berhasil Disimpan",
          message: isNew
            ? "Paket rilis aplikasi berhasil ditambahkan dan siap didistribusikan."
            : "Data rilis aplikasi berhasil diperbarui.",
          variant: "success",
        });
        await fetchApiDownloadApps();
        setTimeout(() => {
          setSearchParams((prev: any) => {
            const next = new URLSearchParams(prev);
            next.set("tab", "content-download");
            next.set("view", "list");
            next.delete("id");
            return next;
          });
        }, 600);
      } else {
        let errMessage = "Gagal menyimpan rilis aplikasi.";
        try {
          const resJson = JSON.parse(xhr.responseText);
          if (resJson.message) errMessage = resJson.message;
          if (resJson.errors) {
            const firstErr = Object.values(resJson.errors)[0];
            if (Array.isArray(firstErr)) errMessage = firstErr[0] as string;
          }
        } catch {}
        toast({
          title: "Gagal Menyimpan",
          message: errMessage,
          variant: "error",
        });
        setUploadPhase("idle");
        setUploadProgress(null);
        setIsSaving(false);
      }
    };

    xhr.onerror = () => {
      toast({
        title: "Koneksi Terputus",
        message: "Gagal terhubung ke server saat mengunggah aplikasi. Silakan periksa koneksi internet.",
        variant: "error",
      });
      setUploadPhase("idle");
      setUploadProgress(null);
      setIsSaving(false);
    };

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.send(formData);
  };

  const handleCancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      setIsSaving(false);
      setUploadPhase("idle");
      setUploadProgress(null);
      toast({
        title: "Upload Dibatalkan",
        message: "Proses unggah berkas APK telah dibatalkan.",
        variant: "info",
      });
    }
  };

  const saved = editor;

  return (
    <div className="download-app-editor space-y-6 animate-in fade-in duration-150 pb-16">
      {/* Top Header Actions */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-xl border-[#E8DFC8] bg-[#FAF8F5] hover:bg-[#F3EDE2] text-[#4A3F35] h-10 px-3.5 text-xs font-semibold cursor-pointer"
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
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Kembali
          </Button>
          <div>
            <h2 className="text-lg font-bold text-[#2C2416] flex items-center gap-2">
              {isNew ? "Tambah Rilis Aplikasi Baru" : "Edit Rilis Aplikasi"}
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FDF8F0] text-[#B8943F] border border-[#F5E6C8]">
                {saved.platform.toUpperCase()}
              </span>
            </h2>
            <p className="text-xs text-[#8A7B6B] mt-0.5">
              {isNew
                ? "Unggah file APK atau tambahkan tautan download resmi aplikasi pasien."
                : `Perbarui konfigurasi rilis ${saved.title || "aplikasi"}.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            disabled={isSaving}
            className="w-full sm:w-auto bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold rounded-xl h-10 px-5 shadow-md shadow-[#C9A24A]/25 cursor-pointer disabled:opacity-50"
            onClick={handleSave}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadPhase === "uploading" ? `Mengunggah (${uploadProgress || 0}%)` : "Menyimpan..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isNew ? "Simpan & Rilis Aplikasi" : "Simpan Perubahan"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="rounded-2xl border border-[#F0E6D3] bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-[#F7F2E8]">
              <CardTitle className="text-sm font-bold text-[#2C2416] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#C9A24A]" />
                Informasi & Spesifikasi Aplikasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A3F35]">
                  Nama / Judul Aplikasi <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={saved.title}
                  onChange={(e) => updateSaved({ title: e.target.value })}
                  placeholder="mis. Aespi Mobile (Aesthetic Pondok Indah)"
                  className="rounded-xl border-[#E8DFC8] focus:border-[#C9A24A] text-sm h-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#4A3F35]">Nomor Versi (Version Tag)</label>
                  <Input
                    value={saved.version}
                    onChange={(e) => updateSaved({ version: e.target.value })}
                    placeholder="mis. 1.0.0 atau v1.2.4"
                    className="rounded-xl border-[#E8DFC8] focus:border-[#C9A24A] text-sm h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#4A3F35]">Target Platform</label>
                  <select
                    value={saved.platform}
                    onChange={(e) => updateSaved({ platform: e.target.value })}
                    className="w-full h-10 rounded-xl border border-[#E8DFC8] bg-white px-3 text-sm text-[#2C2416] outline-none focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 transition-all font-medium"
                  >
                    <option value="android">🤖 Android (File APK / Play Store)</option>
                    <option value="ios">🍎 Apple iOS (App Store / TestFlight)</option>
                    <option value="android,ios">🌐 Android & iOS (Multiplatform)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A3F35]">Catatan Rilis / Deskripsi Pembaruan</label>
                <textarea
                  className="w-full h-28 p-3.5 rounded-xl border border-[#E8DFC8] text-sm text-[#2C2416] outline-none focus:border-[#C9A24A] focus:ring-2 focus:ring-[#C9A24A]/20 transition-all resize-none placeholder:text-gray-400 font-sans"
                  value={saved.description}
                  onChange={(e) => updateSaved({ description: e.target.value })}
                  placeholder="Tuliskan fitur baru, perbaikan bug, atau instruksi instalasi untuk pasien..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A3F35]">Link Download Eksternal (Opsional)</label>
                <Input
                  value={saved.downloadLink}
                  onChange={(e) => updateSaved({ downloadLink: e.target.value })}
                  placeholder="https://play.google.com/store/apps/details?id=com.aestheticpondokindah.app"
                  className="rounded-xl border-[#E8DFC8] focus:border-[#C9A24A] text-sm h-10"
                />
                <p className="text-[11px] text-[#8A7B6B]">
                  Gunakan kolom ini jika aplikasi didistribusikan melalui Google Play Store, Apple App Store, atau cloud eksternal.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: File Upload with Live Progress & Visibility */}
        <div className="space-y-5">
          {/* APK Upload Zone */}
          <Card className="rounded-2xl border border-[#F0E6D3] bg-white shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#F7F2E8]">
              <CardTitle className="text-sm font-bold text-[#2C2416] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#C9A24A]" />
                  Berkas APK Android
                </span>
                {saved.fileSize && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    {formatFileSize(saved.fileSize)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Upload Dropzone */}
              <label className="group block w-full cursor-pointer">
                <input
                  type="file"
                  accept=".apk,.zip"
                  disabled={isSaving}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChange(file);
                    e.currentTarget.value = "";
                  }}
                />
                <div className={`w-full min-h-[160px] p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center relative overflow-hidden ${
                  saved.apkFile || saved.apkUrl
                    ? "border-[#C9A24A]/60 bg-[#FAF8F5]/80"
                    : "border-[#E8DFC8] hover:border-[#C9A24A] bg-[#FAF8F5]/50 hover:bg-[#FAF8F5]"
                }`}>
                  {/* File Selected / Ready */}
                  {saved.apkFile ? (
                    <div className="space-y-2 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                        <FileCode className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2C2416] line-clamp-1 max-w-[200px] mx-auto">
                          {saved.apkFile.name}
                        </p>
                        <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                          {formatFileSize(saved.apkFile.size)} • Siap diunggah
                        </p>
                      </div>
                      <span className="inline-flex items-center text-[10px] font-bold text-[#B8943F] bg-[#FDF8F0] px-2.5 py-1 rounded-full border border-[#F0E6D3]">
                        Klik untuk mengganti berkas
                      </span>
                    </div>
                  ) : saved.apkUrl ? (
                    <div className="space-y-2 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FDF8F0] to-[#FAF5EA] text-[#C9A24A] flex items-center justify-center mx-auto border border-[#F0E6D3] shadow-xs">
                        <Download className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2C2416]">Berkas APK Tersedia di Server</p>
                        <p className="text-[11px] text-[#8A7B6B] mt-0.5">
                          {saved.fileSize ? formatFileSize(saved.fileSize) : "Rilis Aktif"}
                        </p>
                      </div>
                      <span className="inline-flex items-center text-[10px] font-bold text-[#B8943F] bg-white px-2.5 py-1 rounded-full border border-[#F0E6D3]">
                        Klik untuk mengunggah berkas baru
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-[#FDF8F0] text-[#C9A24A] flex items-center justify-center mx-auto border border-[#F0E6D3] group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2C2416]">Pilih atau Tarik File APK</p>
                        <p className="text-[11px] text-[#8A7B6B] mt-0.5">Format .apk atau .zip (Maks. 200 MB)</p>
                      </div>
                      <span className="inline-flex items-center text-[10px] font-bold text-[#B8943F] bg-white px-2.5 py-1 rounded-full border border-[#F0E6D3]">
                        Telusuri File
                      </span>
                    </div>
                  )}
                </div>
              </label>

              {/* Real-time Upload Progress Animation */}
              {isSaving && uploadProgress !== null && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#FDF8F0] to-[#FAF5EA] border border-[#F0E6D3] space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#4A3F35] flex items-center gap-1.5">
                      {uploadPhase === "uploading" ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 text-[#C9A24A] animate-spin" />
                          Mengunggah APK ke Server...
                        </>
                      ) : uploadPhase === "processing" ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#C9A24A] animate-pulse" />
                          Memproses & Menyimpan Rilis...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Selesai!
                        </>
                      )}
                    </span>
                    <span className="font-black text-[#C9A24A] text-sm">{uploadProgress}%</span>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-[#E8DFC8] p-0.5 shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#C9A24A] via-[#E0C068] to-[#B8943F] transition-all duration-300 ease-out relative"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/25 animate-[pulse_1.5s_infinite]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#8A7B6B]">
                    <span>
                      {uploadedBytes > 0 && totalBytes > 0
                        ? `${formatFileSize(uploadedBytes)} / ${formatFileSize(totalBytes)}`
                        : "Mengirimkan data..."}
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelUpload}
                      className="text-rose-600 font-semibold hover:underline cursor-pointer"
                    >
                      Batalkan
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings Card */}
          <Card className="rounded-2xl border border-[#F0E6D3] bg-white shadow-xs">
            <CardHeader className="pb-3 border-b border-[#F7F2E8]">
              <CardTitle className="text-sm font-bold text-[#2C2416]">Status & Visibilitas Rilis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#F0E6D3]">
                <div>
                  <p className="text-xs font-bold text-[#4A3F35]">Publikasikan Rilis</p>
                  <p className="text-[10px] text-[#8A7B6B]">Tampilkan link download ini di halaman pasien</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saved.isActive}
                    onChange={(e) => updateSaved({ isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C9A24A]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#F0E6D3]">
                <div>
                  <p className="text-xs font-bold text-[#4A3F35]">Tandai Versi Beta / Development</p>
                  <p className="text-[10px] text-[#8A7B6B]">Beri badge pengujian khusus pada rilis ini</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saved.isDevelopment}
                    onChange={(e) => updateSaved({ isDevelopment: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A3F35]">Urutan Tampil (Sort Order)</label>
                <Input
                  type="number"
                  min={0}
                  value={saved.sortOrder}
                  onChange={(e) => updateSaved({ sortOrder: Number(e.target.value) })}
                  className="rounded-xl border-[#E8DFC8] focus:border-[#C9A24A] text-sm h-10"
                />
                <p className="text-[10px] text-[#8A7B6B]">Angka lebih kecil akan tampil paling atas.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Prominent Bottom Action Bar */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
        <div className="text-xs text-[#8A7B6B] text-center sm:text-left">
          Pastikan semua data dan berkas APK sudah terisi sebelum menyimpan.
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            className="flex-1 sm:flex-initial rounded-xl border-[#E8DFC8] bg-[#FAF8F5] hover:bg-[#F3EDE2] text-[#4A3F35] h-11 px-5 text-xs font-semibold cursor-pointer"
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
            Batal
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            className="flex-1 sm:flex-initial bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold rounded-xl h-11 px-8 shadow-md shadow-[#C9A24A]/25 cursor-pointer disabled:opacity-50 text-sm"
            onClick={handleSave}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadPhase === "uploading" ? `Mengunggah (${uploadProgress || 0}%)` : "Menyimpan..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isNew ? "Simpan & Rilis Aplikasi" : "Simpan Perubahan"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
