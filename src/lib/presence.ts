import { supabase as _typedSupabase } from "@/integrations/supabase/client";

// The generated Database type has an empty schema, so the typed client
// cannot express untyped tables like `online_visitors`. Same convention
// as booking-api.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase: any = _typedSupabase;

const KEY = "visitor_session_id";

export function startPresenceTracking() {
  let sid = localStorage.getItem(KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(KEY, sid);
  }

  const beat = () =>
    supabase.from("online_visitors").upsert(
      {
        session_id: sid,
        current_path: window.location.pathname,
        user_agent: navigator.userAgent,
        last_seen: new Date().toISOString(),
      },
      { onConflict: "session_id" },
    );

  beat();

  const id = setInterval(beat, 25000);

  const onVis = () =>
    document.visibilityState === "visible" && beat();

  document.addEventListener("visibilitychange", onVis);

  return () => {
    clearInterval(id);
    document.removeEventListener("visibilitychange", onVis);
  };
}
