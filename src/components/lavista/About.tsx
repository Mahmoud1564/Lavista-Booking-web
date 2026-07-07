import { motion } from "framer-motion";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import lounge from "@/assets/gallery-lounge.jpg";
import { useAboutImages, useWebsiteContent } from "@/lib/use-content";
import { supabase } from "@/integrations/supabase/client";
import { publicUrl } from "@/lib/storage";

type AboutData = {
  title?: string;
  body?: string;
  image_url?: string;
};

export function About() {
  const queryClient = useQueryClient();
  const { data: content } = useWebsiteContent();
  const { data: images } = useAboutImages();

  // Invalidate About-related queries in real time so admin edits appear immediately.
  useEffect(() => {
    const channel = supabase
      .channel("about-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "website_content" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["website_content"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "about_images" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["about_images"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // The DB stores about content as a nested object under the "about" key.
  const aboutData = content?.about as unknown as AboutData | undefined;

  const eyebrow = content?.about_eyebrow ?? "About Lavista";
  const title =
    aboutData?.title ??
    "A warm corner of Giza, ten minutes from the pyramids.";
  const highlight = content?.about_highlight ?? "";

  // Body may contain multiple paragraphs separated by blank lines.
  const bodyText =
    aboutData?.body ??
    "Lavista was built for people who care about the feeling of a place. Soft beds, kind staff, a rooftop that catches the sunset, and a common room where travelers from everywhere end up trading stories over mint tea.\n\nAffordable. Comfortable. Quietly beautiful. Modern Egyptian hospitality without the gold-plated pretense.";
  const paragraphs = bodyText.split(/\n\n+/).filter(Boolean);
  const p1 = paragraphs[0] ?? "";
  const p2 = paragraphs[1] ?? "";

  // Image priority: about_images table rows → website_content.about.image_url → local fallback.
  // The about image file is stored in the "review-images" bucket (about-images bucket does not exist).
  const resolvedContentImg = publicUrl("review-images", aboutData?.image_url);
  const heroImg =
    (images && images.length > 0 ? images[0] : null) ??
    resolvedContentImg ??
    lounge;

  return (
    <section id="about" className="mx-auto grid max-w-7xl gap-12 px-6 py-28 md:grid-cols-2 md:items-center">
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-3xl"
      >
        <img src={heroImg} alt="Lavista lounge" loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-ink/40 to-transparent" />
      </motion.div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
        <h2 className="mt-3 font-display text-4xl text-sand-soft md:text-5xl">{title}</h2>
        {highlight && (
          <p className="mt-4 font-display text-lg italic text-gold-soft">{highlight}</p>
        )}
        <p className="mt-6 text-muted-foreground">{p1}</p>
        {p2 && <p className="mt-4 text-muted-foreground">{p2}</p>}

        <div className="mt-8 grid grid-cols-3 gap-6">
          {[
            { k: "4.9", v: "Guest rating" },
            { k: "10 min", v: "To Giza" },
            { k: "24/7", v: "Front desk" },
          ].map((s) => (
            <div key={s.v}>
              <p className="font-display text-3xl text-gold">{s.k}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
