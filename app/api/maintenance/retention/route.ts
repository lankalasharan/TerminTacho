import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function monthsAgo(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function authorizeRequest(req: Request): boolean {
  const secret = process.env.RETENTION_CRON_SECRET;
  if (!secret) return true;

  const header = req.headers.get("x-cron-secret");
  return header === secret;
}

export async function POST(req: Request) {
  if (!authorizeRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contactCutoff = monthsAgo(24);
  const consentCutoff = monthsAgo(12);
  const reviewIpCutoff = daysAgo(30);
  const newsletterTokenCutoff = daysAgo(30);

  const [contactResult, consentResult, reviewResult, tokenResult] = await Promise.all([
    prisma.contactSubmission.deleteMany({
      where: { createdAt: { lt: contactCutoff } },
    }),
    prisma.consentLog.deleteMany({
      where: { createdAt: { lt: consentCutoff } },
    }),
    prisma.review.updateMany({
      where: { createdAt: { lt: reviewIpCutoff }, ipAddress: { not: null } },
      data: { ipAddress: null },
    }),
    prisma.verificationToken.deleteMany({
      where: {
        identifier: { startsWith: "newsletter:" },
        expires: { lt: newsletterTokenCutoff },
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    deletedContactSubmissions: contactResult.count,
    deletedConsentLogs: consentResult.count,
    anonymizedReviewIps: reviewResult.count,
    deletedNewsletterTokens: tokenResult.count,
    ranAt: new Date().toISOString(),
  });
}
