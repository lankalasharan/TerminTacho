import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Get total submissions
    const totalSubmissions = await prisma.report.count({
      where: {
        userEmail,
      },
    });

    // Get total reviews
    const totalReviews = await prisma.review.count({
      where: {
        userEmail,
      },
    });

    // Get last submission date
    const lastSubmission = await prisma.report.findFirst({
      where: {
        userEmail,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        createdAt: true,
      },
    });

    return NextResponse.json({
      totalSubmissions,
      totalReviews,
      lastSubmission: lastSubmission?.createdAt || null,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
