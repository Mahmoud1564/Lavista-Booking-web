// Room type used across the UI. Data now comes from Supabase via
// src/lib/use-rooms.ts and src/lib/booking-api.ts.
export type Room = {
  id: string;
  slug: string;
  type: string;
  img: string;
  gallery: string[];
  capacity: number;
  beds?: number;
  price: number;
  desc: string;
  long: string;
  features: string[];
  amenities: string[];
  availability: string;
};
