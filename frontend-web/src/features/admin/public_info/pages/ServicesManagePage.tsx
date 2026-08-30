import { useState, useEffect, useMemo } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Stethoscope,
  Loader2,
  Check,
  X,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/shared/ui/toast";
import {
  getAdminServices,
  createAdminService,
  updateAdminService,
  deleteAdminService,
  type ClinicServiceItem,
} from "../services/publicInfoAdminApi";
import ServiceEditModal from "../components/ServiceEditModal";

const ITEMS_PER_PAGE = 24;

export default function ServicesManagePage() {
  const [services, setServices] = useState<ClinicServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ClinicServiceItem | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getAdminServices(search);
      setServices(data || []);
    } catch {
      toast({
        title: "Gagal Memuat",
        message: "Tidak dapat memuat daftar layanan klinik.",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [search]);

  // Extract unique categories
  const categories = useMemo(() => {
    const list = Array.from(new Set(services.map((s) => s.category || "Umum"))).filter(Boolean);
    return ["all", ...list];
  }, [services]);

  // Filter by category
  const filteredServices = useMemo(() => {
    let result = services;
    if (selectedCategory !== "all") {
      result = result.filter(
        (s) => (s.category || "Umum").toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    return result;
  }, [services, selectedCategory]);

  // Reset to page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE) || 1;
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredServices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredServices, currentPage]);

  const handleSave = async (data: Partial<ClinicServiceItem>) => {
    try {
      if (editingService) {
        await updateAdminService(editingService.id, data);
        toast({ title: "Berhasil", message: "Layanan klinik berhasil diperbarui." });
      } else {
        await createAdminService(data);
        toast({ title: "Berhasil", message: "Layanan baru berhasil ditambahkan." });
      }
      fetchServices();
    } catch {
      toast({
        title: "Gagal Menyimpan",
        message: "Terjadi kesalahan saat menyimpan data layanan.",
        variant: "error",
      });
      throw new Error();
    }
  };

  const handleToggleStatus = async (item: ClinicServiceItem) => {
    const nextStatus = !item.is_active;
    try {
      await updateAdminService(item.id, {
        ...item,
        is_active: nextStatus,
      });
      toast({
        title: "Status Diperbarui",
        message: `Layanan "${item.title.slice(0, 30)}..." kini ${nextStatus ? "Aktif" : "Non-aktif"}.`,
        variant: "success",
      });
      setServices((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, is_active: nextStatus } : s))
      );
    } catch {
      toast({
        title: "Gagal",
        message: "Gagal mengubah status aktif layanan.",
        variant: "error",
      });
    }
  };

  const handleDelete = async (id: number | string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus layanan "${title}"?`)) return;
    try {
      await deleteAdminService(id);
      toast({ title: "Berhasil", message: `Layanan "${title}" telah dihapus.` });
      fetchServices();
    } catch {
      toast({
        title: "Gagal Menghapus",
        message: "Tidak dapat menghapus layanan ini.",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-bold text-[#4A3F35]">Katalog Layanan & Prosedur Klinik</h1>
          <p className="text-xs sm:text-sm text-[#8A7B6B]">
            Kelola {services.length} tindakan perawatan gigi, estimasi biaya medis, tahapan prosedur, dan penanggung jawab dokter yang tersambung langsung ke database.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingService(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold rounded-xl h-11 px-5 shadow-md shadow-[#C9A24A]/20 cursor-pointer justify-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Layanan Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#F0E6D3] shadow-xs">
          <p className="text-[11px] font-bold text-[#8A7B6B] uppercase tracking-wider">Total Layanan</p>
          <p className="text-xl font-black text-[#4A3F35] mt-1">{services.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#F0E6D3] shadow-xs">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Layanan Aktif</p>
          <p className="text-xl font-black text-emerald-600 mt-1">
            {services.filter((s) => s.is_active).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#F0E6D3] shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[11px] font-bold text-[#8C6B1C] uppercase tracking-wider">Kategori Spesialis</p>
          <p className="text-xl font-black text-[#8C6B1C] mt-1">{categories.length - 1}</p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A7B6B]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tindakan atau prosedur gigi (cth: Veneer, Scaling, Orto)..."
            className="pl-10 h-11 rounded-xl bg-white border-[#F0E6D3] focus:border-[#C9A24A] text-sm"
          />
        </div>

        {/* Categories Filter Tabs */}
        {categories.length > 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                  selectedCategory === cat
                    ? "bg-[#C9A24A] text-white border-[#C9A24A] shadow-xs"
                    : "bg-white text-[#5C5546] border-[#F0E6D3] hover:bg-[#FAF8F5]"
                }`}
              >
                {cat === "all" ? "Semua Kategori" : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Services List Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-10 text-center text-xs text-[#8A7B6B]">
          Tidak ada layanan gigi yang sesuai dengan pencarian.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedServices.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-[#F0E6D3] shadow-xs hover:shadow-md transition-all p-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF5EA] text-[#8C6B1C] border border-[#EADBBD]">
                          {item.category || "Umum"}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all border ${
                            item.is_active
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                              : "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
                          }`}
                          title="Klik untuk mengubah status aktif"
                        >
                          {item.is_active ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-500" />}
                          {item.is_active ? "Aktif" : "Non-aktif"}
                        </button>
                      </div>
                      <h3 className="text-sm font-bold text-[#4A3F35] leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F0E6D3]/60">
                    <span className="font-extrabold text-[#8C6B1C]">
                      {item.price_formatted || `Rp ${Number(item.price || 0).toLocaleString("id-ID")}`}
                    </span>
                    {item.duration && (
                      <span className="text-[10px] text-[#8A7B6B] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#F0E6D3]">
                        ⏱️ {item.duration}
                      </span>
                    )}
                  </div>

                  {item.intro && (
                    <p className="text-xs text-[#5C5546] line-clamp-2 leading-relaxed">
                      {item.intro}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 pt-3 mt-3 border-t border-[#F0E6D3]">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2.5 text-xs text-[#B8943F] hover:bg-[#FAF4E8] rounded-lg cursor-pointer"
                    onClick={() => {
                      setEditingService(item);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    onClick={() => handleDelete(item.id, item.title)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#F0E6D3] shadow-xs mt-4">
              <p className="text-xs text-[#8A7B6B]">
                Menampilkan <span className="font-bold text-[#4A3F35]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> -{" "}
                <span className="font-bold text-[#4A3F35]">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredServices.length)}
                </span>{" "}
                dari <span className="font-bold text-[#4A3F35]">{filteredServices.length}</span> layanan
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-9 px-3 rounded-xl border-[#F0E6D3] text-xs font-bold"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
                </Button>
                <span className="text-xs font-bold text-[#4A3F35] px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-9 px-3 rounded-xl border-[#F0E6D3] text-xs font-bold"
                >
                  Berikutnya <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit/Create Modal */}
      <ServiceEditModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        service={editingService}
        onSave={handleSave}
      />
    </div>
  );
}
