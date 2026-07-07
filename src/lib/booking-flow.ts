import { createContext, useContext, useEffect, useState, type ReactNode, createElement } from "react";

export type GuestInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type BookingDraft = {
  guest: GuestInfo;
  rooms: string[]; // room UUIDs, allows multiple
  arrivalTime: string;
  specialRequests: string;
  payment: "property" | "card";
};

const EMPTY: BookingDraft = {
  guest: { firstName: "", lastName: "", email: "", phone: "" },
  rooms: [],
  arrivalTime: "",
  specialRequests: "",
  payment: "property",
};

const KEY = "lavista.draft";

type Ctx = {
  draft: BookingDraft;
  setDraft: (patch: Partial<BookingDraft>) => void;
  setGuest: (patch: Partial<GuestInfo>) => void;
  addRoom: (id: string) => void;
  removeRoom: (idx: number) => void;
  reset: () => void;
};

const C = createContext<Ctx | null>(null);

function load(): BookingDraft {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    // Migrate legacy numeric room ids by discarding them (incompatible with UUIDs).
    if (Array.isArray(parsed?.rooms) && parsed.rooms.some((r: unknown) => typeof r !== "string")) {
      parsed.rooms = parsed.rooms.filter((r: unknown) => typeof r === "string");
    }
    return { ...EMPTY, ...parsed };
  } catch {
    return EMPTY;
  }
}

export function BookingFlowProvider({ children }: { children: ReactNode }) {
  const [draft, setState] = useState<BookingDraft>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  const setDraft = (patch: Partial<BookingDraft>) =>
    setState((d) => ({ ...d, ...patch }));
  const setGuest = (patch: Partial<GuestInfo>) =>
    setState((d) => ({ ...d, guest: { ...d.guest, ...patch } }));
  const addRoom = (id: string) =>
    setState((d) => (d.rooms.includes(id) ? d : { ...d, rooms: [...d.rooms, id] }));
  const removeRoom = (idx: number) =>
    setState((d) => ({ ...d, rooms: d.rooms.filter((_, i) => i !== idx) }));
  const reset = () => {
    setState(EMPTY);
    if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
  };

  return createElement(
    C.Provider,
    { value: { draft, setDraft, setGuest, addRoom, removeRoom, reset } },
    children,
  );
}

export function useBookingFlow() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useBookingFlow must be inside BookingFlowProvider");
  return ctx;
}
