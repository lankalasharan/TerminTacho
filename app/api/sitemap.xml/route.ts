import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://termintacho.de";
  const staticPages = [
    "",
    "/timelines",
    "/submit",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
    "/faq",
    "/imprint",
  ];

  const buildSitemapXml = (urls: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${url === "" ? "weekly" : "daily"}</changefreq>
    <priority>${url === "" ? "1.0" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  try {
    // Get all unique cities for dynamic routes
    const offices = await prisma.office.findMany({
      select: { city: true },
      distinct: ["city"],
    });

    const dynamicCityPages = offices.map(
      (office: (typeof offices)[number]) => `/offices/${encodeURIComponent(office.city)}`
    );

    // Combine all URLs
    const allUrls = [...staticPages, ...dynamicCityPages];

    const sitemap = buildSitemapXml(allUrls);

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    // Fallback to static pages so deployment and crawlers still get valid XML.
    const fallbackSitemap = buildSitemapXml(staticPages);
    return new NextResponse(fallbackSitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate",
      },
    });
  }
}
