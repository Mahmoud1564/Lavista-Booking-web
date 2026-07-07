import { supabase as _typedSupabase } from "@/integrations/supabase/client";
import { publicUrl } from "./storage";
import { toDateKey } from "./utils";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = _typedSupabase;

export type DbRoom = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  guests: number;
  beds: number;
  is_active: boolean;
  thumbnail_url: string | null;
};

export type UiRoom = {
  id: string;
  slug: string;
  type: string;
  img: string;
  gallery: string[];
  capacity: number;
  beds: number;
  price: number;
  desc: string;
  long: string;
  features: string[];
  amenities: string[];
  availability: string;
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=70";

function roomImg(ref: string | null): string {
  return publicUrl("room-images", ref) ?? FALLBACK_IMG;
}

export function mapRoom(r: DbRoom, gallery: string[] = []): UiRoom {
  const thumb = roomImg(r.thumbnail_url);
  const slug = r.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const gal = gallery.length > 0 ? gallery : [thumb];
  const features = [r.beds > 1 ? `${r.beds} beds` : "1 bed", `Sleeps ${r.guests}`, "Fast Wi-Fi"];
  return {
    id: r.id,
    slug,
    type: r.name,
    img: thumb,
    gallery: gal,
    capacity: r.guests,
    beds: r.beds,
    price: Number(r.price),
    desc: r.description ?? "",
    long: r.description ?? "",
    features,
    amenities: [],
    availability: "Live availability — selection is verified against current bookings.",
  };
}

export async function fetchRooms(): Promise<UiRoom[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("id,name,description,price,guests,beds,is_active,thumbnail_url")
    .eq("is_active", true)
    .order("price", { ascending: true });
  if (error) throw error;
  return (data as DbRoom[]).map((r) => mapRoom(r));
}

export async function fetchRoomGallery(roomId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("room_images")
    .select("image_url,sort_order,is_thumbnail")
    .eq("room_id", roomId)
    .order("is_thumbnail", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) return [];
  return ((data ?? []) as Array<{ image_url: string }>)
    .map((row) => roomImg(row.image_url))
    .filter(Boolean);
}

export async function fetchRoomAmenities(roomId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("room_amenities")
    .select("amenity")
    .eq("room_id", roomId);
  if (error) return [];
  return ((data ?? []) as Array<{ amenity: string }>).map((r) => r.amenity).filter(Boolean);
}

export async function fetchRoom(id: string): Promise<UiRoom | null> {
  const { data, error } = await supabase
    .from("rooms")
    .select("id,name,description,price,guests,beds,is_active,thumbnail_url")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [gallery, amenities] = await Promise.all([fetchRoomGallery(id), fetchRoomAmenities(id)]);
  const room = mapRoom(data as DbRoom, gallery);
  return { ...room, amenities };
}

/**
 * Returns the set of room IDs that are unavailable for the given date range.
 *
 * Bookings and admin blocks follow DIFFERENT overlap rules by design:
 *
 *   - Bookings use hotel stay-night logic (half-open interval [check_in, check_out)).
 *     The checkout day itself is NOT occupied, so a new stay may begin that same
 *     day: overlap when check_in < co AND check_out > ci.
 *
 *   - Admin room_blocks use fully-inclusive calendar days on BOTH sides
 *     (start_date and end_date, and both ci and co are treated as included
 *     days of the search span). A block from Jul 20–22 must hide the room for
 *     any search whose [ci, co] span touches Jul 20, 21, or 22 — including
 *     when co itself lands on a blocked day: overlap when start_date <= co
 *     AND end_date >= ci.
 *
 * The two checks (bookings via booking_rooms/room_id, and admin blocks) run
 * concurrently.  A failure in either one never prevents the other from
 * running — this ensures admin blocks always work even when the bookings
 * table is inaccessible, and vice-versa.
 */
export async function fetchUnavailableRoomIds(checkIn: Date, checkOut: Date): Promise<Set<string>> {
  const ci = toDateKey(checkIn);
  const co = toDateKey(checkOut);

  const [bookingRoomsResult, adminBlocksResult] = await Promise.allSettled([
    // ── Check 1: bookings ──────────────────────────────────────────────────
    // Step 1a: fetch overlapping bookings (any non-cancelled status).
    // Step 1b: fetch room_ids from booking_rooms for those booking IDs.
    // Also collect the direct room_id column stored on the bookings row itself.
    (async (): Promise<Set<string>> => {
      const ids = new Set<string>();

      const { data: bookings } = await supabase
        .from("bookings")
        .select("id,room_id")
        .lt("check_in", co)
        .gt("check_out", ci)
        .neq("status", "cancelled");

      const bookingIds: string[] = [];
      for (const b of (bookings ?? []) as Array<{ id: string; room_id: string | null }>) {
        if (b.room_id) ids.add(b.room_id);
        bookingIds.push(b.id);
      }

      if (bookingIds.length > 0) {
        const { data: br } = await supabase
          .from("booking_rooms")
          .select("room_id")
          .in("booking_id", bookingIds);
        for (const row of (br ?? []) as Array<{ room_id: string }>) {
          if (row.room_id) ids.add(row.room_id);
        }
      }

      return ids;
    })(),

    // ── Check 2: admin-blocked dates ───────────────────────────────────────
    // Both start_date/end_date (block) and ci/co (search span) are treated
    // as fully-inclusive calendar days: overlap when start_date <= co AND
    // end_date >= ci. Unlike bookings, the search's checkout day (co) IS
    // considered occupied for this check, since a block marks specific
    // calendar days as unusable regardless of stay-night semantics.
    (async (): Promise<Set<string>> => {
      const ids = new Set<string>();
      const { data: blocks } = await supabase
        .from("room_blocks")
        .select("room_id")
        .lte("start_date", co)
        .gte("end_date", ci);
      for (const row of (blocks ?? []) as Array<{ room_id: string }>) {
        if (row.room_id) ids.add(row.room_id);
      }
      return ids;
    })(),
  ]);

  const unavailable = new Set<string>();
  if (bookingRoomsResult.status === "fulfilled") {
    bookingRoomsResult.value.forEach((id) => unavailable.add(id));
  } else {
    console.warn("[availability] bookings check failed:", bookingRoomsResult.reason);
  }
  if (adminBlocksResult.status === "fulfilled") {
    adminBlocksResult.value.forEach((id) => unavailable.add(id));
  } else {
    console.warn("[availability] room_blocks check failed:", adminBlocksResult.reason);
  }

  return unavailable;
}

export type CreateGuestInput = {
  name: string;
  phone: string;
  email?: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NIL_UUID = "00000000-0000-0000-0000-000000000000";

function createClientUuid(label: string): string {
  const id = globalThis.crypto?.randomUUID?.();
  if (!id || !UUID_RE.test(id) || id === NIL_UUID) {
    throw new Error(`${label}: unable to create a valid UUID`);
  }
  return id;
}

export async function createGuest(input: CreateGuestInput): Promise<string> {
  if (!input.name?.trim()) throw new Error("createGuest: name is required");
  if (!input.phone?.trim()) throw new Error("createGuest: phone is required");
  const id = createClientUuid("createGuest");
  const payload = {
    id,
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
  };
  // eslint-disable-next-line no-console
  console.log("[createGuest] inserting", payload);
  const response = await supabase.from("guests").insert(payload);
  const { error, status, statusText } = response;
  // eslint-disable-next-line no-console
  console.log("[createGuest] response", { status, statusText, error });
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[createGuest] supabase error", error);
    throw error;
  }
  if (!id || !UUID_RE.test(id) || id === NIL_UUID) {
    throw new Error(`createGuest: invalid guest id returned (${id ?? "null"})`);
  }
  return id;
}

export type CreateBookingInput = {
  guestId: string;
  checkIn: Date;
  checkOut: Date;
  numGuests: number;
  totalPrice: number;
  notes?: string;
  primaryRoomId?: string;
};

export async function createBooking(input: CreateBookingInput): Promise<string> {
  if (!input.guestId || !UUID_RE.test(input.guestId) || input.guestId === NIL_UUID) {
    throw new Error(`createBooking: invalid guestId (${input.guestId ?? "null"})`);
  }
  if (!(input.checkIn instanceof Date) || !(input.checkOut instanceof Date))
    throw new Error("createBooking: check_in and check_out must be Dates");
  if (input.checkOut <= input.checkIn)
    throw new Error("createBooking: check_out must be after check_in");
  if (typeof input.totalPrice !== "number" || Number.isNaN(input.totalPrice))
    throw new Error("createBooking: total_price must be a valid number");

  const id = createClientUuid("createBooking");
  const payload: Record<string, unknown> = {
    id,
    guest_id: input.guestId,
    check_in: toDateKey(input.checkIn),
    check_out: toDateKey(input.checkOut),
    num_guests: input.numGuests,
    status: "confirmed",
    total_price: input.totalPrice,
  };
  if (input.notes) payload.notes = input.notes;
  if (input.primaryRoomId) payload.room_id = input.primaryRoomId;

  // eslint-disable-next-line no-console
  console.log("[createBooking] guest_id:", input.guestId, "payload:", payload);

  const response = await supabase.from("bookings").insert(payload);
  const { error, status, statusText } = response;
  // eslint-disable-next-line no-console
  console.log("[createBooking] response", { status, statusText, error });
  if (error) {
    // eslint-disable-next-line no-console
    console.error("[createBooking] supabase error", error);
    throw error;
  }
  return id;
}

export async function addBookingRoom(
  bookingId: string,
  roomId: string,
  pricePerNight: number,
): Promise<void> {
  if (!bookingId || !UUID_RE.test(bookingId) || bookingId === NIL_UUID) {
    throw new Error(`addBookingRoom: invalid bookingId (${bookingId ?? "null"})`);
  }
  if (!roomId || !UUID_RE.test(roomId) || roomId === NIL_UUID) {
    throw new Error(`addBookingRoom: invalid roomId (${roomId ?? "null"})`);
  }
  const payload = {
    booking_id: bookingId,
    room_id: roomId,
    price_per_night: pricePerNight,
  };
  // eslint-disable-next-line no-console
  console.log("[addBookingRoom] inserting", payload);
  const response = await supabase.from("booking_rooms").insert(payload);
  const { error, status, statusText } = response;
  // eslint-disable-next-line no-console
  console.log("[addBookingRoom] response", { status, statusText, error });
  if (error) throw error;
}

export async function confirmBooking(bookingId: string): Promise<void> {
  const { error } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId);
  if (error) throw error;
}

