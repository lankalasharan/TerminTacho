import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const officeId = searchParams.get("officeId");

    if (!officeId) {
      return NextResponse.json(
        { error: "officeId is required" },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { officeId },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average ratings
    const avgOverall = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
      : 0;
    
    const avgService = reviews.filter(r => r.serviceRating).length > 0
      ? reviews.filter(r => r.serviceRating).reduce((sum, r) => sum + (r.serviceRating || 0), 0) / reviews.filter(r => r.serviceRating).length
      : 0;

    const avgStaff = reviews.filter(r => r.staffRating).length > 0
      ? reviews.filter(r => r.staffRating).reduce((sum, r) => sum + (r.staffRating || 0), 0) / reviews.filter(r => r.staffRating).length
      : 0;

    const avgSpeed = reviews.filter(r => r.speedRating).length > 0
      ? reviews.filter(r => r.speedRating).reduce((sum, r) => sum + (r.speedRating || 0), 0) / reviews.filter(r => r.speedRating).length
      : 0;

    return NextResponse.json({
      reviews,
      averages: {
        overall: avgOverall,
        service: avgService,
        staff: avgStaff,
        speed: avgSpeed,
      },
      total: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      officeId,
      overallRating,
      serviceRating,
      staffRating,
      speedRating,
      title,
      content,
      processType,
    } = body;

    if (!officeId || !overallRating || !content) {
      return NextResponse.json(
        { error: "officeId, overallRating, and content are required" },
        { status: 400 }
      );
    }

    if (overallRating < 1 || overallRating > 5) {
      return NextResponse.json(
        { error: "Ratings must be between 1 and 5" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        officeId,
        overallRating,
        serviceRating,
        staffRating,
        speedRating,
        title,
        content,
        processType,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
