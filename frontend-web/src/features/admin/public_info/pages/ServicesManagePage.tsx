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
  Stethoscope,
  Loader2,
  CheckCircle,
  XCircle,
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

export default function ServicesManagePage() {
  const [services, setServices] = useState<ClinicServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-charcoal">Katalog Layanan Klinik</h1>
          <p className="text-sm text-brand-warm-gray">
            Kelola daftar tindakan perawatan, penjelasan medis, tahapan prosedur, dan penanggung jawab dokter.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingService(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto bg-[#C9A24A] hover:bg-[#B8943F] text-white font-bold rounded-xl h-10 px-5 shadow-xs cursor-pointer justify-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Tambah Layanan
        </Button>
      </div>

      {/* Filter & Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari layanan gigi..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Services List Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Belum ada data layanan klinik yang sesuai.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((item) => (
            <Card
              key={item.id}
              className="rounded-2xl border-border shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-gold/10 text-brand-gold flex items-center justify-center font-bold text-xs">
                      #{item.sort_order ?? item.id}
                    </div>
                    <CardTitle className="text-base font-bold text-brand-charcoal line-clamp-1">
                      {item.title}
                    </CardTitle>
                  </div>
                  {item.is_active ? (
                    <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px]">
                      <CheckCircle className="w-3 h-3 mr-1" /> Aktif
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-rose-700 bg-rose-50 border-rose-200 text-[10px]">
                      <XCircle className="w-3 h-3 mr-1" /> Nonaktif
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF5EA] text-[#8C6B1C] border border-[#EADBBD]">
                        {item.category.toUpperCase()}
                      </span>
                    )}
                    {item.duration && (
                      <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                        ⏱️ {item.duration}
                      </span>
                    )}
                    {item.price && (
                      <span className="text-[11px] font-bold text-[#8C6B1C] ml-auto">
                        {item.price_formatted || `Rp ${Number(item.price).toLocaleString("id-ID")}`}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-brand-warm-gray line-clamp-2 leading-relaxed">
                    {item.intro}
                  </p>
                </div>

                {item.specialist_names && item.specialist_names.length > 0 && (
                  <div className="text-[11px] bg-muted/40 p-2 rounded-lg text-muted-foreground flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                    <span className="truncate">
                      {item.specialist_label || "Spesialis"}: {item.specialist_names.join(", ")}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-xs"
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
                    className="h-8 px-2.5 text-xs text-rose-600 hover:bg-rose-50"
                    onClick={() => handleDelete(item.id, item.title)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
