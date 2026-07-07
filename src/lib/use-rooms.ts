import { useQuery } from "@tanstack/react-query";
import { fetchRoom, fetchRooms, fetchUnavailableRoomIds } from "./booking-api";
import { toDateKey } from "./utils";

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
    staleTime: 60_000,
  });
}

export function useRoom(id: string | undefined) {
  return useQuery({
    queryKey: ["room", id],
    queryFn: () => fetchRoom(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useUnavailableRooms(checkIn?: Date, checkOut?: Date) {
  return useQuery({
    queryKey: [
      "unavailable",
      checkIn ? toDateKey(checkIn) : undefined,
      checkOut ? toDateKey(checkOut) : undefined,
    ],
    queryFn: () => fetchUnavailableRoomIds(checkIn!, checkOut!),
    enabled: !!checkIn && !!checkOut,
    // No stale time — availability must always be fresh.
    staleTime: 0,
    // Never serve a cached result as the initial data; always fetch.
    gcTime: 0,
  });
}
