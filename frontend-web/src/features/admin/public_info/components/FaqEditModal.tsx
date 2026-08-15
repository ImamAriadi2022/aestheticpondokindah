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
import { Loader2 } from "lucide-react";
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-charcoal">
            {faq ? "Edit Pertanyaan FAQ" : "Tambah FAQ Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Pertanyaan (Question) *</Label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="cth: Bagaimana cara melakukan reservasi?"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Jawaban (Answer) *</Label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Tuliskan jawaban yang informatif dan ramah untuk pasien..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kategori</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="cth: Reservasi, Pembayaran"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Urutan</Label>
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
              {faq ? "Simpan Perubahan" : "Tambah FAQ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
