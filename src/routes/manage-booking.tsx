import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Search, XCircle, MessageCircle, Download, Loader2 } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { findBooking, updateBooking, type StoredBooking } from "@/lib/bookings";
import { fetchBookingById, findBookingByGuest, type FullBooking } from "@/lib/booking-api";
import { Footer } from "@/components/lavista/Footer";
import { CountryPhoneInput } from "@/components/lavista/CountryPhoneInput";
import { COUNTRIES } from "@/data/countries";

export const Route = createFileRoute("/manage-booking")({
  head: () => ({
    meta: [
      { title: "Manage your booking — Lavista" },
      { name: "description", content: "Look up, review, or cancel your Lavista booking near the Pyramids of Giza." },
      { property: "og:title", content: "Manage your booking — Lavista" },
      { property: "og:description", content: "Look up your Lavista reservation, review the details or cancel." },
      { property: "og:url", content: "https://lavista-pyramids.lovable.app/manage-booking" },
    ],
    links: [{ rel: "canonical", href: "https://lavista-pyramids.lovable.app/manage-booking" }],
  }),
  component: Manage,
});

type Mode = "id" | "name";

type View = {
  ref: string;
  bookingId?: string;
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
  status: "confirmed" | "cancelled" | "upcoming";
};

function viewFromStored(b: StoredBooking): View {
  return {
    ref: b.ref,
    bookingId: b.bookingId,
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
    status: b.status,
  };
}

function viewFromRemote(ref: string, b: FullBooking): View {
  const ci = new Date(b.check_in);
  const co = new Date(b.check_out);
  const nights = Math.max(1, differenceInCalendarDays(co, ci));
  const [fn, ...rest] = (b.guest?.name ?? "").split(" ");
  return {
    ref,
    bookingId: b.id,
    firstName: fn ?? "",
    lastName: rest.join(" "),
    email: b.guest?.email ?? "",
    phone: b.guest?.phone ?? "",
    guests: b.num_guests,
    checkIn: b.check_in,
    checkOut: b.check_out,
    nights,
    total: b.total_price,
    roomType: b.rooms.map((r) => r.name).join(" + ") || "Room",
    status: (b.status as View["status"]) ?? "confirmed",
  };
}

