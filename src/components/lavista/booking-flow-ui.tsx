import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function StepCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-gold/15 bg-card/60 p-4 md:p-8">
      <h2 className="font-display text-2xl text-sand-soft">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function StepNav({
  back,
  next,
  nextLabel = "Continue",
  disabled,
  onNext,
  nextAsLink = true,
}: {
  back?: string;
  next?: string;
  nextLabel?: string;
  disabled?: boolean;
  onNext?: () => void;
  nextAsLink?: boolean;
}) {
  return (
    <div className="mt-4 flex justify-between md:mt-8">
      {back ? (
        <Link
          to={back}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-gold/30 px-4 py-2.5 text-xs uppercase tracking-[0.22em] text-sand-soft transition hover:bg-gold/10 md:gap-2 md:px-5 md:py-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
      ) : (
        <span />
      )}
      {next && nextAsLink ? (
        <Link
          to={next}
          onClick={(e) => {
            if (disabled) e.preventDefault();
            else onNext?.();
          }}
          aria-disabled={disabled}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gold px-4 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-ink transition hover:bg-gold-soft md:gap-2 md:px-6 md:py-3 md:text-sm ${disabled ? "pointer-events-none opacity-50" : ""}`}
        >
          {nextLabel} <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </Link>
      ) : (
        <button
          onClick={onNext}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gold px-4 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-ink transition hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-50 md:gap-2 md:px-6 md:py-3 md:text-sm"
        >
          {nextLabel} <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </button>
      )}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="text-[10px] uppercase tracking-[0.22em] text-gold">{children}</label>;
}

export function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <FieldLabel>{label}{required && " *"}</FieldLabel>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-gold/20 bg-ink/30 p-3 text-sm text-sand-soft outline-none focus:border-gold"
      />
    </div>
  );
}
