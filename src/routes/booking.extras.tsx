import { createFileRoute } from "@tanstack/react-router";
import { useBookingFlow } from "@/lib/booking-flow";
import { StepCard, StepNav, FieldLabel } from "@/components/lavista/booking-flow-ui";

export const Route = createFileRoute("/booking/extras")({
  head: () => ({ meta: [{ title: "Extras — Lavista" }, { name: "robots", content: "noindex,follow" }] }),
  component: ExtrasStep,
});

const TIMES = ["Before 12:00", "12:00–15:00", "15:00–18:00", "18:00–21:00", "After 21:00", "Not sure yet"];

function ExtrasStep() {
  const { draft, setDraft } = useBookingFlow();
  return (
    <div>
      <StepCard title="Optional details" subtitle="Help us get your arrival just right. You can skip this step.">
        <div className="space-y-5">
          <div>
            <FieldLabel>Estimated arrival time</FieldLabel>
            <div className="mt-3 flex flex-wrap gap-2">
              {TIMES.map((t) => {
                const active = draft.arrivalTime === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDraft({ arrivalTime: active ? "" : t })}
                    className={`rounded-full border px-4 py-2 text-xs transition ${active ? "border-gold bg-gold/10 text-gold" : "border-gold/20 text-sand-soft/80 hover:border-gold/40"}`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <FieldLabel>Special requests</FieldLabel>
            <textarea
              rows={4}
              value={draft.specialRequests}
              onChange={(e) => setDraft({ specialRequests: e.target.value })}
              placeholder="Airport pickup, dietary preferences, early check-in…"
              className="mt-2 w-full rounded-xl border border-gold/20 bg-ink/30 p-3 text-sm text-sand-soft outline-none focus:border-gold"
            />
          </div>
        </div>
      </StepCard>
      <StepNav back="/booking/dates" next="/booking/payment" />
    </div>
  );
}