function Manage() {
  const [mode, setMode] = useState<Mode>("id");
  const [bookingId, setBookingId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("EG");
  const [phoneNational, setPhoneNational] = useState("");
  const phone = phoneNational.trim()
    ? `${COUNTRIES.find((c) => c.code === phoneCountry)?.dial ?? ""} ${phoneNational.trim()}`
    : "";
  const [view, setView] = useState<View | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    setErrMsg(null);
    setView(null);
    // small delay so the loader is always visible, even on cache hits
    await new Promise((r) => setTimeout(r, 350));
    try {
      let found: View | null = null;

      // For name mode: require at least 6 actual digits in the phone field
      if (mode === "name") {
        const phoneDigits = phone.replace(/\D+/g, "");
        if (phoneDigits.length < 6) {
          setErrMsg("Please enter a valid phone number.");
          setLoading(false);
          return;
        }
      }

      if (mode === "id") {
        const q = bookingId.trim();
        // 1. try local cache
        const local = findBooking(q);
        if (local) found = viewFromStored(local);
        // 2. try Supabase (UUID or short ref → resolve)
        if (!found) {
          const remote = await findBookingByGuest(q);
          if (remote) {
            const full = await fetchBookingById(remote.bookingId);
            if (full) found = viewFromRemote(remote.ref, full);
          }
        }
      } else {
        const full = `${firstName.trim()} ${lastName.trim()}`.trim();
        // 1. local — also verify phone matches
        const local = findBooking(full);
        if (local) {
          const localDigits = phone.replace(/\D+/g, "");
          const storedDigits = (local.phone ?? "").replace(/\D+/g, "");
          if (localDigits && storedDigits && storedDigits.endsWith(localDigits.slice(-9))) {
            found = viewFromStored(local);
          }
        }
        // 2. supabase by first + last name + phone (phone is required; passed as filter)
        if (!found) {
          const remote = await findBookingByGuest("", { firstName, lastName, phone });
          if (remote) {
            const full2 = await fetchBookingById(remote.bookingId);
            if (full2) found = viewFromRemote(remote.ref, full2);
          }
        }
      }

      if (!found) {
        setErrMsg(
          mode === "id"
            ? "No booking matched that ID. Double-check and try again, or search by name."
            : "No booking matched that name. Double-check the spelling, or search by booking ID.",
        );
      }
      setView(found);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[manage-booking] lookup error", err);
      setErrMsg("Something went wrong while searching. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancel = async () => {
    if (!view) return;
    if (!confirm("Cancel this booking? This cannot be undone.")) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    updateBooking(view.ref, { status: "cancelled" });
    setView({ ...view, status: "cancelled" });
    setLoading(false);
  };

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
    ctx.fillText(view.status === "cancelled" ? "BOOKING CANCELLED" : "BOOKING CONFIRMED", 80, 260);
    ctx.fillStyle = "#F5EBD8";
    ctx.font = "600 56px serif";
    ctx.fillText(`Reference  ${view.ref}`, 80, 330);
    ctx.fillStyle = "rgba(212,165,80,0.2)";
    ctx.fillRect(80, 380, W - 160, 1);
    const rows: Array<[string, string]> = [
      ["Guest", `${view.firstName} ${view.lastName}`.trim() || "—"],
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
    <main className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-6 pt-7 md:pt-10">
        <Link to="/" className="font-display text-xl tracking-tight text-sand-soft">
          Lavista<span className="text-gold">.</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-sand-soft/80 transition hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </nav>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Manage booking</p>
        <h1 className="mt-3 font-display text-4xl text-sand-soft md:text-5xl">Look up your stay</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Search by your booking ID or by your first and last name to review, download, or cancel your reservation.
        </p>

        {/* Mode toggle */}
        <div className="mt-8 inline-flex rounded-full border border-gold/20 bg-card/60 p-1">
          {(["id", "name"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setSearched(false);
                setView(null);
                setErrMsg(null);
                setPhoneCountry("EG");
                setPhoneNational("");
              }}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                mode === m ? "bg-gold text-ink" : "text-sand-soft/80 hover:text-gold"
              }`}
            >
              {m === "id" ? "By booking ID" : "By name"}
            </button>
          ))}
        </div>

        <form
          onSubmit={lookup}
          className="mt-4 grid gap-4 rounded-3xl border border-gold/15 bg-card/60 p-6 md:grid-cols-[1fr_auto]"
        >
          {mode === "id" ? (
            <div>
              <label className="text-[10px] uppercase tracking-[0.22em] text-gold">Booking ID</label>
              <input
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                placeholder="e.g. LV-ABC123 or the full UUID"
                required
                className="mt-2 w-full rounded-xl border border-gold/20 bg-ink/30 p-3 text-sm text-sand-soft outline-none focus:border-gold"
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-[0.22em] text-gold">First name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  required
                  className="mt-2 w-full rounded-xl border border-gold/20 bg-ink/30 p-3 text-sm text-sand-soft outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.22em] text-gold">Last name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  className="mt-2 w-full rounded-xl border border-gold/20 bg-ink/30 p-3 text-sm text-sand-soft outline-none focus:border-gold"
                />
              </div>
              <div className="sm:col-span-2">
                <CountryPhoneInput
                  label="Phone number"
                  required
                  country={phoneCountry}
                  phone={phoneNational}
                  onCountryChange={setPhoneCountry}
                  onPhoneChange={setPhoneNational}
                />
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-end rounded-xl bg-gold px-5 py-3 text-sm font-medium text-ink transition hover:bg-gold-soft disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {loading ? "Searching…" : "Find"}
          </button>
        </form>

        {loading && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-gold/15 bg-card/60 p-6 text-sm text-sand-soft/80">
            <Loader2 className="h-4 w-4 animate-spin text-gold" />
            Searching your reservation…
          </div>
        )}

        {!loading && searched && !view && errMsg && (
          <p className="mt-8 rounded-2xl border border-gold/15 bg-card/60 p-6 text-sm text-muted-foreground">
            {errMsg}
          </p>
        )}

        {!loading && view && (
          <div className="mt-8 rounded-3xl border border-gold/15 bg-card/60 p-6 md:p-8">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-gold">Reference</p>
                <p className="font-display text-2xl text-sand-soft">{view.ref}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${
                  view.status === "cancelled"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-gold/15 text-gold"
                }`}
              >
                {view.status}
              </span>
            </div>

            <dl className="mt-6 grid gap-3 text-sm md:grid-cols-2">
              <Row label="Guest" value={`${view.firstName} ${view.lastName}`.trim() || "—"} />
              <Row label="Email" value={view.email || "—"} />
              <Row label="Phone" value={view.phone || "—"} />
              <Row label="Room" value={view.roomType} />
              <Row label="Guests" value={String(view.guests)} />
              <Row label="Check-in" value={format(new Date(view.checkIn), "EEE, MMM d, yyyy")} />
              <Row label="Check-out" value={format(new Date(view.checkOut), "EEE, MMM d, yyyy")} />
              <Row label="Nights" value={String(view.nights)} />
              <Row label="Total" value={`$${view.total}`} />
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={download}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-ink transition hover:bg-gold-soft"
              >
                <Download className="h-4 w-4" /> Download as PNG
              </button>
              <a
                href="https://wa.me/201007695392"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-5 py-3 text-xs uppercase tracking-[0.22em] text-sand-soft transition hover:bg-gold/10"
              >
                <MessageCircle className="h-4 w-4" /> Contact
              </a>
              {view.status !== "cancelled" && (
                <button
                  onClick={cancel}
                  className="inline-flex items-center gap-2 rounded-full border border-destructive/40 px-5 py-3 text-xs uppercase tracking-[0.22em] text-destructive transition hover:bg-destructive/10"
                >
                  <XCircle className="h-4 w-4" /> Cancel booking
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gold/10 bg-ink/30 p-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-gold">{label}</p>
      <p className="mt-1 text-sand-soft">{value}</p>
    </div>
  );
}
