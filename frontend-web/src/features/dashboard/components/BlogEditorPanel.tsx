import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import WpEditor from "@/components/dashboard/WpEditor";
import { toast } from "@/components/ui/toast";
import { API_BASE } from "@/lib/apiConfig";
import { logger } from "@/lib/logger";

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

  const [editorState, setEditorState] = useState({
    title: apiPost?.title || "",
    slug: apiPost?.slug || "",
    content: apiPost?.content_html || "",
    excerpt: apiPost?.excerpt || "",
    category: apiPost?.category || "Tips",
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
        featuredImageUrl: apiPost.cover_image_url || "",
        featuredImageFile: null,
      });
    }
  }, [apiPost?.id]);

  const updateEditor = (patch: Partial<typeof editorState>) => {
    setEditorState((prev) => ({ ...prev, ...patch }));
  };

  const handlePublish = async () => {
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
      setSaving(true);

      const formData = new FormData();
      formData.append("title", editorState.title);
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
      formData.append("status", "published");
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
        message: isNew ? "Artikel berhasil dipublish" : "Artikel diperbarui",
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
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-sm border-gray-200" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tambah / Edit Post</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-gradient-to-r from-[#c9a24a] to-[#a8843a] hover:from-[#b8923f] hover:to-[#9a7630] text-white font-semibold rounded-sm"
            onClick={handlePublish}
            disabled={!editorState.title.trim() || saving}
          >
            {saving ? "Menyimpan..." : "Publish"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-sm border-0 shadow-sm lg:col-span-2">
          <CardContent className="p-4 space-y-3">
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
              placeholder="Tambah judul"
              className="rounded-sm border-gray-200 h-14 text-xl font-bold"
            />

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
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Gambar Utama</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="group block w-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    updateEditor({ featuredImageUrl: URL.createObjectURL(file), featuredImageFile: file });
                  }}
                />
                <div className="w-full aspect-[16/9] rounded-sm border border-dashed border-emerald-300 bg-emerald-50/40 overflow-hidden flex items-center justify-center relative">
                  {editorState.featuredImageUrl ? (
                    <img src={editorState.featuredImageUrl} alt="featured" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center px-4">
                      <div className="mx-auto w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 text-lg">↑</span>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-emerald-700">Klik untuk unggah</p>
                      <p className="text-[11px] text-emerald-700/80">PNG, JPG, WEBP (2MB)</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
              </label>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Kategori</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <select
                value={editorState.category}
                onChange={(e) => updateEditor({ category: e.target.value })}
                className="w-full h-10 rounded-sm border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#c9a24a]/30"
              >
                {["Estetika", "Tips", "Ortodonti", "Anak", "Restoratif"].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-gray-900">Status</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="font-medium">{apiPost ? "Published" : "Baru"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Author</span>
                <span className="font-medium">{sessionName}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
