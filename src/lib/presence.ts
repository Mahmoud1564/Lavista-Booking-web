import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "lavista_session_id";
const HEARTBEAT_INTERVAL_MS = 25_000;

function getSessionId(): string {
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

async function sendHeartbeat(session_id: string) {
  const { error } = await supabase
    .from("online_visitors")
    .upsert(
      {
        session_id,
        user_agent: navigator.userAgent,
        last_seen: new Date().toISOString(),
      },
      { onConflict: "session_id" },
    );

  if (error) console.warn("[presence] heartbeat failed", error.message);
}

let started = false;

/**
 * Starts sending presence heartbeats to the `online_visitors` table every
 * 25 seconds so the site can report how many visitors are currently online.
 * Safe to call multiple times — only the first call takes effect.
 * No-op outside the browser (SSR).
 */
export function startPresenceTracking(): void {
  if (started) return;
  if (typeof window === "undefined") return;
  started = true;

  const session_id = getSessionId();

  // Fire immediately, then on a fixed interval.
  void sendHeartbeat(session_id);
  setInterval(() => {
    void sendHeartbeat(session_id);
  }, HEARTBEAT_INTERVAL_MS);
}
