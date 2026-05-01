import { PrismaClient } from "@prisma/client";
type VoteTargetType = "report" | "review";
import { readFile } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

type ParsedCsv = {
  headers: string[];
  rows: Record<string, string>[];
};

function parseCsv(content: string): ParsedCsv {
  const text = content.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        value += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        value += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(value);
      value = "";
    } else if (ch === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (ch === "\r") {
      continue;
    } else {
      value += ch;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  const [headers = [], ...body] = rows;
  const mappedRows = body
    .filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""))
    .map((r) => {
      const out: Record<string, string> = {};
      headers.forEach((header, idx) => {
        out[header] = r[idx] ?? "";
      });
      return out;
    });

  return { headers, rows: mappedRows };
}

function nullIfEmpty(value: string | undefined): string | null {
  if (value === undefined || value === "") return null;
  return value;
}

function parseDate(value: string | undefined): Date | null {
  const v = nullIfEmpty(value);
  return v ? new Date(v) : null;
}

function parseIntOrNull(value: string | undefined): number | null {
  const v = nullIfEmpty(value);
  return v ? Number.parseInt(v, 10) : null;
}

function parseFloatOrNull(value: string | undefined): number | null {
  const v = nullIfEmpty(value);
  return v ? Number.parseFloat(v) : null;
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  const v = nullIfEmpty(value);
  if (!v) return fallback;
  return v.toLowerCase() === "true";
}

async function readRows(baseDir: string, fileName: string): Promise<Record<string, string>[]> {
  try {
    const filePath = path.join(baseDir, fileName);
    const content = await readFile(filePath, "utf8");
    return parseCsv(content).rows;
  } catch {
    return [];
  }
}

function hasModel(model: string): boolean {
  const delegate = (prisma as unknown as Record<string, unknown>)[model] as
    | { createMany: (...args: unknown[]) => Promise<unknown> }
    | undefined;
  return !!delegate && typeof delegate.createMany === "function";
}

async function clearDatabase() {
  const ops: any[] = [];
  const pushDeleteMany = (model: string) => {
    const delegate = (prisma as unknown as Record<string, unknown>)[model] as
      | { deleteMany: () => any }
      | undefined;
    if (delegate && typeof delegate.deleteMany === "function") {
      ops.push(delegate.deleteMany());
    }
  };

  [
    "vote",
    "session",
    "account",
    "review",
    "report",
    "verificationToken",
    "newsletter",
    "contactSubmission",
    "consentLog",
    "processType",
    "office",
    "user",
  ].forEach(pushDeleteMany);

  if (ops.length > 0) {
    await prisma.$transaction(ops);
  }
}