export type FullBooking = {
  id: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  status: string;
  total_price: number;
  notes: string | null;
  created_at: string;
  guest: { name: string; phone: string; email: string | null } | null;
  rooms: Array<{
    room_id: string;
    price_per_night: number | null;
    name: string;
    thumbnail_url: string | null;
  }>;
};

export async function fetchBookingById(id: string): Promise<FullBooking | null> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id,check_in,check_out,num_guests,status,total_price,notes,created_at, guests(name,phone,email), booking_rooms(room_id,price_per_night, rooms(name,thumbnail_url))",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const d = data as unknown as {
    id: string;
    check_in: string;
    check_out: string;
    num_guests: number;
    status: string;
    total_price: number;
    notes: string | null;
    created_at: string;
    guests: { name: string; phone: string; email: string | null } | null;
    booking_rooms: Array<{
      room_id: string;
      price_per_night: number | null;
      rooms: { name: string; thumbnail_url: string | null } | null;
    }>;
  };
  return {
    id: d.id,
    check_in: d.check_in,
    check_out: d.check_out,
    num_guests: d.num_guests,
    status: d.status,
    total_price: Number(d.total_price),
    notes: d.notes,
    created_at: d.created_at,
    guest: d.guests,
    rooms: (d.booking_rooms ?? []).map((r) => ({
      room_id: r.room_id,
      price_per_night: r.price_per_night != null ? Number(r.price_per_night) : null,
      name: r.rooms?.name ?? "Room",
      thumbnail_url: r.rooms?.thumbnail_url ?? null,
    })),
  };
}

