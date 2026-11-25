import { useState, useMemo, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { toast } from "@/shared/ui/toast";
import { Plus, Edit2, Trash2, Tag, Percent, Image as ImageIcon, Check, X, Globe, Users, Crown, Sparkles, Filter } from "lucide-react";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";
import PromoEditorModal, { PROMO_TARGET_OPTIONS } from "../components/PromoEditorModal";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SearchInput } from "@/shared/ui/SearchInput";
import { FilterDropdown } from "@/shared/ui/FilterDropdown";

type Props = {
  token: string;
  apiPromos: any[];
  fetchApiPromos: () => Promise<void>;
};

export default function PromoPage({ token, apiPromos = [], fetchApiPromos }: Props) {
  const [selectedPromo, setSelectedPromo] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All");

  useEffect(() => {
    fetchApiPromos();
  }, []);

  const openCreateModal = () => {
    setSelectedPromo(null);
    setIsModalOpen(true);
  };

  const openEditModal = (promo: any) => {
    setSelectedPromo(promo);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (promo: any) => {
    const nextStatus = !Boolean(promo.is_active ?? promo.enabled);
    try {
      const formData = new FormData();
      formData.append("is_active", nextStatus ? "1" : "0");
      formData.append("_method", "PUT");

      const res = await fetch(`${API_BASE}/admin/promos/${promo.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        toast({
          title: "Status Promo Diperbarui",
          message: `Promo "${promo.title}" kini ${nextStatus ? "Aktif" : "Non-aktif"}.`,
          variant: "success",
        });
        await fetchApiPromos();
      }
    } catch (e) {
      toast({ title: "Gagal Mengubah Status", message: "Gagal memperbarui status promo", variant: "error" });
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus promo ini?")) return;
    try {
      const res = await fetch(`${API_BASE}/admin/promos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: "Berhasil", message: "Promo berhasil dihapus", variant: "success" });
        await fetchApiPromos();
      }
    } catch (e) {
      toast({ title: "Gagal", message: "Gagal menghapus promo", variant: "error" });
    }
  };

  const filtered = useMemo(() => {
    return apiPromos
      .filter((promo) => {
        const isActive = Boolean(promo.is_active ?? promo.enabled);
        if (filterStatus === "Active") return isActive;
        if (filterStatus === "Inactive") return !isActive;
        return true;
      })
      .filter((promo) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          (promo.title || "").toLowerCase().includes(q) ||
          (promo.headline || "").toLowerCase().includes(q) ||
          (promo.description || "").toLowerCase().includes(q) ||
          (promo.discount_text || "").toLowerCase().includes(q) ||
          (promo.target_tier || "").toLowerCase().includes(q)
        );
      });
  }, [apiPromos, filterStatus, search]);

  const activeCount = useMemo(() => apiPromos.filter((p) => Boolean(p.is_active ?? p.enabled)).length, [apiPromos]);

  const getTargetBadge = (targetTier?: string) => {
    const target = (targetTier || "").toLowerCase();
    if (target === "public") {
      return (
        <span className="text-xs font-medium text-[#5C4D3C] whitespace-nowrap">
          Publik & Guest
        </span>
      );
    }
    if (target === "all_members" || target === "bronze") {
      return (
        <span className="text-xs font-medium text-[#5C4D3C] whitespace-nowrap">
          Semua Member
        </span>
      );
    }
    if (target === "gold") {
      return (
        <span className="text-xs font-medium text-[#5C4D3C] whitespace-nowrap">
          Khusus Gold
        </span>
      );
    }
    if (target === "platinum") {
      return (
        <span className="text-xs font-medium text-[#5C4D3C] whitespace-nowrap">
          Khusus Platinum VIP
        </span>
      );
    }
    return (
      <span className="text-xs font-medium text-[#5C4D3C] whitespace-nowrap">
        {targetTier || "Publik"}
      </span>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <PageHeader
        title="Daftar Promo & Penawaran Diskon"
        actions={
          <>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari promo..."
            />
            <FilterDropdown
              value={filterStatus}
              onChange={(v) => setFilterStatus(v as any)}
              icon={Filter}
              labelPrefix="Status"
              options={[
                { value: "All", label: `Semua Promo (${apiPromos.length})` },
                { value: "Active", label: `Promo Aktif (${activeCount})` },
                { value: "Inactive", label: "Non-Aktif" },
              ]}
            />
            <Button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-xs h-9 text-xs cursor-pointer justify-center"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Tambah Promo
            </Button>
          </>
        }
      />

      {/* Promo Data Table with horizontal scroll */}
      <div className="bg-white rounded-3xl border border-[#F0E6D3] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#FAF8F5] border-b border-[#F0E6D3]">
                <TableHead className="font-bold text-[#3D332A] py-3.5 pl-6 text-xs w-16">Banner</TableHead>
                <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Judul Promo</TableHead>
                <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Target Audiens</TableHead>
                <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Teks Diskon</TableHead>
                <TableHead className="font-bold text-[#3D332A] py-3.5 text-xs">Status</TableHead>
                <TableHead className="font-bold text-[#3D332A] py-3.5 pr-6 text-right text-xs">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-[#8A7B6B]">
                    Tidak ada promo ditemukan. Klik "Tambah Promo Baru" di atas untuk membuat promo.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((promo) => {
                  const isActive = Boolean(promo.is_active ?? promo.enabled);
                  return (
                    <TableRow key={promo.id} className="hover:bg-[#FDFBF7] transition-colors border-b border-[#F5ECE0]">
                      <TableCell className="py-3.5 pl-6">
                        {promo.image_url || promo.image_path ? (
                          <img
                            src={getStorageUrl(promo.image_url || promo.image_path) || promo.image_url}
                            alt=""
                            className="w-11 h-11 rounded-xl object-cover border border-[#F0E6D3] shadow-2xs"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.webp"; }}
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F] border border-[#F0E6D3]">
                            <ImageIcon className="w-5 h-5 text-[#B8943F]" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <p className="text-xs font-bold text-[#3D332A]">{promo.title}</p>
                      </TableCell>
                      <TableCell className="py-3.5">
                        {getTargetBadge(promo.target_tier || promo.category)}
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="text-xs font-semibold text-[#3D332A]">
                          {promo.discount_text || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(promo)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-all ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
                          }`}
                          title="Klik untuk mengubah status aktif"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-stone-400"
                            }`}
                          />
                          {isActive ? "Aktif" : "Non-aktif"}
                        </button>
                      </TableCell>
                      <TableCell className="py-3.5 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditModal(promo)}
                            className="h-7 w-7 p-0 text-[#B8943F] hover:bg-[#FAF4E8] rounded-xl border border-[#E8D4A2]/60 transition-all shadow-2xs inline-flex items-center justify-center cursor-pointer"
                            title="Edit Promo"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#B8943F]" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(promo.id)}
                            className="h-7 w-7 p-0 text-[#B8943F] hover:bg-[#FAF4E8] rounded-xl border border-[#E8D4A2]/60 transition-all shadow-2xs inline-flex items-center justify-center cursor-pointer"
                            title="Hapus Promo"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#B8943F]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Dedicated Pop Up Modal for Create & Edit Promo */}
      <PromoEditorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        promo={selectedPromo}
        token={token}
        onSaved={fetchApiPromos}
      />
    </div>
  );
}
