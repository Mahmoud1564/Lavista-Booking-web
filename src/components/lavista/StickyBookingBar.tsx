import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { BookingBar } from "./BookingBar";

export function StickyBookingBar({ onSearch }: { onSearch: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!show}
      className={cn(
        "fixed inset-x-0 top-[68px] z-40 w-full border-b border-gold/10 bg-ink/85 px-4 py-3 backdrop-blur-md transition-all duration-500 md:top-[80px] md:py-4",
        show
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-3 opacity-0",
      )}
    >
      <div className="mx-auto w-full max-w-7xl">
        <BookingBar onSearch={onSearch} />
      </div>
    </div>
  );
}