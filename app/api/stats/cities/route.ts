import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCityName } from "@/lib/cityNames";
import { CITY_COORDINATES, DEFAULT_COORDINATES } from "@/lib/cityCoordinates";

export async function GET() {
  try {
    // Fetch all offices AND completed reports in parallel so the map matches the offices page
    const [allOffices, reports] = await Promise.all([
      prisma.office.findMany({ select: { city: true, lat: true, lng: true } }),
      prisma.report.findMany({
        where: { decisionAt: { not: null } },
        include: { office: { select: { city: true } } },
      }),
    ]);

    // Build per-city stats from completed reports
    const cityMap = new Map<string, { totalDays: number; count: number }>();

    type ReportItem = (typeof reports)[number];
    reports.forEach((report: ReportItem) => {
      const city = normalizeCityName(report.office.city);
      if (!city || !report.submittedAt || !report.decisionAt) return;

      const days = Math.floor(
        (new Date(report.decisionAt).getTime() - new Date(report.submittedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (days < 0) return;

      const existing = cityMap.get(city) || { totalDays: 0, count: 0 };
      cityMap.set(city, {
        totalDays: existing.totalDays + days,
        count: existing.count + 1,
      });
    });

    // Collect every unique city that has an office (same source as the offices page)
    const allCities = new Set<string>();
    const officeCoordsByCity = new Map<string, { lat: number; lng: number }>();
    type OfficeItem = (typeof allOffices)[number];
    allOffices.forEach((o: OfficeItem) => {
      const city = normalizeCityName(o.city);
      if (!city) return;
      allCities.add(city);
      // Store DB-stored coords for this city if available (and not already stored)
      if (o.lat && o.lng && !officeCoordsByCity.has(city)) {
        officeCoordsByCity.set(city, { lat: o.lat, lng: o.lng });
      }
    });

    // Build response — every office city appears, with or without report data
    const cityStats = Array.from(allCities).map((city) => {
      const data = cityMap.get(city);
      const avgDays = data ? Math.round(data.totalDays / data.count) : 0;
      const reportCount = data?.count ?? 0;

      // Coordinate priority: 1) DB-stored coords  2) static map  3) Germany centre
      const coords =
        officeCoordsByCity.get(city) ??
        CITY_COORDINATES[city] ??
        DEFAULT_COORDINATES;

      let confidence: "low" | "medium" | "high";
      if (reportCount >= 10) confidence = "high";
      else if (reportCount >= 4) confidence = "medium";
      else confidence = "low";

      return {
        city,
        avgDays,
        reports: reportCount,
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
