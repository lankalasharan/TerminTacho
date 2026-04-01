import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateWeightedAverage, getReportWeight } from "@/lib/relevance";
import { getCityAliases, normalizeCityName } from "@/lib/cityNames";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ city: string }> }
) {
  try {
    const { city: rawCity } = await params;
    const city = decodeURIComponent(rawCity);
    const aliases = getCityAliases(city);

    // Get office info
    const office = await prisma.office.findFirst({
      where: {
        OR: aliases.map((alias) => ({
          city: { equals: alias, mode: "insensitive" },
        })),
      },
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
      select: {
        id: true,
        officeId: true,
        processTypeId: true,
        method: true,
        submittedAt: true,
        decisionAt: true,
        status: true,
        createdAt: true,
        isOfficial: true,
        processType: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get all reviews
    const reviews = await prisma.review.findMany({
      where: { officeId: office.id },
      select: {
        id: true,
        officeId: true,
        overallRating: true,
        serviceRating: true,
        staffRating: true,
        speedRating: true,
        title: true,
        content: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate statistics
    const totalReports = reports.length;
    const approvedReports = reports.filter(r => r.status === "approved").length;
    const rejectedReports = reports.filter(r => r.status === "rejected").length;
    const pendingReports = reports.filter(r => r.status === "pending").length;

    // Calculate average processing time
    const completedReports = reports.filter(r => r.decisionAt);
    const completedDays: number[] = [];
    const completedWeights: number[] = [];
    completedReports.forEach(report => {
      const days = Math.floor((report.decisionAt!.getTime() - report.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
      if (days >= 0) {
        completedDays.push(days);
        completedWeights.push(getReportWeight({ submittedAt: report.submittedAt, isOfficial: report.isOfficial }));
      }
    });
    const avgProcessingDays = completedDays.length > 0
      ? calculateWeightedAverage(completedDays, completedWeights)
      : 0;

    // Calculate average ratings
    const avgOverall = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
      : 0;

    const processGroups = reports.reduce((acc, report) => {
      const processName = report.processType.name;
      if (!acc[processName]) acc[processName] = [];
      acc[processName].push(report);
      return acc;
    }, {} as Record<string, typeof reports>);

    const processStats = Object.entries(processGroups).map(([name, group]) => {
      const completed = group.filter(r => r.decisionAt);
      const days: number[] = [];
      const weights: number[] = [];
      completed.forEach(report => {
        const diff = Math.floor((report.decisionAt!.getTime() - report.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= 0) {
          days.push(diff);
          weights.push(getReportWeight({ submittedAt: report.submittedAt, isOfficial: report.isOfficial }));
        }
      });
      return {
        name,
        count: group.length,
        avgDays: days.length > 0 ? calculateWeightedAverage(days, weights) : null,
      };
    });

    return NextResponse.json({
      office: {
        id: office.id,
        city: normalizeCityName(office.city),
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
