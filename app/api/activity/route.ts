import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RecentReport = Awaited<ReturnType<typeof prisma.report.findMany>>[number];
type RecentReview = Awaited<ReturnType<typeof prisma.review.findMany>>[number];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get recent reports
    const recentReports = await prisma.report.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        office: true,
        processType: true,
      },
    });

    // Get recent reviews
    const recentReviews = await prisma.review.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        office: true,
      },
    });

    // Combine and sort by date
    const combined = [
      ...recentReports.map((r: RecentReport) => ({
        type: 'report' as const,
        id: r.id,
        date: r.createdAt,
        city: r.office.city,
        process: r.processType.name,
        status: r.status,
      })),
      ...recentReviews.map((r: RecentReview) => ({
        type: 'review' as const,
        id: r.id,
        date: r.createdAt,
        city: r.office.city,
        rating: r.overallRating,
        title: r.title,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);

    return NextResponse.json(combined);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    );
  }
}
