import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ArrowLeft, Check, MapPin } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { BookingProvider, useBooking } from "@/components/lavista/booking-context";
import { BookingFlowProvider, useBookingFlow } from "@/lib/booking-flow";
import { Footer } from "@/components/lavista/Footer";
import { useRooms } from "@/lib/use-rooms";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Book your stay — Lavista, Giza" },
      { name: "description", content: "Reserve your room at Lavista near the Pyramids of Giza in a few simple steps." },
      { name: "robots", content: "noindex,follow" },
    ],
    links: [{ rel: "canonical", href: "https://lavista-pyramids.lovable.app/booking" }],
  }),
  component: BookingLayout,
});

const STEPS = [
  { path: "/booking/guest", label: "Guest" },
  { path: "/booking/rooms", label: "Rooms" },
  { path: "/booking/dates", label: "Dates" },
  { path: "/booking/extras", label: "Extras" },
  { path: "/booking/payment", label: "Payment" },
] as const;

function BookingLayout() {
  return (
    <BookingProvider>
      <BookingFlowProvider>
        <Shell />
      </BookingFlowProvider>
    </BookingProvider>
  );
}

function Shell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isConfirmation = pathname.startsWith("/booking/confirmation");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-7 md:pt-10">
        <Link to="/" className="font-display text-xl tracking-tight text-sand-soft">
          Lavista<span className="text-gold">.</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-sand-soft/80 transition hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
      </nav>

      {!isConfirmation && (
        <header className="mx-auto max-w-6xl px-6 pt-10">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Booking</p>
          <h1 className="mt-3 font-display text-4xl text-sand-soft md:text-5xl">Reserve your stay</h1>
          <Stepper pathname={pathname} />
        </header>
      )}

      {isConfirmation ? (
        <Outlet />
      ) : (
        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.4fr_1fr]">
          <Outlet />
          <Summary />
        </section>
      )}

      <Footer />
    </main>
  );
}

function Stepper({ pathname }: { pathname: string }) {
  const currentIdx = Math.max(0, STEPS.findIndex((s) => pathname.startsWith(s.path)));
  return (
    <ol className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em]">
      {STEPS.map((s, i) => {
        const active = i === currentIdx;
        const done = i < currentIdx;
        return (
          <li key={s.path} className="flex items-center gap-3">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${done ? "border-gold bg-gold text-ink" : active ? "border-gold text-gold" : "border-gold/20 text-muted-foreground"}`}>
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={active || done ? "text-sand-soft" : "text-muted-foreground"}>{s.label}</span>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-gold/20" />}
          </li>
        );
      })}
    </ol>
  );
}

function Summary() {
  const { checkIn, checkOut, guests } = useBooking();
  const { draft } = useBookingFlow();
  const { data: allRooms = [] } = useRooms();
  const nights = checkIn && checkOut ? Math.max(0, differenceInCalendarDays(checkOut, checkIn)) : 0;
  const rooms = draft.rooms
    .map((id) => allRooms.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
  const total = rooms.reduce((sum, r) => sum + r.price * Math.max(1, nights), 0);

  return (
    <aside className="h-fit rounded-3xl border border-gold/15 bg-card/60 p-6 md:p-7">
      <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Your stay summary</p>
      <p className="mt-3 flex items-center gap-2 text-sm text-sand-soft/85">
        <MapPin className="h-3.5 w-3.5 text-gold" /> Lavista · Nazlet El-Semman, Giza
      </p>
      <div className="mt-5 space-y-3 text-sm text-sand-soft/85">
        <Row label="Check-in" value={checkIn ? format(checkIn, "EEE, MMM d, yyyy") : "—"} />
        <Row label="Check-out" value={checkOut ? format(checkOut, "EEE, MMM d, yyyy") : "—"} />
        <Row label="Nights" value={nights ? String(nights) : "—"} />
        <Row label="Guests" value={String(guests)} />
      </div>

      {rooms.length > 0 && (
        <div className="mt-6 border-t border-gold/15 pt-5">
          <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Price breakdown</p>
          <ul className="mt-3 space-y-2 text-sm">
            {rooms.map((r, i) => {
              const n = Math.max(1, nights);
              const sub = r.price * n;
              return (
                <li key={`${r.id}-${i}`} className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-sand-soft/85">
                    {r.type}
                    <span className="ml-1 text-xs text-muted-foreground">
                      (${r.price} × {n} {n === 1 ? "night" : "nights"})
                    </span>
                  </span>
                  <span className="shrink-0 text-sand-soft">${sub}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/10 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.22em] text-gold">Total</span>
          <span className="font-display text-4xl text-sand-soft md:text-5xl">${total}</span>
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Taxes included · pay on arrival or by card</p>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
