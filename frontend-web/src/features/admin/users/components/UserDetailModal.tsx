import { useState, useEffect } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Crown,
  Star,
  CheckCircle2,
  Briefcase,
  Droplet,
  Home,
  Building,
  BookOpen,
  Building2,
  Flag,
  Trophy,
  Hexagon,
  KeyRound,
  Loader2,
  Copy,
  Check,
  Stethoscope,
  Coffee,
  Cigarette,
  HeartHandshake,
  Sparkles,
  Smile,
  Clock,
  ShieldCheck,
  MessageSquare,
  Compass,
  CalendarDays,
  CreditCard,
} from "lucide-react";
import { Dialog, DialogContent } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { toast } from "@/shared/ui/toast";
import { API_BASE } from "@/core/api/apiConfig";
import { apiClient } from "@/core/api/apiClient";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: any | null;
  onUpdated?: () => void;
}

export default function UserDetailModal({ isOpen, onClose, user: initialUser, onUpdated }: Props) {
  const [user, setUser] = useState<any | null>(initialUser);
  const [activeTab, setActiveTab] = useState<"biodata" | "dental" | "reservations">("biodata");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetSuccessPassword, setResetSuccessPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  // User's reservation history
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);

  // Sync state with incoming prop
  useEffect(() => {
    setUser(initialUser);
    setResetSuccessPassword(null);
    setActiveTab("biodata");
  }, [initialUser, isOpen]);

  // Fetch full live profile & reservations whenever modal opens
  useEffect(() => {
    if (!isOpen || !initialUser?.id) return;

    let isMounted = true;
    const fetchLiveProfileAndReservations = async () => {
      setIsLoadingLive(true);
      setIsLoadingReservations(true);
      try {
        const [userData, resvData]: [any, any] = await Promise.all([
          apiClient.get(`/admin/users/${initialUser.id}`, { skipToast: true }).catch(() => null),
          apiClient.get(`/admin/reservations?user_id=${initialUser.id}`, { skipToast: true }).catch(() => null),
        ]);

        if (isMounted) {
          if (userData) {
            setUser((prev: any) => ({ ...prev, ...userData }));
          }
          if (Array.isArray(resvData)) {
            setReservations(resvData);
          } else if (resvData?.data && Array.isArray(resvData.data)) {
            setReservations(resvData.data);
          }
        }
      } catch (err) {
        // Fallback direct fetch
        try {
          const token = localStorage.getItem("apident:token") || localStorage.getItem("auth_token");
          const res = await fetch(`${API_BASE}/admin/reservations?user_id=${initialUser.id}`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const raw = await res.json();
            if (isMounted && Array.isArray(raw)) {
              setReservations(raw);
            }
          }
        } catch {
          // ignore
        }
      } finally {
        if (isMounted) {
          setIsLoadingLive(false);
          setIsLoadingReservations(false);
        }
      }
    };

    fetchLiveProfileAndReservations();
    return () => {
      isMounted = false;
    };
  }, [isOpen, initialUser?.id]);

  if (!user) return null;

  const handleResetPassword = async () => {
    if (!confirm(`Apakah Anda yakin ingin mereset password untuk ${user.name}? Password akan direset ke password standar 'Password123#'.`)) {
      return;
    }

    setIsResettingPassword(true);
    try {
      let newPass = "Password123#";
      try {
        const data: any = await apiClient.post(`/admin/users/${user.id}/reset-password`, {
          password: "Password123#",
        }, { skipToast: true });
        newPass = data?.new_password || "Password123#";
      } catch (err) {
        // Fallback with direct fetch
        const token = localStorage.getItem("apident:token") || localStorage.getItem("auth_token");
        const res = await fetch(`${API_BASE}/admin/users/${user.id}/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: "Password123#" }),
        });

        const rawData = await res.json();
        if (!res.ok) {
          throw new Error(rawData.message || "Gagal mereset password.");
        }
        newPass = rawData.new_password || "Password123#";
      }

      setResetSuccessPassword(newPass);
      toast.success(`Password untuk ${user.name} berhasil direset!`);
      if (onUpdated) onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Gagal mereset password pengguna.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleCopyPassword = () => {
    if (!resetSuccessPassword) return;
    navigator.clipboard.writeText(resetSuccessPassword);
    setCopied(true);
    toast.success("Password baru berhasil disalin ke clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  // Format member registration date (e.g. "April, 2024")
  const formatMemberSince = (dateStr?: string) => {
    if (!dateStr) return "April, 2024";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "April, 2024";
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      return `${monthNames[d.getMonth()]}, ${d.getFullYear()}`;
    } catch {
      return "April, 2024";
    }
  };

  const formatReservationDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const membershipTier = user.membership_level || user.membership_tier || "Platinum";
  const points = Number(user.membership_points || 0).toLocaleString("id-ID");
  const accountStatus = user.membership_status || user.status || "Active";
  const userInitial = (user.name || "U")[0].toUpperCase();

  // Parsing full address / domicile
  const addressLine = user.address || user.address_line || "Kumpeh Ulu, Kabupaten Muaro Jambi, Jambi";
  const kelurahan = user.subdistrict || user.kelurahan || user.village || user.district || "Kumpeh Ulu";
  const kecamatan = user.district || user.kecamatan || "Kumpeh Ulu";
  const kota = user.city || user.domicile || "Muaro Jambi";
  const provinsi = user.province || "Jambi";
  const kodePos = user.postalCode || user.postal_code || "";

  // Dental & Health Profile data
  const insurance = user.insuranceProvider || user.insurance_provider || "Umum (Pribadi)";
  const lastVisit = user.lastDentalVisit || user.last_dental_visit || "< 6 Bulan Lalu";
  const isCoffee = user.isCoffeeDrinker ?? (Array.isArray(user.consumptionHabits) && user.consumptionHabits.includes("coffee_tea"));
  const isSmoker = user.isSmoker ?? (Array.isArray(user.consumptionHabits) && user.consumptionHabits.includes("smoker"));

  const dentalComplaints: string[] = Array.isArray(user.dentalComplaints) && user.dentalComplaints.length > 0
    ? user.dentalComplaints
    : Array.isArray(user.dental_concerns) && user.dental_concerns.length > 0
    ? user.dental_concerns
    : ["Pemeriksaan Rutin"];

  const desiredServices: string[] = Array.isArray(user.desiredServices) && user.desiredServices.length > 0
    ? user.desiredServices
    : Array.isArray(user.treatment_interests) && user.treatment_interests.length > 0
    ? user.treatment_interests
    : ["Scaling Karang Gigi"];

  const treatmentGoals: string[] = Array.isArray(user.treatmentGoals) && user.treatmentGoals.length > 0
    ? user.treatmentGoals
    : Array.isArray(user.personal_goals) && user.personal_goals.length > 0
    ? user.personal_goals
    : ["Kesehatan Gigi & Mulut Optimal"];

  const lifestyleInterests: string[] = Array.isArray(user.lifestyleInterests) && user.lifestyleInterests.length > 0
    ? user.lifestyleInterests
    : Array.isArray(user.lifestyle_interests) && user.lifestyle_interests.length > 0
    ? user.lifestyle_interests
    : ["Estetika Senyum"];

  const preferredChannels: string[] = Array.isArray(user.preferredCommunicationChannels) && user.preferredCommunicationChannels.length > 0
    ? user.preferredCommunicationChannels
    : Array.isArray(user.communication_preferences) && user.communication_preferences.length > 0
    ? user.communication_preferences
    : ["WhatsApp", "Aplikasi"];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="!p-0 overflow-hidden w-[calc(100vw-32px)] max-w-5xl h-[84vh] max-h-[680px] min-h-[580px] flex flex-col rounded-[28px] border border-[#E8DFC8] bg-white shadow-2xl"
      >
        {/* Top Dark Header Card - Keeping User's exact padding */}
        <div className="bg-[#17130E] text-white p-6 pt-3 pb-3 relative shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: User Avatar & Basic Info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-full aspect-square bg-gradient-to-b from-[#F2DCA2] via-[#DDB86C] to-[#B8943F] text-[#17130E] font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
                {userInitial}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {user.name}
                  </h3>
                  <span className="text-xs font-semibold text-stone-300 bg-white/10 px-2.5 py-0.5 rounded-md">
                    ID: #{user.id}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#E6C67A] font-medium">
                  <Hexagon className="w-3.5 h-3.5 text-[#E6C67A]" />
                  <span>Peran: {user.role || "patient"}</span>
                </div>
              </div>
            </div>

            {/* Right: 3 Quick Stat Badges & Close Button */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Membership Badge */}
              <div className="flex items-center gap-2.5 bg-[#251E17] border border-white/10 rounded-2xl px-4 py-2.5 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-[#E6C67A] flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4 text-[#E6C67A]" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-medium leading-none">Membership</p>
                  <p className="text-xs font-bold text-white capitalize mt-1 leading-none">{membershipTier}</p>
                </div>
              </div>

              {/* Poin Reward Badge */}
              <div className="flex items-center gap-2.5 bg-[#251E17] border border-white/10 rounded-2xl px-4 py-2.5 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Star className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-medium leading-none">Poin Reward</p>
                  <p className="text-xs font-bold text-white mt-1 leading-none">{points} Pts</p>
                </div>
              </div>

              {/* Status Akun Badge */}
              <div className="flex items-center gap-2.5 bg-[#251E17] border border-white/10 rounded-2xl px-4 py-2.5 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-medium leading-none">Status Akun</p>
                  <p className="text-xs font-bold text-emerald-400 capitalize mt-1 leading-none">{accountStatus}</p>
                </div>
              </div>

              {/* Close Button (X) */}
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-white/20 text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer shrink-0 ml-1"
                title="Tutup Detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar - Fixed Shrink */}
        <div className="bg-[#FAF7F2] border-b border-[#E8DFC8] px-6 py-2 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab("biodata")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "biodata"
                  ? "bg-[#17130E] text-[#E6C67A] shadow-xs"
                  : "bg-white text-stone-600 border border-[#E8DFC8] hover:bg-stone-50"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Biodata & Domisili</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("dental")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "dental"
                  ? "bg-[#17130E] text-[#E6C67A] shadow-xs"
                  : "bg-white text-stone-600 border border-[#E8DFC8] hover:bg-stone-50"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Kesehatan Gigi & Medis</span>
              {(dentalComplaints.length > 0 || desiredServices.length > 0) && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reservations")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === "reservations"
                  ? "bg-[#17130E] text-[#E6C67A] shadow-xs"
                  : "bg-white text-stone-600 border border-[#E8DFC8] hover:bg-stone-50"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Riwayat Reservasi</span>
              {reservations.length > 0 && (
                <span className="text-[10px] bg-amber-500 text-stone-900 font-bold px-1.5 py-0.2 rounded-full">
                  {reservations.length}
                </span>
              )}
            </button>
          </div>

          {isLoadingLive && (
            <span className="text-[11px] text-[#8C6B1C] font-semibold flex items-center gap-1.5 hidden sm:flex">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Sinkronisasi Data...</span>
            </span>
          )}
        </div>

        {/* Modal Body Container - Fixed Height with Internal Smooth Scroll */}
        <div className="p-6 pt-3 space-y-4 bg-white flex-1 overflow-y-auto min-h-0">
          {activeTab === "biodata" && (
            /* Tab 1: Biodata & Domisili */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Main 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Left Column: INFORMASI KONTAK & AKUN */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#8C6B1C]" />
                    <span>INFORMASI KONTAK & AKUN</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Alamat Email */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#F0E6D3] flex items-center gap-3 shadow-2xs">
                      <div className="w-9 h-9 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 border border-[#F0E6D3]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[11px] text-stone-400 block font-medium">Alamat Email</span>
                        <span className="text-xs font-bold text-stone-800 truncate block">{user.email || "-"}</span>
                      </div>
                    </div>

                    {/* Nomor WhatsApp */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#F0E6D3] flex items-center gap-3 shadow-2xs">
                      <div className="w-9 h-9 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 border border-[#F0E6D3]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[11px] text-stone-400 block font-medium">Nomor WhatsApp</span>
                        <span className="text-xs font-bold text-stone-800 truncate block">{user.phone || user.whatsapp || "-"}</span>
                      </div>
                    </div>

                    {/* Jenis Kelamin */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#F0E6D3] flex items-center gap-3 shadow-2xs">
                      <div className="w-9 h-9 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 border border-[#F0E6D3]">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-400 block font-medium">Jenis Kelamin</span>
                        <span className="text-xs font-bold text-stone-800 capitalize">{user.gender || "male"}</span>
                      </div>
                    </div>

                    {/* Tanggal Lahir */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#F0E6D3] flex items-center gap-3 shadow-2xs">
                      <div className="w-9 h-9 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 border border-[#F0E6D3]">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-400 block font-medium">Tanggal Lahir</span>
                        <span className="text-xs font-bold text-stone-800">{user.birthDate || user.birth_date || "2004-11-21"}</span>
                      </div>
                    </div>

                    {/* Golongan Darah */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#F0E6D3] flex items-center gap-3 shadow-2xs">
                      <div className="w-9 h-9 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 border border-[#F0E6D3]">
                        <Droplet className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-400 block font-medium">Golongan Darah</span>
                        <span className="text-xs font-bold text-stone-800">{user.bloodType || user.blood_type || "O"}</span>
                      </div>
                    </div>

                    {/* Pekerjaan */}
                    <div className="p-3.5 rounded-2xl bg-white border border-[#F0E6D3] flex items-center gap-3 shadow-2xs">
                      <div className="w-9 h-9 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 border border-[#F0E6D3]">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[11px] text-stone-400 block font-medium">Pekerjaan</span>
                        <span className="text-xs font-bold text-stone-800 truncate block">{user.job || "Tentara Nasional Indonesia (TNI)"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: ALAMAT DOMISILI */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#8C6B1C]" />
                    <span>ALAMAT DOMISILI</span>
                  </h4>

                  <div className="p-4 pt-6 pb-6 rounded-2xl bg-white border border-[#F0E6D3] space-y-3 shadow-2xs">
                    {/* Alamat Lengkap */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 border border-[#F0E6D3] mt-0.5">
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-400 block font-medium">Alamat Lengkap</span>
                        <span className="text-xs font-bold text-stone-800 leading-snug">{addressLine}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4 border-[#8C6B1C]/60 pt-2.5 grid grid-cols-2 gap-3">
                      {/* Kelurahan / Desa */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 border border-[#F0E6D3]">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block font-medium">Kelurahan / Desa</span>
                          <span className="text-xs font-bold text-stone-800">{kelurahan}</span>
                        </div>
                      </div>

                      {/* Kecamatan */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 border border-[#F0E6D3]">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block font-medium">Kecamatan</span>
                          <span className="text-xs font-bold text-stone-800">{kecamatan}</span>
                        </div>
                      </div>

                      {/* Kabupaten / Kota */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 border border-[#F0E6D3]">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block font-medium">Kabupaten / Kota</span>
                          <span className="text-xs font-bold text-stone-800">{kota}</span>
                        </div>
                      </div>

                      {/* Provinsi */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#FAF5EA] text-[#8C6B1C] flex items-center justify-center shrink-0 border border-[#F0E6D3]">
                          <Flag className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block font-medium">Provinsi {kodePos && `(${kodePos})`}</span>
                          <span className="text-xs font-bold text-stone-800">{provinsi}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Member Since Banner Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF6ED] to-[#F5EFE0] border border-[#E8DFC8] flex items-center justify-between gap-4 shadow-2xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#C9A24A] text-white flex items-center justify-center shrink-0 shadow-md">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-[#2C2416]">
                      Member Sejak {formatMemberSince(user.created_at || user.membership_started_at)}
                    </h5>
                    <p className="text-[11px] sm:text-xs text-[#8C8272] mt-0.5">
                      Terima kasih telah menjadi bagian dari keluarga Aesthetic Pondok Indah.
                    </p>
                  </div>
                </div>

                {/* Aesthetic Gold Laurel Emblem Logo */}
                <div className="shrink-0 hidden sm:flex items-center justify-center opacity-85">
                  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 15 C30 15 15 35 15 55 C15 72 28 85 45 88" stroke="#C9A24A" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
                    <path d="M50 15 C70 15 85 35 85 55 C85 72 72 85 55 88" stroke="#C9A24A" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
                    <path d="M22 45 Q30 40 32 48 Q26 52 22 45 Z" fill="#C9A24A" />
                    <path d="M20 58 Q28 55 30 62 Q23 65 20 58 Z" fill="#C9A24A" />
                    <path d="M24 70 Q32 68 33 75 Q26 77 24 70 Z" fill="#C9A24A" />
                    <path d="M78 45 Q70 40 68 48 Q74 52 78 45 Z" fill="#C9A24A" />
                    <path d="M80 58 Q72 55 70 62 Q77 65 80 58 Z" fill="#C9A24A" />
                    <path d="M76 70 Q68 68 67 75 Q74 77 76 70 Z" fill="#C9A24A" />
                    <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fill="#C9A24A" fontFamily="serif" fontSize="32" fontWeight="bold">
                      A
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {activeTab === "dental" && (
            /* Tab 2: Kesehatan Gigi & Rekam Medis */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Top 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-[#F0E6D3] flex items-center gap-3 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[11px] text-stone-400 block font-medium">Asuransi</span>
                    <span className="text-xs font-bold text-stone-800 truncate block">{insurance}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#F0E6D3] flex items-center gap-3 shadow-2xs">
                  <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[11px] text-stone-400 block font-medium">Kunjungan Terakhir</span>
                    <span className="text-xs font-bold text-stone-800 truncate block">{lastVisit}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#F0E6D3] flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-100">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 block font-medium">Minum Kopi/Teh</span>
                      <span className="text-xs font-bold text-stone-800">{isCoffee ? "Ya" : "Tidak"}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isCoffee ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-stone-100 text-stone-600 border-stone-200"}`}>
                    {isCoffee ? "Ya" : "Tidak"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#F0E6D3] flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 border border-stone-200">
                      <Cigarette className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 block font-medium">Merokok</span>
                      <span className="text-xs font-bold text-stone-800">{isSmoker ? "Ya" : "Tidak"}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isSmoker ? "bg-red-100 text-red-800 border-red-300" : "bg-emerald-100 text-emerald-800 border-emerald-300"}`}>
                    {isSmoker ? "Ya" : "Tidak"}
                  </span>
                </div>
              </div>

              {/* 3 Detail Cards: Keluhan, Layanan & Target */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Keluhan Gigi */}
                <div className="p-4 rounded-2xl bg-white border border-[#F0E6D3] space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#8C6B1C]">
                    <Stethoscope className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800">Keluhan Gigi Saat Ini</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {dentalComplaints.map((item, idx) => (
                      <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Layanan Diminati */}
                <div className="p-4 rounded-2xl bg-white border border-[#F0E6D3] space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#8C6B1C]">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800">Layanan Diminati</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {desiredServices.map((item, idx) => (
                      <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-[#8C6B1C] border border-[#E8DFC8]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Target Perawatan */}
                <div className="p-4 rounded-2xl bg-white border border-[#F0E6D3] space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#8C6B1C]">
                    <Smile className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-800">Target Perawatan</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {treatmentGoals.map((item, idx) => (
                      <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2 Bottom Cards: Lifestyle & Preferred Channels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-[#F0E6D3] space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#8C6B1C]">
                    <Compass className="w-4 h-4" />
                    <span className="text-xs font-bold text-stone-800">Minat Gaya Hidup (Lifestyle)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lifestyleInterests.map((item, idx) => (
                      <span key={idx} className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#F0E6D3] space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#8C6B1C]">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold text-stone-800">Kanal Komunikasi Pilihan</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {preferredChannels.map((item, idx) => (
                      <span key={idx} className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-[#FAF5EA] text-[#8C6B1C] border border-[#F0E6D3]">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "reservations" && (
            /* Tab 3: Riwayat Reservasi Pasien */
            <div className="space-y-3 animate-in fade-in duration-200">
              {isLoadingReservations ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#8C6B1C]" />
                  <p className="text-xs font-semibold text-stone-600">Memuat riwayat reservasi...</p>
                </div>
              ) : reservations.length === 0 ? (
                <div className="p-10 text-center rounded-2xl border border-dashed border-[#E8DFC8] bg-[#FAF8F4] flex flex-col items-center justify-center gap-2.5">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-[#8C6B1C] flex items-center justify-center border border-amber-200">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-bold text-stone-800">Belum Ada Riwayat Reservasi</h5>
                  <p className="text-xs text-stone-500 max-w-md">
                    Pasien ini belum memiliki jadwal kunjungan klinik atau reservasi aktif yang tercatat di sistem.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reservations.map((r, idx) => (
                    <div
                      key={r.id || idx}
                      className="p-4 rounded-2xl bg-white border border-[#F0E6D3] hover:border-[#C9A24A] transition shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F0E6D3]">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs text-stone-800 bg-[#FAF5EA] px-2.5 py-1 rounded-md border border-[#F0E6D3]">
                            {r.code || `RSV-#${r.id}`}
                          </span>
                          <span className="text-xs font-medium text-stone-500">
                            Dibuat: {formatReservationDate(r.createdAt || r.created_at)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                              r.status === "Selesai"
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : r.status === "Dikonfirmasi" || r.status === "Dalam Konsultasi"
                                ? "bg-blue-100 text-blue-800 border-blue-300"
                                : r.status === "Dibatalkan" || r.status === "Ditolak"
                                ? "bg-red-100 text-red-800 border-red-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {r.status || "Baru"}
                          </span>

                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                              r.paymentStatus === "Sudah Bayar"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-stone-100 text-stone-600 border-stone-200"
                            }`}
                          >
                            {r.paymentStatus || "Belum Bayar"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                        <div className="flex items-start gap-2.5">
                          <Calendar className="w-4 h-4 text-[#8C6B1C] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-stone-400 block text-[10px] font-medium">Jadwal Kunjungan</span>
                            <span className="font-bold text-stone-800">
                              {formatReservationDate(r.date)} {r.preferred_time && `• ${r.preferred_time}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <Stethoscope className="w-4 h-4 text-[#8C6B1C] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-stone-400 block text-[10px] font-medium">Dokter & Cabang</span>
                            <span className="font-bold text-stone-800">{r.doctor || "Dokter Spesialis"}</span>
                            <span className="text-stone-500 block text-[11px]">{r.branch_name || "Main Branch"}</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <CreditCard className="w-4 h-4 text-[#8C6B1C] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-stone-400 block text-[10px] font-medium">Biaya Layanan</span>
                            <span className="font-bold text-stone-900">{r.final_price_formatted || "Rp 0"}</span>
                            {r.point_discount > 0 && (
                              <span className="text-emerald-700 block text-[10px]">
                                Diskon Poin: -{r.point_discount_formatted}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {(r.treatment_interest || r.complaint) && (
                        <div className="p-2.5 rounded-xl bg-[#FAF8F4] border border-[#F0E6D3] text-xs">
                          {r.treatment_interest && (
                            <p className="font-semibold text-stone-800">
                              <span className="text-stone-500 font-normal">Minat Perawatan: </span>
                              {r.treatment_interest}
                            </p>
                          )}
                          {r.complaint && (
                            <p className="text-stone-700 mt-0.5">
                              <span className="text-stone-500">Keluhan: </span>
                              {r.complaint}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer Bar - Fixed Height at Bottom */}
        <div className="p-6 py-3 bg-white border-t border-[#F0E6D3] flex flex-col gap-3 shrink-0">
          {/* Reset Password Success Banner */}
          {resetSuccessPassword && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950">Password Baru Berhasil Dibuat!</p>
                  <p className="text-[11px] text-emerald-800">
                    Password akun: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-950 font-bold ml-1">{resetSuccessPassword}</strong>
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={handleCopyPassword}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-lg cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                <span>{copied ? "Tersalin!" : "Salin Password"}</span>
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetPassword}
              disabled={isResettingPassword}
              className="text-xs font-semibold text-amber-800 border-amber-300 hover:bg-amber-50 rounded-xl px-4 py-2 cursor-pointer shadow-2xs"
            >
              {isResettingPassword ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : (
                <KeyRound className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
              )}
              <span>Reset Password</span>
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onClose}
              className="bg-[#B8943F] hover:bg-[#A38032] text-white text-xs font-bold px-7 py-2 rounded-xl cursor-pointer shadow-md transition"
            >
              Tutup Detail
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
