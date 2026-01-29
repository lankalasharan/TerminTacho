import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Check if email already subscribed
    const existing = await prisma.newsletter.findUnique({
      where: { email },
    });

    if (existing && existing.subscribedAt) {
      return NextResponse.json(
        { error: "Already subscribed with this email" },
        { status: 400 }
      );
    }

    // Create or update subscription
    const subscription = await prisma.newsletter.upsert({
      where: { email },
      update: { subscribedAt: new Date() },
      create: {
        email,
        subscribedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, subscription }, { status: 201 });
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}
