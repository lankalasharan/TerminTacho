import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Trust weight by level — verified data counted more
const TRUST_WEIGHTS: Record<string, number> = {
  admin_digest: 3,
  verified: 2,
  community_verified: 1.5,
  unverified: 1,
};

function weightedMedian(values: number[], weights: number[]): number {
  const pairs = values.map((v, i) => ({ v, w: weights[i] })).sort((a, b) => a.v - b.v);
  const totalW = pairs.reduce((s, p) => s + p.w, 0);
  let cumW = 0;
  for (const p of pairs) {
    cumW += p.w;
    if (cumW >= totalW / 2) return p.v;
  }
  return pairs[pairs.length - 1].v;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const processTypeId = searchParams.get("processTypeId");
  const officeId = searchParams.get("officeId");

  if (!processTypeId) {
    return NextResponse.json({ error: "processTypeId is required" }, { status: 400 });
  }

  const where: Record<string, unknown> = {
    processTypeId,
    submittedAt: { not: null },
    decisionAt: { not: null },
  };
  if (officeId) where.officeId = officeId;

  const reports = await prisma.report.findMany({
    where,
    select: {
      submittedAt: true,
      decisionAt: true,
      trustLevel: true,
      sentiment: true,
    },
    orderBy: { submittedAt: "desc" },
    take: 200,
  });

  const processed: { days: number; weight: number; trustLevel: string; sentiment: string | null }[] = [];

  for (const r of reports) {
    if (!r.submittedAt || !r.decisionAt) continue;
    const days = Math.floor(
      (new Date(r.decisionAt).getTime() - new Date(r.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days < 0 || days > 3650) continue; // sanity check
    const w = TRUST_WEIGHTS[r.trustLevel ?? "unverified"] ?? 1;
    processed.push({ days, weight: w, trustLevel: r.trustLevel ?? "unverified", sentiment: r.sentiment });
  }

  // Sentiment-only count (quick pulses without dates)
  const sentimentOnly = await prisma.report.findMany({
    where: {
      processTypeId,
      ...(officeId ? { officeId } : {}),
      sentiment: { not: null },
    },
    select: { sentiment: true },
    take: 500,
  });

  const sentimentBreakdown = { fast: 0, average: 0, slow: 0 };
  for (const r of sentimentOnly) {
    if (r.sentiment === "fast") sentimentBreakdown.fast++;
    else if (r.sentiment === "average") sentimentBreakdown.average++;
    else if (r.sentiment === "slow") sentimentBreakdown.slow++;
  }

  if (processed.length === 0) {
    // No date-based data — return sentiment-only response
    const total = sentimentBreakdown.fast + sentimentBreakdown.average + sentimentBreakdown.slow;
    if (total === 0) {
      return NextResponse.json({ error: "No data available for this selection yet. Be the first to submit!" }, { status: 404 });
    }
    return NextResponse.json({
      min: null,
      max: null,
      median: null,
      count: total,
      verifiedCount: 0,
      confidence: "low",
      sentimentBreakdown,
      sentimentOnly: true,
    });
  }

  const days = processed.map((p) => p.days);
  const weights = processed.map((p) => p.weight);
  const sortedDays = [...days].sort((a, b) => a - b);

  const min = sortedDays[0];
  const max = sortedDays[sortedDays.length - 1];
  const median = weightedMedian(days, weights);
  const verifiedCount = processed.filter((p) => p.trustLevel !== "unverified").length;

  let confidence: "low" | "medium" | "high" = "low";
  if (processed.length >= 10) confidence = "high";
  else if (processed.length >= 4) confidence = "medium";

  return NextResponse.json({
    min,
    max,
    median: Math.round(median),
    count: processed.length,
    verifiedCount,
    confidence,
    sentimentBreakdown,
    sentimentOnly: false,
  });
}
