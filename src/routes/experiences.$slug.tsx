import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock, CalendarDays, MapPin, MessageCircle } from "lucide-react";
import { EXPERIENCES as FALLBACK, getExperience, type Experience } from "@/data/experiences";
import { useExperiencesContent } from "@/lib/use-content";
import { Footer } from "@/components/lavista/Footer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const Route = createFileRoute("/experiences/$slug")({
  head: ({ params }) => {
    const exp = getExperience(params.slug);
    const title = exp ? `${exp.title} — Lavista Experiences` : "Experience — Lavista";
    const description = exp?.blurb ?? "Local experiences with Lavista in Giza, Egypt.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(exp ? [{ property: "og:image", content: exp.img } as const] : []),
      ],
    };
  },
  component: ExperienceDetail,
});

function ExperienceDetail() {
  const { slug } = Route.useParams();
  const { data: dbList } = useExperiencesContent();

  const dbExp = dbList?.find((e) => e.slug === slug);
  const fallbackExp = getExperience(slug);
  if (!dbExp && !fallbackExp) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div>
          <h1 className="font-display text-4xl text-sand-soft">Experience not found</h1>
          <Link to="/" className="mt-6 inline-block text-gold underline">
            Back home
          </Link>
        </div>
      </div>
    );
  }
  const exp: Experience = dbExp
    ? {
        slug: dbExp.slug,
        title: dbExp.title,
        blurb: dbExp.blurb,
        long: dbExp.long || dbExp.blurb,
        tag: dbExp.tag,
        duration: dbExp.duration || (fallbackExp?.duration ?? ""),
        meeting: dbExp.meeting || (fallbackExp?.meeting ?? ""),
        dates: dbExp.dates || (fallbackExp?.dates ?? ""),
        price: fallbackExp?.price ?? "",
        img: dbExp.img || fallbackExp?.img || "",
        gallery: dbExp.gallery.length > 0 ? dbExp.gallery : (fallbackExp?.gallery ?? []),
      }
    : (fallbackExp as Experience);

  const related =
    dbList && dbList.length > 0
      ? dbList
          .filter((e) => e.slug !== exp.slug)
          .slice(0, 3)
          .map((e) => ({
            slug: e.slug,
            title: e.title,
            img: e.img,
            duration: e.duration,
          }))
      : FALLBACK.filter((e) => e.slug !== exp.slug).slice(0, 3);

  const waMsg = `https://wa.me/201007695392?text=${encodeURIComponent(
    `Hi Lavista — I'd like to book the ${exp.title} experience.`,
  )}`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 pt-7 md:pt-10">
        <Link to="/" className="font-display text-xl tracking-tight text-sand-soft">
          Lavista<span className="text-gold">.</span>
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-sand-soft/80 transition hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.3fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Carousel opts={{ align: "start", loop: exp.gallery.length > 1 }} className="w-full">
            <CarouselContent>
              {(exp.gallery.length > 0 ? exp.gallery : [exp.img]).map((src, i) => (
                <CarouselItem key={i}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-gold/10">
                    <img
                      src={src}
                      alt={`${exp.title} — ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {i === 0 && (
                      <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/50 px-3 py-1 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                        <span className="text-[10px] uppercase tracking-[0.22em] text-sand-soft/90">
                          {exp.tag}
                        </span>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {exp.gallery.length > 1 && (
              <>
                <CarouselPrevious className="left-3" />
                <CarouselNext className="right-3" />
              </>
            )}
          </Carousel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Experience · Giza, Egypt</p>
          <h1 className="mt-3 font-display text-4xl text-sand-soft md:text-5xl">{exp.title}</h1>
          <p className="mt-6 text-base leading-relaxed text-sand-soft/85">{exp.long}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gold/15 bg-card/60 p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold">
                <Clock className="h-3.5 w-3.5" /> Duration
              </p>
              <p className="mt-2 text-sm text-sand-soft/85">{exp.duration}</p>
            </div>
            <div className="rounded-2xl border border-gold/15 bg-card/60 p-5">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold">
                <CalendarDays className="h-3.5 w-3.5" /> Available dates
              </p>
              <p className="mt-2 text-sm text-sand-soft/85">{exp.dates}</p>
            </div>
            <div className="rounded-2xl border border-gold/15 bg-card/60 p-5 sm:col-span-2">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold">
                <MapPin className="h-3.5 w-3.5" /> Meeting / pickup
              </p>
              <p className="mt-2 text-sm text-sand-soft/85">{exp.meeting}</p>
            </div>
          </div>

          <a
            href={waMsg}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] text-ink transition hover:bg-gold-soft"
          >
            <MessageCircle className="h-4 w-4" /> Contact
          </a>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            We reply within minutes during reception hours.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Related experiences</p>
          <h2 className="mt-3 font-display text-3xl text-sand-soft md:text-4xl">More to explore</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {related.map((r) => (
            <Link
              key={r.slug}
              to="/experiences/$slug"
              params={{ slug: r.slug }}
              className="group overflow-hidden rounded-3xl border border-gold/10 bg-card transition hover:border-gold/30"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={r.img}
                  alt={r.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between p-5">
                <div>
                  <h3 className="font-display text-lg text-sand-soft">{r.title}</h3>
                  <p className="text-xs text-muted-foreground">{r.duration}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gold transition group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
