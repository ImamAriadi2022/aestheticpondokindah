import type { ReactNode } from "react";
import Header from "@/core/layouts/Header";
import Footer from "@/core/layouts/Footer";
import { Shield } from "lucide-react";

interface LegalContentLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalContentLayout({ title, lastUpdated, children }: LegalContentLayoutProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pb-24 lg:pb-0">
        <section className="relative py-14 sm:py-20 bg-gradient-to-br from-brand-cream via-background to-brand-gold-light/30 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gold/10 text-brand-gold mb-4">
                <Shield className="w-7 h-7" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-charcoal mb-4">
                {title}
              </h1>
              <p className="text-sm text-brand-warm-gray">Terakhir Diperbarui: {lastUpdated}</p>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto prose prose-stone font-body">
              {children}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
