import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCityName } from "@/lib/cityNames";

export async function GET() {
  const [offices, processTypes] = await Promise.all([
    prisma.office.findMany({ orderBy: [{ city: "asc" }, { name: "asc" }] }),
    prisma.processType.findMany({ orderBy: [{ name: "asc" }] }),
  ]);

  const normalizedOffices = offices.map((office) => ({
    ...office,
    city: normalizeCityName(office.city),
  }));

  return NextResponse.json({ offices: normalizedOffices, processTypes });
}
