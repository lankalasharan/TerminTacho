import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/ipTracking";

export const runtime = "nodejs";

function maskIp(ip: string | null): string | null {
  if (!ip) return null;

  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length !== 4) return null;
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }

  if (ip.includes(":")) {
    const parts = ip.split(":");
    const head = parts.slice(0, 2).join(":");
    return `${head}::xxxx`;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body?.action || "").toLowerCase();
    if (!action || (action !== "accepted" && action !== "declined")) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const ip = getClientIp(req);
    const maskedIp = maskIp(ip);
    const userAgent = req.headers.get("user-agent")?.slice(0, 200) || null;

    await prisma.consentLog.create({
      data: {
        action,
        consentType: "cookies",
        maskedIp,
        userAgent,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Consent logging error:", error);
    return NextResponse.json({ error: "Failed to log consent" }, { status: 500 });
  }
}
