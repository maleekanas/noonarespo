import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kidsarabicacademy.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*/admin/",
        "/*/api/",
        "/*/student/",
        "/*/teacher/",
        "/*/parent/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
