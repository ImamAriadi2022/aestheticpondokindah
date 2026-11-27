import { useState, useEffect, useMemo } from "react";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import {
  Plus,
  Edit2,
  Trash2,
  Stethoscope,
  Loader2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
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
import { PageHeader } from "@/shared/ui/PageHeader";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";

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
    const timer = setTimeout(() => {
      fetchServices();
    }, 300);
    return () => clearTimeout(timer);
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
    <div className="space-y-5">
      <PageHeader
        title="Katalog Layanan & Prosedur Klinik"
        actions={
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari tindakan atau prosedur gigi..."
            />
            {categories.length > 1 && (
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
                setEditingService(null);
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-bold rounded-xl h-9 px-4 text-xs shadow-xs cursor-pointer justify-center"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Tambah Layanan
            </Button>
          </>
        }
      />

      {/* Services List Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#C9A24A] animate-spin" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#F0E6D3] p-10 text-center text-xs text-[#8A7B6B]">
          Tidak ada layanan gigi yang sesuai dengan pencarian.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-[#F0E6D3] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#FAF8F5] border-b border-[#F0E6D3]">
                    <TableHead className="font-bold text-[#3D332A] py-3.5 pl-6 text-xs">Layanan</TableHead>
                    <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Kategori</TableHead>
                    <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Harga</TableHead>
                    <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Durasi</TableHead>
                    <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Status</TableHead>
                    <TableHead className="font-bold text-[#3D332A] py-3.5 pr-6 text-right text-xs">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedServices.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-[#FDFBF7] transition-colors border-b border-[#F5ECE0]"
                    >
                      {/* Layanan */}
                      <TableCell className="py-3.5 pl-6">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#3D332A] max-w-[260px] truncate">
                          <Stethoscope className="w-3.5 h-3.5 text-[#B8943F] shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </div>
                      </TableCell>

                      {/* Kategori */}
                      <TableCell className="py-3.5">
                        <span className="text-xs font-semibold text-[#5C4D3C]">
                          {item.category || "Umum"}
                        </span>
                      </TableCell>

                      {/* Harga */}
                      <TableCell className="py-3.5">
                        <span className="text-xs font-semibold text-[#3D332A]">
                          {item.price_formatted || `Rp ${Number(item.price || 0).toLocaleString("id-ID")}`}
                        </span>
                      </TableCell>

                      {/* Durasi */}
                      <TableCell className="py-3.5">
                        <span className="text-xs font-medium text-[#5C4D3C]">
                          {item.duration || "-"}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                            item.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.is_active ? "bg-emerald-500" : "bg-stone-400"
                            }`}
                          />
                          {item.is_active ? "Aktif" : "Non-aktif"}
                        </button>
                      </TableCell>

                      {/* Aksi */}
                      <TableCell className="py-3.5 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingService(item);
                              setIsModalOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-[#B8943F] hover:bg-[#FAF4E8] rounded-xl border border-[#E8D4A2]/60 transition-all shadow-2xs inline-flex items-center justify-center cursor-pointer"
                            title="Edit Layanan"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#B8943F]" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id, item.title)}
                            className="h-7 w-7 p-0 text-[#B8943F] hover:bg-[#FAF4E8] rounded-xl border border-[#E8D4A2]/60 transition-all shadow-2xs inline-flex items-center justify-center cursor-pointer"
                            title="Hapus Layanan"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#B8943F]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
