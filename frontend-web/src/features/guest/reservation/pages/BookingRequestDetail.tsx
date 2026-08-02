import { useMemo } from "react";
import { Link, useParams } from "react-router";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { listMyBookingRequestsDemo, type BookingRequest } from "@/features/guest/reservation/services/bookingDemo";

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

export default function BookingRequestDetailPage() {
  const params = useParams();
  const id = params.id ?? "";

  const request = useMemo(() => {
    const all = listMyBookingRequestsDemo();
    return all.find((r) => r.id === id) ?? null;
  }, [id]);

  if (!request) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pb-24 lg:pb-0">
          <section className="pt-6 pb-10 sm:pt-8 sm:pb-14 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <Card className="rounded-[2rem] border border-border shadow-2xl shadow-black/5">
                  <CardContent className="py-10 text-center">
                    <p className="text-brand-warm-gray font-body">Request booking tidak ditemukan.</p>
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
                      <CardTitle className="text-2xl font-bold text-brand-charcoal">Detail Booking</CardTitle>
                      <p className="text-sm text-brand-warm-gray font-body mt-1">Ringkasan permintaan booking Anda.</p>
                    </div>
                    <Badge variant="secondary">{statusLabel(request.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-border p-4">
                    <div className="text-sm text-brand-warm-gray font-body">Cabang</div>
                    <div className="text-lg font-bold text-brand-charcoal">{request.branch.name}</div>
                    <div className="text-sm text-brand-warm-gray font-body mt-1">{request.branch.address}</div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      <a href={request.branch.mapLink} target="_blank" rel="noreferrer">
                        <Button variant="outline" className="rounded-xl font-body">Buka Maps</Button>
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border p-4">
                      <div className="text-sm text-brand-warm-gray font-body">Tanggal</div>
                      <div className="font-semibold text-brand-charcoal">{request.preferredDate}</div>
                    </div>
                    <div className="rounded-2xl border border-border p-4">
                      <div className="text-sm text-brand-warm-gray font-body">Preferensi Waktu</div>
                      <div className="font-semibold text-brand-charcoal">
                        {request.preferredStartTime} - {request.preferredEndTime}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border p-4">
                    <div className="text-sm text-brand-warm-gray font-body">Atas nama</div>
                    <div className="font-semibold text-brand-charcoal">{request.patientName}</div>
                    <div className="text-sm text-brand-warm-gray font-body mt-1">{request.phone}</div>
                  </div>

                  {request.status === "proposal_sent" && request.proposal && (
                    <div className="rounded-2xl border border-border p-4">
                      <div className="text-sm text-brand-warm-gray font-body">Jadwal ditawarkan</div>
                      <div className="font-semibold text-brand-charcoal mt-1">
                        {request.proposal.proposedDate} • {request.proposal.proposedTime} • {request.proposal.doctor.name}
                      </div>
                      <div className="mt-3">
                        <Link to={`/booking/proposal/${encodeURIComponent(request.proposal.token)}`}>
                          <Button className="rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body">
                            Buka Halaman Persetujuan
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="pt-1">
                    <Link to="/booking/status" className="text-sm text-brand-gold underline underline-offset-4 font-body">
                      Kembali ke Status Booking
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
