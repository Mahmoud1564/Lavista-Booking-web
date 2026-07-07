import { Instagram, MessageCircle, Mail, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-gold/10 bg-ink">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,165,80,0.08),transparent_60%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl text-sand-soft">Lavista<span className="text-gold">.</span></p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            A warm modern stay a short walk from the pyramids. Built for
            travelers who care about the feeling of a place.
          </p>
          <a href="https://wa.me/201007695392" target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-gold-soft">
            <MessageCircle className="h-4 w-4" /> Contact
          </a>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Visit</p>
          <ul className="mt-4 space-y-2 text-sm text-sand-soft/80">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 text-gold" /> Nazlet El-Semman, Giza, Egypt</li>
            <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-gold" /> hello@lavista.stay</li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-sand-soft/80">
            <li><a href="#stay" className="transition hover:text-gold">Stay</a></li>
            <li><a href="#experiences" className="transition hover:text-gold">Experiences</a></li>
            <li><a href="#about" className="transition hover:text-gold">About</a></li>
            <li><a href="#location" className="transition hover:text-gold">Location</a></li>
            <li><a href="#faq" className="transition hover:text-gold">FAQ</a></li>
            
            <li><Link to="/manage-booking" className="transition hover:text-gold">Manage booking</Link></li>
            <li><a href="https://instagram.com" className="inline-flex items-center gap-1.5 transition hover:text-gold"><Instagram className="h-3.5 w-3.5" /> Instagram</a></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-gold/10 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Lavista · Made warmly in Giza, Egypt
      </div>
    </footer>
  );
}
