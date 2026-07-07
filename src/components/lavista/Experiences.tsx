import { motion } from "framer-motion";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { EXPERIENCES as EXP_FALLBACK, WHATSAPP as WA } from "@/data/experiences";
import { useExperiencesContent } from "@/lib/use-content";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type ExpItem = {
  slug: string;
  img: string;
  title: string;
  tag: string;
  blurb: string;
};

function ExperienceCard({ e, index }: { e: ExpItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
      className="group relative isolate flex aspect-square h-full w-full overflow-hidden rounded-3xl border border-white/5 bg-card shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] transition-[border-color,box-shadow] duration-500 hover:border-gold/30 hover:shadow-[0_40px_80px_-30px_color-mix(in_oklab,var(--gold)_25%,transparent)]"
    >
      <Link
        to="/experiences/$slug"
        params={{ slug: e.slug }}
        aria-label={`View ${e.title} details`}
        className="absolute inset-0 z-20"
      />
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={e.img}
          alt={e.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.08]"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="absolute left-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-ink/50 px-3 py-1 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_var(--gold)]" />
        <span className="text-[10px] uppercase tracking-[0.22em] text-sand-soft/90">{e.tag}</span>
      </div>

      <div className="relative z-10 mt-auto w-full p-5 md:p-6">
        <h3 className="font-display text-2xl leading-tight text-sand-soft md:text-3xl">{e.title}</h3>
        <p className="mt-2 line-clamp-2 max-w-md text-sm leading-relaxed text-sand-soft/75">
          {e.blurb}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ink shadow-[0_8px_24px_-8px_color-mix(in_oklab,var(--gold)_70%,transparent)] transition duration-300 group-hover:gap-3">
            View details
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-ink/40 text-sand-soft backdrop-blur-md transition group-hover:border-gold/50 group-hover:text-gold">
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function Experiences() {
  const { data: db } = useExperiencesContent();
  const EXP: ExpItem[] = (db && db.length > 0
    ? db.map((e) => ({
        slug: e.slug,
        img: e.img || EXP_FALLBACK[0]?.img || "",
        title: e.title,
        tag: e.tag,
        blurb: e.blurb,
      }))
    : EXP_FALLBACK) as ExpItem[];

  const count = EXP.length;

  return (
    <section
      id="experiences"
      className="relative overflow-hidden bg-gradient-to-b from-background via-card/40 to-background py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-gold/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-6">

        {/* ── MOBILE LAYOUT (< lg) ─────────────────────────────────────────
             Pure flex column: text on top, carousel below.
             Hidden on desktop (lg+).
        ──────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-8 lg:hidden">

          {/* Text block */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-gold">
              Experiences & Trips
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] text-sand-soft">
              Things to do,{" "}
              <span className="italic text-gold-soft">the local way</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Hand-picked trips with friends of the house. Tell us what you're
              into and we'll tailor every detail.
            </p>
          </div>

          {/* Carousel */}
          {count === 0 ? null : count === 1 ? (
            <div className="w-full">
              <ExperienceCard e={EXP[0]} index={0} />
            </div>
          ) : (
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
              {/* Arrows row above cards */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.28em] text-gold/70">
                  Swipe to explore
                </span>
                <div className="flex gap-2">
                  <CarouselPrevious className="static left-auto top-auto h-9 w-9 translate-x-0 translate-y-0 border-gold/30 bg-transparent text-sand-soft hover:border-gold hover:bg-gold/10 hover:text-gold disabled:opacity-30" />
                  <CarouselNext className="static left-auto top-auto h-9 w-9 translate-x-0 translate-y-0 border-gold/30 bg-transparent text-sand-soft hover:border-gold hover:bg-gold/10 hover:text-gold disabled:opacity-30" />
                </div>
              </div>
              <CarouselContent className="-ml-3">
                {EXP.map((e, i) => (
                  <CarouselItem key={e.slug} className="basis-[80%] pl-3 sm:basis-1/2">
                    <ExperienceCard e={e} index={i} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          )}

          {/* WhatsApp CTA */}
          <a
            href={WA}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-xs font-medium uppercase tracking-[0.22em] text-ink shadow-[0_12px_30px_-10px_color-mix(in_oklab,var(--gold)_70%,transparent)]"
          >
            <MessageCircle className="h-4 w-4" /> Plan my trip
          </a>
        </div>

        {/* ── DESKTOP LAYOUT (lg+) ─────────────────────────────────────────
             Text + button row on top, full-width carousel below.
             Hidden on mobile.
        ──────────────────────────────────────────────────────────────── */}
        <div className="hidden lg:block">

          {/* Heading row: label/title/desc on left, button aligned to end */}
          <div className="flex items-end justify-between gap-10">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.32em] text-gold">
                Experiences & Trips
              </p>
              <h2 className="mt-4 font-display text-5xl leading-[1.05] text-sand-soft xl:text-6xl">
                Things to do,{" "}
                <span className="italic text-gold-soft">the local way</span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                Hand-picked trips with friends of the house. Tell us what you're
                into and we'll tailor every detail.
              </p>
            </div>
            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className="group shrink-0 inline-flex items-center gap-2 rounded-full border border-gold/30 px-5 py-2.5 text-xs uppercase tracking-[0.22em] text-sand-soft transition hover:border-gold hover:bg-gold/10 hover:text-gold"
            >
              Plan my trip{" "}
              <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Full-width carousel below text — px-12 gives room for side arrows */}
          <div className="mt-12 px-12">
            {count === 0 ? null : count === 1 ? (
              <div className="w-full max-w-md">
                <ExperienceCard e={EXP[0]} index={0} />
              </div>
            ) : (
              <Carousel opts={{ align: "start", loop: false }} className="w-full">
                <CarouselContent className="-ml-4">
                  {EXP.map((e, i) => (
                    <CarouselItem key={e.slug} className="basis-1/3 pl-4">
                      <ExperienceCard e={e} index={i} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="h-10 w-10 border-gold/30 bg-ink/70 text-sand-soft backdrop-blur-sm hover:border-gold hover:bg-gold/10 hover:text-gold disabled:opacity-30" />
                <CarouselNext className="h-10 w-10 border-gold/30 bg-ink/70 text-sand-soft backdrop-blur-sm hover:border-gold hover:bg-gold/10 hover:text-gold disabled:opacity-30" />
              </Carousel>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
