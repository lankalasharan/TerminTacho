import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  return adminEmails.includes(email);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") ?? "";
  const processType = searchParams.get("processType") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = 50;

  const where: Record<string, unknown> = {};

  if (city) {
    where.office = { city: { contains: city, mode: "insensitive" } };
  }
  if (processType) {
    where.processType = { name: { contains: processType, mode: "insensitive" } };
  }
  if (status) {
    where.status = status;
  }

  const [total, reports] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      select: {
        id: true,
        status: true,
        submittedAt: true,
        decisionAt: true,
        method: true,
        createdAt: true,
        confidenceScore: true,
        userEmail: true,
        ipAddress: true,
        office: { select: { city: true, name: true } },
        processType: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ reports, total, page, pageSize });
}
