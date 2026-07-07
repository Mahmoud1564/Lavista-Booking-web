import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { consumePreselectedDates } from "@/lib/preselect-dates";

type Ctx = {
  checkIn?: Date;
  checkOut?: Date;
  guests: number;
  setCheckIn: (d?: Date) => void;
  setCheckOut: (d?: Date) => void;
  setGuests: (n: number) => void;
};

const BookingCtx = createContext<Ctx | null>(null);
const KEY = "lavista.search";

type Stored = { guests?: number };

function load(): Stored {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuestsRaw] = useState(2);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = load();
    if (s.guests) setGuestsRaw(Math.min(6, Math.max(1, s.guests)));
    // Dates are intentionally not persisted across reloads. The only
    // exception is a one-time bridge: if the guest picked dates in the
    // main search bar and then clicked "Book", those dates are consumed
    // here so the booking flow opens with them already filled in.
    const preselected = consumePreselectedDates();
    if (preselected.checkIn) setCheckIn(preselected.checkIn);
    if (preselected.checkOut) setCheckOut(preselected.checkOut);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify({ guests }));
  }, [guests, hydrated]);

  const setGuests = (n: number) => setGuestsRaw(Math.min(6, Math.max(1, n)));

  return (
    <BookingCtx.Provider value={{ checkIn, checkOut, guests, setCheckIn, setCheckOut, setGuests }}>
      {children}
    </BookingCtx.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingCtx);
  if (!ctx) throw new Error("useBooking must be inside BookingProvider");
  return ctx;
}
