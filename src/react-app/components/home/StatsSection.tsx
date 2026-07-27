import { Users, Award, Calendar, ThumbsUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Pasien Bahagia",
    description: "Kepercayaan yang terus bertumbuh",
  },
  {
    icon: Award,
    value: "15+",
    label: "Tahun Pengalaman",
    description: "Melayani dengan dedikasi",
  },
  {
    icon: Calendar,
    value: "50,000+",
    label: "Perawatan Sukses",
    description: "Prosedur berhasil dilakukan",
  },
  {
    icon: ThumbsUp,
    value: "4.9",
    label: "Rating Kepuasan",
    description: "Dari 5,000+ ulasan",
  },
];

export default function StatsSection() {
  return (
    <section className="py-16 sm:py-24 bg-brand-gold-light/40 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-gold-light/60 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F1E6C6' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-background/80 backdrop-blur-sm border border-brand-gold/10 rounded-2xl p-6 hover:bg-background transition-all group shadow-lg shadow-black/5"
            >
              <div className="w-14 h-14 bg-gradient-gold rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-brand-gold/30">
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-charcoal mb-1">
                {stat.value}
              </div>
              <div className="text-base font-semibold text-brand-gold mb-1 font-body">
                {stat.label}
              </div>
              <div className="text-sm text-brand-warm-gray font-body">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
