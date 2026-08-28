import { useState, useMemo, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { toast } from "@/shared/ui/toast";
import { Plus, Edit2, Trash2, Tag, Percent, Image as ImageIcon, Search, Check, X, Globe, Users, Crown, Sparkles } from "lucide-react";
import { API_BASE, getStorageUrl } from "@/core/api/apiConfig";
import PromoEditorModal, { PROMO_TARGET_OPTIONS } from "../components/PromoEditorModal";

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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 whitespace-nowrap">
          <Globe className="w-3 h-3" /> Publik & Guest
        </span>
      );
    }
    if (target === "all_members" || target === "bronze") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 whitespace-nowrap">
          <Users className="w-3 h-3" /> Semua Member
        </span>
      );
    }
    if (target === "gold") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#8C6B1C] bg-[#FAF5EA] border border-[#EADBBD] whitespace-nowrap">
          <Crown className="w-3 h-3" /> Khusus Gold
        </span>
      );
    }
    if (target === "platinum") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 whitespace-nowrap">
          <Sparkles className="w-3 h-3" /> Khusus Platinum VIP
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-stone-700 bg-stone-100 border border-stone-200 whitespace-nowrap">
        {targetTier || "Publik"}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#4A3F35]">Daftar Promo & Penawaran Diskon</h2>
          <p className="text-sm text-[#8A7B6B] mt-1">Kelola banner promo klinik, diskon khusus member, dan penawaran musiman.</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="w-full sm:w-auto bg-gradient-to-r from-[#C9A24A] to-[#B8943F] hover:from-[#B8943F] hover:to-[#A67F3A] text-white font-semibold rounded-xl shadow-md shadow-[#C9A24A]/20 cursor-pointer justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Promo Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
              <Tag className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Total Promo</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#4A3F35]">{apiPromos.length}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Percent className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Promo Aktif</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600">{activeCount}</p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-[#F0E6D3] p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F]">
              <Globe className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#8A7B6B]">Target Segmentasi</p>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#4A3F35] mt-1">Publik, Member & VIP</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {(["All", "Active", "Inactive"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                filterStatus === st
                  ? "bg-[#C9A24A] text-white shadow-xs"
                  : "bg-[#FAF8F5] text-[#7A6E60] hover:bg-[#F5ECE0] border border-[#E8DFC8]/60"
              }`}
            >
              {st === "All" ? "Semua Promo" : st === "Active" ? "Promo Aktif" : "Non-Aktif"}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89F91] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari promo..."
            className="w-full h-9 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl pl-10 pr-3 text-xs text-[#3D332A] focus:outline-hidden focus:ring-2 focus:ring-[#C9A24A] focus:bg-white transition-all font-medium"
          />
        </div>
      </div>

      {/* Promo Data Table with horizontal scroll */}
      <div className="bg-white rounded-2xl border border-[#F0E6D3] overflow-x-auto shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#FAF8F5]">
              <TableHead className="w-16">Banner</TableHead>
              <TableHead>Judul Promo</TableHead>
              <TableHead>Target Audiens</TableHead>
              <TableHead>Teks Diskon</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
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
                  <TableRow key={promo.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <TableCell>
                      {promo.image_url || promo.image_path ? (
                        <img
                          src={getStorageUrl(promo.image_url || promo.image_path) || promo.image_url}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover border border-[#F0E6D3] shadow-2xs"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/layanan/Dental Whitening.webp"; }}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-[#FDF8F0] flex items-center justify-center text-[#B8943F] border border-[#F0E6D3]">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-bold text-[#4A3F35]">{promo.title}</p>
                      <p className="text-[10px] text-[#8A7B6B] line-clamp-1 mt-0.5">{promo.headline || promo.description}</p>
                    </TableCell>
                    <TableCell>
                      {getTargetBadge(promo.target_tier || promo.category)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                        {promo.discount_text || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(promo)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all border ${
                          isActive
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
                        }`}
                        title="Klik untuk mengubah status aktif"
                      >
                        {isActive ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-stone-500" />}
                        {isActive ? "🟢 Aktif" : "⚪ Non-aktif"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(promo)}
                        className="h-8 w-8 p-0 text-[#B8943F] hover:bg-[#FAF4E8] rounded-lg cursor-pointer"
                        title="Edit Promo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(promo.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Hapus Promo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
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
