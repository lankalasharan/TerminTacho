import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { markTimelineSubmitted } from "@/lib/userVerification";
import {
  calculateConfidenceScore,
  isDuplicateSubmission,
  checkSubmissionRateLimit,
} from "@/lib/antifraud";
import { validateTimelineSubmission } from "@/lib/dataValidation";
import { getClientIp, trackIpAddress, checkIpAbusePattern, checkIpSubmissionPatterns } from "@/lib/ipTracking";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { getCityAliases, normalizeCityName } from "@/lib/cityNames";
import { CITY_COORDINATES } from "@/lib/cityCoordinates";

// Always read fresh data from the DB — never serve a cached response
export const dynamic = "force-dynamic";

/** Geocode a city via Nominatim (OpenStreetMap). Only called once per brand-new city. */
async function geocodeCity(cityName: string): Promise<{ lat: number; lng: number } | null> {
  // Check static map first to avoid any network call for known cities
  if (CITY_COORDINATES[cityName]) return CITY_COORDINATES[cityName];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName + ", Germany")}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "termintacho/1.0" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // geocoding failure is non-fatal — office is still created
  }
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");
  const processTypeId = searchParams.get("processTypeId");
  const limitParam = Number(searchParams.get("limit") || "200");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 200;
  const cityAliases = city ? getCityAliases(city) : [];

  const reports = await prisma.report.findMany({
    where: {
      ...(processTypeId ? { processTypeId } : {}),
      ...(city
        ? {
            OR: cityAliases.map((alias) => ({
              office: { city: { equals: alias, mode: "insensitive" } },
            })),
          }
        : {}),
    },
    select: {
      id: true,
      officeId: true,
      processTypeId: true,
      method: true,
      submittedAt: true,
      decisionAt: true,
      status: true,
      createdAt: true,
      office: {
        select: {
          id: true,
          city: true,
          name: true,
        },
      },
      processType: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const normalizedReports = reports.map((report) => ({
    ...report,
    office: report.office
      ? { ...report.office, city: normalizeCityName(report.office.city) }
      : report.office,
  }));

  return NextResponse.json({ reports: normalizedReports }, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Require authentication for all submissions
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "You must be logged in to submit a report." },
      { status: 401 }
    );
  }

  const body = await req.json();
  const ipAddress = getClientIp(req);

  const { officeId, officeCity, officeName, processTypeId, processTypeName, method, submittedAt, decisionAt, status, notes, caseNumber, turnstileToken } =
    body ?? {};

  const captchaCheck = await verifyTurnstileToken(turnstileToken, ipAddress);
  if (!captchaCheck.success) {
    return NextResponse.json(
      { error: "CAPTCHA verification failed" },
      { status: 403 }
    );
  }

  if ((!officeId && !officeCity) || (!processTypeId && !processTypeName) || !method || !submittedAt || !status) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  let resolvedOfficeId: string | null = officeId ? String(officeId) : null;
  if (!resolvedOfficeId) {
    const city = normalizeCityName(String(officeCity || "").trim());
    if (!city) {
      return NextResponse.json({ error: "Office city is required." }, { status: 400 });
    }

    const defaultName = `Ausländerbehörde ${city}`;

    // Match by city only — ignore the submitted office name so that all
    // submissions for the same city are routed to one canonical office row
    // instead of creating a new duplicate row for every slightly different name.
    const existingOffice = await prisma.office.findFirst({
      where: { city: { equals: city, mode: "insensitive" } },
      select: { id: true },
    });

    if (existingOffice) {
      resolvedOfficeId = existingOffice.id;
    } else {
      // Brand-new city — geocode and create the one canonical office row
      const coords = await geocodeCity(city);
      const createdOffice = await prisma.office.create({
        data: { city, name: defaultName, lat: coords?.lat ?? null, lng: coords?.lng ?? null },
        select: { id: true },
      });
      resolvedOfficeId = createdOffice.id;
    }
  }

  // Validate timeline data
  const validationErrors = validateTimelineSubmission({
    submittedAt,
    decisionAt,
    status,
  });

  if (validationErrors.length > 0) {
    return NextResponse.json(
      { error: "Validation failed", details: validationErrors },
      { status: 400 }
    );
  }

  let userId: string | undefined;
  let userEmail: string | undefined;

  // session is guaranteed here (auth check at top)
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, createdAt: true },
  });
  userId = user?.id;
  userEmail = session.user.email;

  if (user) {
    // Track IP address
    if (ipAddress) {
      await trackIpAddress(user.id, ipAddress);
    }

    // Check IP abuse pattern (too many accounts from same IP)
    const ipAbuseCheck = await checkIpAbusePattern(ipAddress);
    if (ipAbuseCheck.isAbusive) {
      return NextResponse.json(
        { error: "Suspicious activity detected. Please try again later." },
        { status: 429 }
      );
    }

    // Check IP submission patterns (spam from same IP)
    const ipPatternCheck = await checkIpSubmissionPatterns(ipAddress);
    if (ipPatternCheck.isSuspicious) {
      return NextResponse.json(
        { error: "Too many submissions from your location. Try again in 1 hour." },
        { status: 429 }
      );
    }

    // Check for duplicate submission (by case number)
    const duplicate = await isDuplicateSubmission(userId, caseNumber, processTypeId);
    if (duplicate.isDuplicate) {
      return NextResponse.json(
        { error: duplicate.message || "Duplicate submission detected" },
        { status: 409 }
      );
    }

    // Check rate limiting (5 submissions per 24 hours)
    const rateCheck = await checkSubmissionRateLimit(userId, {
      maxSubmissions: 5,
      timeWindowHours: 24,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.message },
        { status: 429 }
      );
    }
  }

  // Calculate confidence score based on account age
  let confidenceScore = 0.5; // Default for anonymous
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });
    if (user) {
      confidenceScore = calculateConfidenceScore(user.createdAt);
    }
  }

  let resolvedProcessTypeId: string | null = processTypeId ? String(processTypeId) : null;
  if (!resolvedProcessTypeId) {
    const name = String(processTypeName || "").trim().slice(0, 120);
    if (!name) {
      return NextResponse.json({ error: "Process type is required." }, { status: 400 });
    }

    const existingProcess = await prisma.processType.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });

    if (existingProcess) {
      resolvedProcessTypeId = existingProcess.id;
    } else {
      const createdProcess = await prisma.processType.create({
        data: { name },
        select: { id: true },
      });
      resolvedProcessTypeId = createdProcess.id;
    }
  }

  // Check duplicate: same user, same office, same process type
  if (userId && resolvedOfficeId && resolvedProcessTypeId) {
    const existingReport = await prisma.report.findFirst({
      where: {
        userId,
        officeId: String(resolvedOfficeId),
        processTypeId: String(resolvedProcessTypeId),
      },
      select: { id: true },
    });
    if (existingReport) {
      return NextResponse.json(
        {
          error:
            "You have already submitted a report for the same office and process type. Each user can only submit one report per city/process combination.",
        },
        { status: 409 }
      );
    }
  }

  const report = await prisma.report.create({
    data: {
      officeId: String(resolvedOfficeId),
      processTypeId: String(resolvedProcessTypeId),
      caseNumber: caseNumber ? String(caseNumber) : null,
      method: String(method),
      submittedAt: new Date(submittedAt),
      decisionAt: decisionAt ? new Date(decisionAt) : null,
      status: String(status),
      notes: notes?.trim() ? String(notes).trim().slice(0, 500) : null,
      userId,
      userEmail,
      ipAddress,
      confidenceScore,
      isOfficial: false,
    },
  });

  // Mark timeline as submitted if user is authenticated
  if (userId) {
    await markTimelineSubmitted(userId);
  }

  return NextResponse.json({ report }, { status: 201 });
}
