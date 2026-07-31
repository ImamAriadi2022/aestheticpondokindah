import { Link, useParams } from "react-router";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, MessageCircle, ArrowLeft } from "lucide-react";
import { getDemoBranches } from "@/lib/bookingDemo";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function BranchDetailPage() {
  const params = useParams();
  const slug = params.slug ?? "";

  const branches = getDemoBranches().map((b) => ({ ...b, slug: slugify(b.name) }));
  const branch = branches.find((b) => b.slug === slug) ?? null;

  if (!branch) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pb-24 lg:pb-0">
          <section className="pt-6 pb-10 sm:pt-8 sm:pb-14 bg-background">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <Card className="rounded-[2rem] border border-border shadow-2xl shadow-black/5">
                  <CardContent className="py-10 text-center">
                    <p className="text-brand-warm-gray font-body">Cabang tidak ditemukan.</p>
                    <div className="mt-5">
                      <Link to="/branches">
                        <Button className="rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body">
                          Kembali ke Daftar Cabang
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

  const whatsappDigits = branch.whatsapp.replace(/\D/g, "");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24 lg:pb-0">
        <section className="relative py-14 sm:py-20 bg-gradient-to-br from-brand-cream via-background to-brand-gold-light/30 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
              <Link to="/branches" className="inline-flex items-center text-sm text-brand-warm-gray hover:text-brand-charcoal transition-colors font-body">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Link>

              <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-brand-charcoal">
                {branch.name}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-brand-warm-gray font-body leading-relaxed flex gap-2">
                <MapPin className="w-5 h-5 text-brand-gold mt-0.5" />
                <span>{branch.address}</span>
              </p>

              <div className="mt-6 flex gap-2 flex-wrap">
                <a href={branch.mapLink} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="rounded-xl font-body">Buka Maps</Button>
                </a>
                <a
                  href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
                    `Halo ${branch.name}, saya ingin tanya jadwal dan booking konsultasi.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="outline" className="rounded-xl font-body">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp Cabang
                  </Button>
                </a>
                <Link to={`/booking/new?branch=${encodeURIComponent(branch.id)}`}>
                  <Button className="rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body">
                    Booking Cabang Ini
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="rounded-2xl border-border shadow-lg shadow-black/5 lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold text-brand-charcoal">Lokasi Cabang</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-2xl overflow-hidden border border-border bg-background">
                      <iframe
                        src="https://www.google.com/maps?q=Klinik+Gigi+Aesthetic+Pondok+Indah&output=embed"
                        width="100%"
                        height="360"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Lokasi ${branch.name}`}
                      />
                    </div>
                    <p className="text-xs text-brand-warm-gray font-body mt-2">
                      Catatan: peta masih menggunakan embed contoh. Nanti bisa dibuat dinamis per cabang.
                    </p>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl border-border shadow-lg shadow-black/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold text-brand-charcoal">Booking Cepat</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-brand-warm-gray font-body">
                      Pilih tanggal dan range waktu. Tim cabang akan kirim jadwal final untuk Anda setujui.
                    </p>
                    <Link to={`/booking/new?branch=${encodeURIComponent(branch.id)}`}>
                      <Button className="w-full rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body">
                        Booking Cabang Ini
                      </Button>
                    </Link>
                    <Link to="/booking/status">
                      <Button variant="outline" className="w-full rounded-xl font-body">
                        Cek Status Booking
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
