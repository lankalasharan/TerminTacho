import { PrismaClient } from "@prisma/client";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const prisma = new PrismaClient();

type Row = Record<string, unknown>;

type ExportConfig = {
  table: string;
  file: string;
  fields: string[];
  read: () => Promise<Row[] | null>;
};

function getDelegate(model: string): { findMany: (args?: unknown) => Promise<Row[]> } | null {
  const delegate = (prisma as unknown as Record<string, unknown>)[model] as
    | { findMany: (args?: unknown) => Promise<Row[]> }
    | undefined;
  return delegate && typeof delegate.findMany === "function" ? delegate : null;
}

function toCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "";

  let text: string;
  if (value instanceof Date) {
    text = value.toISOString();
  } else if (typeof value === "object") {
    text = JSON.stringify(value);
  } else {
    text = String(value);
  }

  if (text.includes('"') || text.includes(",") || text.includes("\n") || text.includes("\r")) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function toCsv(rows: Row[], fields: string[]): string {
  const header = fields.join(",");
  const dataLines = rows.map((row) => fields.map((field) => toCsvCell(row[field])).join(","));
  // BOM helps Excel correctly detect UTF-8.
  return `\uFEFF${[header, ...dataLines].join("\n")}\n`;
}

async function main() {
  const outputDirArg = process.argv[2]?.trim();
  const outputDir = path.resolve(outputDirArg || "db-export");

  const tasks: ExportConfig[] = [
    {
      table: "User",
      file: "User.csv",
      fields: ["id", "name", "email", "emailVerified", "image", "hasSubmittedTimeline", "timelineSubmittedAt", "lastIpAddress", "createdAt"],
      read: async () => {
        const d = getDelegate("user");
        return d ? d.findMany({ orderBy: { createdAt: "asc" } }) : null;
      },
    },
    {
      table: "Office",
      file: "Office.csv",
      fields: ["id", "city", "name", "address", "phone", "website", "lat", "lng", "createdAt"],
      read: async () => {
        const d = getDelegate("office");
        return d ? d.findMany({ orderBy: { createdAt: "asc" } }) : null;
      },
    },
    {
      table: "ProcessType",
      file: "ProcessType.csv",
      fields: ["id", "name", "createdAt"],
      read: async () => {
        const d = getDelegate("processType");
        return d ? d.findMany({ orderBy: { createdAt: "asc" } }) : null;
      },
    },
    {
      table: "Report",
      file: "Report.csv",
      fields: ["id", "officeId", "processTypeId", "caseNumber", "method", "submittedAt", "decisionAt", "status", "notes", "userEmail", "userId", "ipAddress", "isOfficial", "createdAt", "helpful", "notHelpful", "confidenceScore", "isStillWaiting"],
      read: async () => {
        const d = getDelegate("report");
        return d ? d.findMany({ orderBy: { createdAt: "asc" } }) : null;
      },
    },
    {
      table: "Review",
      file: "Review.csv",
      fields: ["id", "officeId", "userId", "userEmail", "ipAddress", "overallRating", "serviceRating", "staffRating", "speedRating", "title", "content", "processType", "helpful", "notHelpful", "createdAt", "lastReviewDate"],
      read: async () => {
        const d = getDelegate("review");
        return d ? d.findMany({ orderBy: { createdAt: "asc" } }) : null;
      },
    },
    {
      table: "Vote",
      file: "Vote.csv",
      fields: ["id", "userId", "targetType", "targetId", "helpful", "createdAt", "updatedAt"],
      read: async () => {
        const d = getDelegate("vote");
        return d ? d.findMany({ orderBy: { createdAt: "asc" } }) : null;
      },
    },
    {
      table: "Newsletter",
      file: "Newsletter.csv",
      fields: ["id", "email", "subscribedAt", "unsubscribedAt", "createdAt"],
      read: async () => {
        const d = getDelegate("newsletter");
        return d ? d.findMany({ orderBy: { createdAt: "asc" } }) : null;
      },
    },
    {
      table: "ContactSubmission",
      file: "ContactSubmission.csv",
      fields: ["id", "name", "email", "subject", "message", "createdAt"],
      read: async () => {
        const d = getDelegate("contactSubmission");
        return d ? d.findMany({ orderBy: { createdAt: "asc" } }) : null;
      },
    },
    {
      table: "ConsentLog",
      file: "ConsentLog.csv",
      fields: ["id", "action", "consentType", "maskedIp", "userAgent", "createdAt"],
      read: async () => {
        const d = getDelegate("consentLog");
        return d ? d.findMany({ orderBy: { createdAt: "asc" } }) : null;
      },
    },
    {
      table: "VerificationToken",
      file: "VerificationToken.csv",
      fields: ["identifier", "token", "expires"],
      read: async () => {
        const d = getDelegate("verificationToken");
        return d ? d.findMany({ orderBy: { expires: "asc" } }) : null;
      },
    },
    {
      table: "Account",
      file: "Account.csv",
      fields: ["id", "userId", "type", "provider", "providerAccountId", "refresh_token", "access_token", "expires_at", "token_type", "scope", "id_token", "session_state"],
      read: async () => {
        const d = getDelegate("account");
        return d ? d.findMany({ orderBy: { id: "asc" } }) : null;
      },
    },
    {
      table: "Session",
      file: "Session.csv",
      fields: ["id", "sessionToken", "userId", "expires"],
      read: async () => {
        const d = getDelegate("session");
        return d ? d.findMany({ orderBy: { expires: "asc" } }) : null;
      },
    },
  ];

  await mkdir(outputDir, { recursive: true });

  console.log(`Exporting database to: ${outputDir}`);
  for (const task of tasks) {
    const rows = await task.read();
    if (rows === null) {
      console.log(`- ${task.table}: skipped (model not present in Prisma client)`);
      continue;
    }
    const csv = toCsv(rows, task.fields);
    const filePath = path.join(outputDir, task.file);
    await writeFile(filePath, csv, "utf8");
    console.log(`- ${task.table}: ${rows.length} rows -> ${task.file}`);
  }

  console.log("Export complete. You can open CSV files in Excel.");
}

main()
  .catch((error) => {
    console.error("Export failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
