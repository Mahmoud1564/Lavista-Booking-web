import { Check } from "lucide-react";

export function AmenitiesList({
  items,
}: {
  items: string[];
}) {
  return (
    <div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((a) => (
          <li
            key={a}
            className="flex items-center gap-2 text-sm text-sand-soft/85"
          >
            <Check className="h-4 w-4 shrink-0 text-gold" /> {a}
          </li>
        ))}
      </ul>
    </div>
  );
}
