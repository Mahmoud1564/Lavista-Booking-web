import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToHero = () => scrollToSection("hero");

  const handleLogo = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      scrollToHero();
    } else {
      navigate({ to: "/" }).then(() => {
        setTimeout(scrollToHero, 80);
      });
    }
  };

  const handleNavLink = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    if (location.pathname === "/") {
      scrollToSection(sectionId);
    } else {
      navigate({ to: "/" }).then(() => {
        setTimeout(() => scrollToSection(sectionId), 80);
      });
    }
  };

  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-gold/10 bg-ink/75 backdrop-blur-md shadow-[0_4px_24px_-12px_rgba(0,0,0,0.6)]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:py-4 lg:py-5">
        <a
          href="/"
          onClick={handleLogo}
          className="relative z-10 font-display text-xl tracking-tight text-sand-soft"
          aria-label="Lavista — back to top"
        >
          Lavista<span className="text-gold">.</span>
        </a>
        <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 items-center justify-center md:flex">
          <div className="pointer-events-auto flex items-center gap-6 text-xs text-sand-soft/80 lg:gap-8 lg:text-sm">
            <a href="/#stay" onClick={(e) => handleNavLink(e, "stay")} className="transition hover:text-gold">Stay</a>
            <a href="/#experiences" onClick={(e) => handleNavLink(e, "experiences")} className="transition hover:text-gold">Experiences</a>
            <a href="/#about" onClick={(e) => handleNavLink(e, "about")} className="transition hover:text-gold">About</a>
            <a href="/#location" onClick={(e) => handleNavLink(e, "location")} className="transition hover:text-gold">Location</a>
            <a href="/#faq" onClick={(e) => handleNavLink(e, "faq")} className="transition hover:text-gold">FAQ</a>
            <a href="/#contact" onClick={(e) => handleNavLink(e, "contact")} className="transition hover:text-gold">Contact</a>
          </div>
        </div>
        <Link
          to="/manage-booking"
          className="relative z-10 inline-flex items-center rounded-full border border-gold/40 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-gold transition hover:bg-gold/10 sm:px-3 sm:py-1.5 sm:text-[10px] md:px-2 md:py-1 md:text-[9px] lg:px-4 lg:py-2 lg:text-[11px] lg:tracking-[0.22em]"
        >
          Manage booking
        </Link>
      </div>
    </nav>
  );
}