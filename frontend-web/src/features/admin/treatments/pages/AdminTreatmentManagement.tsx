import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Tag,
  Stethoscope,
  RefreshCw,
  Eye,
  EyeOff,
  Layers,
  ArrowUpDown,
  AlertCircle,
  Building2,
  Filter,
  Sparkles,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import {
  fetchAdminTreatments,
  updateAdminTreatment,
  deleteAdminTreatment,
  type ClinicTreatmentItem,
} from "../services/treatmentApi";
import TreatmentEditorModal from "../components/TreatmentEditorModal";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";
import { usePageRefresh } from "@/core/events/refreshEvents";

export default function AdminTreatmentManagement() {
  const [treatments, setTreatments] = useState<ClinicTreatmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  // Modal states
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<ClinicTreatmentItem | null>(null);

  // Delete state
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTreatments = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminTreatments();
      setTreatments(data || []);
    } catch (err: any) {
      toast({
        title: "Gagal Memuat Layanan Klinik",
        message: err.message || "Terjadi kesalahan saat memuat data layanan",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTreatments();
  }, []);

  usePageRefresh(loadTreatments);

  // Quick toggle active status
  const handleToggleActive = async (item: ClinicTreatmentItem) => {
    try {
      const newStatus = !item.is_active;
      await updateAdminTreatment(item.id, { is_active: newStatus });
      setTreatments((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_active: newStatus } : s))
      );
      toast({
        title: newStatus ? "Layanan Diaktifkan" : "Layanan Dinonaktifkan",
        message: `Layanan "${item.title}" ${
          newStatus ? "sekarang muncul" : "tidak akan muncul"
        } di formulir reservasi pasien & tamu.`,
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Gagal Mengubah Status",
        message: err.message || "Terjadi kendala saat memperbarui status",
        variant: "error",
      });
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteAdminTreatment(deletingId);
      setTreatments((prev) => prev.filter((s) => s.id !== deletingId));
      toast({
        title: "Layanan Dihapus",
        message: "Layanan berhasil dihapus dari database klinik.",
        variant: "success",
      });
      setDeletingId(null);
    } catch (err: any) {
      toast({
        title: "Gagal Menghapus",
        message: err.message || "Gagal menghapus layanan",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats
  const totalCount = treatments.length;
  const activeCount = treatments.filter((s) => s.is_active).length;
  const inactiveCount = totalCount - activeCount;
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    treatments.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [treatments]);

  // Filtered Treatments
  const filteredTreatments = useMemo(() => {
    return treatments.filter((s) => {
      const searchLower = searchQuery.toLowerCase();
      const titleMatch = (s.title || "").toLowerCase().includes(searchLower);
      const catMatch = (s.category || "").toLowerCase().includes(searchLower);
      const introMatch = (s.intro || "").toLowerCase().includes(searchLower);
      const matchesSearch = !searchQuery || titleMatch || catMatch || introMatch;

      const matchesCat = categoryFilter === "Semua" || s.category === categoryFilter;
      const matchesStatus =
        statusFilter === "Semua" ||
        (statusFilter === "Aktif" && s.is_active) ||
        (statusFilter === "Nonaktif" && !s.is_active);

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [treatments, searchQuery, categoryFilter, statusFilter]);

  return (
    <div className="space-y-5 text-left">
      <PageHeader
        title="Layanan Klinik (Treatments)"
        actions={
          <>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari nama layanan klinik..."
            />
            <FilterDropdown
              value={categoryFilter}
              onChange={setCategoryFilter}
              labelPrefix="Kategori"
              options={["Semua", ...categoriesList].map((c) => ({
                value: c,
                label: c === "Semua" ? "Semua Kategori" : c,
              }))}
            />
            <FilterDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              icon={Filter}
              labelPrefix="Status"
              options={[
                { value: "Semua", label: "Semua Status" },
                { value: "Aktif", label: "Aktif" },
                { value: "Nonaktif", label: "Non-Aktif" },
              ]}
            />
            <Button
              onClick={() => {
                setSelectedTreatment(null);
                setEditorOpen(true);
              }}
              className="h-9 px-4 rounded-xl bg-[#8C6B1C] hover:bg-[#735614] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Layanan</span>
            </Button>
          </>
        }
      />

      {/* Main Treatment Table */}

      {/* Services Table Card */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#8A7B6B] space-y-2">
            <div className="w-8 h-8 border-2 border-[#C9A24A] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Memuat daftar layanan klinik dari database...</p>
          </div>
        ) : filteredTreatments.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#8A7B6B] space-y-2">
            <Sparkles className="w-8 h-8 text-[#C9A24A] mx-auto opacity-50" />
            <p className="font-semibold text-[#3D332A]">Belum ada layanan yang sesuai kriteria pencarian.</p>
            <p>Silakan sesuaikan kata kunci atau tambah layanan baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF8F5] border-b border-[#EDE5D6] text-[#7A6E60] font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Layanan & Spesialisasi</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Estimasi Biaya</th>
                  <th className="py-3.5 px-4">Durasi</th>
                  <th className="py-3.5 px-4 text-center">Status Form Reservasi</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5ECE0]">
                {filteredTreatments.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#FDFBF7] transition-colors group"
                  >
                    <td className="py-4 px-4 text-center text-[#8A7B6B] font-mono">
                      {index + 1}
                    </td>

                    {/* Title & Specialist Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#FAF5EA] border border-[#EADBBD] overflow-hidden flex items-center justify-center shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Sparkles className="w-5 h-5 text-[#8C6B1C]" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#3D332A] text-sm">{item.title}</p>
                          <p className="text-[11px] text-[#7A6E60] line-clamp-1 max-w-sm">
                            {item.intro}
                          </p>
                          {item.specialist_label && (
                            <p className="text-[10px] font-semibold text-[#8C6B1C] flex items-center gap-1">
                              <Stethoscope className="w-3 3-3" />
                              {item.specialist_label}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF5EA] border border-[#EADBBD] text-[11px] font-semibold text-[#8C6B1C]">
                        <Tag className="w-3 h-3" />
                        {item.category || "General"}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 font-bold text-[#3D332A]">
                      {item.price ? (
                        <span>Rp {Number(item.price).toLocaleString("id-ID")}</span>
                      ) : (
                        <span className="text-[#8A7B6B] font-normal italic">Konsultasi Dokter</span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-4 text-[#6B5E4F]">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-[#B8943F]" />
                        {item.duration || "30 - 45 Menit"}
                      </span>
                    </td>

                    {/* Status Badge & Quick Toggle */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                        }`}
                        title="Klik untuk mengubah status ketersediaan di form booking"
                      >
                        {item.is_active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-gray-500" />
                            <span>Non-Aktif</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedTreatment(item);
                            setEditorOpen(true);
                          }}
                          className="h-8 w-8 p-0 rounded-lg text-[#8C6B1C] hover:bg-[#FAF5EA]"
                          title="Edit Layanan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeletingId(item.id)}
                          className="h-8 w-8 p-0 rounded-lg text-rose-600 hover:bg-rose-50"
                          title="Hapus Layanan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <TreatmentEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        treatment={selectedTreatment}
        onSaved={loadTreatments}
      />

      {/* Delete Confirmation Modal */}
      {deletingId &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#EADBBD] shadow-2xl space-y-4 text-left">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="text-base font-bold text-[#3D332A]">Hapus Layanan Klinik?</h4>
                <p className="text-xs text-[#7A6E60]">
                  Layanan yang dihapus tidak akan muncul lagi pada formulir booking pasien dan katalog layanan klinik.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeletingId(null)}
                  className="flex-1 rounded-xl text-xs font-semibold py-2.5 h-auto border-[#D9D0BC]"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 h-auto shadow-md"
                >
                  {isDeleting ? "Menghapus..." : "Ya, Hapus Layanan"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
