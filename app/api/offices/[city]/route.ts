import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { city: string } }
) {
  try {
    const city = decodeURIComponent(params.city);

    // Get office info
    const office = await prisma.office.findFirst({
      where: { city: { equals: city, mode: "insensitive" } },
    });

    if (!office) {
      return NextResponse.json(
        { error: "Office not found" },
        { status: 404 }
      );
    }

    // Get all reports for this office
    const reports = await prisma.report.findMany({
      where: { officeId: office.id },
      include: { processType: true },
      orderBy: { createdAt: "desc" },
    });

    // Get all reviews
    const reviews = await prisma.review.findMany({
      where: { officeId: office.id },
      orderBy: { createdAt: "desc" },
    });

    // Calculate statistics
    const totalReports = reports.length;
    const approvedReports = reports.filter(r => r.status === "approved").length;
    const rejectedReports = reports.filter(r => r.status === "rejected").length;
    const pendingReports = reports.filter(r => r.status === "pending").length;

    // Calculate average processing time
    const completedReports = reports.filter(r => r.decisionAt);
    const avgProcessingDays = completedReports.length > 0
      ? completedReports.reduce((sum, r) => {
          const days = Math.floor((r.decisionAt!.getTime() - r.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / completedReports.length
      : 0;

    // Calculate average ratings
    const avgOverall = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
      : 0;

    // Group by process type
    const byProcess = reports.reduce((acc, report) => {
      const processName = report.processType.name;
      if (!acc[processName]) {
        acc[processName] = {
          count: 0,
          totalDays: 0,
          completed: 0,
        };
      }
      acc[processName].count++;
      if (report.decisionAt) {
        const days = Math.floor((report.decisionAt.getTime() - report.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
        acc[processName].totalDays += days;
        acc[processName].completed++;
      }
      return acc;
    }, {} as Record<string, { count: number; totalDays: number; completed: number }>);

    const processStats = Object.entries(byProcess).map(([name, stats]) => ({
      name,
      count: stats.count,
      avgDays: stats.completed > 0 ? Math.round(stats.totalDays / stats.completed) : null,
    }));

    return NextResponse.json({
      office: {
        id: office.id,
        city: office.city,
        name: office.name,
        address: office.address,
        phone: office.phone,
        website: office.website,
      },
      statistics: {
        totalReports,
        approvedReports,
        rejectedReports,
        pendingReports,
        successRate: totalReports > 0 ? Math.round((approvedReports / totalReports) * 100) : 0,
        avgProcessingDays: Math.round(avgProcessingDays),
        avgRating: avgOverall,
        totalReviews: reviews.length,
      },
      processStats,
      recentReports: reports.slice(0, 10),
      recentReviews: reviews.slice(0, 10),
    });
  } catch (error) {
    console.error("Error fetching office details:", error);
    return NextResponse.json(
      { error: "Failed to fetch office details" },
      { status: 500 }
    );
  }
}
