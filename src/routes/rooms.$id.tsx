import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Users, CalendarDays, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Footer } from "@/components/lavista/Footer";
import { AmenitiesList } from "@/components/lavista/AmenitiesList";
import { preselectRoom } from "@/lib/preselect-room";
import { useRoom, useRooms } from "@/lib/use-rooms";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const WA = "https://wa.me/201007695392";

export const Route = createFileRoute("/rooms/$id")({
  validateSearch: (search: Record<string, unknown>) => ({
    from: typeof search.from === "string" ? search.from : undefined,
  }),
  head: ({ params }) => {
    const title = `Room — Lavista, Giza`;
    return {
      meta: [
        { title },
        { name: "description", content: "Lavista room near the Pyramids of Giza." },
        { name: "robots", content: "noindex,follow" },
      ],
    };
  },
  component: RoomDetail,
});

function RoomDetail() {
  const { id } = Route.useParams();
  const { data: room, isLoading, error } = useRoom(id);
  const { data: all = [] } = useRooms();
  const { from } = useSearch({ from: "/rooms/$id" });
  const fromBooking = from === "booking";
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSel = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSel);
    api.on("reInit", onSel);
    return () => {
      api.off("select", onSel);
    };
  }, [api]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sand-soft/70">
        Loading room…
      </main>
    );
  }

  if (error || !room) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div>
          <h1 className="font-display text-4xl text-sand-soft">Room not found</h1>
          <Link to="/" className="mt-6 inline-block text-gold underline">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  const related = all.filter((r) => r.id !== room.id);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 pt-7 md:pt-10">
        <Link to="/" className="font-display text-xl tracking-tight text-sand-soft">
          Lavista<span className="text-gold">.</span>
        </Link>
        {fromBooking ? (
          <Link
            to="/booking/rooms"
            className="inline-flex items-center gap-2 text-sm text-sand-soft/80 transition hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to booking
          </Link>
        ) : (
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-sand-soft/80 transition hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        )}
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1.3fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {(() => {
            const imgs = room.gallery.length > 0 ? room.gallery : [room.img];
            const total = imgs.length;
            return (
              <>
                <Carousel
                  setApi={setApi}
                  opts={{ align: "start", loop: total > 1 }}
                  className="w-full"
                >
                  <CarouselContent>
                    {imgs.map((src, i) => (
                      <CarouselItem key={i}>
                        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-gold/10">
                          <img
                            src={src}
                            alt={`${room.type} — ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-[11px] font-medium tracking-[0.15em] text-sand-soft backdrop-blur">
                            {i + 1} / {total}
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {total > 1 && (
                    <>
                      <CarouselPrevious className="left-3" />
                      <CarouselNext className="right-3" />
                    </>
                  )}
                </Carousel>
                {total > 1 && (
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                      Image <span className="text-sand-soft">{current + 1}</span> of{" "}
                      <span className="text-sand-soft">{total}</span>
                    </p>
                  </div>
                )}
                {total > 1 && (
                  <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
                    {imgs.map((src, i) => (
                      <button
                        key={`thumb-${i}`}
                        type="button"
                        onClick={() => api?.scrollTo(i)}
                        aria-label={`Show image ${i + 1}`}
                        aria-current={current === i}
                        className={`relative aspect-square overflow-hidden rounded-lg border transition ${
                          current === i
                            ? "border-gold shadow-[0_0_0_2px_color-mix(in_oklab,var(--gold)_35%,transparent)]"
                            : "border-white/10 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={src} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Stay · Giza, Egypt</p>
          <h1 className="mt-3 font-display text-4xl text-sand-soft md:text-5xl">{room.type}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl text-gold">${room.price}</span>
            <span className="text-sm text-muted-foreground">/ night</span>
            <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" /> Sleeps {room.capacity}
            </span>
          </div>
          <p className="mt-6 text-base leading-relaxed text-sand-soft/85">{room.long}</p>

          {room.amenities.length > 0 && (
            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.22em] text-gold">Amenities</p>
              <div className="mt-4">
                <AmenitiesList items={room.amenities} />
              </div>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-gold/15 bg-card/60 p-5">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-gold">
              <CalendarDays className="h-3.5 w-3.5" /> Availability
            </p>
            <p className="mt-2 text-sm text-sand-soft/85">{room.availability}</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {fromBooking ? (
              <Link
                to="/booking/rooms"
                onClick={() => preselectRoom(room.id)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] text-ink transition hover:bg-gold-soft"
              >
                Select this room
              </Link>
            ) : (
              <Link
                to="/booking/guest"
                onClick={() => preselectRoom(room.id)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] text-ink transition hover:bg-gold-soft"
              >
                Book Now
              </Link>
            )}
            <a
              href={WA}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 px-6 py-4 text-sm font-medium uppercase tracking-[0.2em] text-sand-soft transition hover:bg-gold/10"
            >
              <MessageCircle className="h-4 w-4" /> Contact
            </a>
          </div>
        </motion.div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Other rooms</p>
            <h2 className="mt-3 font-display text-3xl text-sand-soft md:text-4xl">
              Other rooms to rest in
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {related.map((r) => (
              <Link
                key={r.id}
                to="/rooms/$id"
                params={{ id: r.id }}
                className="group overflow-hidden rounded-3xl border border-gold/10 bg-card transition hover:border-gold/30"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={r.img}
                    alt={r.type}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="font-display text-xl text-sand-soft">{r.type}</h3>
                    <p className="text-xs text-muted-foreground">${r.price}/night</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gold transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
