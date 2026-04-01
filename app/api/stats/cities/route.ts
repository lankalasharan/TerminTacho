import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCityName } from "@/lib/cityNames";

export async function GET() {
  try {
    const reports = await prisma.report.findMany({
      where: {
        decisionAt: { 
          not: null 
        },
      },
      include: {
        office: {
          select: {
            city: true,
          },
        },
      },
    });

    // Group by city and calculate stats
    const cityMap = new Map<string, { totalDays: number; count: number }>();

    reports.forEach((report) => {
      const city = normalizeCityName(report.office.city);
      if (!city || !report.submittedAt || !report.decisionAt) return;

      const days = Math.floor(
        (new Date(report.decisionAt).getTime() - new Date(report.submittedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (days < 0) return; // Skip invalid data

      const existing = cityMap.get(city) || { totalDays: 0, count: 0 };
      cityMap.set(city, {
        totalDays: existing.totalDays + days,
        count: existing.count + 1,
      });
    });

    // City coordinates (Germany major cities)
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      Berlin: { lat: 52.52, lng: 13.405 },
      Hamburg: { lat: 53.5511, lng: 9.9937 },
      Munich: { lat: 48.1351, lng: 11.582 },
      Cologne: { lat: 50.9375, lng: 6.9603 },
      "Frankfurt am Main": { lat: 50.1109, lng: 8.6821 },
      Stuttgart: { lat: 48.7758, lng: 9.1829 },
      Düsseldorf: { lat: 51.2277, lng: 6.7735 },
      Dortmund: { lat: 51.5136, lng: 7.4653 },
      Essen: { lat: 51.4556, lng: 7.0116 },
      Leipzig: { lat: 51.3397, lng: 12.3731 },
      Bremen: { lat: 53.0793, lng: 8.8017 },
      Dresden: { lat: 51.0504, lng: 13.7373 },
      Hanover: { lat: 52.3759, lng: 9.732 },
      Nuremberg: { lat: 49.4521, lng: 11.0767 },
      Duisburg: { lat: 51.4344, lng: 6.7623 },
      Bochum: { lat: 51.4818, lng: 7.2162 },
      Wuppertal: { lat: 51.2562, lng: 7.1508 },
      Bielefeld: { lat: 52.0302, lng: 8.532 },
      Bonn: { lat: 50.7374, lng: 7.0982 },
      Münster: { lat: 51.9607, lng: 7.6261 },
      Karlsruhe: { lat: 49.0069, lng: 8.4037 },
      Mannheim: { lat: 49.4875, lng: 8.466 },
      Augsburg: { lat: 48.3705, lng: 10.8978 },
      Wiesbaden: { lat: 50.0826, lng: 8.24 },
      Chemnitz: { lat: 50.8278, lng: 12.9214 },
    };

    // Build response
    const cityStats = Array.from(cityMap.entries()).map(([city, data]) => {
      const avgDays = Math.round(data.totalDays / data.count);
      const reports = data.count;
      const coords = cityCoordinates[city] || { lat: 51.1657, lng: 10.4515 }; // Germany center fallback

      let confidence: "low" | "medium" | "high";
      if (reports >= 10) confidence = "high";
      else if (reports >= 4) confidence = "medium";
      else confidence = "low";

      return {
        city,
        avgDays,
        reports,
        confidence,
        lat: coords.lat,
        lng: coords.lng,
      };
    });

    return NextResponse.json({ cities: cityStats });
  } catch (error) {
    console.error("Error fetching city stats:", error);
    return NextResponse.json({ error: "Failed to fetch city stats" }, { status: 500 });
  }
}
