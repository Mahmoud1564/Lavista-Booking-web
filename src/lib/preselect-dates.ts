// Helper to carry the main search bar's selected check-in/check-out dates
// into the booking flow. Writes to a short-lived localStorage key that the
// booking flow's BookingProvider consumes once on hydrate, then clears —
// so it only bridges an explicit "Book" action and never causes dates to
// stick around indefinitely.
const KEY = "lavista.searchDates";

export function preselectDates(checkIn?: Date, checkOut?: Date) {
  if (typeof window === "undefined") return;
  if (!checkIn && !checkOut) return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        checkIn: checkIn ? checkIn.toISOString() : undefined,
        checkOut: checkOut ? checkOut.toISOString() : undefined,
      }),
    );
  } catch {
    // ignore
  }
}

export function consumePreselectedDates(): { checkIn?: Date; checkOut?: Date } {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    window.localStorage.removeItem(KEY);
    const parsed = JSON.parse(raw);
    return {
      checkIn: parsed.checkIn ? new Date(parsed.checkIn) : undefined,
      checkOut: parsed.checkOut ? new Date(parsed.checkOut) : undefined,
    };
  } catch {
    return {};
  }
}
