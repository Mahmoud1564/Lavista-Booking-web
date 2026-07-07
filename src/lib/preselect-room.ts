// Helper to preselect a room before BookingFlowProvider mounts.
// Writes directly to the same localStorage key the provider reads on hydrate.
//
// Clicking "Book" on a specific room always starts a fresh booking flow:
// it must show ONLY that room selected (never appended to a stale room list
// left over from a previous session), and extras/add-ons from any previous
// session must not carry over either.
const KEY = "lavista.draft";

export function preselectRoom(id: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    const draft = raw ? JSON.parse(raw) : {};
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        ...draft,
        rooms: [id],
        arrivalTime: "",
        specialRequests: "",
      }),
    );
  } catch {
    // ignore
  }
}
