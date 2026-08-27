import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { ArrowLeft, Save, Eye, Loader2, FileText, CheckCircle2 } from "lucide-react";
import WpEditor from "@/features/admin/content/components/WpEditor";
import { toast } from "@/shared/ui/toast";
import { API_BASE } from "@/core/api/apiConfig";
import { logger } from "@/core/utils/logger";

function stripHtmlToText(html: string) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html || "";
  return (tmp.textContent || tmp.innerText || "").replace(/\s+/g, " ").trim();
}

function toExcerptFromContent(html: string, maxWords: number) {
  const text = stripHtmlToText(html);
  if (!text) return "";
  const words = text.split(" ").filter(Boolean);
  return words.slice(0, maxWords).join(" ");
}

interface Props {
  editorId: string | null;
  apiPost: any;
  sessionName: string;
  token: string | null;
  onBack: () => void;
  onSaved: () => void;
}

export default function BlogEditorPanel({ editorId, apiPost, sessionName, token, onBack, onSaved }: Props) {
  const isNew = !editorId;

  const [saving, setSaving] = useState(false);
  const [targetAction, setTargetAction] = useState<"draft" | "published" | null>(null);

  const [editorState, setEditorState] = useState({
    title: apiPost?.title || "",
    slug: apiPost?.slug || "",
    content: apiPost?.content_html || "",
    excerpt: apiPost?.excerpt || "",
    category: apiPost?.category || "Tips",
    status: (apiPost?.status || "published") as "draft" | "published",
    featuredImageUrl: apiPost?.cover_image_url || "",
    featuredImageFile: null as File | null,
  });

  useEffect(() => {
    if (apiPost) {
      setEditorState({
        title: apiPost.title || "",
        slug: apiPost.slug || "",
        content: apiPost.content_html || "",
        excerpt: apiPost.excerpt || "",
        category: apiPost.category || "Tips",
        status: (apiPost.status || "published") as "draft" | "published",
        featuredImageUrl: apiPost.cover_image_url || "",
        featuredImageFile: null,
      });
    }
  }, [apiPost?.id]);

  const updateEditor = (patch: Partial<typeof editorState>) => {
    setEditorState((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async (targetStatus: "draft" | "published") => {
    try {
      if (!token) {
        toast({
          title: "Belum login",
          message: "Silakan login ulang sebagai Admin Klinik.",
          variant: "error",
        });
        return;
      }

      if (saving) return;
      setTargetAction(targetStatus);
      setSaving(true);

      const formData = new FormData();
      formData.append("title", editorState.title.trim());
      formData.append(
        "slug",
        editorState.slug ||
          editorState.title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")
      );
      formData.append("category", editorState.category);
      formData.append("content_html", editorState.content);
      formData.append("excerpt", editorState.excerpt || toExcerptFromContent(editorState.content, 150));
      formData.append("status", targetStatus);
      if (editorState.featuredImageFile) {
        formData.append("cover_image", editorState.featuredImageFile);
      }

      const url = isNew
        ? `${API_BASE}/admin/posts`
        : `${API_BASE}/admin/posts/${editorId}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        logger.error("Gagal simpan post", text);
        toast({
          title: "Gagal menyimpan",
          message: text || "Terjadi kesalahan saat menyimpan artikel.",
          variant: "error",
        });
        return;
      }

      toast({
        title: "Berhasil",
        message: targetStatus === "draft" ? "Artikel disimpan sebagai Draf" : (isNew ? "Artikel berhasil dipublikasikan" : "Artikel berhasil diperbarui"),
        variant: "success",
      });
      onSaved();
    } catch (e) {
      logger.error("Gagal publish", e);
      toast({
        title: "Gagal menyimpan",
        message: "Terjadi kesalahan saat menyimpan artikel.",
        variant: "error",
      });
    } finally {
      setSaving(false);
      setTargetAction(null);
    }
  };

  return (
    <div className="blog-editor-panel space-y-4 animate-in fade-in duration-150">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-[#F0E6D3] shadow-xs">
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-[#E8DFC8] text-[#4A3F35] hover:bg-[#FAF8F5] h-9 px-3 text-xs font-semibold cursor-pointer" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Kembali
          </Button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#2C2416]">
              {isNew ? "Tulis Artikel Blog Baru" : "Edit Konten Artikel Blog"}
            </h2>
          </div>
        </div>

        <div className="blog-editor-actions flex items-center gap-2">
          {/* Button Simpan Draf */}
          <Button
            type="button"
            variant="outline"
            className="border-[#E8DFC8] bg-white text-[#8C6B1C] hover:bg-[#FAF5EA] font-bold rounded-xl text-xs h-9 px-3.5 cursor-pointer shadow-2xs"
            onClick={() => handleSave("draft")}
            disabled={!editorState.title.trim() || saving}
          >
            {saving && targetAction === "draft" ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
            )}
            Simpan sebagai Draf
          </Button>

          {/* Button Publikasikan */}
          <Button
            type="button"
            className="bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white font-bold rounded-xl text-xs h-9 px-4 cursor-pointer shadow-xs"
            onClick={() => handleSave("published")}
            disabled={!editorState.title.trim() || saving}
          >
            {saving && targetAction === "published" ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Eye className="w-3.5 h-3.5 mr-1.5" />
            )}
            Publikasikan Artikel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content Area */}
        <Card className="rounded-2xl border border-[#F0E6D3] shadow-xs lg:col-span-2 overflow-hidden bg-white">
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="text-[11px] font-bold text-[#8C8272] uppercase tracking-wider block mb-1">
                Judul Artikel Blog *
              </label>
              <Input
                value={editorState.title}
                onChange={(e) => {
                  const title = e.target.value;
                  updateEditor({
                    title,
                    slug:
                      editorState.slug ||
                      title
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                  });
                }}
                placeholder="Tuliskan judul artikel edukasi menarik di sini..."
                className="rounded-xl border-[#E8DFC8] bg-[#FAF8F5] focus:bg-white h-12 text-base font-bold text-[#2C2416] transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#8C8272] uppercase tracking-wider block mb-1">
                Isi Konten Artikel
              </label>
              <WpEditor
                postId={editorId || undefined}
                value={editorState.content}
                onChange={(html) =>
                  updateEditor({
                    content: html,
                    excerpt: toExcerptFromContent(html, 150),
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Meta Info */}
        <div className="space-y-4">
          <Card className="rounded-2xl border border-[#F0E6D3] shadow-xs bg-white">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider">Gambar Utama (Cover)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              <label className="group block w-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const { compressImageFileToWebPFile } = await import("@/core/utils/imageCompressor");
                      const compressed = await compressImageFileToWebPFile(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.85 });
                      updateEditor({ featuredImageUrl: URL.createObjectURL(compressed), featuredImageFile: compressed });
                    } catch {
                      updateEditor({ featuredImageUrl: URL.createObjectURL(file), featuredImageFile: file });
                    }
                  }}
                />
                <div className="w-full aspect-[16/9] rounded-xl border-2 border-dashed border-[#E8DFC8] bg-[#FAF8F5] hover:bg-[#FAF5EA] overflow-hidden flex items-center justify-center relative transition-colors">
                  {editorState.featuredImageUrl ? (
                    <img src={editorState.featuredImageUrl} alt="featured" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center px-4">
                      <div className="mx-auto w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-[#8C6B1C]">
                        <span className="text-sm font-bold">↑</span>
                      </div>
                      <p className="mt-1.5 text-xs font-bold text-[#8C6B1C]">Klik untuk Unggah Cover</p>
                      <p className="text-[10px] text-[#8C8272]">PNG, JPG, WEBP</p>
                    </div>
                  )}
                </div>
              </label>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-[#F0E6D3] shadow-xs bg-white">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider">Kategori Artikel</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2">
              <select
                value={editorState.category}
                onChange={(e) => updateEditor({ category: e.target.value })}
                className="w-full h-10 rounded-xl border border-[#E8DFC8] bg-[#FAF8F5] px-3 text-xs font-bold text-[#2C2416] outline-hidden focus:border-[#C9A24A] cursor-pointer"
              >
                {["Estetika", "Tips", "Ortodonti", "Anak", "Restoratif", "Informasi"].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-[#F0E6D3] shadow-xs bg-white">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider">Status & Metadata</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-xs text-[#5C5546] space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8C8272] uppercase">Status Saat Ini</label>
                <select
                  value={editorState.status}
                  onChange={(e) => updateEditor({ status: e.target.value as "draft" | "published" })}
                  className="w-full h-9 rounded-xl border border-[#E8DFC8] bg-[#FAF8F5] px-3 text-xs font-semibold text-[#2C2416] outline-hidden focus:border-[#C9A24A] cursor-pointer"
                >
                  <option value="draft">🟡 Draf (Belum Dipublikasikan)</option>
                  <option value="published">🟢 Publikasi (Tampil di Website)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#F0E6D3]">
                <span className="text-[#8C8272]">Penulis (Author)</span>
                <span className="font-bold text-[#2C2416]">{sessionName}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
