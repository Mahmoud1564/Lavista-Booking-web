import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { BookingProvider } from "@/components/lavista/booking-context";
import { Hero } from "@/components/lavista/Hero";
import { Navbar } from "@/components/lavista/Navbar";
import { Rooms } from "@/components/lavista/Rooms";
import { Experiences } from "@/components/lavista/Experiences";
import { AirportPickup } from "@/components/lavista/AirportPickup";
import { About } from "@/components/lavista/About";
import { Testimonials } from "@/components/lavista/Testimonials";
import { FAQ } from "@/components/lavista/FAQ";
import { Footer } from "@/components/lavista/Footer";
import { Location } from "@/components/lavista/Location";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lavista — Warm modern stay near the Pyramids of Giza" },
      { name: "description", content: "A stylish, affordable hostel & hotel a short walk from the pyramids. Cozy rooms, rooftop sunsets, local experiences and modern Egyptian hospitality." },
      { property: "og:title", content: "Lavista — Warm modern stay near the Pyramids" },
      { property: "og:description", content: "Cozy rooms, rooftop sunsets, and local experiences a short walk from the Pyramids of Giza." },
      { property: "og:url", content: "https://lavista-pyramids.lovable.app/" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { name: "keywords", content: "Lavista, hotel near Giza pyramids, hostel Giza, hotel Pyramids of Giza, Egypt boutique hotel, affordable stay Giza, where to stay near the pyramids" },
      { name: "robots", content: "index,follow,max-image-preview:large" },
      { name: "geo.region", content: "EG-GZ" },
      { name: "geo.placename", content: "Giza" },
      { name: "geo.position", content: "29.9773;31.1325" },
      { name: "ICBM", content: "29.9773, 31.1325" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Lavista — Warm modern stay near the Pyramids" },
      { name: "twitter:description", content: "Cozy rooms, rooftop sunsets, and local experiences a short walk from the Pyramids of Giza." },
    ],
    links: [
      { rel: "canonical", href: "https://lavista-pyramids.lovable.app/" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["Hotel", "LodgingBusiness"],
          "@id": "https://lavista-pyramids.lovable.app/#hotel",
          name: "Lavista",
          description: "Warm, modern hostel and boutique hotel a short walk from the Pyramids of Giza.",
          url: "https://lavista-pyramids.lovable.app/",
          image: "https://lavista-pyramids.lovable.app/og-cover.jpg",
          telephone: "+20-100-769-5392",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Nazlet El-Semman",
            addressLocality: "Giza",
            addressRegion: "Giza Governorate",
            postalCode: "12511",
            addressCountry: "EG",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: 29.9773,
            longitude: 31.1325,
          },
          areaServed: { "@type": "Place", name: "Giza, Egypt" },
          nearbyAttractions: [
            { "@type": "TouristAttraction", name: "Great Pyramid of Giza" },
            { "@type": "TouristAttraction", name: "Great Sphinx of Giza" },
          ],
          amenityFeature: [
            { "@type": "LocationFeatureSpecification", name: "Free Wi-Fi", value: true },
            { "@type": "LocationFeatureSpecification", name: "Rooftop terrace", value: true },
            { "@type": "LocationFeatureSpecification", name: "Air conditioning", value: true },
            { "@type": "LocationFeatureSpecification", name: "Airport shuttle", value: true },
          ],
          checkinTime: "14:00",
          checkoutTime: "11:00",
          starRating: { "@type": "Rating", ratingValue: "4" },
          email: "hello@lavista.stay",
          priceRange: "$$",
          currenciesAccepted: "USD, EGP",
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [searchTrigger, setSearchTrigger] = useState(0);
  const roomsRef = useRef<HTMLDivElement>(null);

  const onSearch = () => {
    setSearchTrigger((n) => n + 1);
    setTimeout(() => {
      roomsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <BookingProvider>
      <main className="min-h-screen bg-background text-foreground">
        <Navbar />
        <Hero onSearch={onSearch} />
        <div ref={roomsRef}>
          <Rooms trigger={searchTrigger} />
        </div>
        <Experiences />
        <AirportPickup />
        <About />
        <Testimonials />
        <Location />
        <FAQ />
        <Footer />
      </main>
    </BookingProvider>
  );
}
