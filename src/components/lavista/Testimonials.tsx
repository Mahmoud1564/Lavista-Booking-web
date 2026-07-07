import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useReviewsContent } from "@/lib/use-content";

const FALLBACK_REVIEWS = [
  {
    name: "Lena",
    from: "Berlin",
    text: "Honestly the warmest hostel I've stayed at. The rooftop at sunset is unreal — pyramids glowing in the distance.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces",
  },
  {
    name: "Marco & Sofia",
    from: "Milan",
    text: "We came for two nights, stayed five. The staff felt like friends by day two.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=160&h=160&fit=crop&crop=faces",
  },
  {
    name: "Yusuke",
    from: "Tokyo",
    text: "Clean, quiet, beautifully designed. Great Wi-Fi for remote work and a proper coffee in the morning.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&crop=faces",
  },
];


export function Testimonials() {
  const { data: db } = useReviewsContent();
  const REVIEWS = db && db.length > 0
    ? db.map((r) => ({ name: r.name, from: r.from ?? "", text: r.text, rating: r.rating ?? 5, avatar: r.avatar || "" }))
    : FALLBACK_REVIEWS;
  return (
    <section className="bg-card/40 py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Travelers</p>
          <h2 className="mt-3 font-display text-4xl text-sand-soft md:text-5xl">Loved by people passing through</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r, i) => (

            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-3xl border border-gold/10 bg-background/60 p-7 backdrop-blur"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:flex-col md:items-start md:gap-4 lg:flex-row lg:items-center">
                <div className="flex items-center gap-4">
                  <img
                    src={r.avatar}
                    alt={`${r.name} avatar`}
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-full border border-gold/30 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-sand-soft">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.from}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-0.5 text-gold sm:ml-auto md:ml-0 lg:ml-auto">
                  {Array.from({ length: r.rating }).map((_, k) => (
                    <Star key={k} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="mt-5 text-sand-soft/90">"{r.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