/**
 * Search for a booking by booking ID (UUID or short LV- ref) OR
 * by guest first + last name. Returns the first match, most recent first.
 */
export async function findBookingByGuest(
  nameOrId: string,
  extra: { firstName?: string; lastName?: string; phone?: string } = {},
): Promise<{ ref: string; bookingId: string } | null> {
  const raw = (nameOrId ?? "").trim();
  const firstName = (extra.firstName ?? "").trim();
  const lastName = (extra.lastName ?? "").trim();
  const digits = (extra.phone ?? "").replace(/\D+/g, "");

  // 1) Direct booking-id lookup (full UUID)
  if (/^[0-9a-f-]{36}$/i.test(raw)) {
    const b = await fetchBookingById(raw);
    if (b) return { ref: raw, bookingId: raw };
  }
  // 2) Short LV- ref stored client-side
  if (/^lv-/i.test(raw)) {
    const mapped = resolveRef(raw.toUpperCase());
    if (mapped) return { ref: raw.toUpperCase(), bookingId: mapped };
  }

  // 3) Guest name search
  const nameQuery = [firstName, lastName].filter(Boolean).join(" ").trim() || raw;
  if (!nameQuery && !digits) return null;

  let query = supabase.from("guests").select("id,name,phone").limit(100);
  if (nameQuery) {
    // Match either "First Last" or partial tokens
    const parts = nameQuery.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      // Require every token to appear (name contains each part)
      for (const p of parts) query = query.ilike("name", `%${p}%`);
    } else {
      query = query.ilike("name", `%${parts[0]}%`);
    }
  }
  const { data: guests } = await query;

  // When searching by name, phone digits are required — never skip phone filtering.
  const isNameSearch = !!(firstName || lastName);
  if (isNameSearch && !digits) return null;

  const candidates = (guests ?? []).filter((g: { phone: string }) => {
    if (!digits) return true;
    return (g.phone ?? "").replace(/\D+/g, "").endsWith(digits.slice(-9));
  });
  if (candidates.length === 0) return null;

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id,created_at,guest_id")
    .in(
      "guest_id",
      candidates.map((g: { id: string }) => g.id),
    )
    .order("created_at", { ascending: false })
    .limit(1);
  const row = (bookings ?? [])[0] as { id: string } | undefined;
  if (!row) return null;
  return { ref: row.id, bookingId: row.id };
}

