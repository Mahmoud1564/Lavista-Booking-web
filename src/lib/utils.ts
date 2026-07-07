import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a Date as a `YYYY-MM-DD` key using its LOCAL calendar date.
 *
 * Never use `date.toISOString().slice(0, 10)` for this — that converts to
 * UTC first, which silently shifts the date backward by one day for any
 * user in a timezone ahead of UTC (e.g. Cairo, UTC+2). That mismatch
 * between the date the user picked and the date sent to the database is
 * what causes availability/overlap checks to be off by a day.
 */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
