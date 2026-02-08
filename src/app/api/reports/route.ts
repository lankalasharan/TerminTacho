import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { validateTimelineSubmission } from "@/lib/dataValidation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const processTypeId = searchParams.get("processTypeId");

  const reports = await prisma.report.findMany({
    where: {
      ...(processTypeId ? { processTypeId } : {}),
      ...(city ? { office: { city } } : {}),
    },
    include: { office: true, processType: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ reports });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const clientIp = getClientIp(req);
  const rateLimitResult = rateLimit(clientIp, 10, 60 * 60 * 1000); // 10 requests per hour
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json();

  const {
    officeId,
    processTypeId,
    method,
    submittedAt,
    decisionAt,
    status,
    notes,
    turnstileToken,
  } = body ?? {};

  if (!officeId || !processTypeId || !method || !submittedAt || !status) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const captchaCheck = await verifyTurnstileToken(turnstileToken, clientIp);
  if (!captchaCheck.success) {
    return NextResponse.json(
      { error: "CAPTCHA verification failed" },
      { status: 403 }
    );
  }

  const validationErrors = validateTimelineSubmission({
    submittedAt: new Date(submittedAt),
    decisionAt: decisionAt ? new Date(decisionAt) : null,
    status: String(status),
  });

  if (validationErrors.length > 0) {
    return NextResponse.json(
      { error: "Validation failed", details: validationErrors },
      { status: 400 }
    );
  }

  const report = await prisma.report.create({
    data: {
      officeId: String(officeId),
      processTypeId: String(processTypeId),
      method: String(method).slice(0, 120),
      submittedAt: new Date(submittedAt),
      decisionAt: decisionAt ? new Date(decisionAt) : null,
      status: String(status),
      notes: notes?.trim() ? String(notes).trim().slice(0, 500) : null,
    },
  });

  return NextResponse.json({ report }, { status: 201 });
}
