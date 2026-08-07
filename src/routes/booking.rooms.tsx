import { createFileRoute } from "@tanstack/react-router";
import { Plus, X, Check, Eye, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useBookingFlow } from "@/lib/booking-flow";
import { StepCard, StepNav } from "@/components/lavista/booking-flow-ui";
import { useBooking } from "@/components/lavista/booking-context";
import { useRooms, useUnavailableRooms } from "@/lib/use-rooms";

export const Route = createFileRoute("/booking/rooms")({
  head: () => ({ meta: [{ title: "Choose your rooms — Lavista" }, { name: "robots", content: "noindex,follow" }] }),
  component: RoomsStep,
});

function RoomsStep() {
  const { draft, addRoom, removeRoom } = useBookingFlow();
  const { guests, checkIn, checkOut } = useBooking();
  const { data: rooms = [], isLoading } = useRooms();
  const { data: unavailable } = useUnavailableRooms(checkIn, checkOut);
  const [showAllRooms, setShowAllRooms] = useState(false);

  const selected = draft.rooms
    .map((id) => rooms.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));
  const totalCapacity = selected.reduce((s, r) => s + r.capacity, 0);
  const valid = draft.rooms.length >= 1;

  const isSelected = (id: string) => draft.rooms.includes(id);
  const isUnavailable = (id: string) => unavailable?.has(id) ?? false;
  const removeById = (id: string) => {
    const idx = draft.rooms.indexOf(id);
    if (idx >= 0) removeRoom(idx);
  };

  return (
    <div>
      <StepCard
        title="Choose your room"
        subtitle={`Pick one or more rooms for ${guests} guest${guests > 1 ? "s" : ""}. Capacity selected: ${totalCapacity}. Availability is checked live against current bookings.`}
      >
        {!checkIn || !checkOut ? (
          <div className="mb-4 rounded-xl border border-gold/30 bg-gold/5 p-3 text-xs text-sand-soft/80">
            Pick check-in and check-out dates first to verify room availability.
          </div>
        ) : null}

        {selected.length > 0 && (
          <div className="mb-6 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold">
              Selected ({selected.length})
            </p>
            {selected.map((r, idx) => (
              <div key={`${r.id}-${idx}`} className="flex items-center gap-3 rounded-xl border border-gold/40 bg-gold/5 p-3">
                <img src={r.img} alt={r.type} className="h-14 w-20 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-sand-soft">{r.type}</p>
                  <p className="text-xs text-muted-foreground">${r.price} / night · sleeps {r.capacity}</p>
                </div>
                <button onClick={() => removeRoom(idx)} aria-label="Remove room" className="rounded-full border border-gold/30 p-1.5 text-muted-foreground transition hover:border-gold hover:text-gold">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-gold">All rooms</p>
        {isLoading ? (
          <div className="grid gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-card/60" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {rooms.map((r, index) => {
              const selectedRoom = isSelected(r.id);
              const unavail = isUnavailable(r.id);
              const hiddenOnMobile = index > 0 && !showAllRooms;
              return (
                <div
                  key={r.id}
                  className={`flex flex-col items-stretch gap-4 rounded-2xl border p-3 transition sm:flex-row sm:items-center ${hiddenOnMobile ? "hidden sm:flex" : ""} ${
                    selectedRoom
                      ? "border-gold bg-gold/5"
                      : unavail
                      ? "border-gold/10 opacity-60"
                      : "border-gold/15 hover:border-gold/40"
                  }`}
                >
                  <img src={r.img} alt={r.type} className="h-32 w-full rounded-xl object-cover sm:h-24 sm:w-32" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg text-sand-soft">{r.type}</p>
                      {selectedRoom && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink">
                          <Check className="h-3 w-3" /> Selected
                        </span>
                      )}
                      {unavail && !selectedRoom && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-destructive/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-destructive">
                          <AlertCircle className="h-3 w-3" /> Unavailable
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{r.desc}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">Sleeps {r.capacity}</p>
                    <Link
                      to="/rooms/$id"
                      params={{ id: r.id }}
                      search={{ from: "booking" }}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] text-sand-soft/80 transition hover:text-gold"
                    >
                      <Eye className="h-3 w-3" /> View details
                    </Link>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
                    <div className="text-right">
                      <p className="font-display text-xl text-gold">${r.price}</p>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">/ night</p>
                    </div>
                    {selectedRoom ? (
                      <button
                        type="button"
                        onClick={() => removeById(r.id)}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gold/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-gold transition hover:bg-gold/10"
                      >
                        <X className="h-3 w-3" /> Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addRoom(r.id)}
                        disabled={unavail}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gold px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-ink transition hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" /> {unavail ? "Booked" : "Add room"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {rooms.length > 1 && (
              <button
                type="button"
                onClick={() => setShowAllRooms((v) => !v)}
                className="sm:hidden flex items-center justify-center gap-2 rounded-2xl border border-gold/20 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-sand-soft/80 transition hover:border-gold/40 hover:text-gold"
              >
                {showAllRooms ? (
                  <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
                ) : (
                  <><ChevronDown className="h-3.5 w-3.5" /> Show more rooms (+{rooms.length - 1})</>
                )}
              </button>
            )}
          </div>
        )}
      </StepCard>
      <StepNav back="/booking/guest" next="/booking/dates" disabled={!valid} />
    </div>
  );
}
