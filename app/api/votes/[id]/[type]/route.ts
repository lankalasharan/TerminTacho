import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

/**
 * API endpoint to mark reports/reviews as helpful or not helpful
 * Prevents self-voting and vote manipulation
 */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id, type } = await params;
    const { helpful } = await req.json();

    if (typeof helpful !== "boolean") {
      return NextResponse.json(
        { error: "Invalid vote payload" },
        { status: 400 }
      );
    }

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - please sign in to vote" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const clientIp = getClientIp(req);
    const rateLimitResult = rateLimit(`vote:${clientIp}`, 30, 60 * 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many votes. Please try again later." },
        { status: 429 }
      );
    }

    if (type === "report") {
      const report = await prisma.report.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!report) {
        return NextResponse.json(
          { error: "Report not found" },
          { status: 404 }
        );
      }

      // Prevent self-voting
      if (report.userId === user.id) {
        return NextResponse.json(
          { error: "You cannot vote on your own submissions" },
          { status: 403 }
        );
      }

      const existingVote = await prisma.vote.findUnique({
        where: {
          userId_targetType_targetId: {
            userId: user.id,
            targetType: "report",
            targetId: id,
          },
        },
      });

      if (existingVote) {
        if (existingVote.helpful === helpful) {
          return NextResponse.json({ success: true, unchanged: true });
        }

        await prisma.$transaction([
          prisma.vote.update({
            where: { id: existingVote.id },
            data: { helpful },
          }),
          prisma.report.update({
            where: { id },
            data: helpful
              ? { helpful: { increment: 1 }, notHelpful: { decrement: 1 } }
              : { helpful: { decrement: 1 }, notHelpful: { increment: 1 } },
          }),
        ]);

        return NextResponse.json({ success: true, updated: true });
      }

      await prisma.$transaction([
        prisma.vote.create({
          data: {
            userId: user.id,
            targetType: "report",
            targetId: id,
            helpful,
          },
        }),
        prisma.report.update({
          where: { id },
          data: helpful
            ? { helpful: { increment: 1 } }
            : { notHelpful: { increment: 1 } },
        }),
      ]);

      return NextResponse.json({ success: true });
    } else if (type === "review") {
      const review = await prisma.review.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Review not found" },
          { status: 404 }
        );
      }

      // Prevent self-voting
      if (review.userId === user.id) {
        return NextResponse.json(
          { error: "You cannot vote on your own submissions" },
          { status: 403 }
        );
      }

      const existingVote = await prisma.vote.findUnique({
        where: {
          userId_targetType_targetId: {
            userId: user.id,
            targetType: "review",
            targetId: id,
          },
        },
      });

      if (existingVote) {
        if (existingVote.helpful === helpful) {
          return NextResponse.json({ success: true, unchanged: true });
        }

        await prisma.$transaction([
          prisma.vote.update({
            where: { id: existingVote.id },
            data: { helpful },
          }),
          prisma.review.update({
            where: { id },
            data: helpful
              ? { helpful: { increment: 1 }, notHelpful: { decrement: 1 } }
              : { helpful: { decrement: 1 }, notHelpful: { increment: 1 } },
          }),
        ]);

        return NextResponse.json({ success: true, updated: true });
      }

      await prisma.$transaction([
        prisma.vote.create({
          data: {
            userId: user.id,
            targetType: "review",
            targetId: id,
            helpful,
          },
        }),
        prisma.review.update({
          where: { id },
          data: helpful
            ? { helpful: { increment: 1 } }
            : { notHelpful: { increment: 1 } },
        }),
      ]);

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Invalid type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing vote:", error);
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}
