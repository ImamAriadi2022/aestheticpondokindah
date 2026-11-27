import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { type ClinicServiceItem } from "../services/publicInfoAdminApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ClinicServiceItem | null;
  onSave: (data: Partial<ClinicServiceItem>) => Promise<void>;
}

export default function ServiceEditModal({
  open,
  onOpenChange,
  service,
  onSave,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Umum");
  const [price, setPrice] = useState<number>(500000);
  const [duration, setDuration] = useState("45–60 mnt");
  const [image, setImage] = useState("");
  const [intro, setIntro] = useState("");
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [generalDentists, setGeneralDentists] = useState<string[]>([]);
  const [specialistLabel, setSpecialistLabel] = useState("");
  const [specialistNames, setSpecialistNames] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (service) {
      setTitle(service.title || "");
      setSlug(service.slug || "");
      setCategory(service.category || "Umum");
      setPrice(service.price ?? 500000);
      setDuration(service.duration || "45–60 mnt");
      setImage(service.image || "");
      setIntro(service.intro || "");
      setParagraphs(service.paragraphs || [""]);
      setSteps(service.steps || [""]);
      setGeneralDentists(service.general_dentists || []);
      setSpecialistLabel(service.specialist_label || "");
      setSpecialistNames(service.specialist_names || []);
      setSortOrder(service.sort_order ?? 0);
      setIsActive(service.is_active ?? true);
    } else {
      setTitle("");
      setSlug("");
      setCategory("Umum");
      setPrice(500000);
      setDuration("45–60 mnt");
      setImage("");
      setIntro("");
      setParagraphs([""]);
      setSteps([""]);
      setGeneralDentists([]);
      setSpecialistLabel("");
      setSpecialistNames([]);
      setSortOrder(0);
      setIsActive(true);
    }
  }, [service, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        title,
        slug: slug || undefined,
        category,
        price: Number(price),
        duration,
        image: image || null,
        intro,
        paragraphs: paragraphs.filter((p) => p.trim().length > 0),
        steps: steps.filter((s) => s.trim().length > 0),
        general_dentists: generalDentists.filter((d) => d.trim().length > 0),
        specialist_label: specialistLabel || null,
        specialist_names: specialistNames.filter((s) => s.trim().length > 0),
        sort_order: Number(sortOrder),
        is_active: Boolean(isActive),
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[94vw] max-w-4xl p-0 overflow-hidden rounded-2xl border border-[#E8DFC8]/60 bg-[#FDFAF3] shadow-2xl">
        <DialogHeader className="px-6 py-5 border-b border-[#E8DFC8]/50 bg-white/60">
          <DialogTitle className="text-lg font-bold text-[#2D2A26] tracking-tight">
            {service ? "Edit Layanan Klinik" : "Tambah Layanan Baru"}
          </DialogTitle>
          <p className="text-xs text-[#7A756D]">
            Lengkapi rincian informasi layanan klinik, estimasi biaya, dan prosedur tindakan.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[calc(88vh-80px)]">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Informasi Dasar */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9C7A2E]">
                Informasi Dasar Layanan
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#4A453E]">Nama Layanan <span className="text-red-500">*</span></Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="cth: Dental Whitening"
                    required
                    className="h-10 rounded-lg border-[#DDD4C0] bg-white focus-visible:border-[#C9A24A] focus-visible:ring-1 focus-visible:ring-[#C9A24A]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#4A453E]">Slug URL <span className="text-[11px] font-normal text-[#8A847A]">(Opsional)</span></Label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="cth: dental-whitening"
                    className="h-10 rounded-lg border-[#DDD4C0] bg-white focus-visible:border-[#C9A24A] focus-visible:ring-1 focus-visible:ring-[#C9A24A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#4A453E]">Kategori Booking <span className="text-red-500">*</span></Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#DDD4C0] bg-white text-sm text-[#2D2A26] outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] transition-colors"
                  >
                    <option value="Estetik">Estetik</option>
                    <option value="Implan">Implan</option>
                    <option value="Ortodonti">Ortodonti</option>
                    <option value="Umum">Umum</option>
                    <option value="Bedah Mulut">Bedah Mulut</option>
                    <option value="Pediatrik">Pediatrik</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#4A453E]">Estimasi Biaya / Harga (Rp) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    min="0"
                    step="10000"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    placeholder="cth: 500000"
                    required
                    className="h-10 rounded-lg border-[#DDD4C0] bg-white focus-visible:border-[#C9A24A] focus-visible:ring-1 focus-visible:ring-[#C9A24A]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-[#4A453E]">Estimasi Durasi Tindakan <span className="text-red-500">*</span></Label>
                  <Input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="cth: 45–60 mnt"
                    required
                    className="h-10 rounded-lg border-[#DDD4C0] bg-white focus-visible:border-[#C9A24A] focus-visible:ring-1 focus-visible:ring-[#C9A24A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="space-y-1.5 md:col-span-6">
                  <Label className="text-xs font-semibold text-[#4A453E]">Gambar Layanan (Upload / URL)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={image.startsWith("data:image") ? "[Gambar siap diunggah]" : image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="cth: /layanan/Dental Whitening.webp"
                      className="h-10 rounded-lg border-[#DDD4C0] bg-white flex-1 focus-visible:border-[#C9A24A] focus-visible:ring-1 focus-visible:ring-[#C9A24A]"
                    />
                    <label className="inline-flex items-center justify-center px-3.5 h-10 rounded-lg border border-[#C9A24A] bg-[#FAF4E8] text-[#8A6B2B] text-xs font-semibold cursor-pointer hover:bg-[#F3E6CA] active:scale-[0.98] transition-all shrink-0">
                      Pilih File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === "string") {
                              setImage(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>
                  {image && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-white/70 border border-[#E8DFC8] rounded-lg w-fit">
                      <img
                        src={image}
                        alt="Preview layanan"
                        className="w-10 h-10 rounded-md object-cover border border-[#E8DFC8]"
                      />
                      <button
                        type="button"
                        onClick={() => setImage("")}
                        className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <Label className="text-xs font-semibold text-[#4A453E]">Urutan (Sort)</Label>
                  <Input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="h-10 rounded-lg border-[#DDD4C0] bg-white focus-visible:border-[#C9A24A] focus-visible:ring-1 focus-visible:ring-[#C9A24A]"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-3">
                  <Label className="text-xs font-semibold text-[#4A453E]">Status</Label>
                  <select
                    value={isActive ? "active" : "inactive"}
                    onChange={(e) => setIsActive(e.target.value === "active")}
                    className="w-full h-10 px-3 rounded-lg border border-[#DDD4C0] bg-white text-sm text-[#2D2A26] outline-none focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A] transition-colors"
                  >
                    <option value="active">Aktif Tampil</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-[#E8DFC8]/60 pt-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9C7A2E]">
                Deskripsi & Konten Layanan
              </h3>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#4A453E]">Ringkasan Intro Singkat <span className="text-red-500">*</span></Label>
                <Textarea
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  placeholder="Deskripsi singkat mengenai tindakan medis ini..."
                  rows={2}
                  required
                  className="rounded-lg border-[#DDD4C0] bg-white focus-visible:border-[#C9A24A] focus-visible:ring-1 focus-visible:ring-[#C9A24A]"
                />
              </div>

              {/* Paragraphs */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-[#4A453E]">Paragraf Penjelasan Detail</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs border-[#C9A24A]/40 text-[#8A6B2B] hover:bg-[#FAF4E8]"
                    onClick={() => setParagraphs([...paragraphs, ""])}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Paragraf
                  </Button>
                </div>
                <div className="space-y-2">
                  {paragraphs.map((p, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <Textarea
                        value={p}
                        onChange={(e) => {
                          const next = [...paragraphs];
                          next[idx] = e.target.value;
                          setParagraphs(next);
                        }}
                        rows={2}
                        placeholder={`Paragraf ke-${idx + 1}...`}
                        className="rounded-lg border-[#DDD4C0] bg-white flex-1 focus-visible:border-[#C9A24A] focus-visible:ring-1 focus-visible:ring-[#C9A24A]"
                      />
                      {paragraphs.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 text-red-500 hover:bg-red-50 shrink-0 rounded-lg"
                          onClick={() => setParagraphs(paragraphs.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-[#4A453E]">Tahapan Prosedur Medis (Steps)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs border-[#C9A24A]/40 text-[#8A6B2B] hover:bg-[#FAF4E8]"
                    onClick={() => setSteps([...steps, ""])}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Tahap
                  </Button>
                </div>
                <div className="space-y-2">
                  {steps.map((s, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#FAF4E8] text-[#8A6B2B] text-xs font-bold border border-[#E8DFC8] shrink-0">
                        {idx + 1}
                      </div>
                      <Input
                        value={s}
                        onChange={(e) => {
                          const next = [...steps];
                          next[idx] = e.target.value;
                          setSteps(next);
                        }}
                        placeholder={`cth: Pemeriksaan awal dan pembersihan karang gigi...`}
                        className="h-10 rounded-lg border-[#DDD4C0] bg-white flex-1 focus-visible:border-[#C9A24A] focus-visible:ring-1 focus-visible:ring-[#C9A24A]"
                      />
                      {steps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0 text-red-500 hover:bg-red-50 shrink-0 rounded-lg"
                          onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-[#E8DFC8]/60 bg-white/70 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-10 px-5 rounded-lg border-[#DDD4C0] text-[#4A453E] hover:bg-stone-50"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-10 px-6 rounded-lg bg-[#C9A24A] hover:bg-[#B38D38] text-white font-medium shadow-sm transition-all active:scale-[0.98]"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {service ? "Simpan Perubahan" : "Tambah Layanan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
