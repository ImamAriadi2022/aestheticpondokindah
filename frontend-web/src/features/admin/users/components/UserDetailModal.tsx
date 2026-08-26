import { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  Coins,
  Shield,
  Activity,
  Briefcase,
  Heart,
  Coffee,
  Cigarette,
  Clock,
  Sparkles,
  Edit2,
  Save,
  Loader2,
  KeyRound,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { toast } from "@/shared/ui/toast";
import { API_BASE } from "@/core/api/apiConfig";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
  onUpdated?: () => void;
}

export default function UserDetailModal({ isOpen, onClose, user, onUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    phone: "",
    membership_level: "bronze",
    membership_points: 0,
    gender: "",
    birthDate: "",
    bloodType: "",
    job: "",
    address: "",
    city: "",
    province: "",
  });

  // Sync form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || user.whatsapp || "",
        membership_level: user.membership_level || user.membership_tier || "bronze",
        membership_points: user.membership_points || 0,
        gender: user.gender || "-",
        birthDate: user.birthDate || user.birth_date || "-",
        bloodType: user.bloodType || user.blood_type || "-",
        job: user.job || "-",
        address: user.address || user.address_line || "-",
        city: user.city || user.domicile || "-",
        province: user.province || "-",
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("apident:token");
      const res = await fetch(`${API_BASE}/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          whatsapp: formData.phone,
          membership_level: formData.membership_level,
          membership_points: Number(formData.membership_points),
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal memperbarui data pengguna.");
      }

      toast.success("Data pengguna berhasil diperbarui.");
      setIsEditing(false);
      if (onUpdated) onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm(`Apakah Anda yakin ingin mereset password untuk ${user.name}?`)) {
      return;
    }

    setIsResettingPassword(true);
    try {
      const token = localStorage.getItem("apident:token");
      const res = await fetch(`${API_BASE}/admin/users/${user.id}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mereset password.");
      }

      toast.success(`Password berhasil direset! Password baru: ${data.new_password || "Password123#"}`);
    } catch (err: any) {
      toast.error(err.message || "Gagal mereset password.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const tierColors: Record<string, string> = {
    platinum: "bg-purple-100 text-purple-800 border-purple-300",
    gold: "bg-amber-100 text-amber-800 border-amber-300",
    silver: "bg-slate-100 text-slate-700 border-slate-300",
    bronze: "bg-[#FDF8F0] text-[#B8943F] border-[#F5E6C8]",
  };

  const currentTier = (user.membership_level || user.membership_tier || "bronze").toLowerCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="!p-0 overflow-hidden w-[calc(100vw-32px)] max-w-2xl rounded-3xl border border-[#F0E6D3] bg-white shadow-2xl"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#1A1612] to-[#2E261E] text-white p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C9A24A] to-[#E8D4A2] flex items-center justify-center text-[#1A1612] font-black text-xl shadow-md">
                {(user.name || "U")[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {user.name}
                  <span className="text-xs font-normal text-stone-400">ID: #{user.id}</span>
                </h3>
                <p className="text-xs text-[#D4AF37] font-medium flex items-center gap-1.5 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Peran: {user.role || "patient"}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#F0E6D3] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C9A24A]/15 text-[#B8943F] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-medium uppercase tracking-wider">Membership</p>
                <p className="text-xs font-bold text-[#4A3F35] capitalize">{user.membership_level || user.membership_tier || "Bronze"}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#F0E6D3] flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-medium uppercase tracking-wider">Poin Reward</p>
                <p className="text-xs font-bold text-[#4A3F35]">{Number(user.membership_points || 0).toLocaleString("id-ID")} Pts</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#F0E6D3] flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-stone-500 font-medium uppercase tracking-wider">Status Akun</p>
                <p className="text-xs font-bold text-emerald-700 capitalize">{user.membership_status || user.status || "Aktif"}</p>
              </div>
            </div>
          </div>

          {/* Section: Kontak & Biodata */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Informasi Kontak & Akun</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-stone-400 text-[11px] block">Alamat Email</span>
                <span className="font-semibold text-stone-800 break-all">{user.email || "-"}</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-stone-400 text-[11px] block">Nomor WhatsApp</span>
                <span className="font-semibold text-stone-800">{user.phone || user.whatsapp || "-"}</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-stone-400 text-[11px] block">Jenis Kelamin</span>
                <span className="font-semibold text-stone-800">{user.gender || "-"}</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-stone-400 text-[11px] block">Tanggal Lahir</span>
                <span className="font-semibold text-stone-800">{user.birthDate || user.birth_date || "-"}</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-stone-400 text-[11px] block">Golongan Darah</span>
                <span className="font-semibold text-stone-800">{user.bloodType || user.blood_type || "-"}</span>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                <span className="text-stone-400 text-[11px] block">Pekerjaan</span>
                <span className="font-semibold text-stone-800">{user.job || "-"}</span>
              </div>
            </div>
          </div>

          {/* Section: Domisili */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Alamat & Lokasi Domisili</span>
            </h4>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs space-y-1">
              <p className="text-stone-800 font-medium">{user.address || user.address_line || "Belum mengisi alamat lengkap"}</p>
              <p className="text-stone-500 text-[11px]">
                {[user.district, user.city || user.domicile, user.province, user.postal_code].filter(Boolean).join(", ") || "-"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetPassword}
              disabled={isResettingPassword}
              className="text-xs text-amber-700 border-amber-300 hover:bg-amber-50 rounded-xl cursor-pointer"
            >
              {isResettingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <KeyRound className="w-3.5 h-3.5 mr-1.5" />}
              <span>Reset Password</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={onClose}
              className="bg-[#C9A24A] hover:bg-[#A8843A] text-white text-xs font-bold px-5 rounded-xl cursor-pointer"
            >
              Tutup Detail
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
