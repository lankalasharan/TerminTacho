import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCityName } from "@/lib/cityNames";
import { getCanonicalProcessKey, normalizeProcessLabel } from "@/lib/processLabels";

// Always read fresh data from the DB — never serve a cached response
export const dynamic = "force-dynamic";

function foldText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function processLabelScore(name: string): number {
  const normalized = normalizeProcessLabel(name);
  let score = normalized.length;
  if (/\p{Extended_Pictographic}/u.test(name)) score += 50;
  if (/\binitial\b/i.test(normalized)) score += 10;
  return score;
}

export async function GET() {
  const [offices, processTypes] = await Promise.all([
    prisma.office.findMany({ orderBy: [{ city: "asc" }, { name: "asc" }] }),
    prisma.processType.findMany({ orderBy: [{ name: "asc" }] }),
  ]);

  const officeMap = new Map<string, (typeof offices)[number]>();
  offices.forEach((office: (typeof offices)[number]) => {
    const city = normalizeCityName(office.city);
    const key = `${foldText(city)}::${foldText(office.name)}`;
    if (!officeMap.has(key)) {
      officeMap.set(key, { ...office, city });
    }
  });

  const normalizedOffices = Array.from(officeMap.values()).sort((a, b) =>
    a.city.localeCompare(b.city, "en", { sensitivity: "base" }) ||
    a.name.localeCompare(b.name, "en", { sensitivity: "base" })
  );

  const processMap = new Map<string, (typeof processTypes)[number]>();
  processTypes.forEach((processType: (typeof processTypes)[number]) => {
    const key = getCanonicalProcessKey(processType.name);
    const existing = processMap.get(key);
    if (!existing || processLabelScore(processType.name) < processLabelScore(existing.name)) {
      processMap.set(key, processType);
    }
  });

  const normalizedProcessTypes = Array.from(processMap.values()).sort((a, b) =>
    normalizeProcessLabel(a.name).localeCompare(normalizeProcessLabel(b.name), "en", { sensitivity: "base" })
  );

  return NextResponse.json({ offices: normalizedOffices, processTypes: normalizedProcessTypes }, {
    headers: { "Cache-Control": "no-store" },
  });
}
