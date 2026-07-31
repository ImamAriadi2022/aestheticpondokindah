import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  acceptProposalDemo,
  getProposalByTokenDemo,
  requestChangeProposalDemo,
} from "@/features/reservation/services/bookingDemo";

const timeLeftLabel = (expiresAt: string) => {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Kedaluwarsa";
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hours <= 0) return `${remMins} menit`;
  return `${hours} jam ${remMins} menit`;
};

export default function BookingProposalPage() {
  const params = useParams();
  const navigate = useNavigate();
  const token = params.token ?? "";

  const proposal = useMemo(() => (token ? getProposalByTokenDemo(token) : null), [token]);

  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "change">("view");
  const [submitting, setSubmitting] = useState(false);
  const [acceptedRequestId, setAcceptedRequestId] = useState<string | null>(null);

  const [changeForm, setChangeForm] = useState({
    reason: "",
    preferredStartTime: "",
    preferredEndTime: "",
  });

  const onAccept = () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = acceptProposalDemo(token);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setAcceptedRequestId(res.requestId);
    } finally {
      setSubmitting(false);
    }
  };

  const onRequestChange = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!changeForm.reason) {
      setError("Alasan wajib diisi.");
      return;
    }

    if (!changeForm.preferredStartTime || !changeForm.preferredEndTime) {
      setError("Range waktu baru wajib diisi.");
      return;
    }

    if (changeForm.preferredStartTime >= changeForm.preferredEndTime) {
      setError("Jam mulai harus lebih kecil dari jam selesai.");
      return;
    }

    setSubmitting(true);
    try {
      const res = requestChangeProposalDemo(token, {
        reason: changeForm.reason,
        preferredStartTime: changeForm.preferredStartTime,
        preferredEndTime: changeForm.preferredEndTime,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      navigate(`/booking/status?highlight=${encodeURIComponent(res.requestId)}`, { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  if (!proposal) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pb-24 lg:pb-0">
          <section className="pt-6 pb-10 sm:pt-8 sm:pb-14 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <Card className="rounded-[2rem] border border-border shadow-2xl shadow-black/5">
                  <CardContent className="py-10 text-center">
                    <p className="text-brand-warm-gray font-body">Jadwal tidak ditemukan.</p>
                    <div className="mt-5">
                      <Link to="/booking/status">
                        <Button className="rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body">
                          Kembali ke Status Booking
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const expired = proposal.status === "expired" || new Date(proposal.expiresAt).getTime() < Date.now();

  if (acceptedRequestId) {
    const whatsappDigits = proposal.branch.whatsapp.replace(/\D/g, "");
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pb-24 lg:pb-0">
          <section className="pt-6 pb-10 sm:pt-8 sm:pb-14 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <Card className="rounded-[2rem] border border-border shadow-2xl shadow-black/5">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold text-brand-charcoal">Booking Terkonfirmasi</CardTitle>
                    <p className="text-sm text-brand-warm-gray font-body mt-1">
                      Jadwal Anda sudah kami catat. Sampai jumpa di klinik.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-border p-4">
                      <div className="text-sm text-brand-warm-gray font-body">Ringkasan</div>
                      <div className="mt-2 space-y-1">
                        <div className="text-sm font-semibold text-brand-charcoal">{proposal.branch.name}</div>
                        <div className="text-sm text-brand-warm-gray font-body">{proposal.proposedDate} • {proposal.proposedTime}</div>
                        <div className="text-sm text-brand-warm-gray font-body">{proposal.doctor.name}</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        className="flex-1 h-12 rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body"
                        onClick={() => navigate(`/booking/status?highlight=${encodeURIComponent(acceptedRequestId)}`, { replace: true })}
                      >
                        Lihat Status Booking
                      </Button>
                      <a
                        className="flex-1"
                        href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
                          `Halo, saya sudah setuju proposal booking (ID: ${acceptedRequestId}). Mohon info jika ada yang perlu dipersiapkan.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button variant="outline" className="w-full h-12 rounded-xl font-body">
                          Chat WhatsApp Cabang
                        </Button>
                      </a>
                    </div>

                    <div>
                      <Link to="/booking/new" className="text-sm text-brand-gold underline underline-offset-4 font-body">
                        Buat booking lain
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24 lg:pb-0">
        <section className="pt-6 pb-10 sm:pt-8 sm:pb-14 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="rounded-[2rem] border border-border shadow-2xl shadow-black/5">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-2xl font-bold text-brand-charcoal">Konfirmasi Jadwal</CardTitle>
                      <p className="text-sm text-brand-warm-gray font-body mt-1">
                        Silakan setujui jadwal yang ditawarkan cabang.
                      </p>
                    </div>
                    <Badge variant={expired ? "secondary" : "default"}>
                      {expired ? "Kedaluwarsa" : `Berlaku ${timeLeftLabel(proposal.expiresAt)}`}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-border p-4">
                      <div className="text-sm text-brand-warm-gray font-body">Cabang</div>
                      <div className="text-lg font-bold text-brand-charcoal">{proposal.branch.name}</div>
                      <div className="text-sm text-brand-warm-gray font-body mt-1">{proposal.branch.address}</div>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <a href={proposal.branch.mapLink} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="rounded-xl font-body">Buka Maps</Button>
                        </a>
                        <a
                          href={`https://wa.me/${proposal.branch.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Halo, saya ingin konfirmasi booking saya. Token: ${proposal.token}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="outline" className="rounded-xl font-body">Chat WhatsApp Cabang</Button>
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-border p-4">
                        <div className="text-sm text-brand-warm-gray font-body">Dokter</div>
                        <div className="font-semibold text-brand-charcoal">{proposal.doctor.name}</div>
                      </div>
                      <div className="rounded-2xl border border-border p-4">
                        <div className="text-sm text-brand-warm-gray font-body">Tanggal</div>
                        <div className="font-semibold text-brand-charcoal">{proposal.proposedDate}</div>
                      </div>
                      <div className="rounded-2xl border border-border p-4">
                        <div className="text-sm text-brand-warm-gray font-body">Jam</div>
                        <div className="font-semibold text-brand-charcoal">{proposal.proposedTime}</div>
                      </div>
                    </div>

                    {error && (
                      <div className="text-xs text-red-600 font-body" role="alert">
                        {error}
                      </div>
                    )}

                    {mode === "change" ? (
                      <form onSubmit={onRequestChange} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reason">Alasan dan preferensi Anda</Label>
                          <Input
                            id="reason"
                            className="h-12 rounded-xl font-body"
                            value={changeForm.reason}
                            onChange={(e) => setChangeForm((p) => ({ ...p, reason: e.target.value }))}
                            placeholder="Contoh: saya hanya bisa setelah jam 14:00"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label htmlFor="preferredStartTime">Jam mulai (baru)</Label>
                            <Input
                              id="preferredStartTime"
                              type="time"
                              className="h-12 rounded-xl font-body"
                              value={changeForm.preferredStartTime}
                              onChange={(e) => setChangeForm((p) => ({ ...p, preferredStartTime: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="preferredEndTime">Jam selesai (baru)</Label>
                            <Input
                              id="preferredEndTime"
                              type="time"
                              className="h-12 rounded-xl font-body"
                              value={changeForm.preferredEndTime}
                              onChange={(e) => setChangeForm((p) => ({ ...p, preferredEndTime: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-12 rounded-xl font-body"
                            onClick={() => setMode("view")}
                            disabled={submitting}
                          >
                            Kembali
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 h-12 rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body"
                            disabled={submitting || expired}
                          >
                            {submitting ? "Mengirim..." : "Kirim Permintaan Ubah"}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          className="flex-1 h-12 rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body"
                          onClick={onAccept}
                          disabled={submitting || expired}
                        >
                          {submitting ? "Memproses..." : "Setuju Jadwal Ini"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 h-12 rounded-xl font-body"
                          onClick={() => setMode("change")}
                          disabled={submitting || expired}
                        >
                          Minta Ubah Jadwal
                        </Button>
                      </div>
                    )}

                    <div className="pt-2">
                      <Link to="/booking/status" className="text-sm text-brand-gold underline underline-offset-4 font-body">
                        Kembali ke Status Booking
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
