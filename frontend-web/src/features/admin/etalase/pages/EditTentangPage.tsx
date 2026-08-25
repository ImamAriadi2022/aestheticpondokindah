import { useState, useEffect } from "react";
import {
  fetchAdminAbout,
  updateAdminAbout,
  type AboutContentData,
  DEFAULT_ABOUT_CONTENT,
} from "../services/etalaseService";
import { compressImageFileToWebPFile } from "@/core/utils/imageCompressor";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { toast } from "@/shared/ui/toast";
import {
  Info,
  Save,
  RotateCcw,
  ExternalLink,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  Award,
  Layers,
  Image as ImageIcon,
  BarChart3,
  Heart,
  Eye,
} from "lucide-react";

export default function EditTentangPage() {
  const [formData, setFormData] = useState<AboutContentData>(DEFAULT_ABOUT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "preview">("content");
  const [storyImagePreview, setStoryImagePreview] = useState<string>("");
  const [newParagraph, setNewParagraph] = useState("");

  useEffect(() => {
    loadAboutData();
  }, []);

  const loadAboutData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAbout();
      setFormData(data);
      setStoryImagePreview(data.story_image || DEFAULT_ABOUT_CONTENT.story_image);
    } catch {
      toast({
        title: "Gagal Mengambil Data",
        message: "Menggunakan pengaturan default halaman tentang.",
        variant: "warning",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const webpFile = await compressImageFileToWebPFile(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.85 });
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setStoryImagePreview(base64);
        setFormData((prev) => ({ ...prev, story_image: base64 }));
      };
      reader.readAsDataURL(webpFile);
      toast({
        title: "Foto Berhasil Dimuat",
        message: "Foto dikonversi ke WebP dan siap disimpan.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Gagal Memproses Gambar",
        message: "Gunakan format PNG atau JPG yang valid.",
        variant: "error",
      });
    }
  };

  const handleAddParagraph = () => {
    if (!newParagraph.trim()) return;
    setFormData((prev) => ({
      ...prev,
      story_paragraphs: [...(prev.story_paragraphs || []), newParagraph.trim()],
    }));
    setNewParagraph("");
  };

  const handleRemoveParagraph = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      story_paragraphs: prev.story_paragraphs.filter((_, i) => i !== index),
    }));
  };

  const handleAddStat = () => {
    setFormData((prev) => ({
      ...prev,
      stats: [...(prev.stats || []), { value: "10+", label: "Statistik Baru", sublabel: "Keterangan singkat" }],
    }));
    toast({
      title: "Kartu Statistik Ditambahkan",
      message: "Silakan isi angka dan keterangan pada kartu baru.",
      variant: "success",
    });
  };

  const handleRemoveStat = (index: number) => {
    if (formData.stats.length <= 1) {
      toast({
        title: "Peringatan",
        message: "Minimal harus ada 1 kartu statistik.",
        variant: "warning",
      });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }));
  };

  const handleAddValue = () => {
    setFormData((prev) => ({
      ...prev,
      values: [...(prev.values || []), { title: "Nilai Inti Baru", description: "Deskripsi dedikasi dan komitmen pelayanan klinik..." }],
    }));
    toast({
      title: "Nilai Inti Ditambahkan",
      message: "Silakan sesuaikan judul dan deskripsi nilai baru.",
      variant: "success",
    });
  };

  const handleRemoveValue = (index: number) => {
    if (formData.values.length <= 1) {
      toast({
        title: "Peringatan",
        message: "Minimal harus ada 1 nilai inti.",
        variant: "warning",
      });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }));
  };

  const handleResetToDefault = () => {
    if (window.confirm("Apakah Anda yakin ingin mengembalikan seluruh konten Tentang Kami ke pengaturan standar klinik?")) {
      setFormData(DEFAULT_ABOUT_CONTENT);
      setStoryImagePreview(DEFAULT_ABOUT_CONTENT.story_image);
      toast({
        title: "Reset Berhasil",
        message: "Silakan klik 'Simpan Perubahan' untuk menerapkan ke website publik.",
        variant: "info",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateAdminAbout(formData);
      toast({
        title: "Berhasil Disimpan",
        message: res.message || "Konten Tentang Kami berhasil diperbarui dan langsung tayang di website publik.",
        variant: "success",
      });
      if (res.about) {
        setFormData(res.about);
        if (res.about.story_image) setStoryImagePreview(res.about.story_image);
      }
    } catch {
      toast({
        title: "Gagal Menyimpan",
        message: "Terjadi kesalahan saat menyimpan perubahan Tentang Kami.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C9A24A]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1E1B18] via-[#2A241C] to-[#1E1B18] border border-[#C9A24A]/30 p-6 md:p-8 text-white shadow-xl shadow-black/10">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#C9A24A]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A24A]/20 border border-[#C9A24A]/40 text-xs font-semibold text-[#E8C547]">
              <Sparkles className="w-3.5 h-3.5" />
              CMS Etalase Klinik
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Info className="w-8 h-8 text-[#C9A24A]" />
              Edit Halaman Tentang Kami (About Page)
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl">
              Kelola judul pengantar, narasi cerita klinik, foto fasilitas, badge penghargaan, 4 angka statistik pencapaian, dan nilai-nilai inti klinik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/#/about"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
            >
              <ExternalLink className="w-4 h-4" />
              Buka Halaman Tentang
            </a>
            <Button
              type="button"
              variant="outline"
              onClick={handleResetToDefault}
              className="bg-transparent border-red-400/40 text-red-300 hover:bg-red-950/40 hover:text-red-200 text-xs rounded-xl px-4 py-2.5 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Default
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:opacity-90 text-white font-semibold text-xs rounded-xl px-5 py-2.5 shadow-lg shadow-[#C9A24A]/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "content"
              ? "bg-[#C9A24A] text-white shadow-md shadow-[#C9A24A]/20"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Layers className="w-4 h-4" />
          Form Editor CMS
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === "preview"
              ? "bg-[#C9A24A] text-white shadow-md shadow-[#C9A24A]/20"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Eye className="w-4 h-4" />
          Live Preview Tentang Kami
        </button>
      </div>

      {activeTab === "content" ? (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Sections (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Hero Header */}
            <Card className="border border-[#C9A24A]/20 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50/50 to-transparent border-b border-amber-100/60 pb-4">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C9A24A]" />
                  1. Header Hero Tentang Kami
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Judul besar dan paragraf pembuka di bagian atas halaman Tentang Kami.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Judul Utama Halaman
                  </label>
                  <Input
                    value={formData.hero_title}
                    onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                    placeholder="About The Company Aesthetic Pondok Indah"
                    className="rounded-xl font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Paragraf Pengantar Singkat (Hero Subtitle)
                  </label>
                  <Textarea
                    value={formData.hero_subtitle}
                    onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                    placeholder="At Aesthetic Pondok Indah Dental Clinic, we deliver professional dental solutions..."
                    rows={3}
                    className="rounded-xl resize-none leading-relaxed"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Cerita Klinik (Story) */}
            <Card className="border border-[#C9A24A]/20 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50/50 to-transparent border-b border-amber-100/60 pb-4">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#C9A24A]" />
                  2. Cerita Kami (Clinic Story & Mission)
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Narasi perjalanan klinik dan nilai pelayanan yang ditampilkan di samping foto fasilitas.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Label Tag Badge
                    </label>
                    <Input
                      value={formData.story_tag}
                      onChange={(e) => setFormData({ ...formData, story_tag: e.target.value })}
                      placeholder="Cerita Kami"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Judul Cerita
                    </label>
                    <Input
                      value={formData.story_title}
                      onChange={(e) => setFormData({ ...formData, story_title: e.target.value })}
                      placeholder="Professional Care that Puts You First"
                      className="rounded-xl font-semibold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Paragraf Narasi Cerita
                  </label>
                  <div className="space-y-3 mb-3">
                    {(formData.story_paragraphs || []).map((p, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
                        <span className="text-xs font-bold text-[#C9A24A] mt-2">#{idx + 1}</span>
                        <Textarea
                          value={p}
                          onChange={(e) => {
                            const updated = [...formData.story_paragraphs];
                            updated[idx] = e.target.value;
                            setFormData({ ...formData, story_paragraphs: updated });
                          }}
                          rows={2}
                          className="text-xs bg-transparent border-0 focus-visible:ring-0 shadow-none resize-none leading-relaxed text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveParagraph(idx)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors mt-1"
                          title="Hapus Paragraf"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2">
                    <Textarea
                      value={newParagraph}
                      onChange={(e) => setNewParagraph(e.target.value)}
                      placeholder="Tulis paragraf narasi baru..."
                      rows={2}
                      className="rounded-xl text-xs resize-none"
                    />
                    <Button
                      type="button"
                      onClick={handleAddParagraph}
                      className="bg-[#C9A24A] hover:bg-[#B8943F] text-white rounded-xl text-xs px-4 py-6"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Tambah
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Statistik Pencapaian */}
            <Card className="border border-[#C9A24A]/20 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50/50 to-transparent border-b border-amber-100/60 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#C9A24A]" />
                    3. Statistik & Pencapaian Utama
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-[#C9A24A] font-semibold ml-1">
                      {formData.stats?.length || 0} Kartu
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500 mt-1">
                    Angka metrik keunggulan klinik yang ditampilkan pada seksi statistik (bisa ditambah atau dikurangi secara dinamis).
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={handleAddStat}
                  className="bg-[#C9A24A] hover:bg-[#B8943F] text-white rounded-xl text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Kartu
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(formData.stats || []).map((stat, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-2 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#C9A24A]">Kartu Statistik #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveStat(idx)}
                          className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus Kartu Statistik"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-semibold text-gray-600">Angka/Nilai</label>
                          <Input
                            value={stat.value}
                            onChange={(e) => {
                              const updated = [...formData.stats];
                              updated[idx] = { ...updated[idx], value: e.target.value };
                              setFormData({ ...formData, stats: updated });
                            }}
                            placeholder="15+"
                            className="h-8 text-xs font-bold text-[#C9A24A] bg-white rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-semibold text-gray-600">Label Utama</label>
                          <Input
                            value={stat.label}
                            onChange={(e) => {
                              const updated = [...formData.stats];
                              updated[idx] = { ...updated[idx], label: e.target.value };
                              setFormData({ ...formData, stats: updated });
                            }}
                            placeholder="Tahun Pengalaman"
                            className="h-8 text-xs font-semibold text-gray-800 bg-white rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-gray-600">Keterangan Subtitle</label>
                        <Input
                          value={stat.sublabel || ""}
                          onChange={(e) => {
                            const updated = [...formData.stats];
                            updated[idx] = { ...updated[idx], sublabel: e.target.value };
                            setFormData({ ...formData, stats: updated });
                          }}
                          placeholder="Melayani dengan standar terbaik"
                          className="h-8 text-xs text-gray-600 bg-white rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Nilai-Nilai Utama (Core Values) */}
            <Card className="border border-[#C9A24A]/20 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50/50 to-transparent border-b border-amber-100/60 pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#C9A24A]" />
                    4. Nilai-Nilai Utama Klinik (Core Values)
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-[#C9A24A] font-semibold ml-1">
                      {formData.values?.length || 0} Nilai
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500 mt-1">
                    Prinsip keunggulan dan dedikasi klinik kepada pasien (bisa ditambah atau dikurangi dinamis).
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={handleAddValue}
                  className="bg-[#C9A24A] hover:bg-[#B8943F] text-white rounded-xl text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Nilai
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {(formData.values || []).map((val, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-2 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700">Nilai Inti #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveValue(idx)}
                        className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus Nilai Inti"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Input
                      value={val.title}
                      onChange={(e) => {
                        const updated = [...formData.values];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        setFormData({ ...formData, values: updated });
                      }}
                      placeholder="Judul Nilai"
                      className="h-8 text-xs font-bold text-gray-900 bg-white rounded-lg"
                    />
                    <Textarea
                      value={val.description}
                      onChange={(e) => {
                        const updated = [...formData.values];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        setFormData({ ...formData, values: updated });
                      }}
                      placeholder="Deskripsi nilai..."
                      rows={2}
                      className="text-xs bg-white rounded-lg resize-none"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Photo & Badge */}
          <div className="space-y-6">
            <Card className="border border-[#C9A24A]/20 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50/50 to-transparent border-b border-amber-100/60 pb-4">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C9A24A]" />
                  Foto Fasilitas Klinik (WebP)
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Foto klinik yang mendampingi cerita kami.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-b from-[#FAF8F5] to-gray-100 aspect-[6/5] flex items-center justify-center group">
                  {storyImagePreview ? (
                    <img
                      src={storyImagePreview}
                      alt="Fasilitas Klinik Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Belum ada foto</p>
                    </div>
                  )}

                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-xs font-semibold">Ganti Foto Klinik</span>
                    <span className="text-[10px] text-gray-200">Otomatis WebP (Anti-blur)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-2 border-t border-gray-100 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                    <Award className="w-4 h-4 text-[#C9A24A]" />
                    Badge Penghargaan Melayang
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-600">Gelar/Badge</label>
                      <Input
                        value={formData.badge_title}
                        onChange={(e) => setFormData({ ...formData, badge_title: e.target.value })}
                        placeholder="Top"
                        className="h-8 text-xs font-bold rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-600">Keterangan</label>
                      <Input
                        value={formData.badge_subtitle}
                        onChange={(e) => setFormData({ ...formData, badge_subtitle: e.target.value })}
                        placeholder="Dental Clinic in Jakarta"
                        className="h-8 text-xs rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:opacity-90 text-white font-semibold rounded-xl py-3 shadow-lg shadow-[#C9A24A]/20 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Menyimpan Perubahan..." : "Simpan Halaman Tentang"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      ) : (
        /* Live Preview Mode */
        <div className="space-y-8">
          {/* Hero Preview */}
          <div className="bg-gradient-to-br from-[#FAF8F5] via-white to-amber-50/40 rounded-3xl p-8 sm:p-12 border border-[#C9A24A]/20 shadow-md text-center max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#2C2416]">
              {formData.hero_title}
            </h1>
            <p className="text-sm sm:text-base text-[#5C5546] leading-relaxed max-w-2xl mx-auto">
              {formData.hero_subtitle}
            </p>
          </div>

          {/* Story Preview */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-md max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
            <div className="relative">
              <div className="rounded-3xl overflow-hidden aspect-[6/5] bg-gray-100 shadow-xl">
                <img
                  src={storyImagePreview || "/about/tentang3.webp"}
                  alt="Klinik Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-[#C9A24A]/20 flex items-center gap-3">
                <div className="w-12 h-12 bg-[#C9A24A] rounded-xl flex items-center justify-center text-white font-bold">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xl font-bold text-[#2C2416]">{formData.badge_title}</p>
                  <p className="text-xs text-[#5C5546]">{formData.badge_subtitle}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="inline-block px-3.5 py-1 rounded-full bg-amber-100 text-[#C9A24A] text-xs font-bold">
                {formData.story_tag}
              </div>
              <h2 className="text-2xl font-bold text-[#2C2416]">
                {formData.story_title}
              </h2>
              <div className="space-y-3 text-xs sm:text-sm text-[#5C5546] leading-relaxed">
                {(formData.story_paragraphs || []).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Preview */}
          <div className="bg-amber-50/40 rounded-3xl p-8 border border-amber-200/50 max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {(formData.stats || []).map((s, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-bold text-[#C9A24A]">{s.value}</p>
                <p className="text-sm font-bold text-[#2C2416]">{s.label}</p>
                <p className="text-xs text-[#5C5546]">{s.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
