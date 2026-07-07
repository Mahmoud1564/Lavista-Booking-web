import { useState } from "react";
import { format, startOfDay, addDays } from "date-fns";
import { Calendar as CalendarIcon, Users, Search } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useBooking } from "./booking-context";

function Field({
  label,
  value,
  icon,
  onClick,
  asChild,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  onClick?: () => void;
  asChild?: boolean;
}) {
  const Cmp: any = asChild ? "div" : "button";
  return (
    <Cmp
      type={asChild ? undefined : "button"}
      onClick={onClick}
      className="group flex w-full min-w-0 items-center gap-3 rounded-2xl px-5 py-3 text-left transition hover:bg-gold/10 active:bg-gold/15 md:rounded-full"
    >
      <span className="shrink-0 text-gold transition group-hover:scale-110">{icon}</span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-sand-soft/60">
          {label}
        </span>
        <span className="truncate whitespace-nowrap text-sm text-sand-soft">{value}</span>
      </span>
    </Cmp>
  );
}

const sharedCalendarClassNames = {
  today:
    "rounded-md border border-gold/60 bg-transparent text-sand-soft data-[selected=true]:border-transparent",
} as const;

const sharedModifiersClassNames = {
  rangeStart: "bg-gold text-ink rounded-l-md [&_button]:bg-gold [&_button]:text-ink [&_button]:hover:bg-gold",
  rangeEnd: "bg-gold text-ink rounded-r-md [&_button]:bg-gold [&_button]:text-ink [&_button]:hover:bg-gold",
  rangeMiddle: "bg-gold/25 text-sand-soft rounded-none [&_button]:bg-transparent [&_button]:text-sand-soft [&_button]:hover:bg-gold/30",
  selectedSingle: "bg-gold text-ink rounded-md [&_button]:bg-gold [&_button]:text-ink [&_button]:hover:bg-gold",
} as const;

export function BookingBar({ onSearch }: { onSearch?: () => void }) {
  const { checkIn, checkOut, guests, setCheckIn, setCheckOut, setGuests } = useBooking();
  const [openIn, setOpenIn] = useState(false);
  const [openOut, setOpenOut] = useState(false);
  const [openGuests, setOpenGuests] = useState(false);

  const today = startOfDay(new Date());

  const checkInLabel = checkIn ? format(checkIn, "EEE, MMM d") : "Add date";
  const checkOutLabel = checkOut ? format(checkOut, "EEE, MMM d") : "Add date";

  const atMax = guests >= 6;
  const atMin = guests <= 1;

  const rangeModifiers = (() => {
    if (checkIn && checkOut) {
      return {
        rangeStart: checkIn,
        rangeEnd: checkOut,
        rangeMiddle: { after: checkIn, before: checkOut },
      } as const;
    }
    if (checkIn) return { selectedSingle: checkIn } as const;
    if (checkOut) return { selectedSingle: checkOut } as const;
    return {} as const;
  })();

  const NightsHeader = () => {
    const n =
      checkIn && checkOut
        ? Math.max(0, Math.round((+checkOut - +checkIn) / 86400000))
        : 0;
    return (
      <div className="flex items-center justify-between border-b border-gold/15 px-4 pb-3 pt-3 text-xs">
        <span className="uppercase tracking-[0.22em] text-gold">Your stay</span>
        <span className="text-sand-soft">
          {n > 0 ? `${n} night${n > 1 ? "s" : ""}` : "Pick check-in & check-out"}
        </span>
      </div>
    );
  };

  const handleSearch = () => {
    onSearch?.();
  };

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div className="glass flex w-full flex-col items-stretch gap-1 rounded-3xl p-2 shadow-2xl shadow-black/40 md:flex-row md:flex-nowrap md:items-center md:rounded-full md:p-1.5">
        <Popover open={openIn} onOpenChange={setOpenIn}>
          <PopoverTrigger asChild>
            <div className="min-w-0 flex-1 cursor-pointer">
              <Field
                asChild
                label="Check in"
                value={checkInLabel}
                icon={<CalendarIcon className="h-4 w-4" />}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto bg-card p-0" align="start">
            <NightsHeader />
            <Calendar
              mode="single"
              numberOfMonths={2}
              selected={checkIn}
              onSelect={(d: Date | undefined) => {
                if (!d) return;
                setCheckIn(d);
                if (checkOut && d >= checkOut) setCheckOut(undefined);
                setOpenIn(false);
              }}
              disabled={{ before: today }}
              modifiers={rangeModifiers as any}
              modifiersClassNames={sharedModifiersClassNames}
              initialFocus
              classNames={sharedCalendarClassNames}
              className={cn("pointer-events-auto p-3")}
            />
          </PopoverContent>
        </Popover>

        <div className="hidden h-8 w-px bg-gold/20 md:block" />

        <Popover open={openOut} onOpenChange={setOpenOut}>
          <PopoverTrigger asChild>
            <div className="min-w-0 flex-1 cursor-pointer">
              <Field
                asChild
                label="Check out"
                value={checkOutLabel}
                icon={<CalendarIcon className="h-4 w-4" />}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto bg-card p-0" align="start">
            <NightsHeader />
            <Calendar
              mode="single"
              numberOfMonths={2}
              selected={checkOut}
              onSelect={(d: Date | undefined) => {
                if (!d) return;
                setCheckOut(d);
                setOpenOut(false);
              }}
              disabled={{ before: checkIn ? addDays(checkIn, 1) : addDays(today, 1) }}
              modifiers={rangeModifiers as any}
              modifiersClassNames={sharedModifiersClassNames}
              initialFocus
              classNames={sharedCalendarClassNames}
              className={cn("pointer-events-auto p-3")}
            />
          </PopoverContent>
        </Popover>

        <div className="hidden h-8 w-px bg-gold/20 md:block" />

        <Popover open={openGuests} onOpenChange={setOpenGuests}>
          <PopoverTrigger asChild>
            <div className="min-w-0 flex-1 cursor-pointer md:max-w-[180px]">
              <Field
                asChild
                label="Guests"
                value={`${guests} guest${guests > 1 ? "s" : ""}`}
                icon={<Users className="h-4 w-4" />}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-64 bg-card p-4" align="end">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-sand-soft">Guests</p>
                <p className="text-xs text-muted-foreground">Up to 6 per booking</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  disabled={atMin}
                  aria-label="Decrease guests"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 text-gold transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >−</button>
                <span className="w-5 text-center text-sand-soft" aria-live="polite">{guests}</span>
                <button
                  onClick={() => setGuests(Math.min(6, guests + 1))}
                  disabled={atMax}
                  aria-label="Increase guests"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 text-gold transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                >+</button>
              </div>
            </div>
            {atMax && (
              <p className="mt-3 text-[11px] text-muted-foreground">Maximum 6 guests per booking.</p>
            )}
          </PopoverContent>
        </Popover>

        <button
          onClick={handleSearch}
          className="group ml-1 flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-gold px-6 py-3.5 text-sm font-medium text-ink shadow-lg shadow-gold/20 transition hover:bg-gold-soft md:rounded-full md:px-7"
        >
          <Search className="h-4 w-4 transition group-hover:scale-110" />
          Check availability
        </button>
      </div>
    </div>
  );
}
