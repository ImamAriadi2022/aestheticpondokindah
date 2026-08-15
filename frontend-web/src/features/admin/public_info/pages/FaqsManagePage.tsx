import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  HelpCircle,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "@/shared/ui/toast";
import {
  getAdminFaqs,
  createAdminFaq,
  updateAdminFaq,
  deleteAdminFaq,
  type FaqItem,
} from "../services/publicInfoAdminApi";
import FaqEditModal from "../components/FaqEditModal";

export default function FaqsManagePage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const data = await getAdminFaqs(search);
      setFaqs(data || []);
    } catch {
      toast({
        title: "Gagal Memuat",
        message: "Tidak dapat memuat daftar FAQ.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [search]);

  const handleSave = async (data: Partial<FaqItem>) => {
    try {
      if (editingFaq) {
        await updateAdminFaq(editingFaq.id, data);
        toast({ title: "Berhasil", message: "FAQ berhasil diperbarui." });
      } else {
        await createAdminFaq(data);
        toast({ title: "Berhasil", message: "FAQ baru berhasil ditambahkan." });
      }
      fetchFaqs();
    } catch {
      toast({
        title: "Gagal Menyimpan",
        message: "Terjadi kesalahan saat menyimpan FAQ.",
        variant: "error",
      });
      throw new Error();
    }
  };

  const handleDelete = async (id: number | string, question: string) => {
    if (!confirm(`Hapus pertanyaan FAQ "${question}"?`)) return;
    try {
      await deleteAdminFaq(id);
      toast({ title: "Berhasil", message: "FAQ berhasil dihapus." });
      fetchFaqs();
    } catch {
      toast({
        title: "Gagal Menghapus",
        message: "Tidak dapat menghapus FAQ.",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-charcoal">Pusat Bantuan & FAQ</h1>
          <p className="text-sm text-brand-warm-gray">
            Kelola daftar pertanyaan dan jawaban umum yang tampil pada menu Bantuan untuk pasien dan tamu.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingFaq(null);
            setIsModalOpen(true);
          }}
          className="bg-brand-gold hover:opacity-90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah FAQ
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pertanyaan FAQ..."
            className="pl-9"
          />
        </div>
      </div>

      {/* FAQs List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
        </div>
      ) : faqs.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Belum ada data FAQ yang tersimpan.
        </Card>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.id} className="rounded-2xl border-border shadow-xs hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {faq.category || "Umum"}
                        </Badge>
                        {faq.is_active ? (
                          <span className="inline-flex items-center text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-2.5 h-2.5 mr-1" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                            <XCircle className="w-2.5 h-2.5 mr-1" /> Nonaktif
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-base font-bold text-brand-charcoal">
                        {faq.question}
                      </CardTitle>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs"
                      onClick={() => {
                        setEditingFaq(faq);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDelete(faq.id, faq.question)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-brand-warm-gray leading-relaxed pl-10 whitespace-pre-wrap">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      <FaqEditModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        faq={editingFaq}
        onSave={handleSave}
      />
    </div>
  );
}
