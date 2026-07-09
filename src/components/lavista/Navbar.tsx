import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { id: "stay", label: "Stay" },
  { id: "experiences", label: "Experiences" },
  { id: "about", label: "About" },
  { id: "location", label: "Location" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route change and lock body scroll while open.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToHero = () => scrollToSection("hero");

  const handleLogo = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
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
    setMenuOpen(false);
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
        scrolled || menuOpen
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
            <a
              href="/#stay"
              onClick={(e) => handleNavLink(e, "stay")}
              className="transition hover:text-gold"
            >
              Stay
            </a>
            <a
              href="/#experiences"
              onClick={(e) => handleNavLink(e, "experiences")}
              className="transition hover:text-gold"
            >
              Experiences
            </a>
            <a
              href="/#about"
              onClick={(e) => handleNavLink(e, "about")}
              className="transition hover:text-gold"
            >
              About
            </a>
            <a
              href="/#location"
              onClick={(e) => handleNavLink(e, "location")}
              className="transition hover:text-gold"
            >
              Location
            </a>
            <a
              href="/#faq"
              onClick={(e) => handleNavLink(e, "faq")}
              className="transition hover:text-gold"
            >
              FAQ
            </a>
            <a
              href="/#contact"
              onClick={(e) => handleNavLink(e, "contact")}
              className="transition hover:text-gold"
            >
              Contact
            </a>
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <Link
            to="/manage-booking"
            className="inline-flex items-center rounded-full border border-gold/40 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.2em] text-gold transition hover:bg-gold/10 sm:px-3 sm:py-1.5 sm:text-[10px] md:px-2 md:py-1 md:text-[9px] lg:px-4 lg:py-2 lg:text-[11px] lg:tracking-[0.22em]"
          >
            Manage booking
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="-mr-1 flex h-11 w-11 shrink-0 items-center justify-center text-sand-soft transition hover:text-gold md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel — unmounted while closed so its links can never
          receive keyboard focus or be reachable by assistive tech. */}
      {menuOpen && (
        <div
          id="mobile-nav-menu"
          className="overflow-hidden border-t border-gold/10 bg-ink/95 backdrop-blur-md md:hidden"
        >
          <div className="flex flex-col px-6 py-2 text-sm text-sand-soft/90">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`/#${link.id}`}
                onClick={(e) => handleNavLink(e, link.id)}
                className="flex min-h-12 items-center border-b border-gold/10 last:border-b-0 transition hover:text-gold"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
