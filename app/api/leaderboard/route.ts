import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get top contributors (users with most reports)
    // Note: We're using email as anonymous identifier since we don't store user-report relationships
    const contributions = await prisma.report.groupBy({
      by: ["createdAt"], // Group by some identifier
      _count: {
        id: true,
      },
    });

    // For now, return mock leaderboard data since we need to track user-report relationship
    // In production, update your Report model to include userId or similar
    const contributors = await prisma.$queryRaw`
      SELECT 
        u.id,
        COUNT(r.id) as "reportsCount"
      FROM "User" u
      LEFT JOIN "Report" r ON u.id = r."userId"
      GROUP BY u.id
      HAVING COUNT(r.id) > 0
      ORDER BY COUNT(r.id) DESC
      LIMIT 100
    `;

    // If the above query fails, return empty list
    // (means Report table doesn't have userId field yet)
    const formattedContributors = (contributors as any[]).map((c, index) => ({
      id: c.id,
      reportsCount: parseInt(c.reportsCount) || 0,
      rank: index + 1,
    }));

    return NextResponse.json({ contributors: formattedContributors });
  } catch (error) {
    console.error("Leaderboard error:", error);
    // Return empty leaderboard instead of error
    return NextResponse.json({ contributors: [] });
  }
}
