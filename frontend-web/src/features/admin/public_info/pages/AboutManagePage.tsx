import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "@/shared/ui/toast";
import {
  getAdminAbout,
  updateAdminAbout,
  type ClinicAboutProfile,
} from "../services/publicInfoAdminApi";

export default function AboutManagePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [about, setAbout] = useState<ClinicAboutProfile>({
    hero_title: "",
    hero_subtitle: "",
    story_title: "",
    story_paragraphs: [],
    stats: [],
    values: [],
  });

  const fetchAbout = async () => {
    setLoading(true);
    try {
      const data = await getAdminAbout();
      if (data) setAbout(data);
    } catch {
      toast({
        title: "Gagal Memuat",
        message: "Tidak dapat memuat profil klinik.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminAbout(about);
      toast({ title: "Berhasil", message: "Profil dan nilai klinik berhasil diperbarui." });
    } catch {
      toast({
        title: "Gagal Menyimpan",
        message: "Terjadi kesalahan saat menyimpan profil.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-charcoal">Profil & Nilai Klinik (About Us)</h1>
          <p className="text-sm text-brand-warm-gray">
            Kelola judul hero, cerita sejarah klinik, angka statistik pencapaian, dan nilai-nilai keunggulan pelayanan.
          </p>
        </div>
        <Button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto bg-[#C9A24A] hover:bg-[#B8943F] text-white font-bold rounded-xl h-10 px-5 shadow-xs cursor-pointer justify-center"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan Perubahan
        </Button>
      </div>

      {/* Hero Section */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="text-base font-bold text-brand-charcoal">
            Bagian Header (Hero Section)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Judul Utama (Hero Title)</Label>
            <Input
              value={about.hero_title}
              onChange={(e) => setAbout({ ...about, hero_title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Subjudul / Deskripsi Pembuka</Label>
            <Textarea
              value={about.hero_subtitle}
              onChange={(e) => setAbout({ ...about, hero_subtitle: e.target.value })}
              rows={3}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Story Section */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-brand-charcoal">
              Cerita & Sejarah Klinik
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                setAbout({
                  ...about,
                  story_paragraphs: [...about.story_paragraphs, ""],
                })
              }
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Paragraf
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Judul Cerita</Label>
            <Input
              value={about.story_title}
              onChange={(e) => setAbout({ ...about, story_title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Paragraf Narasi</Label>
            {about.story_paragraphs.map((para, idx) => (
              <div key={idx} className="flex gap-2">
                <Textarea
                  value={para}
                  onChange={(e) => {
                    const next = [...about.story_paragraphs];
                    next[idx] = e.target.value;
                    setAbout({ ...about, story_paragraphs: next });
                  }}
                  rows={2}
                />
                {about.story_paragraphs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-rose-500 hover:bg-rose-50"
                    onClick={() =>
                      setAbout({
                        ...about,
                        story_paragraphs: about.story_paragraphs.filter((_, i) => i !== idx),
                      })
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-brand-charcoal">
              Statistik Pencapaian Klinik
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                setAbout({
                  ...about,
                  stats: [...about.stats, { value: "10+", label: "Label", sublabel: "Keterangan" }],
                })
              }
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Angka
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {about.stats.map((st, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-muted/40 rounded-xl items-center">
              <Input
                placeholder="Angka (cth: 15+)"
                value={st.value}
                onChange={(e) => {
                  const next = [...about.stats];
                  next[idx].value = e.target.value;
                  setAbout({ ...about, stats: next });
                }}
              />
              <Input
                placeholder="Label (cth: Tahun Pengalaman)"
                value={st.label}
                onChange={(e) => {
                  const next = [...about.stats];
                  next[idx].label = e.target.value;
                  setAbout({ ...about, stats: next });
                }}
              />
              <div className="flex gap-1">
                <Input
                  placeholder="Sublabel"
                  value={st.sublabel}
                  onChange={(e) => {
                    const next = [...about.stats];
                    next[idx].sublabel = e.target.value;
                    setAbout({ ...about, stats: next });
                  }}
                />
                {about.stats.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-rose-500 hover:bg-rose-50"
                    onClick={() =>
                      setAbout({
                        ...about,
                        stats: about.stats.filter((_, i) => i !== idx),
                      })
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Values Section */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-brand-charcoal">
              Nilai-Nilai Keunggulan Pelayanan
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                setAbout({
                  ...about,
                  values: [...about.values, { title: "Nilai Baru", description: "Deskripsi nilai pelayanan..." }],
                })
              }
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Nilai
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {about.values.map((vl, idx) => (
            <div key={idx} className="p-3 bg-muted/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Input
                  placeholder="Judul Nilai (cth: Patient-Centered Excellence)"
                  value={vl.title}
                  onChange={(e) => {
                    const next = [...about.values];
                    next[idx].title = e.target.value;
                    setAbout({ ...about, values: next });
                  }}
                  className="font-semibold"
                />
                {about.values.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-rose-500 hover:bg-rose-50"
                    onClick={() =>
                      setAbout({
                        ...about,
                        values: about.values.filter((_, i) => i !== idx),
                      })
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="Penjelasan nilai..."
                value={vl.description}
                onChange={(e) => {
                  const next = [...about.values];
                  next[idx].description = e.target.value;
                  setAbout({ ...about, values: next });
                }}
                rows={2}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </form>
  );
}
