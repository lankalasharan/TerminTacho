import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const verification = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verification || verification.expires < new Date()) {
      if (verification) {
        await prisma.verificationToken.delete({ where: { token } });
      }
      return NextResponse.redirect(new URL("/?newsletter=invalid", req.url));
    }

    if (!verification.identifier.startsWith("newsletter:")) {
      return NextResponse.json({ error: "Invalid token type" }, { status: 400 });
    }

    const email = verification.identifier.replace(/^newsletter:/, "");

    await prisma.newsletter.upsert({
      where: { email },
      update: {
        subscribedAt: new Date(),
        unsubscribedAt: null,
      },
      create: {
        email,
        subscribedAt: new Date(),
      },
    });

    await prisma.verificationToken.deleteMany({ where: { identifier: verification.identifier } });

    return NextResponse.redirect(new URL("/?newsletter=confirmed", req.url));
  } catch (error) {
    console.error("Newsletter confirmation error:", error);
    return NextResponse.json({ error: "Failed to confirm newsletter" }, { status: 500 });
  }
}
