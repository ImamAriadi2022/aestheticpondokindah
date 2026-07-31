import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiClient } from "@/lib/apiClient";
import { toast } from "@/components/ui/toast";
import { Crown, Loader2, RefreshCw, Search, Star, Sparkles, Wallet } from "lucide-react";

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

type UpgradeRequest = {
  id: number;
  amount: string | number;
  status: string;
  created_at: string;
  metadata?: { target_level?: Tier; order_id?: string; payment_mode?: string };
  user: Pick<Member, "name" | "email" | "whatsapp">;
};

const tierPresentation: Record<Tier, { label: string; className: string; Icon: typeof Star }> = {
  bronze: { label: "Bronze", className: "bg-orange-50 text-orange-700 border-orange-200", Icon: Star },
  gold: { label: "Gold", className: "bg-amber-50 text-amber-700 border-amber-200", Icon: Crown },
  platinum: { label: "Platinum", className: "bg-slate-100 text-slate-700 border-slate-200", Icon: Sparkles },
};

const formatCurrency = (amount: string | number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(amount || 0));

export default function AdminMembershipPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [requests, setRequests] = useState<UpgradeRequest[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<"all" | Tier>("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [pointMember, setPointMember] = useState<Member | null>(null);
  const [pointAdjustment, setPointAdjustment] = useState(0);
  const [pointNote, setPointNote] = useState("");
  const [paymentRequest, setPaymentRequest] = useState<UpgradeRequest | null>(null);
  const [paymentNote, setPaymentNote] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set("search", search.trim());
      if (level !== "all") query.set("level", level);

      const [memberResponse, requestResponse] = await Promise.all([
        apiClient.get<{ data: { data: Member[] } }>(`/admin/membership${query.size ? `?${query}` : ""}`),
        apiClient.get<{ data: { data: UpgradeRequest[] } }>("/admin/membership/upgrade-requests?status=pending"),
      ]);
      setMembers(memberResponse.data.data);
      setRequests(requestResponse.data.data);
    } catch {
      // apiClient already shows the actionable error toast.
    } finally {
      setLoading(false);
    }
  }, [level, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 250);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const pendingManualRequests = useMemo(
    () => requests.filter((request) => request.metadata?.payment_mode === "manual_confirmation" || !request.metadata?.payment_mode),
    [requests],
  );

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

  const adjustPoints = async () => {
    if (!pointMember || !Number.isInteger(pointAdjustment) || pointAdjustment === 0) {
      toast({ title: "Nominal poin diperlukan", message: "Masukkan penyesuaian poin selain 0.", variant: "warning" });
      return;
    }
    setSavingId(pointMember.id);
    try {
      await apiClient.patch(`/admin/membership/${pointMember.id}/points`, {
        points: pointAdjustment,
        type: "adjusted",
        description: pointNote.trim() || "Penyesuaian poin oleh admin",
      });
      toast({ title: "Poin diperbarui", message: `Saldo poin ${pointMember.name} telah disesuaikan.`, variant: "success" });
      setPointMember(null);
      setPointAdjustment(0);
      setPointNote("");
      await loadData();
    } catch {
      // apiClient presents the error.
    } finally {
      setSavingId(null);
    }
  };

  const confirmManualPayment = async () => {
    if (!paymentRequest) return;
    setSavingId(paymentRequest.id);
    try {
      await apiClient.post(`/admin/membership/upgrade-requests/${paymentRequest.id}/confirm-payment`, {
        note: paymentNote.trim() || undefined,
      });
      toast({ title: "Pembayaran dikonfirmasi", message: "Tier member dan poin bonus telah diperbarui.", variant: "success" });
      setPaymentRequest(null);
      setPaymentNote("");
      await loadData();
    } catch {
      // apiClient presents the error.
    } finally {
      setSavingId(null);
    }
  };

  return (
    <DashboardLayout role="clinic">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 pb-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#a8843a]">Admin Klinik</p>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Membership</h1>
            <p className="mt-1 text-sm text-gray-500">Atur tier dan poin member, serta konfirmasi pembayaran upgrade manual.</p>
          </div>
          <Button variant="outline" onClick={() => void loadData()} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Muat ulang
          </Button>
        </div>

        <Card className="border-amber-100 shadow-sm">
          <CardHeader className="border-b border-amber-100 bg-amber-50/40">
            <CardTitle className="flex items-center gap-2 text-base text-gray-900"><Wallet className="h-5 w-5 text-[#a8843a]" /> Pembayaran manual menunggu konfirmasi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {pendingManualRequests.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">Tidak ada pembayaran membership yang menunggu konfirmasi.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingManualRequests.map((request) => (
                  <div key={request.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{request.user.name}</p>
                      <p className="text-sm text-gray-500">{request.metadata?.order_id || `Transaksi #${request.id}`} · {formatCurrency(request.amount)} · ke {tierPresentation[request.metadata?.target_level || "gold"].label}</p>
                    </div>
                    <Button onClick={() => setPaymentRequest(request)} disabled={savingId === request.id} className="bg-[#c9a24a] text-white hover:bg-[#a8843a]">
                      {savingId === request.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Konfirmasi pembayaran
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="gap-4 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base text-gray-900">Daftar Member</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau email" className="pl-9" /></div>
              <select value={level} onChange={(event) => setLevel(event.target.value as "all" | Tier)} className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700">
                <option value="all">Semua tier</option><option value="bronze">Bronze</option><option value="gold">Gold</option><option value="platinum">Platinum</option>
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-3">Member</th><th className="px-5 py-3">Tier</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Poin</th><th className="px-5 py-3">Transaksi</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-500"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Memuat data member…</td></tr> : members.length === 0 ? <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-500">Member tidak ditemukan.</td></tr> : members.map((member) => {
                    const currentTier = member.membership_level || "bronze";
                    const tier = tierPresentation[currentTier];
                    const TierIcon = tier.Icon;
                    return <tr key={member.id} className="hover:bg-amber-50/20"><td className="px-5 py-4"><p className="font-semibold text-gray-900">{member.name}</p><p className="text-xs text-gray-500">{member.email}</p></td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${tier.className}`}><TierIcon className="h-3.5 w-3.5" />{tier.label}</span></td><td className="px-5 py-4 capitalize text-gray-600">{member.membership_status || "inactive"}</td><td className="px-5 py-4 font-semibold text-gray-700">{member.membership_points || 0}</td><td className="px-5 py-4 text-gray-600">{formatCurrency(member.total_transactions)}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><select aria-label={`Tier ${member.name}`} value={currentTier} onChange={(event) => void updateLevel(member, event.target.value as Tier)} disabled={savingId === member.id} className="h-9 rounded-md border border-gray-200 bg-white px-2 text-xs"><option value="bronze">Bronze</option><option value="gold">Gold</option><option value="platinum">Platinum</option></select><Button size="sm" variant="outline" onClick={() => setPointMember(member)} disabled={savingId === member.id}>Poin</Button></div></td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={pointMember !== null} onOpenChange={(open) => !open && setPointMember(null)}>
        <DialogContent><DialogHeader><DialogTitle>Sesuaikan poin membership</DialogTitle></DialogHeader><p className="text-sm text-gray-500">Member: <span className="font-semibold text-gray-800">{pointMember?.name}</span>. Gunakan nilai negatif untuk mengurangi poin.</p><Input type="number" value={pointAdjustment} onChange={(event) => setPointAdjustment(Number(event.target.value))} placeholder="Contoh: 100 atau -50" /><Input value={pointNote} onChange={(event) => setPointNote(event.target.value)} placeholder="Catatan penyesuaian (opsional)" /><DialogFooter><Button variant="outline" onClick={() => setPointMember(null)}>Batal</Button><Button onClick={() => void adjustPoints()} disabled={savingId === pointMember?.id} className="bg-[#c9a24a] text-white hover:bg-[#a8843a]">Simpan poin</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={paymentRequest !== null} onOpenChange={(open) => !open && setPaymentRequest(null)}>
        <DialogContent><DialogHeader><DialogTitle>Konfirmasi pembayaran upgrade</DialogTitle></DialogHeader><p className="text-sm text-gray-600">Konfirmasi hanya setelah bukti pembayaran {paymentRequest?.user.name} diterima. Tier akan langsung di-upgrade dan poin bonus ditambahkan.</p><Input value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} placeholder="Catatan admin (opsional)" /><DialogFooter><Button variant="outline" onClick={() => setPaymentRequest(null)}>Batal</Button><Button onClick={() => void confirmManualPayment()} disabled={savingId === paymentRequest?.id} className="bg-[#c9a24a] text-white hover:bg-[#a8843a]">Konfirmasi pembayaran</Button></DialogFooter></DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
