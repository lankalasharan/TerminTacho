import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    if (!userId && !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userFilter = userId ? { userId } : { userEmail };
    const fallbackFilter = userId && userEmail ? [{ userId }, { userEmail }] : [userFilter];

    // Get total submissions
    const totalSubmissions = await prisma.report.count({
      where: {
        OR: fallbackFilter,
      },
    });

    // Get total reviews
    const totalReviews = await prisma.review.count({
      where: {
        OR: fallbackFilter,
      },
    });

    // Get last submission date
    const lastSubmission = await prisma.report.findFirst({
      where: {
        OR: fallbackFilter,
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
