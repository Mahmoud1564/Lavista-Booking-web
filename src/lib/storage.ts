import { supabase } from "@/integrations/supabase/client";

export type StorageBucket =
  | "room-images"
  | "experience-images"
  | "review-images"
  | "branding"
  | "about-images";

/** Resolve a stored image reference to a public URL.
 *  Accepts either a full http(s) URL or a filename inside the given bucket. */
export function publicUrl(
  bucket: StorageBucket,
  ref: string | null | undefined,
): string | null {
  if (!ref) return null;
  if (/^https?:\/\//i.test(ref)) return ref;
  const { data } = supabase.storage.from(bucket).getPublicUrl(ref);
  return data?.publicUrl ?? null;
}
