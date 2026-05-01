import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/ipTracking";

export const dynamic = "force-dynamic";

const MATCH_THRESHOLD = 3; // upvotes needed to become community_verified

function makeTokenHash(ip: string, userAgent: string, reportId: string): string {
  // Hash IP + User-Agent + reportId together — no PII stored raw
  return createHash("sha256")
    .update(`${ip}|${userAgent}|${reportId}`)
    .digest("hex")
    .slice(0, 32);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reportId } = await params;

  const ip = getClientIp(req) ?? "unknown";
  const userAgent = req.headers.get("user-agent") ?? "unknown";
  const tokenHash = makeTokenHash(ip, userAgent, reportId);

  // Check report exists
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { id: true, matchCount: true, trustLevel: true },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Check if already matched from this token
  const existing = await prisma.reportMatch.findUnique({
    where: { reportId_tokenHash: { reportId, tokenHash } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You have already matched this report", alreadyMatched: true },
      { status: 409 }
    );
  }

  // Create the match record
  await prisma.reportMatch.create({
    data: { reportId, tokenHash },
  });

  const newMatchCount = report.matchCount + 1;

  // Upgrade trustLevel if threshold reached
  let newTrustLevel = report.trustLevel;
  if (
    newMatchCount >= MATCH_THRESHOLD &&
    report.trustLevel === "unverified"
  ) {
    newTrustLevel = "community_verified";
  }

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: { matchCount: newMatchCount, trustLevel: newTrustLevel },
    select: { matchCount: true, trustLevel: true },
  });

  return NextResponse.json({ matchCount: updated.matchCount, trustLevel: updated.trustLevel });
}
