import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const contributors = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        COUNT(r.id) as "reportsCount"
      FROM "User" u
      LEFT JOIN "Report" r ON u.id = r."userId"
      GROUP BY u.id, u.email
      HAVING COUNT(r.id) > 0
      ORDER BY COUNT(r.id) DESC
      LIMIT 100
    `;

    // If the above query fails, return empty list
    // (means Report table doesn't have userId field yet)
    const formattedContributors = (contributors as any[]).map((c, index) => ({
      id: c.id,
      email: c.email ?? null,
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
