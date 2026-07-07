import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { COUNTRIES, type Country } from "@/data/countries";

export const flagEmoji = (code: string) =>
  code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

type Props = {
  country: string; // ISO code, e.g. "EG"
  onCountryChange: (code: string) => void;
  phone: string; // national number only
  onPhoneChange: (v: string) => void;
  label?: string;
  required?: boolean;
};

export function CountryPhoneInput({
  country,
  onCountryChange,
  phone,
  onPhoneChange,
  label = "Phone",
  required,
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const current: Country =
    COUNTRIES.find((c) => c.code === country) ?? COUNTRIES.find((c) => c.code === "EG")!;

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(s) || c.dial.includes(s) || c.code.toLowerCase().includes(s),
    );
  }, [q]);

  return (
    <div>
      <label className="text-[10px] uppercase tracking-[0.22em] text-gold">
        {label}
        {required && " *"}
      </label>
      <div className="mt-2 flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-gold/20 bg-ink/30 px-3 py-3 text-sm text-sand-soft transition hover:border-gold/40"
              aria-label="Select country"
            >
              <span className="text-base leading-none">{flagEmoji(current.code)}</span>
              <span className="tabular-nums">{current.dial}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 border-gold/20 bg-card p-0">
            <div className="flex items-center gap-2 border-b border-gold/10 px-3 py-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search country or code"
                className="w-full bg-transparent text-sm text-sand-soft outline-none placeholder:text-muted-foreground"
              />
            </div>
            <ul className="max-h-72 overflow-auto py-1">
              {filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onCountryChange(c.code);
                      setOpen(false);
                      setQ("");
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-sand-soft transition hover:bg-gold/10"
                  >
                    <span className="text-base leading-none">{flagEmoji(c.code)}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{c.dial}</span>
                    {c.code === current.code && <Check className="h-3.5 w-3.5 text-gold" />}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-4 text-center text-xs text-muted-foreground">No matches</li>
              )}
            </ul>
          </PopoverContent>
        </Popover>
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value.replace(/[^\d\s-]/g, ""))}
          placeholder="100 123 4567"
          className="w-full rounded-xl border border-gold/20 bg-ink/30 p-3 text-sm text-sand-soft outline-none focus:border-gold"
        />
      </div>
    </div>
  );
}
