import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { BedDouble, Compass, Info, MapPin, HelpCircle, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { id: "stay", label: "Stay", icon: BedDouble },
  { id: "experiences", label: "Experiences", icon: Compass },
  { id: "about", label: "About", icon: Info },
  { id: "location", label: "Location", icon: MapPin },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "contact", label: "Contact", icon: MessageCircle },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track which section is currently in view so the mobile bottom nav can
  // highlight the matching link, similar to a native app's active tab.
  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection(null);
      return;
    }
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => !!el,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

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
    setActiveSection(sectionId);
    if (location.pathname === "/") {
      scrollToSection(sectionId);
    } else {
      navigate({ to: "/" }).then(() => {
        setTimeout(() => scrollToSection(sectionId), 80);
      });
    }
  };

  return (
    <>
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
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation — replaces the old hamburger/overlay menu
          with an always-visible, native-app-style tab bar so every section
          stays one tap away without hiding links behind an extra toggle. */}
      <nav
        aria-label="Section navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/10 bg-ink/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch justify-between overflow-x-auto px-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={`/#${link.id}`}
                onClick={(e) => handleNavLink(e, link.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex min-w-14 flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-gold" : "text-sand-soft/60 hover:text-sand-soft",
                )}
              >
                <Icon className={cn("h-5 w-5", isActive && "fill-gold/15")} />
                <span className="tracking-tight">{link.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
