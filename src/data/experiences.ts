import nile from "@/assets/exp-nile.jpg";
import pyramids from "@/assets/exp-pyramids.jpg";
import desert from "@/assets/exp-desert.jpg";
import food from "@/assets/exp-food.jpg";
import rooftop from "@/assets/gallery-rooftop.jpg";
import giza from "@/assets/gallery-cairo.jpg";

export const WHATSAPP = "https://wa.me/201007695392";

export type Experience = {
  slug: string;
  img: string;
  gallery: string[];
  title: string;
  tag: string;
  blurb: string;
  price: string;
  duration: string;
  long: string;
  dates: string;
  meeting: string;
};

export const EXPERIENCES: Experience[] = [
  {
    slug: "pyramids-tour",
    img: pyramids,
    gallery: [pyramids, giza, desert],
    title: "Pyramids Tour",
    tag: "Half day",
    blurb: "Guided walk through Giza with a local Egyptologist.",
    price: "from $35",
    duration: "4 hours",
    long: "A deep, story-rich walk through the Giza plateau with a licensed Egyptologist. Skip the tourist traps — you'll see the Great Pyramid, the Sphinx, and the quieter corners most visitors miss. Small groups, lots of time for photos.",
    dates: "Daily · 8:00 AM and 2:00 PM departures",
    meeting: "Pickup directly from Lavista lobby. Entry tickets and bottled water included.",
  },
  {
    slug: "nile-sunset-cruise",
    img: nile,
    gallery: [nile, giza, rooftop],
    title: "Nile Sunset Cruise",
    tag: "Evening",
    blurb: "Felucca sail at golden hour with mint tea on board.",
    price: "from $25",
    duration: "2 hours",
    long: "A traditional felucca sailboat ride along the Nile at golden hour. Slow, quiet, mint tea on board, and the best light of the day over the river. Perfect for couples and small groups.",
    dates: "Daily · 5:00 PM (seasonal — adjusts with sunset)",
    meeting: "Private transfer from Lavista to the dock in Giza. Round-trip included.",
  },
  {
    slug: "desert-safari",
    img: desert,
    gallery: [desert, pyramids, giza],
    title: "Desert Safari",
    tag: "Full day",
    blurb: "Quad-biking, sandboarding & a Bedouin dinner under the stars.",
    price: "from $60",
    duration: "8 hours",
    long: "Quad-biking across the dunes, sandboarding down the slopes, and a Bedouin dinner under a sky full of stars. Full-day adventure with a guide who actually grew up out there.",
    dates: "Tue · Thu · Sat · 12:00 PM departure",
    meeting: "Pickup from Lavista. 4x4 transfer to the desert camp included.",
  },
  {
    slug: "rooftop-nights",
    img: rooftop,
    gallery: [rooftop, giza, nile],
    title: "Giza Rooftop Nights",
    tag: "On-site",
    blurb: "Live oud, shisha and skyline views — meet other travelers.",
    price: "free for guests",
    duration: "3–4 hours",
    long: "Our weekly rooftop session — live oud, shisha, mezze plates, and the Giza skyline as a backdrop. The easiest way to meet other travelers staying at Lavista.",
    dates: "Every Thursday & Saturday · 8:00 PM onwards",
    meeting: "On the Lavista rooftop. Just take the lift.",
  },
  {
    slug: "local-food-tour",
    img: food,
    gallery: [food, giza, rooftop],
    title: "Local Food Tour",
    tag: "Evening",
    blurb: "Koshary, ful & street sweets through Giza's local lanes.",
    price: "from $30",
    duration: "3 hours",
    long: "Eat your way through the lanes around Giza with a local host. Koshary, ful, taameya, and the sweet shops only locals know. Come hungry.",
    dates: "Mon · Wed · Fri · 6:00 PM",
    meeting: "Meet in the Lavista lobby. We walk together to the first stop.",
  },
];

export const getExperience = (slug: string) =>
  EXPERIENCES.find((e) => e.slug === slug);