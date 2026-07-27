import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import Header from "@/react-app/components/layout/Header";
import Footer from "@/react-app/components/layout/Footer";
import { Button } from "@/react-app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Badge } from "@/react-app/components/ui/badge";
import { listMyBookingRequestsDemo, type BookingRequest } from "@/react-app/lib/bookingDemo";

type Filter = "all" | "needs_action" | "pending" | "confirmed";

const statusLabel = (status: BookingRequest["status"]) => {
  switch (status) {
    case "pending_review":
      return "Menunggu diproses";
    case "proposal_sent":
      return "Butuh persetujuan Anda";
    case "confirmed":
      return "Terkonfirmasi";
    case "cancelled":
      return "Dibatalkan";
    case "expired":
      return "Kedaluwarsa";
    default:
      return status;
  }
};

const Timeline = ({ status }: { status: BookingRequest["status"] }) => {
  const steps = [
    { id: "created", label: "Dikirim" },
    { id: "processed", label: "Diproses" },
    { id: "approved", label: "Persetujuan" },
    { id: "confirmed", label: "Konfirmasi" },
  ] as const;

  const activeIndex =
    status === "confirmed"
      ? 3
      : status === "proposal_sent"
        ? 2
        : status === "pending_review"
          ? 1
          : 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {steps.map((s, idx) => {
        const active = idx <= activeIndex;
        return (
          <div key={s.id} className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${active ? "bg-brand-gold" : "bg-gray-200"}`}
              aria-hidden
            />
            <span className={`text-[11px] font-body ${active ? "text-brand-charcoal" : "text-brand-warm-gray"}`}>
              {s.label}
            </span>
            {idx !== steps.length - 1 && (
              <span className="text-[11px] text-brand-warm-gray" aria-hidden>
                —
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const statusVariant = (status: BookingRequest["status"]) => {
  switch (status) {
    case "proposal_sent":
      return "default" as const;
    case "confirmed":
      return "secondary" as const;
    case "pending_review":
      return "secondary" as const;
    default:
      return "secondary" as const;
  }
};

export default function BookingStatusPage() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const [filter, setFilter] = useState<Filter>("all");

  const requests = useMemo(() => listMyBookingRequestsDemo(), []);

  const filtered = useMemo(() => {
    switch (filter) {
      case "needs_action":
        return requests.filter((r) => r.status === "proposal_sent" && r.proposal);
      case "pending":
        return requests.filter((r) => r.status === "pending_review" || r.status === "proposal_sent");
      case "confirmed":
        return requests.filter((r) => r.status === "confirmed");
      default:
        return requests;
    }
  }, [filter, requests]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24 lg:pb-0">
        <section className="pt-6 pb-10 sm:pt-8 sm:pb-14 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-brand-charcoal">Status Booking</h1>
                  <p className="text-sm text-brand-warm-gray font-body mt-1">
                    Booking kamu akan tampil otomatis (menggunakan guest session di perangkat ini).
                  </p>
                </div>
                <Link to="/booking/new">
                  <Button className="h-11 rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body">
                    Buat Booking Baru
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                <Button
                  type="button"
                  variant={filter === "all" ? "default" : "outline"}
                  className="rounded-xl font-body"
                  onClick={() => setFilter("all")}
                >
                  Semua
                </Button>
                <Button
                  type="button"
                  variant={filter === "needs_action" ? "default" : "outline"}
                  className="rounded-xl font-body"
                  onClick={() => setFilter("needs_action")}
                >
                  Butuh Aksi
                </Button>
                <Button
                  type="button"
                  variant={filter === "pending" ? "default" : "outline"}
                  className="rounded-xl font-body"
                  onClick={() => setFilter("pending")}
                >
                  Diproses
                </Button>
                <Button
                  type="button"
                  variant={filter === "confirmed" ? "default" : "outline"}
                  className="rounded-xl font-body"
                  onClick={() => setFilter("confirmed")}
                >
                  Terkonfirmasi
                </Button>
              </div>

              {filtered.length === 0 ? (
                <Card className="rounded-[2rem] border border-border shadow-2xl shadow-black/5">
                  <CardContent className="py-10 text-center">
                    <p className="text-brand-warm-gray font-body">Belum ada booking.</p>
                    <div className="mt-5">
                      <Link to="/booking/new">
                        <Button className="rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body">
                          Buat Booking Pertama
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filtered.map((r) => {
                    const isHighlighted = highlightId === r.id;
                    return (
                      <Card
                        key={r.id}
                        className={`rounded-[1.5rem] border border-border shadow-lg shadow-black/5 ${
                          isHighlighted ? "ring-2 ring-brand-gold/50" : ""
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <CardTitle className="text-lg font-bold text-brand-charcoal">
                                {r.branch.name}
                              </CardTitle>
                              <p className="text-sm text-brand-warm-gray font-body mt-1">
                                {r.preferredDate} • Preferensi {r.preferredStartTime} - {r.preferredEndTime}
                              </p>
                            </div>
                            <Badge variant={statusVariant(r.status)}>{statusLabel(r.status)}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-sm text-brand-warm-gray font-body">
                              Atas nama: {r.patientName} • {r.phone}
                            </div>

                            {r.status === "proposal_sent" && r.proposal ? (
                              <Link to={`/booking/proposal/${encodeURIComponent(r.proposal.token)}`}>
                                <Button className="rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body">
                                  Lihat Jadwal yang Ditawarkan
                                </Button>
                              </Link>
                            ) : (
                              <Link to={`/booking/request/${encodeURIComponent(r.id)}`}>
                                <Button variant="outline" className="rounded-xl font-body">
                                  Detail
                                </Button>
                              </Link>
                            )}
                          </div>

                          <div className="mt-3">
                            <Timeline status={r.status} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
