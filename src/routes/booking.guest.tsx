import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useBookingFlow } from "@/lib/booking-flow";
import { StepCard, StepNav, TextInput } from "@/components/lavista/booking-flow-ui";
import { CountryPhoneInput } from "@/components/lavista/CountryPhoneInput";
import { COUNTRIES } from "@/data/countries";

export const Route = createFileRoute("/booking/guest")({
  head: () => ({
    meta: [{ title: "Guest details — Lavista" }, { name: "robots", content: "noindex,follow" }],
  }),
  component: GuestStep,
});

function parsePhone(full: string): { country: string; national: string } {
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (full.startsWith(c.dial)) {
      return { country: c.code, national: full.slice(c.dial.length).trim() };
    }
  }
  return { country: "EG", national: full.replace(/^\+/, "") };
}

function GuestStep() {
  const { draft, setGuest } = useBookingFlow();
  const g = draft.guest;
  const initial = parsePhone(g.phone);
  const [country, setCountry] = useState(initial.country);
  const [national, setNational] = useState(initial.national);

  const updatePhone = (code: string, num: string) => {
    setCountry(code);
    setNational(num);
    const dial = COUNTRIES.find((c) => c.code === code)?.dial ?? "";
    setGuest({ phone: num.trim() ? `${dial} ${num.trim()}` : "" });
  };

  const emailOk = g.email.trim() === "" || /.+@.+\..+/.test(g.email);
  const valid =
    g.firstName.trim() && g.lastName.trim() && emailOk && national.replace(/\D/g, "").length >= 6;
  return (
    <div>
      <StepCard title="Guest details" subtitle="Who should we have the room ready for?">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="First name"
            value={g.firstName}
            onChange={(v) => setGuest({ firstName: v })}
            required
          />
          <TextInput
            label="Last name"
            value={g.lastName}
            onChange={(v) => setGuest({ lastName: v })}
            required
          />
          <TextInput
            label="Email (optional)"
            type="email"
            value={g.email}
            onChange={(v) => setGuest({ email: v })}
          />
          <CountryPhoneInput
            label="Phone (WhatsApp)"
            required
            country={country}
            phone={national}
            onCountryChange={(c) => updatePhone(c, national)}
            onPhoneChange={(p) => updatePhone(country, p)}
          />
        </div>
      </StepCard>
      <StepNav next="/booking/rooms" disabled={!valid} />
    </div>
  );
}
