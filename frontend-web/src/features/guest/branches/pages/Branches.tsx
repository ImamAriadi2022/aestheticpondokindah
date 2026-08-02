import { Link } from "react-router";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import { getDemoBranches } from "@/features/guest/reservation/services/bookingDemo";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function BranchesPage() {
  const branches = getDemoBranches().map((b) => ({ ...b, slug: slugify(b.name) }));

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24 lg:pb-0">
        <section className="relative py-14 sm:py-20 bg-gradient-to-br from-brand-cream via-background to-brand-gold-light/30 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-charcoal mb-5 sm:mb-6">
                Pilih
                <span className="text-gradient-gold"> Cabang Terdekat</span>
              </h1>
              <p className="text-base sm:text-lg text-brand-warm-gray font-body leading-relaxed">
                Setiap cabang memiliki tim dan jadwal praktik yang berbeda. Pilih cabang yang paling nyaman untuk Anda.
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {branches.map((b) => (
                <Card key={b.id} className="rounded-2xl border-border shadow-lg shadow-black/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold text-brand-charcoal">{b.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2 text-sm text-brand-warm-gray font-body">
                      <MapPin className="w-4 h-4 text-brand-gold mt-0.5" />
                      <div className="line-clamp-3">{b.address}</div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Link to={`/branches/${encodeURIComponent(b.slug)}`}>
                        <Button variant="outline" className="rounded-xl font-body">
                          Lihat Detail <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                      <Link to={`/booking/new?branch=${encodeURIComponent(b.id)}`}>
                        <Button className="rounded-xl bg-gradient-gold hover:opacity-90 text-white font-semibold font-body">
                          Booking Cabang Ini
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
