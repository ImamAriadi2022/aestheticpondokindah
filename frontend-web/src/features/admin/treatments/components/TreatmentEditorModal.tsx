import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  DollarSign,
  Clock,
  Tag,
  FileText,
  Stethoscope,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/toast";
import {
  createAdminTreatment,
  updateAdminTreatment,
  type ClinicTreatmentItem,
} from "../services/treatmentApi";

interface TreatmentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  treatment: ClinicTreatmentItem | null;
  onSaved: () => void;
}

const CATEGORY_OPTIONS = [
  "Aesthetic Dentistry",
  "Restorative & Implants",
  "Orthodontics",
  "Pediatric Dentistry",
  "Periodontics & Gum Care",
  "Oral Surgery",
  "General Dental Care",
];

export default function TreatmentEditorModal({
  isOpen,
  onClose,
  treatment,
  onSaved,
}: TreatmentEditorModalProps) {
  const isEditing = Boolean(treatment);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Aesthetic Dentistry");
  const [price, setPrice] = useState<number | string>(500000);
  const [duration, setDuration] = useState("30 - 45 Menit");
  const [image, setImage] = useState("");
  const [intro, setIntro] = useState("");
  const [specialistLabel, setSpecialistLabel] = useState("");
  const [specialistNames, setSpecialistNames] = useState<string[]>([]);
  const [newSpecialistName, setNewSpecialistName] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (treatment) {
      setTitle(treatment.title || "");
      setCategory(treatment.category || "Aesthetic Dentistry");
      setPrice(treatment.price ?? 500000);
      setDuration(treatment.duration || "30 - 45 Menit");
      setImage(treatment.image || "");
      setIntro(treatment.intro || "");
      setSpecialistLabel(treatment.specialist_label || "");
      setSpecialistNames(Array.isArray(treatment.specialist_names) ? treatment.specialist_names : []);
      setSortOrder(treatment.sort_order ?? 0);
      setIsActive(treatment.is_active !== false);
    } else {
      setTitle("");
      setCategory("Aesthetic Dentistry");
      setPrice(500000);
      setDuration("30 - 45 Menit");
      setImage("");
      setIntro("");
      setSpecialistLabel("");
      setSpecialistNames([]);
      setSortOrder(0);
      setIsActive(true);
    }
  }, [treatment, isOpen]);

  const handleAddSpecialist = () => {
    if (!newSpecialistName.trim()) return;
    setSpecialistNames([...specialistNames, newSpecialistName.trim()]);
    setNewSpecialistName("");
  };

  const handleRemoveSpecialist = (idx: number) => {
    setSpecialistNames(specialistNames.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Form Belum Lengkap", message: "Nama layanan wajib diisi.", variant: "warning" });
      return;
    }
    if (!intro.trim()) {
      toast({ title: "Form Belum Lengkap", message: "Deskripsi singkat layanan wajib diisi.", variant: "warning" });
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<ClinicTreatmentItem> = {
        title: title.trim(),
        category,
        price: Number(price) || 0,
        duration: duration.trim(),
        image: image.trim() || null,
        intro: intro.trim(),
        specialist_label: specialistLabel.trim() || null,
        specialist_names: specialistNames.length > 0 ? specialistNames : null,
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      };

      if (isEditing && treatment) {
        await updateAdminTreatment(treatment.id, payload);
        toast({
          title: "Layanan Berhasil Diperbarui",
          message: `Layanan "${title}" berhasil disimpan ke database.`,
          variant: "success",
        });
      } else {
        await createAdminTreatment(payload);
        toast({
          title: "Layanan Berhasil Ditambahkan",
          message: `Layanan "${title}" telah aktif dan siap digunakan dalam alur reservasi.`,
          variant: "success",
        });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      toast({
        title: "Gagal Menyimpan",
        message: err.message || "Terjadi kesalahan saat menyimpan layanan",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-3xl bg-[#FAF8F5] border border-[#E8DFC8] shadow-2xl text-left">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-[#E8DFC8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center border border-[#EADBBD] shadow-inner">
              <Sparkles className="w-5 h-5 text-[#8C6B1C]" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold text-[#3D332A]">
                {isEditing ? "Edit Layanan Klinik" : "Tambah Layanan Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#8A7B6B]">
                Kelola tindakan perawatan gigi dan ketersediaannya di form reservasi pasien & guest.
              </DialogDescription>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5ECE0] hover:bg-[#EADBBD] text-[#4A3F35] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#8C6B1C]" />
                Nama Layanan / Treatment <span className="text-rose-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Dental Whitening, Veneer Premium..."
                className="h-10 text-xs bg-white border-[#E8DFC8] rounded-xl font-semibold text-[#3D332A]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#8C6B1C]" />
                Kategori Layanan
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 bg-white border border-[#E8DFC8] rounded-xl px-3 text-xs font-semibold text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Price & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#8C6B1C]" />
                Estimasi Biaya / Harga (Rp)
              </label>
              <Input
                type="number"
                min="0"
                step="10000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Contoh: 750000"
                className="h-10 text-xs bg-white border-[#E8DFC8] rounded-xl font-semibold text-[#3D332A]"
              />
              <p className="text-[10px] text-[#8A7B6B]">
                {price ? `Tampilan: Rp ${Number(price).toLocaleString("id-ID")}` : "Belum diatur"}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#8C6B1C]" />
                Estimasi Durasi Tindakan
              </label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Contoh: 30 - 45 Menit, 60 Menit..."
                className="h-10 text-xs bg-white border-[#E8DFC8] rounded-xl font-semibold text-[#3D332A]"
              />
            </div>
          </div>

          {/* 3. Description / Intro */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#8C6B1C]" />
              Deskripsi Singkat & Penjelasan Layanan <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              rows={3}
              placeholder="Jelaskan manfaat, indikasi, dan prosedur perawatan ini secara ringkas dan mudah dipahami pasien..."
              className="w-full bg-white border border-[#E8DFC8] rounded-xl p-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A]"
              required
            />
          </div>

          {/* 4. Specialist Team Config */}
          <div className="bg-white p-4 rounded-2xl border border-[#EDE5D6] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#8C6B1C]" />
                Dokter Spesialis Penanggung Jawab Layanan
              </label>
              <span className="text-[10px] text-[#8A7B6B]">Opsional</span>
            </div>

            <Input
              value={specialistLabel}
              onChange={(e) => setSpecialistLabel(e.target.value)}
              placeholder="Label Spesialis (contoh: Dokter Spesialis Konservasi Gigi / Sp.KG)"
              className="h-9 text-xs bg-[#FAF8F5] border-[#E8DFC8] rounded-xl"
            />

            <div className="flex gap-2">
              <Input
                value={newSpecialistName}
                onChange={(e) => setNewSpecialistName(e.target.value)}
                placeholder="Tambah nama dokter (contoh: drg. Yulita Dora, Sp.KG)"
                className="h-9 text-xs bg-[#FAF8F5] border-[#E8DFC8] rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSpecialist();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddSpecialist}
                size="sm"
                className="h-9 px-3 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah
              </Button>
            </div>

            {specialistNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {specialistNames.map((name, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF5EA] border border-[#EADBBD] text-xs font-medium text-[#4A3F35]"
                  >
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialist(idx)}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 5. Image URL & Sort Order & Visibility Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#3D332A] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#8C6B1C]" />
                URL Gambar / Ilustrasi Layanan
              </label>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="Contoh: /layanan/Dental Whitening.png"
                className="h-10 text-xs bg-white border-[#E8DFC8] rounded-xl text-[#3D332A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#3D332A] block">
                Urutan Tampil (Sort Order)
              </label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                placeholder="0"
                className="h-10 text-xs bg-white border-[#E8DFC8] rounded-xl font-bold text-[#3D332A]"
              />
            </div>
          </div>

          {/* 6. Active Status Switch Card */}
          <div className="p-3.5 bg-[#FAF8F5] border border-[#E8DFC8] rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#3D332A]">Status Ketersediaan di Form Reservasi</p>
              <p className="text-[11px] text-[#7A6E60]">
                {isActive
                  ? "Layanan ini aktif dan dapat dipilih oleh pasien/guest saat melakukan booking."
                  : "Layanan ini dinonaktifkan sementara dan tidak muncul di daftar pilihan booking."}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C9A24A]"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#E8DFC8] flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 px-5 rounded-xl border-[#D9D0BC] text-[#5C5546] hover:bg-[#FAF8F5] text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-10 px-6 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? "Simpan Perubahan" : "Simpan Layanan"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
