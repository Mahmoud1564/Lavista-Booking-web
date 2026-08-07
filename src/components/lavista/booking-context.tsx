import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { consumePreselectedDates, preselectDates } from "@/lib/preselect-dates";

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

export function BookingProvider({
  children,
  persistDates = false,
}: {
  children: ReactNode;
  persistDates?: boolean;
}) {
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuestsRaw] = useState(2);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = load();
    if (s.guests) setGuestsRaw(Math.min(6, Math.max(1, s.guests)));
    if (!persistDates) {
      // Booking flow: consume the one-time bridge written by the search bar.
      const preselected = consumePreselectedDates();
      if (preselected.checkIn) setCheckIn(preselected.checkIn);
      if (preselected.checkOut) setCheckOut(preselected.checkOut);
    }
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify({ guests }));
  }, [guests, hydrated]);

  // Search-bar provider: keep lavista.searchDates in sync so the booking
  // flow can pick them up automatically when it mounts, even without an
  // explicit "Book" button click.
  useEffect(() => {
    if (!persistDates || !hydrated) return;
    preselectDates(checkIn, checkOut);
  }, [checkIn, checkOut, persistDates, hydrated]);

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
