import { MetadataRoute } from "next";
import { locales } from "@/lib/localization";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.arabickidsacademy.com";

  const publicRoutes = ["", "/login", "/privacy", "/terms"];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const route of publicRoutes) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "monthly",
        priority: route === "" ? 1.0 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [loc, `${baseUrl}/${loc}${route}`])
          ),
        },
      });
    }
  }

  return sitemapEntries;
}
