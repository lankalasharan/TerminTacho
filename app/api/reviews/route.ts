import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { canSubmitReview } from "@/lib/antifraud";
import { validateReview } from "@/lib/dataValidation";
import { checkTextSimilarity, detectSpamPatterns } from "@/lib/textSimilarity";
import { getClientIp, trackIpAddress } from "@/lib/ipTracking";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { verifyTurnstileToken } from "@/lib/turnstile";

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
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const ipAddress = getClientIp(request);
    const {
      officeId,
      overallRating,
      serviceRating,
      staffRating,
      speedRating,
      title,
      content,
      processType,
      turnstileToken,
    } = body;

    const captchaCheck = await verifyTurnstileToken(turnstileToken, ipAddress);
    if (!captchaCheck.success) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed" },
        { status: 403 }
      );
    }

    if (!officeId || !overallRating || !content) {
      return NextResponse.json(
        { error: "officeId, overallRating, and content are required" },
        { status: 400 }
      );
    }

    // Validate review data
    const validationErrors = validateReview({
      overallRating,
      serviceRating,
      staffRating,
      speedRating,
      title,
      content,
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    // Check for spam patterns
    const spamPatterns = detectSpamPatterns(content);
    if (spamPatterns.isSpam) {
      return NextResponse.json(
        { error: "Review appears to contain spam", reasons: spamPatterns.reasons },
        { status: 400 }
      );
    }

    // Check for similar reviews (copy-paste detection)
    const existingReviews = await prisma.review.findMany({
      where: { officeId },
      select: { content: true },
    });

    const existingTexts = existingReviews.map((r) => r.content);
    const similarityCheck = await checkTextSimilarity(content, existingTexts, 0.85);

    if (similarityCheck.isSimilar) {
      return NextResponse.json(
        {
          error: "Your review is too similar to an existing review. Please write original content.",
          similarity: Math.round(similarityCheck.similarity * 100),
        },
        { status: 400 }
      );
    }

    // Rate limiting: 1 review per day per user
    let userId: string | undefined;
    let userEmail: string | undefined;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });

      if (user) {
        userId = user.id;
        userEmail = session.user.email;

        // Track IP address
        if (ipAddress) {
          await trackIpAddress(user.id, ipAddress);
        }

        const reviewCheck = await canSubmitReview(user.id);
        if (!reviewCheck.allowed) {
          return NextResponse.json(
            { error: reviewCheck.message },
            { status: 429 }
          );
        }
      }
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
        userId,
        userEmail,
        ipAddress,
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
