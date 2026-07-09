import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { supabase as _typedSupabase } from "@/integrations/supabase/client";

// The generated Database type has an empty schema, so the typed client
// cannot express untyped tables like `page_views`. Same convention as
// booking-api.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = _typedSupabase;

const SESSION_KEY = "lavista_session_id";

function getSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // localStorage unavailable (private browsing edge cases) — use a per-load id
    return crypto.randomUUID();
  }
}

/** Tracks a page view in Supabase on every public route navigation. */
export function usePageView() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Skip admin paths (future-proof)
    if (pathname.startsWith("/admin")) return;

    const session_id = getSessionId();

    supabase
      .from("page_views")
      .insert({
        path: pathname,
        session_id,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      })
      .then(({ error }: { error: { message: string } | null }) => {
        if (error) console.warn("[page_view] insert failed", error.message);
      });
  }, [pathname]);
}
