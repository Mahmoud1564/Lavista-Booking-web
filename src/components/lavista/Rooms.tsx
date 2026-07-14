import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useBooking } from "./booking-context";
import { preselectRoom } from "@/lib/preselect-room";
import { preselectDates } from "@/lib/preselect-dates";
import { useRooms, useUnavailableRooms } from "@/lib/use-rooms";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

const CARD_FEATURE_LIMIT = 3;

export function Rooms({ trigger }: { trigger: number }) {
  const { guests, checkIn, checkOut } = useBooking();
  const { data: all = [], isLoading } = useRooms();
  const {
    data: unavailable,
    isLoading: unavailableLoading,
    isFetching: unavailableFetching,
  } = useUnavailableRooms(checkIn, checkOut);
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // While the availability query is still in-flight (after a search was
  // triggered) do not show any rooms — an undefined `unavailable` set would
  // pass every room through and show blocked/booked rooms as available.
  const availabilityReady = !unavailableLoading && !unavailableFetching;

  // Once a search has been triggered, filter by guest capacity AND date
  // availability.  Never apply the filter until the availability data has
  // fully loaded so we never flash blocked rooms to the user.
  const rooms =
    trigger > 0
      ? availabilityReady
        ? all.filter(
            (r) =>
              r.capacity >= guests &&
              !(unavailable?.has(r.id)),
          )
        : []  // still fetching — withhold results until we know what's blocked
      : all;


  useEffect(() => {
    if (!api) return;
    const update = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api, rooms]);

  const showArrows = canPrev || canNext;

  return (
    <section id="stay" className="relative mx-auto max-w-7xl scroll-mt-24 px-6 py-28">
      <div className="mb-8 flex items-end justify-between gap-4 md:mb-14 md:gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Stay</p>
          <h2 className="mt-3 font-display text-4xl text-sand-soft md:text-5xl">
            Rooms made for resting
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
            Every room is designed around warm light and quiet comfort. No fuss,
            just a great place to sleep and start again.
          </p>
          {showArrows && (
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                disabled={!canPrev}
                aria-label="Previous rooms"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-sand-soft transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                disabled={!canNext}
                aria-label="Next rooms"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-sand-soft transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="grid gap-6 md:grid-cols-3">
            {[0,1,2].map(i => (
              <div key={i} className="h-[420px] animate-pulse rounded-3xl bg-card/60" />
            ))}
          </motion.div>
        ) : rooms.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            No rooms match — try fewer guests or contact us.
          </p>
        ) : (
          <motion.div key="rooms" initial={{opacity:0}} animate={{opacity:1}} className="relative">
            <Carousel
              setApi={setApi}
              opts={{ align: "start", containScroll: "trimSnaps" }}
              className="w-full"
            >
              <CarouselContent className="-ml-6">
                {rooms.map((room, i) => (
                  <CarouselItem
                    key={room.id}
                    className="pl-6 sm:basis-1/2 lg:basis-1/3"
                  >
                    <motion.article
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gold/10 bg-card transition hover:border-gold/30 hover:shadow-2xl hover:shadow-black/40"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img src={room.img} alt={room.type} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
                        <div className="absolute right-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-xs text-gold backdrop-blur">
                          ${room.price}/night
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-display text-2xl text-sand-soft">{room.type}</h3>
                          <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3.5 w-3.5" /> {room.capacity}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">{room.desc}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {room.features.slice(0, CARD_FEATURE_LIMIT).map((f) => (
                            <span key={f} className="rounded-full border border-gold/20 px-2.5 py-1 text-[11px] text-sand-soft/80">{f}</span>
                          ))}
                          {room.features.length > CARD_FEATURE_LIMIT && (
                            <span className="rounded-full border border-gold/20 px-2.5 py-1 text-[11px] text-sand-soft/60">…</span>
                          )}
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                          <Link to="/rooms/$id" params={{ id: room.id }} className="text-sm text-sand-soft/80 transition hover:text-gold">View details</Link>
                          <Link
                            to="/rooms/$id"
                            params={{ id: room.id }}
                            className="inline-flex items-center gap-1.5 rounded-full bg-gold px-4 py-2 text-xs font-medium text-ink transition hover:bg-gold-soft"
                          >
                            Book <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {showArrows && (
              <>
                <button
                  type="button"
                  onClick={() => api?.scrollPrev()}
                  disabled={!canPrev}
                  aria-label="Previous rooms"
                  className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-2 hidden md:inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-ink/80 text-sand-soft backdrop-blur transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30 lg:-translate-x-5"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => api?.scrollNext()}
                  disabled={!canNext}
                  aria-label="Next rooms"
                  className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 hidden md:inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-ink/80 text-sand-soft backdrop-blur transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30 lg:translate-x-5"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
