import { Check } from "lucide-react";

export function AmenitiesList({ items }: { items: string[] }) {
  return (
    <div>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-3 min-[360px]:gap-x-4 max-[320px]:grid-cols-1">
        {items.map((a) => (
          <li
            key={a}
            className="flex min-w-0 items-start gap-2 text-sm leading-snug text-sand-soft/85"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <span className="min-w-0 break-words">{a}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
