import { useState, useEffect } from "react";
import {
  fetchAdminHome,
  updateAdminHome,
  type HomeContentData,
  DEFAULT_HOME_CONTENT,
} from "../services/etalaseService";
import { compressImageFileToWebPFile } from "@/core/utils/imageCompressor";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { toast } from "@/shared/ui/toast";
import {
  LayoutTemplate,
  Save,
  RotateCcw,
  ExternalLink,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  MessageCircle,
  Eye,
  CheckCircle2,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

export default function EditBerandaPage() {
  const [formData, setFormData] = useState<HomeContentData>(DEFAULT_HOME_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "preview">("content");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [aboutImage1Preview, setAboutImage1Preview] = useState<string>("");
  const [aboutImage2Preview, setAboutImage2Preview] = useState<string>("");
  const [newServiceItem, setNewServiceItem] = useState("");
  const [newAboutPoint, setNewAboutPoint] = useState("");

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminHome();
      setFormData(data);
      setImagePreview(data.hero_image || DEFAULT_HOME_CONTENT.hero_image);
      setAboutImage1Preview(data.about_image1 || DEFAULT_HOME_CONTENT.about_image1 || "/about/tentang1.webp");
      setAboutImage2Preview(data.about_image2 || DEFAULT_HOME_CONTENT.about_image2 || "/about/tentang2.webp");
    } catch {
      toast({
        title: "Gagal Mengambil Data",
        message: "Menggunakan pengaturan default beranda.",
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
        setImagePreview(base64);
        setFormData((prev) => ({ ...prev, hero_image: base64 }));
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

  const handleAboutImage1Change = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const webpFile = await compressImageFileToWebPFile(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.85 });
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setAboutImage1Preview(base64);
        setFormData((prev) => ({ ...prev, about_image1: base64 }));
      };
      reader.readAsDataURL(webpFile);
      toast({
        title: "Foto Ruangan 1 Dimuat",
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

  const handleAboutImage2Change = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const webpFile = await compressImageFileToWebPFile(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.85 });
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setAboutImage2Preview(base64);
        setFormData((prev) => ({ ...prev, about_image2: base64 }));
      };
      reader.readAsDataURL(webpFile);
      toast({
        title: "Foto Ruangan 2 Dimuat",
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

  const handleAddServiceItem = () => {
    if (!newServiceItem.trim()) return;
    setFormData((prev) => ({
      ...prev,
      floating_services: [...(prev.floating_services || []), newServiceItem.trim()],
    }));
    setNewServiceItem("");
  };

  const handleRemoveServiceItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      floating_services: prev.floating_services.filter((_, i) => i !== index),
    }));
  };

  const handleAddAboutPoint = () => {
    if (!newAboutPoint.trim()) return;
    setFormData((prev) => ({
      ...prev,
      about_points: [...(prev.about_points || []), newAboutPoint.trim()],
    }));
    setNewAboutPoint("");
  };

  const handleRemoveAboutPoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      about_points: (prev.about_points || []).filter((_, i) => i !== index),
    }));
  };

  const handleResetToDefault = () => {
    if (window.confirm("Apakah Anda yakin ingin mengembalikan seluruh konten Beranda ke pengaturan standar klinik?")) {
      setFormData(DEFAULT_HOME_CONTENT);
      setImagePreview(DEFAULT_HOME_CONTENT.hero_image);
      setAboutImage1Preview(DEFAULT_HOME_CONTENT.about_image1 || "/about/tentang1.webp");
      setAboutImage2Preview(DEFAULT_HOME_CONTENT.about_image2 || "/about/tentang2.webp");
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
      const res = await updateAdminHome(formData);
      toast({
        title: "Berhasil Disimpan",
        message: res.message || "Konten beranda berhasil diperbarui dan langsung tayang di website publik.",
        variant: "success",
      });
      if (res.home) {
        setFormData(res.home);
        if (res.home.hero_image) setImagePreview(res.home.hero_image);
        if (res.home.about_image1) setAboutImage1Preview(res.home.about_image1);
        if (res.home.about_image2) setAboutImage2Preview(res.home.about_image2);
      }
    } catch {
      toast({
        title: "Gagal Menyimpan",
        message: "Terjadi kesalahan saat menyimpan perubahan beranda.",
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
              <LayoutTemplate className="w-8 h-8 text-[#C9A24A]" />
              Edit Halaman Beranda (Landing Page)
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl">
              Sesuaikan teks headline, kalimat promosi, foto banner dokter, dan kartu layanan floating pada halaman beranda utama website tanpa perlu coding.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <a
              href="/#/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/10"
            >
              <ExternalLink className="w-4 h-4" />
              Buka Beranda Publik
            </a>
            <Button
              type="button"
              variant="outline"
              onClick={handleResetToDefault}
              className="bg-transparent border-red-400/40 text-red-300 hover:bg-red-950/40 hover:text-red-200 text-xs rounded-xl px-4 py-2.5 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Default
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:opacity-90 text-white font-semibold text-xs rounded-xl px-5 py-2.5 shadow-lg shadow-[#C9A24A]/20 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto no-scrollbar">
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
          Live Preview Beranda
        </button>
      </div>

      {activeTab === "content" ? (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Hero Headline & Copywriting */}
            <Card className="border border-[#C9A24A]/20 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50/50 to-transparent border-b border-amber-100/60 pb-4">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C9A24A]" />
                  1. Hero Headline & Copywriting
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Teks utama yang pertama kali dilihat pasien saat membuka website.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tagline Atas (Kategori/Nama Klinik)
                  </label>
                  <Input
                    value={formData.hero_tagline}
                    onChange={(e) => setFormData({ ...formData, hero_tagline: e.target.value })}
                    placeholder="Aesthetic Pondok Indah Dental Clinic"
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Headline Baris 1
                    </label>
                    <Input
                      value={formData.hero_headline_line1}
                      onChange={(e) => setFormData({ ...formData, hero_headline_line1: e.target.value })}
                      placeholder="The solution to"
                      className="rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Headline Baris 2
                    </label>
                    <Input
                      value={formData.hero_headline_line2}
                      onChange={(e) => setFormData({ ...formData, hero_headline_line2: e.target.value })}
                      placeholder="brighten your"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Kata Sorotan Emas (Gradient)
                    </label>
                    <Input
                      value={formData.hero_headline_highlight}
                      onChange={(e) => setFormData({ ...formData, hero_headline_highlight: e.target.value })}
                      placeholder="smile"
                      className="rounded-xl font-bold text-[#C9A24A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Sub-Headline Bold
                    </label>
                    <Input
                      value={formData.hero_subheadline}
                      onChange={(e) => setFormData({ ...formData, hero_subheadline: e.target.value })}
                      placeholder="Smile Confidently with Veneers!"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Teks Rating & Bukti Sosial
                    </label>
                    <Input
                      value={formData.hero_rating_text}
                      onChange={(e) => setFormData({ ...formData, hero_rating_text: e.target.value })}
                      placeholder="180+ Satisfied Customer"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Deskripsi Ringkas Klinik
                  </label>
                  <Textarea
                    value={formData.hero_description}
                    onChange={(e) => setFormData({ ...formData, hero_description: e.target.value })}
                    placeholder="Professional and Trusted Aesthetic Dentistry"
                    rows={2}
                    className="rounded-xl resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Promo Highlight & Buttons */}
            <Card className="border border-[#C9A24A]/20 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50/50 to-transparent border-b border-amber-100/60 pb-4">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C9A24A]" />
                  2. Banner Promo Sorotan & Tombol Aksi (CTA)
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Kustomisasi kalimat promo bulanan dan tautan WhatsApp klinik.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Teks Badge Promo Sorotan (Kuning Emas)
                  </label>
                  <Input
                    value={formData.hero_promo_badge}
                    onChange={(e) => setFormData({ ...formData, hero_promo_badge: e.target.value })}
                    placeholder="Get 10% Off When You Consult for Veneers This Month!"
                    className="rounded-xl bg-amber-50/60 border-amber-200 text-amber-950 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Label Tombol WhatsApp
                    </label>
                    <Input
                      value={formData.cta_whatsapp_text}
                      onChange={(e) => setFormData({ ...formData, cta_whatsapp_text: e.target.value })}
                      placeholder="Konsultasi WhatsApp"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Link WhatsApp Tujuan (URL/Nomor)
                    </label>
                    <Input
                      value={formData.cta_whatsapp_url}
                      onChange={(e) => setFormData({ ...formData, cta_whatsapp_url: e.target.value })}
                      placeholder="https://wa.me/6281990114949"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Floating Services Card */}
            <Card className="border border-[#C9A24A]/20 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50/50 to-transparent border-b border-amber-100/60 pb-4">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C9A24A]" />
                  3. Kartu Layanan Melayang (Floating Services Card)
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Daftar poin layanan unggulan yang muncul pada kartu melayang di samping foto dokter.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Judul Kartu Floating
                  </label>
                  <Input
                    value={formData.floating_services_title}
                    onChange={(e) => setFormData({ ...formData, floating_services_title: e.target.value })}
                    placeholder="Our Services Include:"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Daftar Poin Layanan
                  </label>
                  <div className="space-y-2 mb-3">
                    {(formData.floating_services || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="w-2 h-2 rounded-full bg-[#C9A24A] ml-2 flex-shrink-0" />
                        <Input
                          value={item}
                          onChange={(e) => {
                            const updated = [...formData.floating_services];
                            updated[idx] = e.target.value;
                            setFormData({ ...formData, floating_services: updated });
                          }}
                          className="h-8 text-xs bg-transparent border-0 focus-visible:ring-0 shadow-none font-medium text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveServiceItem(idx)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Hapus Layanan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      value={newServiceItem}
                      onChange={(e) => setNewServiceItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddServiceItem();
                        }
                      }}
                      placeholder="Tambah poin layanan baru..."
                      className="rounded-xl text-xs"
                    />
                    <Button
                      type="button"
                      onClick={handleAddServiceItem}
                      className="bg-[#C9A24A] hover:bg-[#B8943F] text-white rounded-xl text-xs px-4"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Tambah
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: About Us Section (15 Years of Expertise) */}
            <Card className="border border-[#C9A24A]/20 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50/50 to-transparent border-b border-amber-100/60 pb-4">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C9A24A]" />
                  4. Bagian "About Us" Beranda (15 Years of Expertise)
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Kustomisasi teks tentang kami, poin keunggulan, dan foto fasilitas klinik pada halaman beranda.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tag/Badge Atas
                    </label>
                    <Input
                      value={formData.about_tag || ""}
                      onChange={(e) => setFormData({ ...formData, about_tag: e.target.value })}
                      placeholder="ABOUT US"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Headline Baris 1
                    </label>
                    <Input
                      value={formData.about_title_line1 || ""}
                      onChange={(e) => setFormData({ ...formData, about_title_line1: e.target.value })}
                      placeholder="15 Years of Expertise"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Headline Baris 2
                    </label>
                    <Input
                      value={formData.about_title_line2 || ""}
                      onChange={(e) => setFormData({ ...formData, about_title_line2: e.target.value })}
                      placeholder="in Dental Care"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Deskripsi Ringkas Tentang Kami
                  </label>
                  <Textarea
                    value={formData.about_description || ""}
                    onChange={(e) => setFormData({ ...formData, about_description: e.target.value })}
                    placeholder="Kami menghadirkan pengalaman perawatan gigi yang nyaman, modern, dan aman dengan tim dokter profesional."
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>

                {/* About Points Checklist */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Daftar Poin Keunggulan / Checklist
                  </label>
                  <div className="space-y-2 mb-3">
                    {(formData.about_points || []).map((point, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-[#C9A24A] ml-2 flex-shrink-0" />
                        <Input
                          value={point}
                          onChange={(e) => {
                            const updated = [...(formData.about_points || [])];
                            updated[idx] = e.target.value;
                            setFormData({ ...formData, about_points: updated });
                          }}
                          className="h-8 text-xs bg-transparent border-0 focus-visible:ring-0 shadow-none font-medium text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAboutPoint(idx)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Hapus Poin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      value={newAboutPoint}
                      onChange={(e) => setNewAboutPoint(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddAboutPoint();
                        }
                      }}
                      placeholder="Tambah poin keunggulan baru..."
                      className="rounded-xl text-xs"
                    />
                    <Button
                      type="button"
                      onClick={handleAddAboutPoint}
                      className="bg-[#C9A24A] hover:bg-[#B8943F] text-white rounded-xl text-xs px-4 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Tambah
                    </Button>
                  </div>
                </div>

                {/* Button CTA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Label Tombol Aksi
                    </label>
                    <Input
                      value={formData.about_cta_text || ""}
                      onChange={(e) => setFormData({ ...formData, about_cta_text: e.target.value })}
                      placeholder="Learn More"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Link Tombol Aksi (Halaman / URL)
                    </label>
                    <Input
                      value={formData.about_cta_link || ""}
                      onChange={(e) => setFormData({ ...formData, about_cta_link: e.target.value })}
                      placeholder="/about"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Hero & About Photos & Actions */}
          <div className="space-y-6">
            {/* Action Save Button */}
            <Card className="border border-[#C9A24A]/20 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:opacity-90 text-white font-semibold rounded-xl py-3 shadow-lg shadow-[#C9A24A]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Menyimpan Perubahan..." : "Simpan Seluruh Beranda"}
                </Button>
              </CardContent>
            </Card>

            {/* Photo Hero Banner */}
            <Card className="border border-[#C9A24A]/20 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50/50 to-transparent border-b border-amber-100/60 pb-4">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C9A24A]" />
                  Foto Banner Dokter (WebP)
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Foto dokter utama yang tampil di banner beranda.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-b from-[#FAF8F5] to-gray-100 aspect-[4/5] flex items-center justify-center group">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Hero Dokter Preview"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500">Belum ada foto</p>
                    </div>
                  )}

                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-xs font-semibold">Ganti Foto Dokter</span>
                    <span className="text-[10px] text-gray-200">Otomatis WebP (Anti-blur)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <span>Format: PNG/JPG/WebP</span>
                  <span>Maks: 1920x1920</span>
                </div>
              </CardContent>
            </Card>

            {/* Photos About Us Section */}
            <Card className="border border-[#C9A24A]/20 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-50/50 to-transparent border-b border-amber-100/60 pb-4">
                <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#C9A24A]" />
                  Foto Bagian "About Us"
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  Dua foto fasilitas & dokter untuk bagian About Us beranda.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Photo 1 */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Foto Ruang Klinik / Dokter (Besar)
                  </label>
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 h-36 flex items-center justify-center group mb-1">
                    {aboutImage1Preview ? (
                      <img
                        src={aboutImage1Preview}
                        alt="About 1"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-gray-400">Belum ada foto 1</div>
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs font-semibold">Ganti Foto 1</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAboutImage1Change}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Photo 2 */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Foto Dokter / Perawatan (Kecil)
                  </label>
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 h-32 flex items-center justify-center group mb-1">
                    {aboutImage2Preview ? (
                      <img
                        src={aboutImage2Preview}
                        alt="About 2"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-gray-400">Belum ada foto 2</div>
                    )}
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs font-semibold">Ganti Foto 2</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAboutImage2Change}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      ) : (
        /* Live Preview Mode */
        <div className="space-y-10">
          {/* Hero Live Preview */}
          <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-10 border border-[#C9A24A]/20 shadow-xl overflow-hidden">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
              {/* Left Texts */}
              <div className="space-y-4">
                <div className="text-sm font-semibold tracking-wide text-[#5C5546]">
                  {formData.hero_tagline}
                </div>

                <h1 className="text-3xl sm:text-5xl font-bold text-[#2C2416] leading-tight">
                  {formData.hero_headline_line1}{" "}
                  <span className="block">{formData.hero_headline_line2}</span>
                  <span className="block bg-gradient-to-r from-[#C9A24A] to-[#E8C547] bg-clip-text text-transparent">
                    {formData.hero_headline_highlight}
                  </span>
                </h1>

                <div className="space-y-1">
                  <p className="text-lg font-bold text-[#2C2416]">
                    {formData.hero_subheadline}
                  </p>
                  <p className="text-sm text-[#5C5546]">
                    {formData.hero_description}
                  </p>
                </div>

                <div className="inline-block px-4 py-2 rounded-xl bg-[#F4E9CD] text-[#7A5B15] text-xs font-semibold border border-[#E3D3A8]">
                  {formData.hero_promo_badge}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
                    <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white" />
                    <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white" />
                  </div>
                  <span className="text-xs font-medium text-[#5C5546]">{formData.hero_rating_text}</span>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <Button className="bg-[#C9A24A] text-white rounded-full px-6 py-2.5 text-xs font-semibold shadow-md">
                    {formData.booking_button_text}
                  </Button>
                  <a
                    href={formData.cta_whatsapp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full border border-[#C9A24A] text-[#C9A24A] text-xs font-semibold hover:bg-[#C9A24A]/10 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {formData.cta_whatsapp_text}
                  </a>
                </div>
              </div>

              {/* Right Photo & Floating Card */}
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-amber-100/50 shadow-2xl border border-white">
                  <img
                    src={imagePreview || "/dokter/drg. Yulita Dora.webp"}
                    alt="Doctor Hero"
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Floating Card */}
                <div className="absolute -bottom-6 left-6 right-6 sm:right-auto sm:w-72 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-[#C9A24A]/20">
                  <p className="text-xs font-bold text-[#2C2416] mb-2">
                    {formData.floating_services_title}
                  </p>
                  <div className="space-y-1.5">
                    {(formData.floating_services || []).map((srv, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-[#5C5546]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C9A24A]" />
                        <span>{srv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Us Live Preview */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#C9A24A]/20 shadow-xl overflow-hidden">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
              {/* Left Images */}
              <div className="relative">
                <div className="grid grid-cols-[1.25fr_1fr] gap-4 items-end">
                  <div className="rounded-2xl overflow-hidden bg-amber-50 border border-amber-100 shadow-lg">
                    <img
                      src={aboutImage1Preview || "/about/tentang1.webp"}
                      alt="About 1"
                      className="w-full h-[240px] sm:h-[300px] object-cover"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden bg-amber-50 border border-amber-100 shadow-lg">
                    <img
                      src={aboutImage2Preview || "/about/tentang2.webp"}
                      alt="About 2"
                      className="w-full h-[180px] sm:h-[230px] object-cover"
                    />
                  </div>
                </div>
                <div className="absolute -bottom-4 left-6 bg-white rounded-xl border border-gray-200 shadow-md px-4 py-2 flex items-center gap-2">
                  <img src="/logo/logo-vertikal.webp" alt="Logo" className="h-8 w-auto object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo/Logo-vertikal.png'; }} />
                </div>
              </div>

              {/* Right Texts */}
              <div className="space-y-4">
                <div className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider">
                  {formData.about_tag || "ABOUT US"}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C2416] leading-tight">
                  {formData.about_title_line1 || "15 Years of Expertise"}
                  {formData.about_title_line2 && (
                    <span className="block">{formData.about_title_line2}</span>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-[#5C5546] leading-relaxed">
                  {formData.about_description || "Kami menghadirkan pengalaman perawatan gigi yang nyaman..."}
                </p>

                <div className="space-y-2 pt-1">
                  {(formData.about_points || []).map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#2C2416]">
                      <CheckCircle2 className="w-4 h-4 text-[#8C6B1C] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Button className="bg-[#C9A24A] text-white rounded-xl px-5 py-2 text-xs font-semibold shadow-md">
                    {formData.about_cta_text || "Learn More"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
