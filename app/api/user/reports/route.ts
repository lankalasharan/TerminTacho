import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.json({ reports: [] });
  }

  const reports = await prisma.report.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      status: true,
      submittedAt: true,
      createdAt: true,
      processType: { select: { name: true } },
      office: { select: { city: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reports });
}
