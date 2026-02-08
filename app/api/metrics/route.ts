import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [cities, processes, reports, users] = await Promise.all([
      prisma.office.count(),
      prisma.processType.count(),
      prisma.report.count(),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      cities,
      processes,
      reports,
      users,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