async function main() {
  const csvDirArg = process.argv[2]?.trim();
  const csvDir = path.resolve(csvDirArg || "db-export");
  const shouldClear = process.argv.includes("--clear");

  console.log(`Importing CSV from: ${csvDir}`);

  if (shouldClear) {
    console.log("--clear detected: deleting existing rows before import...");
    await clearDatabase();
  }

  const users = await readRows(csvDir, "User.csv");
  if (hasModel("user") && users.length > 0) {
    await prisma.user.createMany({
      data: users.map((r) => ({
        id: r.id,
        name: nullIfEmpty(r.name),
        email: nullIfEmpty(r.email),
        emailVerified: parseDate(r.emailVerified),
        image: nullIfEmpty(r.image),
        hasSubmittedTimeline: parseBoolean(r.hasSubmittedTimeline, false),
        timelineSubmittedAt: parseDate(r.timelineSubmittedAt),
        lastIpAddress: nullIfEmpty(r.lastIpAddress),
        createdAt: parseDate(r.createdAt) ?? new Date(),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`- User: ${users.length} rows`);

  const offices = await readRows(csvDir, "Office.csv");
  if (hasModel("office") && offices.length > 0) {
    await prisma.office.createMany({
      data: offices.map((r) => ({
        id: r.id,
        city: r.city,
        name: r.name,
        address: nullIfEmpty(r.address),
        phone: nullIfEmpty(r.phone),
        website: nullIfEmpty(r.website),
        lat: parseFloatOrNull(r.lat),
        lng: parseFloatOrNull(r.lng),
        createdAt: parseDate(r.createdAt) ?? new Date(),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`- Office: ${offices.length} rows`);

  const processTypes = await readRows(csvDir, "ProcessType.csv");
  if (hasModel("processType") && processTypes.length > 0) {
    await prisma.processType.createMany({
      data: processTypes.map((r) => ({
        id: r.id,
        name: r.name,
        createdAt: parseDate(r.createdAt) ?? new Date(),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`- ProcessType: ${processTypes.length} rows`);

  const newsletters = await readRows(csvDir, "Newsletter.csv");
  if (hasModel("newsletter") && newsletters.length > 0) {
    await prisma.newsletter.createMany({
      data: newsletters.map((r) => ({
        id: r.id,
        email: r.email,
        subscribedAt: parseDate(r.subscribedAt) ?? new Date(),
        unsubscribedAt: parseDate(r.unsubscribedAt),
        createdAt: parseDate(r.createdAt) ?? new Date(),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`- Newsletter: ${newsletters.length} rows`);

  const contacts = await readRows(csvDir, "ContactSubmission.csv");
  if (hasModel("contactSubmission") && contacts.length > 0) {
    await prisma.contactSubmission.createMany({
      data: contacts.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        subject: r.subject,
        message: r.message,
        createdAt: parseDate(r.createdAt) ?? new Date(),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`- ContactSubmission: ${contacts.length} rows`);

  const consentLogs = await readRows(csvDir, "ConsentLog.csv");
  if (hasModel("consentLog") && consentLogs.length > 0) {
    const consentLogDelegate = (prisma as unknown as Record<string, unknown>)["consentLog"] as
      | { createMany: (args: unknown) => Promise<unknown> }
      | undefined;
    await consentLogDelegate?.createMany({
      data: consentLogs.map((r) => ({
        id: r.id,
        action: r.action,
        consentType: nullIfEmpty(r.consentType) ?? "cookies",
        maskedIp: nullIfEmpty(r.maskedIp),
        userAgent: nullIfEmpty(r.userAgent),
        createdAt: parseDate(r.createdAt) ?? new Date(),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`- ConsentLog: ${consentLogs.length} rows`);

  const verificationTokens = await readRows(csvDir, "VerificationToken.csv");
  if (hasModel("verificationToken") && verificationTokens.length > 0) {
    await prisma.verificationToken.createMany({
      data: verificationTokens.map((r) => ({
        identifier: r.identifier,
        token: r.token,
        expires: parseDate(r.expires) ?? new Date(),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`- VerificationToken: ${verificationTokens.length} rows`);

  const accounts = await readRows(csvDir, "Account.csv");
  if (hasModel("account") && accounts.length > 0) {
    await prisma.account.createMany({
      data: accounts.map((r) => ({
        id: r.id,
        userId: r.userId,
        type: r.type,
        provider: r.provider,
        providerAccountId: r.providerAccountId,
        refresh_token: nullIfEmpty(r.refresh_token),
        access_token: nullIfEmpty(r.access_token),
        expires_at: parseIntOrNull(r.expires_at),
        token_type: nullIfEmpty(r.token_type),
        scope: nullIfEmpty(r.scope),
        id_token: nullIfEmpty(r.id_token),
        session_state: nullIfEmpty(r.session_state),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`- Account: ${accounts.length} rows`);

  const sessions = await readRows(csvDir, "Session.csv");
  if (hasModel("session") && sessions.length > 0) {
    await prisma.session.createMany({
      data: sessions.map((r) => ({
        id: r.id,
        sessionToken: r.sessionToken,
        userId: r.userId,
        expires: parseDate(r.expires) ?? new Date(),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`- Session: ${sessions.length} rows`);

  const reports = await readRows(csvDir, "Report.csv");
  if (hasModel("report") && reports.length > 0) {
    await prisma.report.createMany({
      data: reports.map((r) => ({
        id: r.id,
        officeId: r.officeId,
        processTypeId: r.processTypeId,
        caseNumber: nullIfEmpty(r.caseNumber),
        method: r.method,
        submittedAt: parseDate(r.submittedAt) ?? new Date(),
        decisionAt: parseDate(r.decisionAt),
        status: r.status,
        notes: nullIfEmpty(r.notes),
        userEmail: nullIfEmpty(r.userEmail),
        userId: nullIfEmpty(r.userId),
        ipAddress: nullIfEmpty(r.ipAddress),
        isOfficial: parseBoolean(r.isOfficial, false),
        createdAt: parseDate(r.createdAt) ?? new Date(),
        helpful: parseIntOrNull(r.helpful) ?? 0,
        notHelpful: parseIntOrNull(r.notHelpful) ?? 0,
        confidenceScore: parseFloatOrNull(r.confidenceScore) ?? 0.5,
        isStillWaiting: parseBoolean(r.isStillWaiting, false),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`- Report: ${reports.length} rows`);

  const reviews = await readRows(csvDir, "Review.csv");
  if (hasModel("review") && reviews.length > 0) {
    await prisma.review.createMany({
      data: reviews.map((r) => ({
        id: r.id,
        officeId: r.officeId,
        userId: nullIfEmpty(r.userId),
        userEmail: nullIfEmpty(r.userEmail),
        ipAddress: nullIfEmpty(r.ipAddress),
        overallRating: parseIntOrNull(r.overallRating) ?? 1,
        serviceRating: parseIntOrNull(r.serviceRating),
        staffRating: parseIntOrNull(r.staffRating),
        speedRating: parseIntOrNull(r.speedRating),
        title: nullIfEmpty(r.title),
        content: r.content,
        processType: nullIfEmpty(r.processType),
        helpful: parseIntOrNull(r.helpful) ?? 0,
        notHelpful: parseIntOrNull(r.notHelpful) ?? 0,
        createdAt: parseDate(r.createdAt) ?? new Date(),
        lastReviewDate: parseDate(r.lastReviewDate),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`- Review: ${reviews.length} rows`);

  const votes = await readRows(csvDir, "Vote.csv");
  if (hasModel("vote") && votes.length > 0) {
    await prisma.vote.createMany({
      data: votes.map((r) => ({
        id: r.id,
        userId: r.userId,
        targetType: (r.targetType as VoteTargetType) ?? ("report" as VoteTargetType),
        targetId: r.targetId,
        helpful: parseBoolean(r.helpful, false),
        createdAt: parseDate(r.createdAt) ?? new Date(),
        updatedAt: parseDate(r.updatedAt) ?? new Date(),
      })),
      skipDuplicates: true,
    });
  }
  console.log(`- Vote: ${votes.length} rows`);

  console.log("Import complete.");
}

main()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
