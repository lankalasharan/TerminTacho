import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateTimelineSubmission } from "@/lib/dataValidation";

type BulkReportInput = {
  officeId?: string;
  officeCity?: string;
  officeName?: string;
  processTypeId?: string;
  processTypeName?: string;
  method?: string;
  submittedAt: string | Date;
  decisionAt?: string | Date | null;
  status: string;
  notes?: string | null;
  caseNumber?: string | null;
  userEmail?: string | null;
  confidenceScore?: number;
  isOfficial?: boolean;
};

const csvHeaders = new Set([
  "officeId",
  "officeCity",
  "officeName",
  "processTypeId",
  "processTypeName",
  "method",
  "submittedAt",
  "decisionAt",
  "status",
  "notes",
  "caseNumber",
  "userEmail",
  "confidenceScore",
  "isOfficial",
]);

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;
  return undefined;
}

function parseCsvBody(csvText: string): BulkReportInput[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) return [];

  const header = splitCsvLine(lines[0]).map((key) => key.trim());
  const hasValidHeader = header.some((key) => csvHeaders.has(key));

  if (!hasValidHeader) return [];

  const entries: BulkReportInput[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const values = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};

    header.forEach((key, idx) => {
      row[key] = values[idx] ?? "";
    });

    const confidenceRaw = row.confidenceScore?.trim();
    const confidenceScore = confidenceRaw ? Number(confidenceRaw) : undefined;
    const isOfficial = parseBoolean(row.isOfficial);

    entries.push({
      officeId: row.officeId || undefined,
      officeCity: row.officeCity || undefined,
      officeName: row.officeName || undefined,
      processTypeId: row.processTypeId || undefined,
      processTypeName: row.processTypeName || undefined,
      method: row.method || undefined,
      submittedAt: row.submittedAt || "",
      decisionAt: row.decisionAt || undefined,
      status: row.status || "",
      notes: row.notes || undefined,
      caseNumber: row.caseNumber || undefined,
      userEmail: row.userEmail || undefined,
      confidenceScore: Number.isFinite(confidenceScore) ? confidenceScore : undefined,
      isOfficial,
    });
  }

  return entries;
}

function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function clampConfidence(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export async function POST(req: Request) {
  const expectedKey = process.env.ADMIN_IMPORT_KEY;
  if (!expectedKey) {
    return NextResponse.json(
      { error: "ADMIN_IMPORT_KEY is not configured" },
      { status: 500 }
    );
  }

  const headerKey = req.headers.get("x-admin-import-key");
  const bearer = req.headers.get("authorization");
  const providedKey = headerKey || (bearer?.startsWith("Bearer ") ? bearer.slice(7) : null);

  if (!providedKey || providedKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contentType = req.headers.get("content-type") || "";
  let entries: unknown[] | null = null;

  if (contentType.includes("text/csv") || contentType.includes("application/csv")) {
    const csvText = await req.text();
    entries = parseCsvBody(csvText);
  } else {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    entries = Array.isArray(body)
      ? body
      : Array.isArray((body as { reports?: unknown }).reports)
        ? (body as { reports: unknown[] }).reports
        : null;
  }

  if (!entries || entries.length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty JSON array, { reports: [...] }, or a valid CSV" },
      { status: 400 }
    );
  }

  const results: {
    created: number;
    skipped: number;
    errors: Array<{ index: number; error: string }>;
  } = {
    created: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < entries.length; i += 1) {
    const raw = entries[i] as BulkReportInput;

    try {
      const submittedAt = parseDate(raw.submittedAt);
      const decisionAt = parseDate(raw.decisionAt ?? null);

      if (!submittedAt) {
        results.errors.push({ index: i, error: "submittedAt is invalid" });
        results.skipped += 1;
        continue;
      }

      if (!raw.status) {
        results.errors.push({ index: i, error: "status is required" });
        results.skipped += 1;
        continue;
      }

      const validationErrors = validateTimelineSubmission({
        submittedAt,
        decisionAt,
        status: raw.status,
      });

      if (validationErrors.length > 0) {
        results.errors.push({
          index: i,
          error: validationErrors.map((e) => `${e.field}: ${e.message}`).join("; "),
        });
        results.skipped += 1;
        continue;
      }

      let resolvedOfficeId = raw.officeId?.toString();
      if (!resolvedOfficeId) {
        const city = String(raw.officeCity || "").trim();
        if (!city) {
          results.errors.push({ index: i, error: "officeCity or officeId is required" });
          results.skipped += 1;
          continue;
        }

        const name = String(raw.officeName || "").trim().slice(0, 120) || `Auslanderbehorde ${city}`;

        const existingOffice = await prisma.office.findFirst({
          where: { city, name },
          select: { id: true },
        });

        if (existingOffice) {
          resolvedOfficeId = existingOffice.id;
        } else {
          const createdOffice = await prisma.office.create({
            data: { city, name },
            select: { id: true },
          });
          resolvedOfficeId = createdOffice.id;
        }
      }

      let resolvedProcessTypeId = raw.processTypeId?.toString();
      if (!resolvedProcessTypeId) {
        const name = String(raw.processTypeName || "").trim().slice(0, 120);
        if (!name) {
          results.errors.push({ index: i, error: "processTypeName or processTypeId is required" });
          results.skipped += 1;
          continue;
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

      const rawConfidence = typeof raw.confidenceScore === "number" ? raw.confidenceScore : 0.9;
      const confidenceScore = clampConfidence(rawConfidence);
      const isOfficial = typeof raw.isOfficial === "boolean" ? raw.isOfficial : false;

      await prisma.report.create({
        data: {
          officeId: String(resolvedOfficeId),
          processTypeId: String(resolvedProcessTypeId),
          caseNumber: raw.caseNumber ? String(raw.caseNumber) : null,
          method: raw.method ? String(raw.method) : "online",
          submittedAt,
          decisionAt: decisionAt ?? null,
          status: String(raw.status),
          notes: raw.notes ? String(raw.notes).trim().slice(0, 500) : null,
          userEmail: raw.userEmail ? String(raw.userEmail) : null,
          userId: null,
          ipAddress: null,
          confidenceScore,
          isOfficial,
        },
      });

      results.created += 1;
    } catch (error) {
      results.errors.push({ index: i, error: String(error) });
      results.skipped += 1;
    }
  }

  return NextResponse.json({
    success: true,
    created: results.created,
    skipped: results.skipped,
    errors: results.errors,
  });
}
