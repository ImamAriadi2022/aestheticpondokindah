import { useState, useEffect, useMemo } from "react";
import { Button } from "@/shared/ui/button";
import {
  Plus,
  Edit2,
  Trash2,
  HelpCircle,
  Loader2,
  Check,
  X,
  Layers,
  Sparkles,
  Filter,
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
import { PageHeader } from "@/shared/ui/PageHeader";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";

export default function FaqsManagePage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
        message: "Tidak dapat memuat daftar FAQ dari database.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [search]);

  // Extract unique categories
  const categories = useMemo(() => {
    const list = Array.from(new Set(faqs.map((f) => f.category || "Umum"))).filter(Boolean);
    return ["all", ...list];
  }, [faqs]);

  // Filtered FAQs by category
  const filteredFaqs = useMemo(() => {
    if (selectedCategory === "all") return faqs;
    return faqs.filter((f) => (f.category || "Umum").toLowerCase() === selectedCategory.toLowerCase());
  }, [faqs, selectedCategory]);

  const handleSave = async (data: Partial<FaqItem>) => {
    try {
      if (editingFaq) {
        await updateAdminFaq(editingFaq.id, data);
        toast({ title: "Berhasil", message: "FAQ berhasil diperbarui di database." });
      } else {
        await createAdminFaq(data);
        toast({ title: "Berhasil", message: "FAQ baru berhasil ditambahkan ke database." });
      }
      fetchFaqs();
    } catch {
      toast({
        title: "Gagal Menyimpan",
        message: "Terjadi kesalahan saat menyimpan FAQ ke server.",
        variant: "error",
      });
      throw new Error();
    }
  };

  const handleToggleStatus = async (faq: FaqItem) => {
    const nextStatus = !faq.is_active;
    try {
      await updateAdminFaq(faq.id, {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        sort_order: faq.sort_order,
        is_active: nextStatus,
      });
      toast({
        title: "Status Diperbarui",
        message: `FAQ "${faq.question.slice(0, 30)}..." kini ${nextStatus ? "Aktif" : "Non-aktif"}.`,
        variant: "success",
      });
      setFaqs((prev) =>
        prev.map((item) => (item.id === faq.id ? { ...item, is_active: nextStatus } : item))
      );
    } catch {
      toast({
        title: "Gagal",
        message: "Gagal mengubah status aktif FAQ.",
        variant: "error",
      });
    }
  };

  const handleDelete = async (id: number | string, question: string) => {
    if (!confirm(`Hapus pertanyaan FAQ "${question}"? Tindakan ini permanen.`)) return;
    try {
      await deleteAdminFaq(id);
      toast({ title: "Berhasil", message: "FAQ berhasil dihapus dari database." });
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
    <div className="space-y-5">
      <PageHeader
        title="Pusat Bantuan & FAQ"
        actions={
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari pertanyaan atau jawaban FAQ..."
            />
            {categories.length > 2 && (
              <FilterDropdown
                value={selectedCategory}
                onChange={setSelectedCategory}
                icon={Filter}
                labelPrefix="Kategori"
                options={categories.map((c) => ({
                  value: c,
                  label: c === "all" ? "Semua Kategori" : c,
                }))}
              />
            )}
            <Button
              onClick={() => {
                setEditingFaq(null);
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold rounded-xl h-9 px-4 text-xs shadow-xs cursor-pointer justify-center"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Tambah Pertanyaan
            </Button>
          </>
        }
      />

      {/* FAQs Card List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin" />
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-10 text-center text-xs text-[#8A7B6B]">
          {search
            ? "Tidak ada pertanyaan FAQ yang cocok dengan pencarian."
            : "Belum ada data FAQ tersimpan di database. Klik tombol 'Tambah Pertanyaan FAQ' di atas untuk membuat."}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-xs overflow-hidden divide-y divide-[#F0E6D3]">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="p-4 sm:p-5 hover:bg-[#FAF8F5]/60 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FAF5EA] border border-[#F0E6D3] flex items-center justify-center text-[#B8943F] font-bold shrink-0 mt-0.5">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-semibold text-[#8C6B1C]">
                          {faq.category || "Umum"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(faq)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all border ${
                            faq.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                          }`}
                          title="Klik untuk mengubah status aktif di website"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              faq.is_active ? "bg-emerald-500" : "bg-stone-400"
                            }`}
                          />
                          {faq.is_active ? "Aktif" : "Non-aktif"}
                        </button>
                        {faq.sort_order !== undefined && faq.sort_order > 0 && (
                          <span className="text-[10px] text-[#8A7B6B] font-mono">
                            Urutan: #{faq.sort_order}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-[#4A3F35] leading-snug">
                        {faq.question}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-[#B8943F] hover:bg-[#FAF4E8] rounded-lg cursor-pointer"
                        title="Edit Pertanyaan & Jawaban FAQ"
                        onClick={() => {
                          setEditingFaq(faq);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Hapus FAQ"
                        onClick={() => handleDelete(faq.id, faq.question)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2.5 bg-[#FAF8F5] p-3 rounded-xl border border-[#F0E6D3]/70">
                    <p className="text-xs text-[#5C5546] leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
