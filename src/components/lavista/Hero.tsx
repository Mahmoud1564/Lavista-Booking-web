import { useEffect } from "react";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-pyramids.jpg";
import { BookingBar } from "./BookingBar";
import { Car, Plane, Wallet, CalendarCheck, Coffee } from "lucide-react";
import { differenceInCalendarDays } from "date-fns";
import { useBooking } from "./booking-context";
import { useWebsiteContent } from "@/lib/use-content";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type HeroData = { title?: string; subtitle?: string };

const FALLBACK_TITLE = "Lavista";
const FALLBACK_SUBTITLE =
  "A warm, modern stay a short walk from the pyramids — built for travelers who want comfort, character, and a place to actually meet people.";

export function Hero({ onSearch }: { onSearch: () => void }) {
  const { checkIn, checkOut } = useBooking();
  const nights = checkIn && checkOut ? Math.max(0, differenceInCalendarDays(checkOut, checkIn)) : 0;

  const { data: content } = useWebsiteContent();
  const heroData = (content?.hero as HeroData | undefined) ?? {};
  const title = heroData.title || FALLBACK_TITLE;
  const subtitle = heroData.subtitle || FALLBACK_SUBTITLE;

  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("hero-content-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "website_content" }, () => {
        queryClient.invalidateQueries({ queryKey: ["website_content"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return (
    <section id="hero" className="relative min-h-[100svh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Pyramids at golden hour"
          className="h-full w-full object-cover"
          width={1920}
          height={1280}
        />
        {/* Cinematic vignette + haze */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/30 to-ink" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(20,12,4,0.55)_75%)]" />
      </div>

      {/* Cinematic title */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-6 pb-[34rem] pt-28 sm:pb-[26rem] md:pb-80 md:pt-32">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="text-xs uppercase tracking-[0.4em] text-gold-soft/80"
        >
          Giza · Egypt
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className="text-gold-glow mt-5 font-display text-[18vw] leading-[0.88] tracking-tight text-sand-soft md:text-[10rem]"
        >
          <span aria-hidden="true">{title}</span>
          <span className="sr-only">{title} — Warm modern stay near the Pyramids of Giza</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.7 }}
          className="mt-6 max-w-xl text-base text-sand-soft/85 md:text-lg"
        >
          {subtitle}
        </motion.p>
      </div>

      {/* Floating booking bar + nights count + trust row */}
      <div className="absolute inset-x-0 bottom-8 z-20 flex flex-col items-stretch gap-8 px-4 sm:gap-5 md:bottom-14 md:gap-4">
        <div
          aria-live="polite"
          className="mx-auto text-center text-[11px] uppercase tracking-[0.32em] text-gold-soft/90"
        >
          {nights > 0
            ? `${nights} night${nights > 1 ? "s" : ""} selected`
            : "Pick your dates to begin"}
        </div>
        <BookingBar onSearch={onSearch} />
        <ul className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-2 text-[11px] text-sand-soft/60 md:pt-1">
          <li className="flex items-center gap-1.5">
            <Car className="h-3.5 w-3.5 text-gold/70" aria-hidden="true" />
            Free parking
          </li>
          <li className="flex items-center gap-1.5">
            <Plane className="h-3.5 w-3.5 text-gold/70" aria-hidden="true" />
            Airport pickup available
          </li>
          <li className="flex items-center gap-1.5">
            <Wallet className="h-3.5 w-3.5 text-gold/70" aria-hidden="true" />
            No prepayment needed
          </li>
          <li className="flex items-center gap-1.5">
            <Coffee className="h-3.5 w-3.5 text-gold/70" aria-hidden="true" />
            Breakfast
          </li>
          <li className="flex items-center gap-1.5">
            <CalendarCheck className="h-3.5 w-3.5 text-gold/70" aria-hidden="true" />
            Free cancellation up to 24h before check-in
          </li>
        </ul>
      </div>
    </section>
  );
}
