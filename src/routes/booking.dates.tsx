import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { format, differenceInCalendarDays, addDays } from "date-fns";
import { CalendarDays, Users, LogIn, LogOut } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useBooking } from "@/components/lavista/booking-context";
import { StepCard, StepNav } from "@/components/lavista/booking-flow-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/booking/dates")({
  head: () => ({
    meta: [{ title: "Pick dates — Lavista" }, { name: "robots", content: "noindex,follow" }],
  }),
  component: DatesStep,
});

function DatesStep() {
  const { checkIn, checkOut, guests, setCheckIn, setCheckOut, setGuests } = useBooking();
  const [openIn, setOpenIn] = useState(false);
  const [openOut, setOpenOut] = useState(false);
  const nights = checkIn && checkOut ? Math.max(0, differenceInCalendarDays(checkOut, checkIn)) : 0;
  const valid = !!checkIn && !!checkOut && nights > 0 && guests >= 1;

  const handleSetCheckIn = (d?: Date) => {
    setCheckIn(d);
    if (d && checkOut && differenceInCalendarDays(checkOut, d) <= 0) {
      setCheckOut(addDays(d, 1));
    }
    setOpenIn(false);
  };

  return (
    <div>
      <StepCard
        title="Dates & guests"
        subtitle="Pick when you'd like to stay and how many people are coming."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Popover open={openIn} onOpenChange={setOpenIn}>
            <PopoverTrigger asChild>
              <button className="rounded-2xl border border-gold/20 bg-ink/30 p-4 text-left transition hover:border-gold/40">
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-gold">
                  <LogIn className="h-3.5 w-3.5" /> Check-in
                </p>
                <p className="mt-2 text-sm text-sand-soft">
                  {checkIn ? format(checkIn, "EEE, MMM d, yyyy") : "Pick check-in date"}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">From 2:00 PM</p>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto bg-card p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={handleSetCheckIn}
                disabled={{ before: new Date() }}
                initialFocus
                className={cn("pointer-events-auto p-3")}
              />
            </PopoverContent>
          </Popover>

          <Popover open={openOut} onOpenChange={setOpenOut}>
            <PopoverTrigger asChild>
              <button className="rounded-2xl border border-gold/20 bg-ink/30 p-4 text-left transition hover:border-gold/40">
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-gold">
                  <LogOut className="h-3.5 w-3.5" /> Check-out
                </p>
                <p className="mt-2 text-sm text-sand-soft">
                  {checkOut ? format(checkOut, "EEE, MMM d, yyyy") : "Pick check-out date"}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : "Until 11:00 AM"}
                </p>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto bg-card p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={(d) => {
                  setCheckOut(d);
                  setOpenOut(false);
                }}
                disabled={{ before: checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1) }}
                initialFocus
                className={cn("pointer-events-auto p-3")}
              />
            </PopoverContent>
          </Popover>

          <div className="rounded-2xl border border-gold/20 bg-ink/30 p-4 md:col-span-2">
            <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-gold">
              <Users className="h-3.5 w-3.5" /> Guests
            </p>
            <div className="mt-3 flex items-center gap-4">
              <button
                onClick={() => setGuests(guests - 1)}
                disabled={guests <= 1}
                className="h-9 w-9 rounded-full border border-gold/30 text-gold disabled:opacity-40"
              >
                −
              </button>
              <span className="text-lg text-sand-soft">{guests}</span>
              <button
                onClick={() => setGuests(guests + 1)}
                disabled={guests >= 6}
                className="h-9 w-9 rounded-full border border-gold/30 text-gold disabled:opacity-40"
              >
                +
              </button>
              <span className="ml-auto text-xs text-muted-foreground">Max 6</span>
            </div>
          </div>
        </div>

        {(!checkIn || !checkOut) && (
          <button
            onClick={() => {
              const t = new Date();
              setCheckIn(t);
              setCheckOut(addDays(t, 2));
            }}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-gold underline-offset-4 hover:underline"
          >
            <CalendarDays className="h-3.5 w-3.5" /> Quick pick: 2-night stay starting today
          </button>
        )}
      </StepCard>
      <StepNav back="/booking/rooms" next="/booking/extras" disabled={!valid} />
    </div>
  );
}
