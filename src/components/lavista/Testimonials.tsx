import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReviewsContent } from "@/lib/use-content";

const REVIEW_AVATAR_PLACEHOLDER = "/attached_assets/image_1786130358238.png";

const FALLBACK_REVIEWS = [
  {
    name: "Lena",
    from: "Berlin",
    text: "Honestly the warmest hostel I've stayed at. The rooftop at sunset is unreal — pyramids glowing in the distance.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces",
  },
  {
    name: "Marco & Sofia",
    from: "Milan",
    text: "We came for two nights, stayed five. The staff felt like friends by day two.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=160&h=160&fit=crop&crop=faces",
  },
  {
    name: "Yusuke",
    from: "Tokyo",
    text: "Clean, quiet, beautifully designed. Great Wi-Fi for remote work and a proper coffee in the morning.",
    rating: 5,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&crop=faces",
  },
];

function ReviewCard({
  r,
  className,
}: {
  r: { name: string; from: string; text: string; rating: number; avatar: string };
  className?: string;
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    setAvatarFailed(false);
  }, [r.avatar]);

  return (
    <div
      className={cn(
        "w-[280px] shrink-0 rounded-3xl border border-gold/10 bg-background/60 p-6 backdrop-blur sm:w-[320px] sm:p-7",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <img
          src={avatarFailed || !r.avatar ? REVIEW_AVATAR_PLACEHOLDER : r.avatar}
          alt={`${r.name} avatar`}
          loading="lazy"
          onError={() => setAvatarFailed(true)}
          className="h-12 w-12 shrink-0 rounded-full border border-gold/30 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-sand-soft">{r.name}</p>
          <p className="truncate text-xs text-muted-foreground">{r.from}</p>
        </div>
        <div className="flex shrink-0 gap-0.5 text-gold">
          {Array.from({ length: r.rating }).map((_, k) => (
            <Star key={k} className="h-3.5 w-3.5 fill-current" />
          ))}
        </div>
      </div>
      <p className="mt-5 text-sand-soft/90">"{r.text}"</p>
    </div>
  );
}

export function Testimonials() {
  const { data: db } = useReviewsContent();
  const [paused, setPaused] = useState(false);
  const REVIEWS =
    db && db.length > 0
      ? db.map((r) => ({
          name: r.name,
          from: r.from ?? "",
          text: r.text,
          rating: r.rating ?? 5,
          avatar: r.avatar || "",
        }))
      : FALLBACK_REVIEWS;
  // Scale duration with item count so the scroll speed stays consistent
  // regardless of how many reviews are loaded.
  const durationSeconds = REVIEWS.length * 6;

  return (
    <section className="bg-card/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center md:mb-14"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Travelers</p>
          <h2 className="mt-3 font-display text-3xl text-sand-soft sm:text-4xl md:text-5xl">
            Loved by people passing through
          </h2>
        </motion.div>
      </div>
      <div
        className="group relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div
          className={cn("flex w-max animate-marquee", paused && "[animation-play-state:paused]")}
          style={{ animationDuration: `${durationSeconds}s` }}
        >
          {/* Two identical, equal-width groups placed back to back: animating by
              exactly one group's width (translateX(-50%) of the pair) guarantees
              a seamless loop with no jump, regardless of item count. */}
          <div className="flex shrink-0 gap-6 px-3">
            {REVIEWS.map((r, i) => (
              <ReviewCard key={`a-${r.name}-${i}`} r={r} />
            ))}
          </div>
          <div className="flex shrink-0 gap-6 px-3" aria-hidden="true">
            {REVIEWS.map((r, i) => (
              <ReviewCard key={`b-${r.name}-${i}`} r={r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
