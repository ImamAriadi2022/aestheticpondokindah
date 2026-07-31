import { Play } from "lucide-react";

type Props = {
  youtubeId: string;
};

export default function VideoSection({ youtubeId }: Props) {
  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-background rounded-full shadow-sm mb-6 border border-border">
            <Play className="w-4 h-4 text-brand-gold" />
            <span className="text-sm font-semibold text-brand-gold font-body">Video</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-charcoal mb-5 sm:mb-6">
            Saksikan Profil Kami
          </h2>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative w-full overflow-hidden rounded-3xl bg-brand-cream border border-border shadow-xl shadow-black/5">
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title="YouTube video"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
