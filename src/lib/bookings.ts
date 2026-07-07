import type { Room } from "@/data/rooms";

export type BookingRoomLine = {
  id: string;
  type: string;
  price: number;
  nights: number;
  subtotal: number;
};

export type StoredBooking = {
  ref: string;
  bookingId?: string;
  roomId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  total: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: string;
  status: "confirmed" | "cancelled";
  rooms?: BookingRoomLine[];
};

const KEY = "lavista.bookings";

export function loadAll(): StoredBooking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveBooking(b: StoredBooking) {
  if (typeof window === "undefined") return;
  const all = loadAll();
  all.unshift(b);
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function findBooking(idOrName: string, emailOrPhone?: string) {
  const all = loadAll();
  const q1 = idOrName.trim().toLowerCase();
  if (!q1) return undefined;
  const q2 = (emailOrPhone ?? "").trim().toLowerCase();
  const digits = (s: string) => s.replace(/\D+/g, "");
  const q2Digits = digits(q2);
  return all.find((b) => {
    const fullName = `${b.firstName} ${b.lastName}`.toLowerCase();
    const idMatch = b.ref.toLowerCase() === q1 || fullName === q1 || fullName.includes(q1);
    if (!idMatch) return false;
    if (!q2) return true;
    const emailMatch = b.email.toLowerCase() === q2;
    const phoneMatch = q2Digits.length > 0 && digits(b.phone) === q2Digits;
    return emailMatch || phoneMatch;
  });
}

export function updateBooking(ref: string, patch: Partial<StoredBooking>) {
  if (typeof window === "undefined") return;
  const all = loadAll().map((b) => (b.ref === ref ? { ...b, ...patch } : b));
  window.localStorage.setItem(KEY, JSON.stringify(all));
}

export function priceFor(room: Room, nights: number) {
  return Math.max(1, nights) * room.price;
}
