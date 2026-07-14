import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, CreditCard, Check, AlertCircle } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { useBooking } from "@/components/lavista/booking-context";
import { useBookingFlow } from "@/lib/booking-flow";
import { useRooms } from "@/lib/use-rooms";
import { StepCard } from "@/components/lavista/booking-flow-ui";
import { saveBooking } from "@/lib/bookings";
import {
  addBookingRoom,
  createBooking,
  createGuest,
  fetchUnavailableRoomIds,
  generateRef,
  storeRef,
} from "@/lib/booking-api";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/booking/payment")({
  head: () => ({ meta: [{ title: "Payment — Lavista" }, { name: "robots", content: "noindex,follow" }] }),
  component: PaymentStep,
});

function PaymentStep() {
  const navigate = useNavigate();
  const { checkIn, checkOut, guests, setCheckIn, setCheckOut } = useBooking();
  const { draft, reset } = useBookingFlow();
  const { data: allRooms = [] } = useRooms();
  const queryClient = useQueryClient();
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nights = checkIn && checkOut ? Math.max(0, differenceInCalendarDays(checkOut, checkIn)) : 0;
  const rooms = draft.rooms
    .map((id) => allRooms.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
  const total = rooms.reduce((s, r) => s + r.price * Math.max(1, nights), 0);

  const cardComplete =
    card.number.replace(/\s/g, "").length >= 12 &&
    card.name.trim().length > 0 &&
    card.exp.trim().length >= 4 &&
    card.cvc.trim().length >= 3;

  const canConfirm =
    nights > 0 &&
    rooms.length > 0 &&
    !!draft.guest.firstName &&
    !!draft.guest.lastName &&
    (draft.payment === "property" || cardComplete);

  const confirm = async () => {
    if (!canConfirm || !checkIn || !checkOut) return;
    setSubmitting(true);
    setError(null);

    // Track whether the booking record was successfully created in the DB.
    // Once bookingId is set, all subsequent steps are non-critical: failures
    // must not prevent navigation to the confirmation page.
    let bookingId: string | null = null;
    let ref: string | null = null;

    try {
      // Step 0: re-check availability before writing.
      const unavailable = await fetchUnavailableRoomIds(checkIn, checkOut);
      const conflict = rooms.find((r) => unavailable.has(r.id));
      if (conflict) {
        throw new Error(
          `"${conflict.type}" is no longer available for the selected dates. Please choose a different room.`,
        );
      }

      // Step 1: create guest record. Real failure here blocks the flow.
      const fullName = `${draft.guest.firstName} ${draft.guest.lastName}`.trim();
      const guestId = await createGuest({
        name: fullName,
        phone: draft.guest.phone,
        email: draft.guest.email || undefined,
      });

      // Step 2: create booking record. Real failure here blocks the flow.
      const notes = [
        draft.arrivalTime ? `Arrival: ${draft.arrivalTime}` : "",
        draft.specialRequests ? `Requests: ${draft.specialRequests}` : "",
        `Payment: ${draft.payment === "property" ? "Pay at property" : "Credit card"}`,
      ]
        .filter(Boolean)
        .join(" · ");

      bookingId = await createBooking({
        guestId,
        checkIn,
        checkOut,
        numGuests: guests,
        totalPrice: total,
        notes,
        primaryRoomId: rooms[0].id,
      });

      // Booking confirmed in DB — generate the UI reference immediately so we
      // can navigate even if subsequent steps encounter errors.
      ref = generateRef();
      storeRef(ref, bookingId);

      // Step 3: insert booking_rooms (non-critical — guest + booking exist).
      for (const r of rooms) {
        try {
          await addBookingRoom(bookingId, r.id, r.price);
        } catch (roomErr) {
          // eslint-disable-next-line no-console
          console.warn("[booking] booking_rooms insert failed (non-critical):", roomErr);
        }
      }

      // Step 4: persist to local cache (non-critical).
      try {
        const n = Math.max(1, nights);
        saveBooking({
          ref,
          bookingId,
          roomId: rooms[0].id,
          roomType: rooms.map((r) => r.type).join(" + "),
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          nights,
          guests,
          total,
          firstName: draft.guest.firstName,
          lastName: draft.guest.lastName,
          email: draft.guest.email,
          phone: draft.guest.phone,
          notes,
          createdAt: new Date().toISOString(),
          status: "confirmed",
          rooms: rooms.map((r) => ({
            id: r.id,
            type: r.type,
            price: r.price,
            nights: n,
            subtotal: r.price * n,
          })),
        });
      } catch (cacheErr) {
        // eslint-disable-next-line no-console
        console.warn("[booking] local cache save failed (non-critical):", cacheErr);
      }

      reset();
      setCheckIn(undefined);
      setCheckOut(undefined);
      navigate({ to: "/booking/confirmation/$ref", params: { ref } });
    } catch (e) {
      // If bookingId was already set, the core booking exists in the DB.
      // Navigate to confirmation instead of showing an error.
      if (bookingId && ref) {
        // eslint-disable-next-line no-console
        console.warn("[booking] post-booking step failed, navigating to confirmation anyway:", e);
        reset();
        setCheckIn(undefined);
        setCheckOut(undefined);
        navigate({ to: "/booking/confirmation/$ref", params: { ref } });
        return;
      }

      // Guest or booking creation genuinely failed — surface the error.
      let msg: string;
      if (e && typeof e === "object") {
        const err = e as { code?: string; message?: string; details?: string; hint?: string };
        if (err.code || err.details || err.hint) {
          msg =
            `Booking failed.\n` +
            (err.code ? `code: ${err.code}\n` : "") +
            (err.message ? `message: ${err.message}\n` : "") +
            (err.details ? `details: ${err.details}\n` : "") +
            (err.hint ? `hint: ${err.hint}` : "");
        } else {
          msg = err.message ?? JSON.stringify(e);
        }
      } else {
        msg = String(e);
      }
      // eslint-disable-next-line no-console
      console.error("[booking] booking creation failed:", e);
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <StepCard title="Payment" subtitle="Choose how you'd like to pay. No charge is taken now.">
        <div className="grid gap-3 md:grid-cols-2">
          <PayOption kind="property" active={draft.payment === "property"} icon={<Building2 className="h-5 w-5" />} title="Pay at property" sub="Settle the bill on arrival. No prepayment needed." />
          <PayOption kind="card" active={draft.payment === "card"} icon={<CreditCard className="h-5 w-5" />} title="Credit card" sub="Securely save card details (UI demo, no charge)." />
        </div>

        {draft.payment === "card" && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <CardInput label="Card number" value={card.number} onChange={(v) => setCard({ ...card, number: v })} placeholder="4242 4242 4242 4242" />
            <CardInput label="Name on card" value={card.name} onChange={(v) => setCard({ ...card, name: v })} />
            <CardInput label="Expiry (MM/YY)" value={card.exp} onChange={(v) => setCard({ ...card, exp: v })} placeholder="12/27" />
            <CardInput label="CVC" value={card.cvc} onChange={(v) => setCard({ ...card, cvc: v })} placeholder="123" />
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="whitespace-pre-wrap">{error}</p>
          </div>
        )}

        <p className="mt-6 rounded-xl border border-gold/15 bg-ink/30 p-4 text-xs text-muted-foreground">
          Free cancellation up to 24h before check-in. By confirming, you agree to Lavista's house rules.
        </p>
      </StepCard>
      <div className="mt-4 flex justify-between md:mt-8">
        <BackLink />
        <button
          onClick={confirm}
          disabled={!canConfirm || submitting}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gold px-4 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-ink transition hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-50 md:gap-2 md:px-6 md:py-3 md:text-sm"
        >
          <Check className="h-3.5 w-3.5 md:h-4 md:w-4" /> {submitting ? "Confirming…" : "Confirm"}
        </button>
      </div>
    </div>
  );
}

function PayOption({ kind, active, icon, title, sub }: { kind: "property" | "card"; active: boolean; icon: React.ReactNode; title: string; sub: string }) {
  const { setDraft } = useBookingFlow();
  return (
    <button
      type="button"
      onClick={() => setDraft({ payment: kind })}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${active ? "border-gold bg-gold/5" : "border-gold/15 hover:border-gold/40"}`}
    >
      <span className={`mt-1 ${active ? "text-gold" : "text-sand-soft/70"}`}>{icon}</span>
      <span className="flex-1">
        <span className="block text-sm text-sand-soft">{title}</span>
        <span className="block text-xs text-muted-foreground">{sub}</span>
      </span>
      {active && <Check className="h-4 w-4 text-gold" />}
    </button>
  );
}

function CardInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.22em] text-gold">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-gold/20 bg-ink/30 p-3 text-sm text-sand-soft outline-none focus:border-gold"
      />
    </div>
  );
}

function BackLink() {
  return (
    <a
      href="/booking/extras"
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gold/30 px-4 py-2.5 text-xs uppercase tracking-[0.22em] text-sand-soft transition hover:bg-gold/10 md:gap-2 md:px-5 md:py-3"
    >
      ← Back
    </a>
  );
}
