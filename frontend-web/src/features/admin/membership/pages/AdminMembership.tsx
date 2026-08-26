import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { apiClient } from "@/core/api/apiClient";
import { toast } from "@/shared/ui/toast";
import {
  CheckCircle2,
  Clock,
  Crown,
  History,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Star,
  Sparkles,
  ShieldCheck,
  XCircle,
  Receipt,
  Users,
  Coins,
  Edit2,
  Trash2,
  Sliders,
  Phone,
  Mail,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

type Tier = "bronze" | "gold" | "platinum";

type Member = {
  id: number;
  name: string;
  email: string;
  role?: string;
  whatsapp: string | null;
  membership_level: Tier | null;
  membership_status: string | null;
  membership_points: number;
  total_transactions: string | number;
};

type MembershipTransactionItem = {
  id: number;
  amount: string | number;
  status: string;
  created_at: string;
  metadata?: { target_level?: Tier; order_id?: string; payment_method?: string };
  user: Pick<Member, "name" | "email" | "whatsapp">;
};

type PointRule = {
  id: number;
  name: string;
  service_id: number | null;
  service_name: string | null;
  points: number;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
  service?: { id: number; title: string; price_formatted?: string } | null;
  creator?: { id: number; name: string } | null;
  updater?: { id: number; name: string } | null;
};

type PointLedgerItem = {
  id: number;
  user_id: number;
  points: number;
  balance_before: number;
  balance_after: number;
  type: "earned" | "redeemed" | "expired" | "adjusted";
  description: string | null;
  reference_id: string | null;
  reference_type: string | null;
  created_at: string;
  user?: { id: number; name: string; email: string; whatsapp?: string } | null;
  admin?: { id: number; name: string } | null;
};

const tierPresentation: Record<Tier, { label: string; className: string; Icon: typeof Star }> = {
  bronze: { label: "Bronze", className: "bg-amber-50 text-amber-800 border-amber-200", Icon: Star },
  gold: { label: "Gold", className: "bg-[#FFF9EB] text-[#A8843A] border-[#F0DFB6]", Icon: Crown },
  platinum: { label: "Platinum", className: "bg-slate-100 text-slate-800 border-slate-300", Icon: Sparkles },
};

const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(amount || 0));

