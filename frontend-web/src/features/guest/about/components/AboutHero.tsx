export function AboutHero() {
  return (
    <section className="relative py-14 sm:py-20 bg-gradient-to-br from-brand-cream via-background to-brand-gold-light/30 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-gold-light/40 rounded-full -translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-brand-charcoal mb-5 sm:mb-6">
            About The Company
            <span className="text-gradient-gold"> Aesthetic Pondok Indah</span>
          </h1>
          <p className="text-base sm:text-lg text-brand-warm-gray font-body leading-relaxed">
            At Aesthetic Pondok Indah Dental Clinic, we deliver professional dental solutions that go beyond treating problems. Our focus is on enhancing your smile, improving confidence, and supporting long-term health.
          </p>
        </div>
      </div>
    </section>
  );
}
