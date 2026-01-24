import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [offices, processTypes] = await Promise.all([
    prisma.office.findMany({ orderBy: [{ city: "asc" }, { name: "asc" }] }),
    prisma.processType.findMany({ orderBy: [{ name: "asc" }] }),
  ]);

  return NextResponse.json({ offices, processTypes });
}
