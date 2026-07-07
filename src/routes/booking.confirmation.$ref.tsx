import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, MapPin, MessageCircle, Download, Home } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { findBooking, type StoredBooking } from "@/lib/bookings";
import { fetchBookingById, resolveRef, type FullBooking } from "@/lib/booking-api";

export const Route = createFileRoute("/booking/confirmation/$ref")({
  head: ({ params }) => ({
    meta: [
      { title: `Booking ${params.ref} confirmed — Lavista` },
      { name: "description", content: "Your stay at Lavista near the Pyramids of Giza is confirmed." },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: Confirmation,
});

type View = {
  ref: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  guests: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  roomType: string;
  rooms: Array<{ id: string; type: string; price: number; nights: number; subtotal: number }>;
};

function fromStored(b: StoredBooking): View {
  return {
    ref: b.ref,
    firstName: b.firstName,
    lastName: b.lastName,
    email: b.email,
    phone: b.phone,
    guests: b.guests,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    nights: b.nights,
    total: b.total,
    roomType: b.roomType,
    rooms: b.rooms ?? [
      {
        id: b.roomId,
        type: b.roomType,
        price: Math.round(b.total / Math.max(1, b.nights)),
        nights: b.nights,
        subtotal: b.total,
      },
    ],
  };
}

function fromRemote(ref: string, b: FullBooking): View {
  const ci = new Date(b.check_in);
  const co = new Date(b.check_out);
  const nights = Math.max(1, differenceInCalendarDays(co, ci));
  const rooms = b.rooms.map((r) => {
    const price = r.price_per_night ?? Math.round(b.total_price / Math.max(1, b.rooms.length) / nights);
    return {
      id: r.room_id,
      type: r.name,
      price,
      nights,
      subtotal: price * nights,
    };
  });
  return {
    ref,
    firstName: b.guest?.name?.split(" ")[0] ?? "",
    lastName: b.guest?.name?.split(" ").slice(1).join(" ") ?? "",
    email: b.guest?.email ?? "",
    phone: b.guest?.phone ?? "",
    guests: b.num_guests,
    checkIn: b.check_in,
    checkOut: b.check_out,
    nights,
    total: b.total_price,
    roomType: rooms.map((r) => r.type).join(" + "),
    rooms,
  };
}

function Confirmation() {
  const { ref } = Route.useParams();
  const [view, setView] = useState<View | null>(null);

  useEffect(() => {
    // 1. Try local cache first (fast, works offline)
    const local = findBooking(ref);
    if (local) {
      setView(fromStored(local));
    }
    // 2. Always reconcile with Supabase
    const id = resolveRef(ref);
    if (!id) return;
    fetchBookingById(id)
      .then((remote) => {
        if (remote) setView(fromRemote(ref, remote));
      })
      .catch(() => {
        /* keep local */
      });
  }, [ref]);

  const download = () => {
    if (!view) return;
    const W = 1200;
    const H = 1500;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "#140C04");
    grad.addColorStop(1, "#0B0703");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#D4A550";
    ctx.fillRect(80, 200, 120, 4);
    ctx.fillStyle = "#F5EBD8";
    ctx.font = "600 64px serif";
    ctx.fillText("Lavista.", 80, 160);
    ctx.fillStyle = "#D4A550";
    ctx.font = "500 22px sans-serif";
    ctx.fillText("BOOKING CONFIRMED", 80, 260);
    ctx.fillStyle = "#F5EBD8";
    ctx.font = "600 56px serif";
    ctx.fillText(`Reference  ${view.ref}`, 80, 330);
    ctx.fillStyle = "rgba(212,165,80,0.2)";
    ctx.fillRect(80, 380, W - 160, 1);
    const rows: Array<[string, string]> = [
      ["Guest", `${view.firstName} ${view.lastName}`.trim()],
      ["Phone", view.phone || "—"],
      ["Email", view.email || "—"],
      ["Room", view.roomType],
      ["Guests", String(view.guests)],
      ["Check-in", format(new Date(view.checkIn), "EEE, MMM d, yyyy")],
      ["Check-out", format(new Date(view.checkOut), "EEE, MMM d, yyyy")],
      ["Nights", String(view.nights)],
      ["Total", `$${view.total}`],
    ];
    let y = 440;
    rows.forEach(([k, v]) => {
      ctx.fillStyle = "#D4A550";
      ctx.font = "500 20px sans-serif";
      ctx.fillText(k.toUpperCase(), 80, y);
      ctx.fillStyle = "#F5EBD8";
      ctx.font = "400 32px sans-serif";
      ctx.fillText(v, 80, y + 44);
      y += 96;
    });
    ctx.fillStyle = "rgba(212,165,80,0.2)";
    ctx.fillRect(80, H - 200, W - 160, 1);
    ctx.fillStyle = "#A89A82";
    ctx.font = "400 22px sans-serif";
    ctx.fillText("Lavista · Nazlet El-Semman, Giza, Egypt", 80, H - 140);
    ctx.fillText("WhatsApp: +20 100 769 5392", 80, H - 100);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lavista-${view.ref}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-ink">
          <Check className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Booking confirmed</p>
          <h1 className="font-display text-3xl text-sand-soft md:text-4xl">You're in. See you in Giza.</h1>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-gold/15 bg-card/60 p-6 md:p-8">
        <div className="flex items-baseline justify-between">
          <p className="text-xs uppercase tracking-[0.22em] text-gold">Booking ID</p>
          <p className="font-display text-2xl text-sand-soft">{ref}</p>
        </div>

        {view ? (
          <>
            <dl className="mt-6 grid gap-3 text-sm md:grid-cols-2">
              <Detail label="Guest" value={`${view.firstName} ${view.lastName}`.trim()} />
              <Detail label="Email" value={view.email || "—"} />
              <Detail label="Phone" value={view.phone || "—"} />
              <Detail label="Room" value={view.roomType} />
              <Detail label="Guests" value={String(view.guests)} />
              <Detail label="Check-in" value={format(new Date(view.checkIn), "EEE, MMM d, yyyy")} />
              <Detail label="Check-out" value={format(new Date(view.checkOut), "EEE, MMM d, yyyy")} />
              <Detail label="Nights" value={String(view.nights)} />
            </dl>

            <div className="mt-8 rounded-2xl border border-gold/15 bg-ink/30 p-5 md:p-6">
              <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Price breakdown</p>
              <ul className="mt-3 space-y-2 text-sm">
                {view.rooms.map((r, i) => (
                  <li key={`${r.id}-${i}`} className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-sand-soft/85">
                      {r.type}
                      <span className="ml-1 text-xs text-muted-foreground">
                        (${r.price} × {r.nights} {r.nights === 1 ? "night" : "nights"})
                      </span>
                    </span>
                    <span className="shrink-0 text-sand-soft">${r.subtotal}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-baseline justify-between gap-3 rounded-xl border border-gold/30 bg-gold/10 p-4">
                <span className="text-xs font-medium uppercase tracking-[0.22em] text-gold">Total</span>
                <span className="font-display text-4xl text-sand-soft md:text-5xl">${view.total}</span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Taxes included · pay on arrival or by card</p>
            </div>
          </>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            Loading booking details…
          </p>
        )}

        <p className="mt-6 flex items-center gap-2 text-sm text-sand-soft/85">
          <MapPin className="h-3.5 w-3.5 text-gold" /> Lavista · Nazlet El-Semman, Giza, Egypt
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={download}
            disabled={!view}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ink transition hover:bg-gold-soft disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Download as PNG
          </button>
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-5 py-3 text-xs uppercase tracking-[0.22em] text-sand-soft transition hover:bg-gold/10">
            <Home className="h-3.5 w-3.5" /> Back to home
          </Link>
          <a
            href="https://wa.me/201007695392"
            target="_blank"
            rel="noreferrer"
            aria-label="Contact reception on WhatsApp"
            title="Contact"
            className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 text-gold transition hover:bg-gold/10"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gold/10 bg-ink/30 p-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-gold">{label}</p>
      <p className="mt-1 text-sand-soft">{value}</p>
    </div>
  );
}