export default function AdminMembershipPage() {
  const [activeTab, setActiveTab] = useState<"transaksi" | "member" | "poin">("poin");

  // Read cache immediately (0ms instant render)
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const cached = localStorage.getItem("apig_admin_cached_members");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [transactions, setTransactions] = useState<MembershipTransactionItem[]>(() => {
    try {
      const cached = localStorage.getItem("apig_admin_cached_membership_trx");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // Read cache immediately (0ms instant render for all tabs)
  const [rules, setRules] = useState<PointRule[]>(() => {
    try {
      const cached = localStorage.getItem("apig_admin_cached_point_rules");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [clinicServices, setClinicServices] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem("apig_admin_cached_clinic_services");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [ledgerItems, setLedgerItems] = useState<PointLedgerItem[]>(() => {
    try {
      const cached = localStorage.getItem("apig_admin_cached_point_ledger");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  // If any entity has cached data, don't show full-page loading spinner
  const hasCachedData = members.length > 0 || transactions.length > 0 || rules.length > 0 || ledgerItems.length > 0;
  const [loading, setLoading] = useState(!hasCachedData);
  const [loadingRules, setLoadingRules] = useState(false);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<"all" | Tier>("all");
  const [trxStatusFilter, setTrxStatusFilter] = useState<"all" | "paid" | "pending" | "failed">("all");
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<"all" | "earned" | "adjusted" | "redeemed">("all");

  // Rule Form Modal State
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PointRule | null>(null);
  const [ruleFormData, setRuleFormData] = useState<{
    name: string;
    service_id: number | string;
    service_name: string;
    points: number | string;
    is_active: boolean;
    description: string;
  }>({
    name: "",
    service_id: "",
    service_name: "",
    points: 50,
    is_active: true,
    description: "",
  });
  const [savingRule, setSavingRule] = useState(false);

  // Manual Adjustment Modal State
  const [adjustmentMember, setAdjustmentMember] = useState<Member | null>(null);
  const [adjustmentAction, setAdjustmentAction] = useState<"add" | "deduct">("add");
  const [adjustmentAmount, setAdjustmentAmount] = useState<number | string>(50);
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  // Member Points History Modal State
  const [historyMember, setHistoryMember] = useState<Member | null>(null);
  const [memberHistoryItems, setMemberHistoryItems] = useState<PointLedgerItem[]>([]);
  const [loadingMemberHistory, setLoadingMemberHistory] = useState(false);

  // Point Conversion Settings State (Supports empty string while typing)
  const pointSettingsInitialized = useRef(false);
  const [pointSettings, setPointSettings] = useState<{
    conversion_rate: number | string;
    min_redeem_points: number | string;
    max_discount_percentage: number | string;
    tier_multipliers: {
      bronze: number;
      gold: number;
      platinum: number;
    };
  }>({
    conversion_rate: 1000,
    min_redeem_points: 100,
    max_discount_percentage: 100,
    tier_multipliers: {
      bronze: 1.0,
      gold: 1.5,
      platinum: 2.0,
    },
  });
  const [savingPointSettings, setSavingPointSettings] = useState(false);

  // Load Main Data with Stale-While-Revalidate (SWR) Caching
  const loadData = useCallback(async (silent = false) => {
    if (!silent && !hasCachedData) setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (levelFilter !== "all") query.set("level", levelFilter);

      const [memberResponse, transactionResponse, rulesResponse, servicesResponse, ledgerResponse, pointSettingsRes] = await Promise.all([
        apiClient.get<{ data: { data: Member[] } }>(`/admin/membership${query.size ? `?${query}` : ""}`, { skipToast: true }),
        apiClient.get<{ data: { data: MembershipTransactionItem[] } }>("/admin/membership/upgrade-requests?status=all", { skipToast: true }),
        apiClient.get<{ data: PointRule[] }>("/admin/membership/rules", { skipToast: true }),
        apiClient.get<{ data: any[] }>("/services", { skipToast: true }).catch(() => ({ data: [] })),
        apiClient.get<{ data: { data: PointLedgerItem[] } }>("/admin/membership/points-ledger", { skipToast: true }).catch(() => ({ data: { data: [] } })),
        apiClient.get<{ data: any }>("/admin/membership/point-settings", { skipToast: true }).catch(() => ({ data: null })),
      ]);

      const memberList = memberResponse?.data?.data || [];
      const trxList = transactionResponse?.data?.data || [];
      const ruleList = rulesResponse?.data || [];
      const srvList = Array.isArray(servicesResponse?.data) ? servicesResponse.data : (servicesResponse as any)?.data?.data || [];
      const ldgList = ledgerResponse?.data?.data || [];
      const psData = pointSettingsRes?.data;

      if (psData && (!pointSettingsInitialized.current || !silent)) {
        setPointSettings({
          conversion_rate: Number(psData.conversion_rate ?? 1000),
          min_redeem_points: Number(psData.min_redeem_points ?? 100),
          max_discount_percentage: Number(psData.max_discount_percentage ?? 100),
          tier_multipliers: psData.tier_multipliers || {
            bronze: 1.0,
            gold: 1.5,
            platinum: 2.0,
          },
        });
        pointSettingsInitialized.current = true;
      }

      if (Array.isArray(memberList)) {
        setMembers(memberList);
        try { localStorage.setItem("apig_admin_cached_members", JSON.stringify(memberList)); } catch {}
      }

      if (Array.isArray(trxList)) {
        setTransactions(trxList);
        try { localStorage.setItem("apig_admin_cached_membership_trx", JSON.stringify(trxList)); } catch {}
      }

      if (Array.isArray(ruleList)) {
        setRules(ruleList);
        try { localStorage.setItem("apig_admin_cached_point_rules", JSON.stringify(ruleList)); } catch {}
      }

      if (Array.isArray(srvList)) {
        setClinicServices(srvList);
        try { localStorage.setItem("apig_admin_cached_clinic_services", JSON.stringify(srvList)); } catch {}
      }

      if (Array.isArray(ldgList)) {
        setLedgerItems(ldgList);
        try { localStorage.setItem("apig_admin_cached_point_ledger", JSON.stringify(ldgList)); } catch {}
      }
    } catch {
      // Keep cached data smoothly
    } finally {
      setLoading(false);
      setLoadingRules(false);
      setLoadingLedger(false);
    }
  }, [levelFilter, search, hasCachedData]);

  const handleSavePointSettings = async () => {
    try {
      setSavingPointSettings(true);
      const payload = {
        conversion_rate: Number(pointSettings.conversion_rate) || 1000,
        min_redeem_points: Number(pointSettings.min_redeem_points) || 10,
        max_discount_percentage: Math.min(100, Math.max(1, Number(pointSettings.max_discount_percentage) || 100)),
        tier_multipliers: pointSettings.tier_multipliers,
      };
      await apiClient.put("/admin/membership/point-settings", payload);
      toast.success("Pengaturan nilai konversi poin dan privilese tier berhasil disimpan!");
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan pengaturan nilai poin.");
    } finally {
      setSavingPointSettings(false);
    }
  };

  // Initial & Realtime Polling Synchronization (SWR every 8 seconds)
  useEffect(() => {
    loadData(hasCachedData);

    const interval = setInterval(() => {
      // Background silent sync
      loadData(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [loadData, hasCachedData]);

  const loadRules = async () => {
    setLoadingRules(true);
    try {
      const res = await apiClient.get<{ data: PointRule[] }>("/admin/membership/rules", { skipToast: true });
      if (Array.isArray(res?.data)) {
        setRules(res.data);
        try { localStorage.setItem("apig_admin_cached_point_rules", JSON.stringify(res.data)); } catch {}
      }
    } catch {} finally {
      setLoadingRules(false);
    }
  };

  const loadGlobalLedger = async () => {
    setLoadingLedger(true);
    try {
      const res = await apiClient.get<any>("/admin/membership/points-ledger", { skipToast: true });
      const rawData = res?.data;
      const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
      if (Array.isArray(list)) {
        setLedgerItems(list);
        try { localStorage.setItem("apig_admin_cached_point_ledger", JSON.stringify(list)); } catch {}
      }
    } catch {} finally {
      setLoadingLedger(false);
    }
  };

  const openCreateRuleModal = () => {
    setEditingRule(null);
    setRuleFormData({
      name: "",
      service_id: "",
      service_name: "",
      points: 50,
      is_active: true,
      description: "",
    });
    setIsRuleModalOpen(true);
  };

  const openEditRuleModal = (rule: PointRule) => {
    setEditingRule(rule);
    setRuleFormData({
      name: rule.name,
      service_id: rule.service_id || "",
      service_name: rule.service_name || "",
      points: rule.points,
      is_active: rule.is_active,
      description: rule.description || "",
    });
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleFormData.name.trim() || Number(ruleFormData.points) <= 0) {
      toast({ title: "Data Tidak Lengkap", message: "Nama aturan dan jumlah poin harus diisi dengan benar.", variant: "warning" });
      return;
    }

    setSavingRule(true);
    try {
      const payload: any = {
        name: ruleFormData.name,
        points: Number(ruleFormData.points),
        is_active: ruleFormData.is_active,
        description: ruleFormData.description || null,
      };

      if (ruleFormData.service_id) {
        payload.service_id = Number(ruleFormData.service_id);
        const selectedSrv = clinicServices.find((s) => s.id === Number(ruleFormData.service_id));
        if (selectedSrv) payload.service_name = selectedSrv.title;
      } else if (ruleFormData.service_name) {
        payload.service_name = ruleFormData.service_name;
      }

      if (editingRule) {
        await apiClient.put(`/admin/membership/rules/${editingRule.id}`, payload);
        toast({ title: "Aturan Diperbarui", message: `Aturan poin "${ruleFormData.name}" berhasil diupdate.`, variant: "success" });
      } else {
        await apiClient.post("/admin/membership/rules", payload);
        toast({ title: "Aturan Dibuat", message: `Aturan poin baru "${ruleFormData.name}" berhasil ditambahkan.`, variant: "success" });
      }

      setIsRuleModalOpen(false);
      await loadRules();
    } catch (err: any) {
      toast({ title: "Gagal Menyimpan Aturan", message: err?.message || "Terjadi kendala saat menyimpan.", variant: "error" });
    } finally {
      setSavingRule(false);
    }
  };

  const handleToggleRuleStatus = async (rule: PointRule) => {
    try {
      await apiClient.patch(`/admin/membership/rules/${rule.id}/toggle`, {});
      toast({
        title: "Status Aturan Diubah",
        message: `Aturan "${rule.name}" sekarang ${!rule.is_active ? "AKTIF" : "NONAKTIF"}.`,
        variant: "success",
      });
      await loadRules();
    } catch {
      toast({ title: "Gagal Mengubah Status", message: "Gagal mengubah status aturan di database.", variant: "error" });
    }
  };

  const handleDeleteRule = async (rule: PointRule) => {
    if (!window.confirm(`Hapus aturan perolehan poin "${rule.name}"? Riwayat poin sebelumnya tidak akan terhapus.`)) return;
    try {
      await apiClient.delete(`/admin/membership/rules/${rule.id}`);
      toast({ title: "Aturan Dihapus", message: "Aturan poin berhasil dihapus.", variant: "success" });
      await loadRules();
    } catch {
      toast({ title: "Gagal Menghapus Aturan", message: "Gagal menghapus aturan poin.", variant: "error" });
    }
  };

  const updateLevel = async (member: Member, nextLevel: Tier) => {
    if (nextLevel === (member.membership_level || "bronze")) return;
    setSavingId(member.id);
    try {
      await apiClient.patch(`/admin/membership/${member.id}/level`, {
        level: nextLevel,
        reason: "Penyesuaian tier melalui panel admin",
      });
      toast({
        title: "Tier Diperbarui",
        message: `${member.name} sekarang berstatus ${tierPresentation[nextLevel].label}.`,
        variant: "success",
      });
      await loadData(true);
    } catch {
      // apiClient handles toast
    } finally {
      setSavingId(null);
    }
  };

  const openHistoryModal = async (member: Member) => {
    setHistoryMember(member);
    setLoadingMemberHistory(true);
    try {
      const response = await apiClient.get<any>(`/admin/membership/${member.id}/points-history`);
      const rawData = response?.data;
      const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
      setMemberHistoryItems(list);
    } catch {
      toast({ title: "Gagal Memuat Riwayat", message: "Tidak dapat mengambil riwayat poin member.", variant: "error" });
    } finally {
      setLoadingMemberHistory(false);
    }
  };

  const openManualAdjustmentModal = (member: Member) => {
    setAdjustmentMember(member);
    setAdjustmentAction("add");
    setAdjustmentAmount(50);
    setAdjustmentReason("");
  };

  const handleSaveManualAdjustment = async () => {
    const numericAmount = Number(adjustmentAmount);
    if (!adjustmentMember || numericAmount <= 0) {
      toast({ title: "Jumlah Poin Tidak Valid", message: "Masukkan jumlah poin positif.", variant: "warning" });
      return;
    }
    if (!adjustmentReason.trim() || adjustmentReason.trim().length < 3) {
      toast({ title: "Alasan Wajib Diisi", message: "Harap berikan alasan koreksi manual untuk audit trail admin.", variant: "warning" });
      return;
    }

    setSavingAdjustment(true);
    try {
      await apiClient.post(`/admin/membership/${adjustmentMember.id}/manual-adjustment`, {
        points: numericAmount,
        action: adjustmentAction,
        reason: adjustmentReason.trim(),
      });

      toast({
        title: "Koreksi Manual Berhasil",
        message: `Koreksi poin ${adjustmentAction === "add" ? "+" : "-"}${numericAmount} pts berhasil dicatat untuk ${adjustmentMember.name}.`,
        variant: "success",
      });

      setAdjustmentMember(null);
      await loadData(true);
      await loadGlobalLedger();
    } catch (err: any) {
      toast({
        title: "Gagal Melakukan Koreksi",
        message: err?.message || "Terjadi kesalahan saat memproses koreksi poin.",
        variant: "error",
      });
    } finally {
      setSavingAdjustment(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      const isPaid = ["paid", "approved", "completed", "settlement", "success"].includes((trx.status || "").toLowerCase());
      const isPending = (trx.status || "").toLowerCase() === "pending";
      const isFailed = ["cancelled", "canceled", "expired", "failed", "deny"].includes((trx.status || "").toLowerCase());

      if (trxStatusFilter === "paid" && !isPaid) return false;
      if (trxStatusFilter === "pending" && !isPending) return false;
      if (trxStatusFilter === "failed" && !isFailed) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const orderId = (trx.metadata?.order_id || `UPG-#${trx.id}`).toLowerCase();
        const name = (trx.user?.name || "").toLowerCase();
        const email = (trx.user?.email || "").toLowerCase();
        return orderId.includes(q) || name.includes(q) || email.includes(q);
      }
      return true;
    });
  }, [transactions, trxStatusFilter, search]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (member.role && member.role !== "patient") return false;
      const tier = member.membership_level || "bronze";
      if (levelFilter !== "all" && tier !== levelFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const name = (member.name || "").toLowerCase();
        const email = (member.email || "").toLowerCase();
        const wa = (member.whatsapp || "").toLowerCase();
        return name.includes(q) || email.includes(q) || wa.includes(q);
      }
      return true;
    });
  }, [members, levelFilter, search]);

  const filteredLedger = useMemo(() => {
    return ledgerItems.filter((item) => {
      if (ledgerTypeFilter !== "all" && item.type !== ledgerTypeFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const userName = (item.user?.name || "").toLowerCase();
        const userEmail = (item.user?.email || "").toLowerCase();
        const desc = (item.description || "").toLowerCase();
        const refId = (item.reference_id || "").toLowerCase();
        return userName.includes(q) || userEmail.includes(q) || desc.includes(q) || refId.includes(q);
      }
      return true;
    });
  }, [ledgerItems, ledgerTypeFilter, search]);

  const metrics = useMemo(() => {
    const validMembers = members.filter((m) => !m.role || m.role === "patient");
    const totalPoints = validMembers.reduce((sum, m) => sum + (Number(m.membership_points) || 0), 0);
    const paidTrx = transactions.filter((t) => ["paid", "approved", "completed", "settlement", "success"].includes((t.status || "").toLowerCase()));
    const totalRevenue = paidTrx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
    const activeRulesCount = rules.filter((r) => r.is_active).length;

    return {
      totalMembers: validMembers.length,
      platinumCount: validMembers.filter((m) => m.membership_level === "platinum").length,
      goldCount: validMembers.filter((m) => m.membership_level === "gold").length,
      bronzeCount: validMembers.filter((m) => !m.membership_level || m.membership_level === "bronze").length,
      totalTransactions: transactions.length,
      paidTransactionsCount: paidTrx.length,
      totalRevenue,
      totalPoints,
      totalRules: rules.length,
      activeRulesCount,
    };
  }, [members, transactions, rules]);

  return (
    <DashboardLayout role="clinic">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8 animate-in fade-in duration-150">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-5 sm:p-6 rounded-2xl border border-[#E8DFC8] shadow-xs">
          <div>
            <p className="text-xs font-bold text-[#8C6B1C] uppercase tracking-wider">Admin Klinik</p>
            <h1 className="text-xl sm:text-2xl font-black text-[#2C2416] mt-0.5">Kelola Membership & Poin</h1>
            <p className="text-xs text-[#8C8272] mt-1">
              Sistem perolehan poin otomatis berbasis aturan, verifikasi transaksi Midtrans, dan ledger audit mutasi poin.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadData(false)}
            disabled={loading}
            className="rounded-xl border-[#E8DFC8] text-[#8C6B1C] hover:bg-[#FAF8F5] font-semibold h-9 px-4 text-xs cursor-pointer shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Muat Ulang
          </Button>
        </div>

        {/* 3 Main Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveTab("poin"); setSearch(""); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "poin"
                ? "bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] text-white shadow-xs"
                : "text-[#6B5E4F] hover:bg-[#FAF5EA] hover:text-[#8C6B1C]"
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Kelola Poin</span>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "poin" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"
            }`}>
              {metrics.activeRulesCount} Aturan Aktif
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("member"); setSearch(""); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "member"
                ? "bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] text-white shadow-xs"
                : "text-[#6B5E4F] hover:bg-[#FAF5EA] hover:text-[#8C6B1C]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Member</span>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "member" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
            }`}>
              {metrics.totalMembers}
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("transaksi"); setSearch(""); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "transaksi"
                ? "bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] text-white shadow-xs"
                : "text-[#6B5E4F] hover:bg-[#FAF5EA] hover:text-[#8C6B1C]"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Riwayat Transaksi Member</span>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "transaksi" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
            }`}>
              {metrics.totalTransactions}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: KELOLA POINT (POINT RULES & GLOBAL LEDGER AUDIT) */}
        {/* ========================================================================= */}
        {activeTab === "poin" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#8C8272]">Total Saldo Poin Beredar</span>
                  <p className="text-2xl font-black text-[#8C6B1C] mt-0.5 whitespace-nowrap">{new Intl.NumberFormat("id-ID").format(metrics.totalPoints)} Poin</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#FAF5EA] border border-[#EADBBD] flex items-center justify-center text-[#8C6B1C]">
                  <Coins className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700">Aturan Poin Aktif</span>
                  <p className="text-2xl font-black text-emerald-600 mt-0.5">
                    {metrics.activeRulesCount} dari {metrics.totalRules} Aturan
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Sliders className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#8C8272]">Mekanisme Perolehan</span>
                  <p className="text-sm font-bold text-[#2C2416] mt-1">Otomatis saat Selesai Tindakan</p>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Anti-Double Point Aktif
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* SECTION 0: PENGATURAN NILAI KONVERSI POIN & PRIVILESE TIER */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E8DFC8] bg-gradient-to-r from-[#FAF8F5] to-[#FDFBF7] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#2C2416] flex items-center gap-2">
                    <Coins className="w-4 h-4 text-[#8C6B1C]" />
                    Pengaturan Nilai Konversi Poin & Privilese Tier
                  </h3>
                  <p className="text-xs text-[#8C8272] mt-0.5">
                    Atur nilai konversi 1 poin ke Rupiah untuk pemotongan biaya layanan pasien serta bobot privilese tiap tingkatan member.
                  </p>
                </div>
                <Button
                  onClick={handleSavePointSettings}
                  disabled={savingPointSettings}
                  className="bg-[#8C6B1C] hover:bg-[#735514] text-white font-bold rounded-xl text-xs h-9 px-4 cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                >
                  {savingPointSettings ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Simpan Pengaturan Poin</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Konversi 1 Poin */}
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] space-y-1.5">
                    <label className="text-xs font-bold text-[#2C2416]">
                      Nilai 1 Poin ke Rupiah (IDR) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-[#8C6B1C]">Rp</span>
                      <Input
                        type="number"
                        min="1"
                        step="100"
                        value={pointSettings.conversion_rate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPointSettings(prev => ({ ...prev, conversion_rate: val }));
                        }}
                        className="pl-9 h-9 rounded-xl bg-white border-[#D9D0BC] text-xs font-bold text-[#2C2416]"
                      />
                    </div>
                    <p className="text-[10px] text-[#8C8272]">
                      Contoh: 100 poin = Potongan <strong>Rp {new Intl.NumberFormat('id-ID').format((Number(pointSettings.conversion_rate) || 0) * 100)}</strong>
                    </p>
                  </div>

                  {/* Minimal Poin Ditukar */}
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] space-y-1.5">
                    <label className="text-xs font-bold text-[#2C2416]">
                      Minimal Poin Ditukar per Transaksi *
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        value={pointSettings.min_redeem_points}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPointSettings(prev => ({ ...prev, min_redeem_points: val }));
                        }}
                        className="h-9 rounded-xl bg-white border-[#D9D0BC] text-xs font-bold text-[#2C2416]"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-[#8C6B1C]">Pts</span>
                    </div>
                    <p className="text-[10px] text-[#8C8272]">
                      Setara potongan minimal <strong>Rp {new Intl.NumberFormat('id-ID').format((Number(pointSettings.conversion_rate) || 0) * (Number(pointSettings.min_redeem_points) || 0))}</strong>
                    </p>
                  </div>

                  {/* Maksimal Potongan Biaya */}
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8] space-y-1.5">
                    <label className="text-xs font-bold text-[#2C2416]">
                      Maksimal Potongan Biaya Layanan (%) *
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={pointSettings.max_discount_percentage}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPointSettings(prev => ({ ...prev, max_discount_percentage: val }));
                        }}
                        className="h-9 rounded-xl bg-white border-[#D9D0BC] text-xs font-bold text-[#2C2416]"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-[#8C6B1C]">%</span>
                    </div>
                    <p className="text-[10px] text-[#8C8272]">
                      Maksimal potongan dari total estimasi biaya (100% = bisa gratis jika poin cukup)
                    </p>
                  </div>
                </div>

                {/* Ringkasan Matriks Privilese & Multiplier Tier Member */}
                <div className="border border-[#E8DFC8] rounded-xl overflow-hidden">
                  <div className="bg-[#FAF5EA] px-4 py-2.5 border-b border-[#EADBBD] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8C6B1C] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Matriks Privilese & Multiplier Poin per Tingkatan Member
                    </span>
                    <span className="text-[10px] font-semibold text-[#8C6B1C]">Tersinkronisasi Otomatis</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E8DFC8] bg-white text-xs">
                    {/* Bronze */}
                    <div className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px] uppercase">
                          Bronze Member
                        </span>
                        <span className="font-black text-[#8C6B1C]">1.0x Poin</span>
                      </div>
                      <p className="text-[11px] text-[#5C5546] leading-relaxed">
                        • Rekam Medis & Riwayat Digital<br/>
                        • Poin Reward Standar Setiap Transaksi<br/>
                        • Poin Langsung Potong Biaya Booking
                      </p>
                    </div>

                    {/* Gold */}
                    <div className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#A8843A] bg-[#FFF9EB] px-2 py-0.5 rounded-full border border-[#F0DFB6] text-[10px] uppercase">
                          Gold Member
                        </span>
                        <span className="font-black text-[#A8843A]">1.5x Poin</span>
                      </div>
                      <p className="text-[11px] text-[#5C5546] leading-relaxed">
                        • Prioritas Antrean Reservasi<br/>
                        • Diskon Khusus Layanan 5%<br/>
                        • Free Konsultasi Dokter Gigi<br/>
                        • Voucher Ulang Tahun Spesial
                      </p>
                    </div>

                    {/* Platinum */}
                    <div className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300 text-[10px] uppercase">
                          Platinum Member
                        </span>
                        <span className="font-black text-purple-700">2.0x Poin</span>
                      </div>
                      <p className="text-[11px] text-[#5C5546] leading-relaxed">
                        • Fast-Track Appointment VIP<br/>
                        • Free Scaling Gigi 1x/Tahun<br/>
                        • Prioritas Jadwal Dokter Spesialis<br/>
                        • Diskon Khusus Layanan 10%<br/>
                        • Dedicated Patient Care VIP
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1: POINT RULES CONFIGURATION TABLE */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E8DFC8] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#2C2416] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#8C6B1C]" />
                    Aturan Perolehan Poin Otomatis
                  </h3>
                  <p className="text-xs text-[#8C8272] mt-0.5">
                    Tentukan jumlah poin yang didapat pasien saat tindakan perawatan selesai. Sistem akan menghitung dan memberikan poin otomatis tanpa input manual.
                  </p>
                </div>
                <Button
                  onClick={openCreateRuleModal}
                  className="bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white font-bold rounded-xl text-xs h-9 px-4 cursor-pointer shrink-0 shadow-xs"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Tambah Aturan Poin Baru
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5]/50 border-b border-[#E8DFC8] text-[10px] uppercase font-bold text-[#8C8272] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Layanan / Sumber Transaksi</th>
                      <th className="px-5 py-3.5">Poin Diperoleh</th>
                      <th className="px-5 py-3.5">Status Aturan</th>
                      <th className="px-5 py-3.5">Keterangan</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5EFE6]">
                    {loadingRules ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-[#8C8272]">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#C9A24A] mb-1" />
                          Memuat aturan poin...
                        </td>
                      </tr>
                    ) : rules.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-[#8C8272]">
                          <Sliders className="w-8 h-8 text-[#C9A24A]/40 mx-auto mb-2" />
                          <p className="font-bold text-[#2C2416]">Belum Ada Aturan Poin</p>
                          <p className="text-[11px] mt-0.5">Klik tombol di atas untuk membuat aturan perolehan poin pertama.</p>
                        </td>
                      </tr>
                    ) : (
                      rules.map((r) => (
                        <tr key={r.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-[#2C2416] text-xs">{r.name.replace(/\s*\(.*?\)/g, "")}</p>
                            {r.service_name && (
                              <p className="text-[10px] text-[#8C8272] mt-0.5">
                                Kategori Layanan: <span className="font-semibold text-[#8C6B1C]">{r.service_name}</span>
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 font-black text-xs text-[#8C6B1C] bg-[#FAF5EA] px-2.5 py-1 rounded-xl border border-[#EADBBD]">
                              <Sparkles className="w-3 h-3 text-[#C9A24A]" />
                              +{r.points} Poin
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              type="button"
                              onClick={() => handleToggleRuleStatus(r)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                r.is_active
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                              }`}
                              title="Klik untuk aktifkan/nonaktifkan aturan"
                            >
                              <span className={`w-2 h-2 rounded-full ${r.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
                              {r.is_active ? "🟢 Aktif" : "🔴 Nonaktif"}
                            </button>
                          </td>
                          <td className="px-5 py-3.5 text-[#6B5E4F] max-w-xs truncate">
                            {r.description || "-"}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => openEditRuleModal(r)}
                                className="text-[#8C6B1C] hover:bg-[#FAF5EA] rounded-lg cursor-pointer"
                                title="Edit Aturan"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => handleDeleteRule(r)}
                                className="text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Hapus Aturan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 2: GLOBAL POINT LEDGER MUTASI AUDIT TRAIL */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-[#E8DFC8] bg-[#FAF8F5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#2C2416] flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-[#8C6B1C]" />
                    Buku Besar Mutasi Poin
                  </h3>
                  <p className="text-xs text-[#8C8272] mt-0.5">
                    Catatan audit setiap perolehan, penukaran, dan penyesuaian poin seluruh member beserta saldo sebelum dan sesudah mutasi.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {(["all", "earned", "adjusted", "redeemed"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setLedgerTypeFilter(t)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                          ledgerTypeFilter === t
                            ? "bg-[#8C6B1C] text-white shadow-2xs"
                            : "text-[#6B5E4F] hover:bg-[#FAF5EA] hover:text-[#8C6B1C]"
                        }`}
                      >
                        {t === "all" ? "Semua Mutasi" : t === "earned" ? "Perolehan" : t === "adjusted" ? "Koreksi Manual" : "Penukaran"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5]/50 border-b border-[#E8DFC8] text-[10px] uppercase font-bold text-[#8C8272] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Waktu & Pasien</th>
                      <th className="px-5 py-3.5">Sumber / Layanan</th>
                      <th className="px-5 py-3.5">Tipe Mutasi</th>
                      <th className="px-5 py-3.5">Perubahan Poin</th>
                      <th className="px-5 py-3.5">Perubahan Saldo</th>
                      <th className="px-5 py-3.5">Keterangan / Audit Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5EFE6]">
                    {loadingLedger ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-[#8C8272]">
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#C9A24A] mb-1" />
                          Memuat ledger mutasi poin...
                        </td>
                      </tr>
                    ) : filteredLedger.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-[#8C8272]">
                          <Receipt className="w-8 h-8 text-[#C9A24A]/40 mx-auto mb-2" />
                          <p className="font-bold text-[#2C2416]">Belum Ada Transaksi Poin</p>
                          <p className="text-[11px] mt-0.5">Poin yang diperoleh dari layanan selesai akan tercatat di sini secara otomatis.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredLedger.map((item) => {
                        const isPositive = item.points > 0 || item.type === "earned";
                        return (
                          <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="font-bold text-[#2C2416]">{item.user?.name || "Pasien"}</p>
                              <p className="text-[10px] text-[#8C8272]">
                                {item.created_at
                                  ? new Date(item.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })
                                  : "-"}
                              </p>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-semibold text-[#2C2416]">
                                {item.reference_type === "reservation" ? (
                                  <span className="inline-flex items-center gap-1 text-[#8C6B1C] font-mono text-[11px]">
                                    Reservasi #{item.reference_id}
                                  </span>
                                ) : item.reference_type === "manual_adjustment" ? (
                                  <span className="text-amber-800 font-semibold">Koreksi Manual Admin</span>
                                ) : (
                                  <span>{item.reference_type || "Sistem"}</span>
                                )}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.5 font-bold text-[9px] uppercase border ${
                                  item.type === "earned"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : item.type === "adjusted"
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-rose-50 text-rose-800 border-rose-200"
                                }`}
                              >
                                {item.type}
                              </span>
                            </td>
                            <td className={`px-5 py-3.5 font-black text-xs ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                              {isPositive ? `+${item.points}` : item.points} Pts
                            </td>
                            <td className="px-5 py-3.5 font-mono text-[11px] text-[#4A3F35]">
                              {item.balance_before !== undefined && item.balance_after !== undefined ? (
                                <span className="inline-flex items-center gap-1.5 font-bold bg-[#FAF5EA] px-2 py-0.5 rounded-lg border border-[#EADBBD]">
                                  <span>{item.balance_before}</span>
                                  <ArrowRight className="w-2.5 h-2.5 text-[#8C6B1C]" />
                                  <span className="text-[#8C6B1C]">{item.balance_after}</span>
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-[#6B5E4F] max-w-xs text-[11px]">
                              <p className="truncate" title={item.description || ""}>{item.description || "-"}</p>
                              {item.admin && (
                                <p className="text-[9px] text-[#8C8272] mt-0.5">Oleh Admin: {item.admin.name}</p>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DAFTAR MEMBER */}
        {/* ========================================================================= */}
        {activeTab === "member" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs">
                <span className="text-[11px] font-bold text-[#8C8272]">Total Member</span>
                <p className="text-2xl font-black text-[#2C2416] mt-0.5">{metrics.totalMembers}</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs">
                <span className="text-[11px] font-bold text-slate-800">Platinum (Priority)</span>
                <p className="text-2xl font-black text-slate-700 mt-0.5">{metrics.platinumCount}</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs">
                <span className="text-[11px] font-bold text-[#A8843A]">Gold (Premium)</span>
                <p className="text-2xl font-black text-[#A8843A] mt-0.5">{metrics.goldCount}</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs">
                <span className="text-[11px] font-bold text-amber-800">Bronze (Basic)</span>
                <p className="text-2xl font-black text-amber-800 mt-0.5">{metrics.bronzeCount}</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E8DFC8]">
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                {(["all", "bronze", "gold", "platinum"] as const).map((tierKey) => (
                  <button
                    key={tierKey}
                    type="button"
                    onClick={() => setLevelFilter(tierKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      levelFilter === tierKey
                        ? "bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] text-white shadow-2xs"
                        : "text-[#6B5E4F] hover:bg-[#FAF5EA] hover:text-[#8C6B1C]"
                    }`}
                  >
                    {tierKey === "all" ? "Semua Tier" : tierKey.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama, email, whatsapp member..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8DFC8] focus:border-[#C9A24A] focus:bg-white rounded-xl outline-hidden text-[#2C2416] transition-all"
                />
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E8DFC8] text-[10px] uppercase font-bold text-[#8C8272] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Profil Member</th>
                      <th className="px-5 py-3.5">Tier Membership</th>
                      <th className="px-5 py-3.5">Status Akun</th>
                      <th className="px-5 py-3.5">Saldo Poin</th>
                      <th className="px-5 py-3.5">Total Transaksi</th>
                      <th className="px-5 py-3.5 text-right">Aksi & Ledger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5EFE6]">
                    {loading && members.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-[#8C8272]">
                          <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[#C9A24A]" />
                          Memuat data member klinik...
                        </td>
                      </tr>
                    ) : filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-[#8C8272]">
                          <Users className="w-8 h-8 text-[#C9A24A]/40 mx-auto mb-2" />
                          <p className="font-bold text-[#2C2416]">Member Tidak Ditemukan</p>
                          <p className="text-[11px] mt-0.5">Tidak ada member yang cocok dengan filter pencarian.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((member) => {
                        const currentTier = member.membership_level || "bronze";
                        const tier = tierPresentation[currentTier] || tierPresentation.bronze;
                        const TierIcon = tier.Icon;

                        return (
                          <tr key={member.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C9A24A] to-[#8C6B1C] text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                                  {(member.name || "M").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-[#2C2416]">{member.name}</p>
                                  <p className="text-[10px] text-[#8C8272]">{member.email}</p>
                                  {member.whatsapp && (
                                    <p className="text-[10px] text-[#8C6B1C] flex items-center gap-1 mt-0.5 font-mono">
                                      <Phone className="w-2.5 h-2.5" />
                                      {member.whatsapp}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${tier.className}`}>
                                <TierIcon className="h-3.5 w-3.5" />
                                {tier.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Aktif
                              </span>
                            </td>
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              <span className="font-bold text-[#8C6B1C] bg-[#FAF5EA] px-2.5 py-1 rounded-lg border border-[#EADBBD] inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                                {new Intl.NumberFormat("id-ID").format(Number(member.membership_points) || 0)} Poin
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-[#2C2416]">
                              {formatCurrency(member.total_transactions)}
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <select
                                  aria-label={`Tier ${member.name}`}
                                  value={currentTier}
                                  onChange={(event) => void updateLevel(member, event.target.value as Tier)}
                                  disabled={savingId === member.id}
                                  className="h-8 rounded-xl border border-[#E8DFC8] bg-white px-2 text-xs font-semibold text-[#2C2416] outline-hidden focus:border-[#C9A24A] cursor-pointer"
                                >
                                  <option value="bronze">Bronze</option>
                                  <option value="gold">Gold</option>
                                  <option value="platinum">Platinum</option>
                                </select>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => void openHistoryModal(member)}
                                  className="h-8 px-2.5 text-xs font-semibold text-[#8C6B1C] border-[#E8DFC8] bg-white hover:bg-[#FAF8F5] rounded-xl cursor-pointer"
                                  title="Lihat Buku Besar Poin Member"
                                >
                                  <History className="h-3.5 w-3.5 mr-1" />
                                  Riwayat
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openManualAdjustmentModal(member)}
                                  className="h-8 px-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 rounded-xl cursor-pointer"
                                  title="Koreksi Manual Poin (Admin Adjustment)"
                                >
                                  Koreksi
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: RIWAYAT TRANSAKSI MEMBER */}
        {/* ========================================================================= */}
        {activeTab === "transaksi" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs">
                <span className="text-[11px] font-bold text-[#8C8272]">Total Transaksi</span>
                <p className="text-2xl font-black text-[#2C2416] mt-0.5">{metrics.totalTransactions}</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs">
                <span className="text-[11px] font-bold text-emerald-700">Lunas / Terverifikasi</span>
                <p className="text-2xl font-black text-emerald-600 mt-0.5">{metrics.paidTransactionsCount}</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs">
                <span className="text-[11px] font-bold text-amber-700">Menunggu Pembayaran</span>
                <p className="text-2xl font-black text-amber-600 mt-0.5">
                  {transactions.filter((t) => (t.status || "").toLowerCase() === "pending").length}
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs">
                <span className="text-[11px] font-bold text-[#8C6B1C]">Total Volume Transaksi</span>
                <p className="text-xl font-black text-[#8C6B1C] mt-1">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E8DFC8]">
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                {(["all", "paid", "pending", "failed"] as const).map((filter) => {
                  const label =
                    filter === "all" ? "Semua Status" : filter === "paid" ? "Terverifikasi (Lunas)" : filter === "pending" ? "Menunggu Pembayaran" : "Batal / Gagal";
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setTrxStatusFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        trxStatusFilter === filter
                          ? "bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] text-white shadow-2xs"
                          : "text-[#6B5E4F] hover:bg-[#FAF5EA] hover:text-[#8C6B1C]"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-[#8C8272] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari Order ID, nama pasien..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E8DFC8] focus:border-[#C9A24A] focus:bg-white rounded-xl outline-hidden text-[#2C2416] transition-all"
                />
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] border-b border-[#E8DFC8] text-[10px] uppercase font-bold text-[#8C8272] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Order ID & Waktu</th>
                      <th className="px-5 py-3.5">Pasien</th>
                      <th className="px-5 py-3.5">Upgrade Ke</th>
                      <th className="px-5 py-3.5">Nominal</th>
                      <th className="px-5 py-3.5">Status Verifikasi Midtrans</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5EFE6]">
                    {loading && transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-[#8C8272]">
                          <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[#C9A24A]" />
                          Memuat riwayat transaksi Midtrans...
                        </td>
                      </tr>
                    ) : filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-[#8C8272]">
                          <Receipt className="w-8 h-8 text-[#C9A24A]/40 mx-auto mb-2" />
                          <p className="font-bold text-[#2C2416]">Tidak Ada Riwayat Transaksi</p>
                          <p className="text-[11px] mt-0.5">Belum ada transaksi pembayaran membership yang sesuai dengan filter.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((trx) => {
                        const isPaid = ["paid", "approved", "completed", "settlement", "success"].includes((trx.status || "").toLowerCase());
                        const isPending = (trx.status || "").toLowerCase() === "pending";
                        const targetLevel = trx.metadata?.target_level || "gold";
                        const targetTierInfo = tierPresentation[targetLevel] || tierPresentation.gold;
                        const TargetIcon = targetTierInfo.Icon;

                        return (
                          <tr key={trx.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="font-mono font-bold text-[#2C2416]">{trx.metadata?.order_id || `UPG-#${trx.id}`}</p>
                              <p className="text-[10px] text-[#8C8272] mt-0.5">
                                {trx.created_at
                                  ? new Date(trx.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
                                  : "-"}
                              </p>
                            </td>
                            <td className="px-5 py-3.5">
                              <p className="font-bold text-[#2C2416]">{trx.user?.name || "Pasien"}</p>
                              <p className="text-[10px] text-[#8C8272] flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-[#8C6B1C]" />
                                {trx.user?.email || "-"}
                              </p>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${targetTierInfo.className}`}>
                                <TargetIcon className="w-3 h-3" />
                                {targetTierInfo.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-bold text-[#2C2416]">
                              {formatCurrency(trx.amount)}
                            </td>
                            <td className="px-5 py-3.5">
                              {isPaid ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Terverifikasi Midtrans (Lunas)
                                </span>
                              ) : isPending ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                  <Clock className="h-3.5 w-3.5 text-amber-600" /> Menunggu Pembayaran
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                                  <XCircle className="h-3.5 w-3.5 text-rose-600" /> {trx.status}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH / EDIT POINT RULE */}
      {/* ========================================================================= */}
      <Dialog open={isRuleModalOpen} onOpenChange={(open) => !open && setIsRuleModalOpen(false)}>
        <DialogContent className="max-w-md bg-white rounded-3xl border border-[#E8DFC8] shadow-2xl p-0 overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-[#FAF8F5] via-[#FAF5EA] to-[#F5EFE6] border-b border-[#E8DFC8] flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold text-[#2C2416]">
                {editingRule ? "Edit Aturan Poin" : "Tambah Aturan Poin Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#8C8272] mt-0.5">
                Konfigurasi perolehan poin otomatis untuk layanan medis yang selesai.
              </DialogDescription>
            </div>
          </div>

          <form onSubmit={handleSaveRule} className="space-y-3.5 p-5 text-xs">
            {/* Status Switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E8DFC8]">
              <div>
                <span className="font-bold text-[#2C2416] block">Status Aturan</span>
                <span className="text-[11px] text-[#8C8272]">
                  {ruleFormData.is_active ? "🟢 Aktif (Poin otomatis dihitung)" : "🔴 Nonaktif (Aturan dilewati)"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRuleFormData((prev) => ({ ...prev, is_active: !prev.is_active }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  ruleFormData.is_active ? "bg-emerald-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    ruleFormData.is_active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Rule Name */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8272] block mb-1">
                Nama Aturan / Judul *
              </label>
              <Input
                required
                value={ruleFormData.name}
                onChange={(e) => setRuleFormData({ ...ruleFormData, name: e.target.value })}
                placeholder="Contoh: Scaling & Polishing, Tambal Gigi Estetik"
                className="bg-[#FAF8F5] border-[#E8DFC8] rounded-xl text-xs"
              />
            </div>

            {/* Connected Clinic Service */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8272] block mb-1">
                Kategori Layanan Terkait (Opsional)
              </label>
              <select
                value={ruleFormData.service_id}
                onChange={(e) => {
                  const val = e.target.value;
                  const srv = clinicServices.find((s) => s.id === Number(val));
                  setRuleFormData({
                    ...ruleFormData,
                    service_id: val,
                    service_name: srv ? srv.title : "",
                    name: !ruleFormData.name && srv ? srv.title : ruleFormData.name,
                  });
                }}
                className="w-full h-9 px-3 bg-[#FAF8F5] border border-[#E8DFC8] rounded-xl text-xs text-[#2C2416] outline-hidden focus:border-[#C9A24A] cursor-pointer"
              >
                <option value="">-- Cocokkan Berdasarkan Kata Kunci Nama Layanan --</option>
                {clinicServices.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.title} ({srv.category || "Umum"})
                  </option>
                ))}
              </select>
            </div>

            {/* Points Awarded */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8272] block mb-1">
                Jumlah Poin yang Diperoleh Pasien *
              </label>
              <div className="relative">
                <Input
                  type="number"
                  required
                  min="1"
                  value={ruleFormData.points}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, points: e.target.value })}
                  placeholder="50"
                  className="bg-[#FAF8F5] border-[#E8DFC8] rounded-xl text-xs pr-12 font-bold text-[#8C6B1C]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C8272]">Poin</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8272] block mb-1">
                Keterangan / Catatan Aturan
              </label>
              <Input
                value={ruleFormData.description}
                onChange={(e) => setRuleFormData({ ...ruleFormData, description: e.target.value })}
                placeholder="Contoh: Perolehan poin untuk pasien yang telah menyelesaikan tindakan scaling"
                className="bg-[#FAF8F5] border-[#E8DFC8] rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsRuleModalOpen(false)} className="rounded-xl text-xs">
                Batal
              </Button>
              <Button
                type="submit"
                disabled={savingRule}
                className="bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                {savingRule ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                {editingRule ? "Simpan Perubahan" : "Buat Aturan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: RIWAYAT BUKU BESAR POIN MEMBER (RUNNING BALANCE LEDGER) */}
      {/* ========================================================================= */}
      <Dialog open={historyMember !== null} onOpenChange={(open) => !open && setHistoryMember(null)}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl border border-[#E8DFC8] shadow-2xl p-0 overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-[#FAF8F5] via-[#FAF5EA] to-[#F5EFE6] border-b border-[#E8DFC8]">
            <DialogTitle className="text-base font-bold text-[#2C2416]">Riwayat Buku Besar Poin Member</DialogTitle>
            <DialogDescription className="text-xs text-[#8C8272] mt-0.5">
              Member: <span className="font-bold text-[#2C2416]">{historyMember?.name}</span> ({historyMember?.email}) — Saldo Saat Ini:{" "}
              <strong className="text-[#8C6B1C] font-black whitespace-nowrap">{new Intl.NumberFormat("id-ID").format(Number(historyMember?.membership_points) || 0)} Poin</strong>
            </DialogDescription>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-4">
            {loadingMemberHistory ? (
              <div className="py-12 text-center text-[#8C8272]">
                <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[#C9A24A]" />
                Memuat riwayat mutasi poin member...
              </div>
            ) : memberHistoryItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8C8272]">Belum ada riwayat transaksi poin untuk member ini.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] border-b border-[#E8DFC8] uppercase text-[10px] font-bold text-[#8C8272]">
                  <tr>
                    <th className="px-3 py-2.5">Tanggal</th>
                    <th className="px-3 py-2.5">Sumber / Layanan</th>
                    <th className="px-3 py-2.5">Tipe</th>
                    <th className="px-3 py-2.5">Perubahan Poin</th>
                    <th className="px-3 py-2.5">Saldo (Awal ➔ Akhir)</th>
                    <th className="px-3 py-2.5">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5EFE6]">
                  {memberHistoryItems.map((item) => {
                    const isPositive = item.points > 0 || item.type === "earned";
                    return (
                      <tr key={item.id} className="hover:bg-[#FAF8F5]/80">
                        <td className="px-3 py-2.5 text-[#8C8272] whitespace-nowrap font-mono text-[10px]">
                          {new Date(item.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-[#2C2416]">
                          {item.reference_type === "reservation" ? `Reservasi #${item.reference_id}` : item.reference_type || "Sistem"}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 font-bold text-[9px] uppercase ${
                              item.type === "earned"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : item.type === "adjusted"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-rose-50 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className={`px-3 py-2.5 font-black ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                          {isPositive ? `+${item.points}` : item.points} Pts
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[10px]">
                          {item.balance_before !== undefined && item.balance_after !== undefined ? (
                            <span className="inline-flex items-center gap-1 font-bold text-[#8C6B1C]">
                              <span>{item.balance_before}</span>
                              <ArrowRight className="w-2.5 h-2.5 text-gray-400" />
                              <span className="text-black">{item.balance_after}</span>
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-[#4A3F35] text-[11px]">{item.description || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <DialogFooter className="px-5 py-3 bg-[#FAF8F5] border-t border-[#E8DFC8]">
            <Button variant="outline" size="sm" onClick={() => setHistoryMember(null)} className="rounded-xl text-xs">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: KOREKSI POIN MANUAL (MANUAL ADJUSTMENT) */}
      {/* ========================================================================= */}
      <Dialog open={adjustmentMember !== null} onOpenChange={(open) => !open && setAdjustmentMember(null)}>
        <DialogContent className="max-w-md bg-white rounded-3xl border border-[#E8DFC8] shadow-2xl p-0 overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-[#FAF8F5] via-[#FAF5EA] to-[#F5EFE6] border-b border-[#E8DFC8]">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <DialogTitle className="text-base font-bold text-[#2C2416]">Koreksi Poin Manual</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#8C8272] mt-0.5">
              Gunakan hanya untuk kompensasi kesalahan sistem atau koreksi manual. Setiap koreksi akan dicatat permanen dalam buku besar audit.
            </DialogDescription>
          </div>

          <div className="space-y-3.5 p-5 text-xs">
            <div className="p-3 bg-[#FAF5EA] rounded-xl border border-[#EADBBD] text-xs">
              <p className="text-[#8C8272]">Member Terpilih:</p>
              <p className="font-bold text-[#2C2416] text-sm mt-0.5">{adjustmentMember?.name}</p>
              <p className="text-[11px] text-[#8C6B1C] mt-0.5">
                Saldo Poin Saat Ini: <strong className="whitespace-nowrap">{new Intl.NumberFormat("id-ID").format(Number(adjustmentMember?.membership_points) || 0)} Poin</strong>
              </p>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8272] block mb-1.5">
                Tindakan Koreksi
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustmentAction("add")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 font-bold transition-all cursor-pointer ${
                    adjustmentAction === "add"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs"
                      : "border-[#E8DFC8] text-[#6B5E4F] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <Plus className="h-4 w-4 text-emerald-600" /> Tambah Poin
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustmentAction("deduct")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 font-bold transition-all cursor-pointer ${
                    adjustmentAction === "deduct"
                      ? "border-rose-500 bg-rose-50 text-rose-800 shadow-2xs"
                      : "border-[#E8DFC8] text-[#6B5E4F] hover:bg-[#FAF8F5]"
                  }`}
                >
                  <Minus className="h-4 w-4 text-rose-600" /> Kurangi Poin
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8272] block mb-1">
                Jumlah Poin Koreksi *
              </label>
              <Input
                type="number"
                min="1"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                placeholder="Contoh: 50"
                className="bg-[#FAF8F5] border-[#E8DFC8] rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C8272] block mb-1">
                Alasan Koreksi (Wajib untuk Audit Admin) *
              </label>
              <Input
                required
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder="Contoh: Kompensasi gangguan sistem reservasi / Penyesuaian koin promo"
                className="bg-[#FAF8F5] border-[#E8DFC8] rounded-xl text-xs"
              />
            </div>

            {adjustmentMember && Number(adjustmentAmount) > 0 && (
              <div className="rounded-xl border border-[#EADBBD] bg-[#FAF8F5] p-3 text-xs text-[#8C6B1C]">
                <p>
                  Proyeksi Saldo Akhir:{" "}
                  <strong>
                    {new Intl.NumberFormat("id-ID").format(adjustmentMember.membership_points)} {adjustmentAction === "add" ? "+" : "-"} {new Intl.NumberFormat("id-ID").format(Number(adjustmentAmount))} ={" "}
                    {new Intl.NumberFormat("id-ID").format(adjustmentAction === "add" ? adjustmentMember.membership_points + Number(adjustmentAmount) : adjustmentMember.membership_points - Number(adjustmentAmount))} Poin
                  </strong>
                </p>
                {adjustmentAction === "deduct" && adjustmentMember.membership_points - Number(adjustmentAmount) < 0 && (
                  <p className="mt-1 font-bold text-rose-600">⚠️ Peringatan: Saldo tidak cukup untuk pengurangan ini!</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="px-5 py-3 bg-[#FAF8F5] border-t border-[#E8DFC8] gap-2">
            <Button variant="ghost" size="sm" onClick={() => setAdjustmentMember(null)} className="rounded-xl text-xs">
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSaveManualAdjustment}
              disabled={savingAdjustment || !adjustmentReason.trim()}
              className="bg-gradient-to-r from-[#C9A24A] to-[#8C6B1C] hover:from-[#B8943F] hover:to-[#735514] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              {savingAdjustment ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Simpan Koreksi Manual
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
