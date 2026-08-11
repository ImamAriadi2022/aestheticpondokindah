import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/core/layouts/DashboardLayout";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { apiClient } from "@/core/api/apiClient";
import { toast } from "@/shared/ui/toast";
import { CheckCircle2, Clock, Crown, History, Loader2, Minus, Plus, RefreshCw, Search, Star, Sparkles, ShieldCheck, XCircle } from "lucide-react";

type Tier = "bronze" | "gold" | "platinum";

type Member = {
  id: number;
  name: string;
  email: string;
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

type PointHistoryItem = {
  id: number;
  points: number;
  type: "earned" | "redeemed" | "expired" | "adjusted";
  description: string | null;
  created_at: string;
};

const tierPresentation: Record<Tier, { label: string; className: string; Icon: typeof Star }> = {
  bronze: { label: "Bronze", className: "bg-orange-50 text-orange-700 border-orange-200", Icon: Star },
  gold: { label: "Gold", className: "bg-[#fffbeb] text-[#a8843a] border-[#fef3c7]", Icon: Crown },
  platinum: { label: "Platinum", className: "bg-slate-100 text-slate-700 border-slate-200", Icon: Sparkles },
};

const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(amount || 0));

export default function AdminMembershipPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<MembershipTransactionItem[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<"all" | Tier>("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  // Point Adjustment Modal State
  const [pointMember, setPointMember] = useState<Member | null>(null);
  const [pointAction, setPointAction] = useState<"add" | "deduct">("add");
  const [pointAmount, setPointAmount] = useState<number>(0);
  const [pointNote, setPointNote] = useState("");

  // Point History Modal State
  const [historyMember, setHistoryMember] = useState<Member | null>(null);
  const [historyItems, setHistoryItems] = useState<PointHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (level !== "all") query.set("level", level);

      const [memberResponse, transactionResponse] = await Promise.all([
        apiClient.get<{ data: { data: Member[] } }>(`/admin/membership${query.size ? `?${query}` : ""}`),
        apiClient.get<{ data: { data: MembershipTransactionItem[] } }>("/admin/membership/upgrade-requests?status=all"),
      ]);
      setMembers(memberResponse.data.data);
      setTransactions(transactionResponse.data.data);
    } catch {
      // apiClient handles error toast
    } finally {
      setLoading(false);
    }
  }, [level, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 250);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const updateLevel = async (member: Member, nextLevel: Tier) => {
    if (nextLevel === (member.membership_level || "bronze")) return;
    setSavingId(member.id);
    try {
      await apiClient.patch(`/admin/membership/${member.id}/level`, {
        level: nextLevel,
        reason: "Penyesuaian tier melalui panel admin",
      });
      toast({ title: "Tier diperbarui", message: `${member.name} sekarang ${tierPresentation[nextLevel].label}.`, variant: "success" });
      await loadData();
    } catch {
      // apiClient presents the error.
    } finally {
      setSavingId(null);
    }
  };

  const openPointModal = (member: Member) => {
    setPointMember(member);
    setPointAction("add");
    setPointAmount(0);
    setPointNote("");
  };

  const adjustPoints = async () => {
    if (!pointMember || !Number.isInteger(pointAmount) || pointAmount <= 0) {
      toast({ title: "Jumlah poin diperlukan", message: "Masukkan angka poin positif yang valid.", variant: "warning" });
      return;
    }

    const finalPoints = pointAction === "add" ? pointAmount : -pointAmount;
    const projectedBalance = pointMember.membership_points + finalPoints;

    if (projectedBalance < 0) {
      toast({ title: "Saldo poin tidak mencukupi", message: "Pengurangan poin akan menyebabkan saldo menjadi negatif.", variant: "warning" });
      return;
    }

    setSavingId(pointMember.id);
    try {
      await apiClient.patch(`/admin/membership/${pointMember.id}/points`, {
        points: finalPoints,
        type: pointAction === "add" ? "earned" : "redeemed",
        description: pointNote.trim() || (pointAction === "add" ? "Penambahan poin oleh admin" : "Pengurangan poin oleh admin"),
      });
      toast({ title: "Poin berhasil diperbarui", message: `Saldo poin ${pointMember.name} telah disesuaikan.`, variant: "success" });
      setPointMember(null);
      await loadData();
    } catch {
      // apiClient presents error
    } finally {
      setSavingId(null);
    }
  };

  const openHistoryModal = async (member: Member) => {
    setHistoryMember(member);
    setLoadingHistory(true);
    try {
      const response = await apiClient.get<{ data: { data: PointHistoryItem[] } }>(`/admin/membership/${member.id}/points-history`);
      setHistoryItems(response.data.data);
    } catch {
      toast({ title: "Gagal memuat riwayat", message: "Tidak dapat mengambil riwayat poin member.", variant: "error" });
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <DashboardLayout role="clinic">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#a8843a]">Admin Klinik</p>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Membership & Poin</h1>
            <p className="mt-1 text-sm text-gray-500">Atur tier, saldo poin/koin member, dan pantau bukti riwayat pembayaran Midtrans otomatis.</p>
          </div>
          <Button variant="outline" onClick={() => void loadData()} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Muat ulang
          </Button>
        </div>

        {/* Card Bukti Pembayaran Midtrans Otomatis */}
        <Card className="shadow-sm border-emerald-100">
          <CardHeader className="border-b border-emerald-100 bg-emerald-50/40">
            <CardTitle className="flex items-center gap-2 text-base text-gray-900">
              <ShieldCheck className="h-5 w-5 text-emerald-600" /> Riwayat Transaksi & Bukti Pembayaran Midtrans
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Order ID / Tanggal</th>
                    <th className="px-5 py-3">Pasien</th>
                    <th className="px-5 py-3">Upgrade Ke</th>
                    <th className="px-5 py-3">Nominal</th>
                    <th className="px-5 py-3">Status Verifikasi Midtrans</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-6 text-center text-gray-500">
                        <Loader2 className="mx-auto mb-1.5 h-4 w-4 animate-spin text-emerald-600" />
                        Memuat riwayat transaksi Midtrans…
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-6 text-center text-gray-500">
                        Belum ada riwayat transaksi pembayaran Midtrans.
                      </td>
                    </tr>
                  ) : (
                    transactions.slice(0, 10).map((trx) => {
                      const isPaid = ["paid", "approved", "completed", "settlement", "success"].includes(trx.status.toLowerCase());
                      const isPending = trx.status.toLowerCase() === "pending";
                      const targetLevel = trx.metadata?.target_level || "gold";
                      const targetTierInfo = tierPresentation[targetLevel];

                      return (
                        <tr key={trx.id} className="hover:bg-emerald-50/20">
                          <td className="px-5 py-3.5">
                            <p className="font-bold text-gray-900">{trx.metadata?.order_id || `UPG-#${trx.id}`}</p>
                            <p className="text-[11px] text-gray-500">
                              {new Date(trx.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-gray-900">{trx.user?.name || "Pasien"}</p>
                            <p className="text-[11px] text-gray-500">{trx.user?.email || "-"}</p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${targetTierInfo.className}`}>
                              {targetTierInfo.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-gray-800">{formatCurrency(trx.amount)}</td>
                          <td className="px-5 py-3.5">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Terverifikasi Midtrans (Lunas)
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                <Clock className="h-3.5 w-3.5 text-amber-600" /> Menunggu Pembayaran
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
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
          </CardContent>
        </Card>

        {/* Tabel Daftar Member */}
        <Card className="shadow-sm">
          <CardHeader className="gap-4 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base text-gray-900">Daftar Member & Saldo Poin</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau email" className="pl-9" />
              </div>
              <select value={level} onChange={(event) => setLevel(event.target.value as "all" | Tier)} className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700">
                <option value="all">Semua tier</option>
                <option value="bronze">Bronze</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Member</th>
                    <th className="px-5 py-3">Tier</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Saldo Poin</th>
                    <th className="px-5 py-3">Total Transaksi</th>
                    <th className="px-5 py-3 text-right">Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                        <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                        Memuat data member…
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                        Member tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    members.map((member) => {
                      const currentTier = member.membership_level || "bronze";
                      const tier = tierPresentation[currentTier];
                      const TierIcon = tier.Icon;
                      return (
                        <tr key={member.id} className="hover:bg-amber-50/20">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${tier.className}`}>
                              <TierIcon className="h-3.5 w-3.5" />
                              {tier.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 capitalize text-gray-600">
                            {currentTier === "bronze" ? "Aktif (Gratis)" : member.membership_status === "active" ? "Aktif" : member.membership_status === "pending" ? "Pending" : "Nonaktif"}
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-[#a8843a] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                              {member.membership_points || 0} Poin
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-600">{formatCurrency(member.total_transactions)}</td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <select
                                aria-label={`Tier ${member.name}`}
                                value={currentTier}
                                onChange={(event) => void updateLevel(member, event.target.value as Tier)}
                                disabled={savingId === member.id}
                                className="h-9 rounded-md border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700"
                              >
                                <option value="bronze">Bronze</option>
                                <option value="gold">Gold</option>
                                <option value="platinum">Platinum</option>
                              </select>
                              <Button size="sm" variant="outline" onClick={() => openPointModal(member)} disabled={savingId === member.id} className="gap-1 text-xs">
                                Atur Poin
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => void openHistoryModal(member)} className="gap-1 text-xs text-gray-600 hover:text-gray-900">
                                <History className="h-3.5 w-3.5" /> Riwayat
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
          </CardContent>
        </Card>
      </div>

      {/* Point Adjustment Modal */}
      <Dialog open={pointMember !== null} onOpenChange={(open) => !open && setPointMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Penyesuaian Poin Member</DialogTitle>
            <DialogDescription>
              Member: <span className="font-semibold text-gray-900">{pointMember?.name}</span> (Saldo Saat Ini:{" "}
              <strong className="text-[#a8843a]">{pointMember?.membership_points || 0} Poin</strong>)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Jenis Aksi</label>
              <div className="mt-1.5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPointAction("add")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-semibold transition-all ${
                    pointAction === "add" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Plus className="h-4 w-4" /> Tambah Poin
                </button>
                <button
                  type="button"
                  onClick={() => setPointAction("deduct")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-semibold transition-all ${
                    pointAction === "deduct" ? "border-rose-500 bg-rose-50 text-rose-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Minus className="h-4 w-4" /> Kurangi Poin
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Jumlah Poin</label>
              <Input
                type="number"
                min="1"
                value={pointAmount || ""}
                onChange={(e) => setPointAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                placeholder="Contoh: 100"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Alasan / Catatan Admin</label>
              <Input
                value={pointNote}
                onChange={(e) => setPointNote(e.target.value)}
                placeholder="Contoh: Reward perbaikan layanan / Penyesuaian koin"
                className="mt-1"
              />
            </div>

            {pointMember && pointAmount > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800">
                <p>
                  Proyeksi Saldo Baru:{" "}
                  <strong>
                    {pointMember.membership_points} {pointAction === "add" ? "+" : "-"} {pointAmount} ={" "}
                    {pointAction === "add" ? pointMember.membership_points + pointAmount : pointMember.membership_points - pointAmount} Poin
                  </strong>
                </p>
                {pointAction === "deduct" && pointMember.membership_points - pointAmount < 0 && (
                  <p className="mt-1 font-semibold text-rose-600">⚠️ Peringatan: Saldo tidak cukup untuk pengurangan ini!</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPointMember(null)}>
              Batal
            </Button>
            <Button onClick={() => void adjustPoints()} disabled={savingId === pointMember?.id} className="bg-[#c9a24a] text-[#fff] hover:bg-[#a8843a]">
              {savingId === pointMember?.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Simpan Penyesuaian
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Point History Modal */}
      <Dialog open={historyMember !== null} onOpenChange={(open) => !open && setHistoryMember(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Riwayat Ledger Poin Member</DialogTitle>
            <DialogDescription>
              Member: <span className="font-semibold text-gray-900">{historyMember?.name}</span> ({historyMember?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[380px] overflow-y-auto pr-1">
            {loadingHistory ? (
              <div className="py-12 text-center text-gray-500">
                <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[#a8843a]" />
                Memuat riwayat transaksi poin…
              </div>
            ) : historyItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">Belum ada riwayat transaksi poin untuk member ini.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2.5">Tanggal</th>
                    <th className="px-3 py-2.5">Tipe</th>
                    <th className="px-3 py-2.5">Perubahan Poin</th>
                    <th className="px-3 py-2.5">Keterangan / Alasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historyItems.map((item) => {
                    const isPositive = item.points > 0 || item.type === "earned";
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80">
                        <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                          {new Date(item.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-block rounded px-2 py-0.5 font-semibold text-[10px] uppercase ${
                              item.type === "earned"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.type === "redeemed"
                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className={`px-3 py-2.5 font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                          {isPositive ? `+${item.points}` : item.points} Poin
                        </td>
                        <td className="px-3 py-2.5 text-gray-700">{item.description || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryMember(null)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