/** Stores ref↔bookingId mapping so the confirmation route can look up by short ref. */
const REF_KEY = "lavista.bookingRefs";
type RefMap = Record<string, string>;

export function generateRef(): string {
  return "LV-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function storeRef(ref: string, bookingId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(REF_KEY);
    const map: RefMap = raw ? JSON.parse(raw) : {};
    map[ref] = bookingId;
    window.localStorage.setItem(REF_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function resolveRef(ref: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REF_KEY);
    if (!raw) return null;
    const map: RefMap = JSON.parse(raw);
    return map[ref] ?? null;
  } catch {
    return null;
  }
}

// ---------- Content (experiences / faq / reviews / about) ----------

export type DbExperience = {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  thumbnail_url: string | null;
  meeting_point: string | null;
  pickup_info: string | null;
  is_active: boolean;
};

export type UiExperience = {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  long: string;
  tag: string;
  duration: string;
  meeting: string;
  dates: string;
  img: string;
  gallery: string[];
};

function expSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchExperienceGallery(id: string): Promise<string[]> {
  const { data } = await supabase
    .from("experience_images")
    .select("image_url,sort_order")
    .eq("experience_id", id)
    .order("sort_order", { ascending: true, nullsFirst: false });
  return ((data ?? []) as Array<{ image_url: string }>)
    .map((r) => publicUrl("experience-images", r.image_url))
    .filter((u): u is string => !!u);
}

export async function fetchExperiences(): Promise<UiExperience[]> {
  const { data, error } = await supabase
    .from("experiences")
    .select("id,title,description,duration,thumbnail_url,meeting_point,pickup_info,is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as DbExperience[];
  const galleries = await Promise.all(
    rows.map((r) => fetchExperienceGallery(r.id).catch(() => [])),
  );
  return rows.map((e, i) => {
    const img = publicUrl("experience-images", e.thumbnail_url) ?? galleries[i][0] ?? "";
    const gallery = galleries[i].length > 0 ? galleries[i] : img ? [img] : [];
    return {
      id: e.id,
      slug: expSlug(e.title),
      title: e.title,
      blurb: e.description ?? "",
      long: e.description ?? "",
      tag: e.duration ?? "Experience",
      duration: e.duration ?? "",
      meeting: [e.meeting_point, e.pickup_info].filter(Boolean).join(" · "),
      dates: "",
      img,
      gallery,
    };
  });
}

export type DbFaq = { id: string; question: string; answer: string; sort_order: number | null };

export async function fetchFaq() {
  const { data, error } = await supabase
    .from("faq")
    .select("id,question,answer,sort_order")
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return ((data ?? []) as DbFaq[]).map((f) => ({ q: f.question, a: f.answer }));
}

export type DbReview = {
  id: string;
  guest_name: string;
  rating: number;
  review_text: string;
  image_url: string | null;
  created_at: string;
};

export async function fetchReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("id,guest_name,rating,review_text,image_url,created_at")
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) throw error;
  return ((data ?? []) as DbReview[]).map((r) => ({
    name: r.guest_name,
    text: r.review_text,
    rating: r.rating ?? 5,
    avatar: publicUrl("review-images", r.image_url) ?? "",
    from: "",
  }));
}

export async function fetchWebsiteContent(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("website_content").select("key,value");
  if (error) return {};
  const map: Record<string, string> = {};
  for (const row of (data ?? []) as Array<{ key: string; value: string }>) {
    map[row.key] = row.value;
  }
  return map;
}

export async function fetchAboutImages(): Promise<string[]> {
  const { data, error } = await supabase
    .from("about_images")
    .select("image_url,sort_order")
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) return [];
  return ((data ?? []) as Array<{ image_url: string }>)
    .map((r) => publicUrl("about-images", r.image_url))
    .filter((u): u is string => !!u);
}
