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
import { Loader2, HelpCircle } from "lucide-react";
import { type FaqItem } from "../services/publicInfoAdminApi";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq: FaqItem | null;
  onSave: (data: Partial<FaqItem>) => Promise<void>;
}

export default function FaqEditModal({
  open,
  onOpenChange,
  faq,
  onSave,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("Umum");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (faq) {
      setQuestion(faq.question || "");
      setAnswer(faq.answer || "");
      setCategory(faq.category || "Umum");
      setSortOrder(faq.sort_order ?? 0);
      setIsActive(faq.is_active ?? true);
    } else {
      setQuestion("");
      setAnswer("");
      setCategory("Umum");
      setSortOrder(0);
      setIsActive(true);
    }
  }, [faq, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        question,
        answer,
        category,
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
      <DialogContent className="max-w-xl rounded-3xl border border-[#F0E6D3] bg-white p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF5EA] border border-[#F0E6D3] flex items-center justify-center text-[#B8943F] font-bold shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-[#4A3F35]">
                {faq ? "Edit Pertanyaan FAQ" : "Tambah FAQ Baru"}
              </DialogTitle>
              <p className="text-xs text-[#8A7B6B]">
                {faq ? "Perbarui isi tanya jawab yang tersimpan di database" : "Tambahkan tanya jawab baru untuk ditampilkan ke publik"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A3F35]">Pertanyaan (Question) *</Label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="cth: Bagaimana cara melakukan reservasi jadwal dokter?"
              className="h-11 rounded-xl bg-[#FAF8F5] border-[#F0E6D3] focus:border-[#C9A24A] text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#4A3F35]">Jawaban (Answer) *</Label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Tuliskan jawaban yang informatif, jelas, dan ramah untuk pasien..."
              rows={5}
              className="rounded-xl bg-[#FAF8F5] border-[#F0E6D3] focus:border-[#C9A24A] text-sm leading-relaxed"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#4A3F35]">Kategori</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="cth: Reservasi, Layanan"
                className="h-11 rounded-xl bg-[#FAF8F5] border-[#F0E6D3] focus:border-[#C9A24A] text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#4A3F35]">Urutan Tampil</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="h-11 rounded-xl bg-[#FAF8F5] border-[#F0E6D3] focus:border-[#C9A24A] text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#4A3F35]">Status Tampil</Label>
              <select
                value={isActive ? "active" : "inactive"}
                onChange={(e) => setIsActive(e.target.value === "active")}
                className="w-full h-11 px-3 rounded-xl border border-[#F0E6D3] bg-[#FAF8F5] text-sm font-semibold text-[#4A3F35] outline-none focus:border-[#C9A24A]"
              >
                <option value="active">🟢 Aktif Tampil</option>
                <option value="inactive">⚪ Nonaktif (Draf)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-[#F0E6D3] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl border-[#F0E6D3] text-[#4A3F35] hover:bg-[#FAF8F5] h-11 px-5 text-xs font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold rounded-xl h-11 px-6 shadow-md shadow-[#C9A24A]/20 cursor-pointer text-xs"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {faq ? "Simpan Perubahan" : "Tambah FAQ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
