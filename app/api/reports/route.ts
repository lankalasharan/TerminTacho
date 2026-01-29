import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    // Removed take limit to show all reports for dashboard statistics
  });

  return NextResponse.json({ reports });
}

export async function POST(req: Request) {
  const body = await req.json();

  const { officeId, processTypeId, method, submittedAt, decisionAt, status, notes } =
    body ?? {};

  if (!officeId || !processTypeId || !method || !submittedAt || !status) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const report = await prisma.report.create({
    data: {
      officeId: String(officeId),
      processTypeId: String(processTypeId),
      method: String(method),
      submittedAt: new Date(submittedAt),
      decisionAt: decisionAt ? new Date(decisionAt) : null,
      status: String(status),
      notes: notes?.trim() ? String(notes).trim().slice(0, 500) : null,
    },
  });

  return NextResponse.json({ report }, { status: 201 });
}
