import { MapPin } from "lucide-react";

const EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1227.3390534210455!2d31.141987109667607!3d29.97978952349126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14584508df92d129%3A0x8720019934c121f!2sLa%20vista%20pyramids%20view!5e1!3m2!1sen!2seg!4v1782256490145!5m2!1sen!2seg";


export function Location() {
  return (
    <section id="location" className="relative mx-auto max-w-7xl scroll-mt-24 px-6 py-24 md:py-28">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-14">
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Location</p>
          <h2 className="mt-3 font-display text-4xl text-sand-soft md:text-5xl">
            A short walk from the pyramids
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            Tucked into the quiet streets of Nazlet El-Semman, Lavista sits within
            walking distance of the Great Pyramid and the Sphinx. Step out for
            sunrise at the plateau, return for tea on the rooftop.
          </p>

          <ul className="mt-7 space-y-3 text-sm text-sand-soft/85">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>Nazlet El-Semman, Giza, Egypt</span>
            </li>
          </ul>

        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-gold/15 via-transparent to-transparent blur-2xl" aria-hidden />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-gold/15 bg-card shadow-2xl shadow-black/40">
            <iframe
              title="Lavista — Pyramids view location"
              src={EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="block h-[360px] w-full md:h-[460px] lg:h-[520px]"
              style={{ border: 0, filter: "grayscale(0.15) contrast(1.05)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
