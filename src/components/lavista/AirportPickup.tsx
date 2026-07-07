import { Plane, MessageCircle } from "lucide-react";

const WA_PICKUP =
  "https://wa.me/201007695392?text=" +
  encodeURIComponent(
    "Hi Lavista — I'd like to arrange an airport pickup. Here are my flight details:",
  );

export function AirportPickup() {
  return (
    <section id="airport-pickup" className="mx-auto max-w-7xl px-6 py-20">
      <div className="relative overflow-hidden rounded-3xl border border-gold/15 bg-gradient-to-br from-card via-card/80 to-ink p-8 md:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-gold/30 bg-ink/40 text-gold">
              <Plane className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Service</p>
              <h2 className="mt-2 font-display text-3xl text-sand-soft md:text-4xl">
                Airport pickup, on us to arrange
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Land tired, skip the queue. Share your flight details and we'll meet you at Cairo
                Airport with a fixed, fair price — no haggling.
              </p>
            </div>
          </div>
          <a
            href={WA_PICKUP}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 self-center rounded-full bg-gold px-7 py-4 text-xs font-medium uppercase tracking-[0.22em] text-ink shadow-[0_12px_30px_-10px_color-mix(in_oklab,var(--gold)_70%,transparent)] transition hover:bg-gold-soft"
          >
            <MessageCircle className="h-4 w-4" /> Contact
          </a>
        </div>
      </div>
    </section>
  );
}
