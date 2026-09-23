import { MetadataRoute } from "next";
import { locales } from "@/lib/localization";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://arabickidsacademy.com";

  const publicRoutes = [
    "",
    "/how-it-works",
    "/pricing",
    "/about",
    "/contact",
    "/faq",
    "/for-parents",
    "/teach",
    "/inquiry",
    "/child-safety",
    "/programs",
    "/schools",
    "/login",
    "/register",
    "/privacy",
    "/terms",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  for (const route of publicRoutes) {
    for (const locale of locales) {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1.0 : route === "/pricing" || route === "/programs" ? 0.9 : 0.7,
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
