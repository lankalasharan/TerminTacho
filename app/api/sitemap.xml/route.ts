import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const baseUrl = "https://termintacho.com";
    
    // Static pages
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

    // Get all unique cities for dynamic routes
    const offices = await prisma.office.findMany({
      select: { city: true },
      distinct: ["city"],
    });

    const dynamicCityPages = offices.map(
      (office) => `/offices/${encodeURIComponent(office.city)}`
    );

    // Combine all URLs
    const allUrls = [...staticPages, ...dynamicCityPages];

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
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

    return new NextResponse(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate sitemap" },
      { status: 500 }
    );
  }
}
