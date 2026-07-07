import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

import { EXPERIENCES } from "@/data/experiences";
import { fetchRooms } from "@/lib/booking-api";

const BASE_URL = "https://lavista-pyramids.lovable.app";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const rooms = await fetchRooms().catch(() => []);
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/booking", changefreq: "monthly", priority: "0.9" },
          { path: "/manage-booking", changefreq: "yearly", priority: "0.5" },
          ...rooms.map((r) => ({
            path: `/rooms/${r.id}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          ...EXPERIENCES.map((e) => ({
            path: `/experiences/${e.slug}`,
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
