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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-charcoal">
            {service ? "Edit Layanan Klinik" : "Tambah Layanan Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nama Layanan *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="cth: Dental Whitening"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Slug URL (Opsional)</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="cth: dental-whitening"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kategori Booking *</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
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
              <Label className="text-xs font-semibold">Estimasi Biaya / Harga (Rp) *</Label>
              <Input
                type="number"
                min="0"
                step="10000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="cth: 1500000"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Estimasi Durasi Tindakan *</Label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="cth: 60–90 mnt"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">URL / Jalur Gambar</Label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="cth: /layanan/Dental Whitening.png"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Urutan (Sort)</Label>
                <Input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status</Label>
                <select
                  value={isActive ? "active" : "inactive"}
                  onChange={(e) => setIsActive(e.target.value === "active")}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="active">Aktif Tampil</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Ringkasan Intro Singkat *</Label>
            <Textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="Deskripsi singkat mengenai tindakan medis ini..."
              rows={2}
              required
            />
          </div>

          {/* Paragraphs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Paragraf Penjelasan Detail</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setParagraphs([...paragraphs, ""])}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Paragraf
              </Button>
            </div>
            {paragraphs.map((p, idx) => (
              <div key={idx} className="flex gap-2">
                <Textarea
                  value={p}
                  onChange={(e) => {
                    const next = [...paragraphs];
                    next[idx] = e.target.value;
                    setParagraphs(next);
                  }}
                  rows={2}
                  placeholder={`Paragraf ke-${idx + 1}...`}
                />
                {paragraphs.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => setParagraphs(paragraphs.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Tahapan Prosedur Medis (Steps)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSteps([...steps, ""])}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Tahap
              </Button>
            </div>
            {steps.map((s, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={s}
                  onChange={(e) => {
                    const next = [...steps];
                    next[idx] = e.target.value;
                    setSteps(next);
                  }}
                  placeholder={`Tahap ${idx + 1}: cth. Pemeriksaan awal gigi...`}
                />
                {steps.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-gold hover:opacity-90 text-white"
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
