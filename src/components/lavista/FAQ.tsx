import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useFaqContent } from "@/lib/use-content";


const FAQS = [
  {
    q: "How far is Lavista from the Pyramids of Giza?",
    a: "Lavista is a 7–10 minute walk from the entrance of the Giza Plateau, with a clear view of the pyramids from our rooftop.",
  },
  {
    q: "Do you offer airport pickup from Cairo International Airport?",
    a: "Yes — we arrange private, fixed-price transfers (about 45–60 minutes). Message us on WhatsApp with your flight details and we'll handle the rest.",
  },
  {
    q: "What is the check-in and check-out time?",
    a: "Check-in from 2:00 PM, check-out by 11:00 AM. Early check-in and late check-out are usually possible — just ask.",
  },
  {
    q: "Is breakfast included?",
    a: "Breakfast is included with Cozy Double and Pyramid View Suite bookings, and available à la carte for Twin Shared guests on the rooftop.",
  },
  {
    q: "Can you arrange tours and experiences?",
    a: "Yes — pyramid tours, Nile cruises, desert safaris, and food walks are all bookable through reception or our WhatsApp.",
  },
  {
    q: "Do you accept walk-ins?",
    a: "When we have availability, yes. During high season (October–April) we strongly recommend booking ahead.",
  },
  {
    q: "Is the area around Lavista safe for solo travelers and couples?",
    a: "Absolutely. Nazlet El-Semman is a friendly, well-lit neighborhood with locals you'll recognize within a day. We also offer 24/7 reception.",
  },
];

export function FAQ() {
  const { data: dbFaqs } = useFaqContent();
  const items = dbFaqs && dbFaqs.length > 0 ? dbFaqs : FAQS;

  return (
    <section id="faq" className="relative mx-auto max-w-4xl px-6 py-24 md:py-32">
      <div className="mb-12 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">FAQ</p>
        <h2 className="mt-3 font-display text-4xl text-sand-soft md:text-5xl">
          Good questions, honest answers
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
          Everything travelers ask before they book — about the stay, the pyramids, and getting around Giza.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {items.map((f, i) => (

          <AccordionItem key={i} value={`item-${i}`} className="border-gold/15">
            <AccordionTrigger className="text-left font-display text-lg text-sand-soft hover:text-gold hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-sand-soft/80">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* FAQ structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </section>
  );
}