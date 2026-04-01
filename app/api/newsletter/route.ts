import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rateLimit";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendNewsletterConfirmation } from "@/lib/email";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, turnstileToken } = await req.json();
    const clientIp = getClientIp(req);

    const captchaCheck = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!captchaCheck.success) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed" },
        { status: 403 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const identifier = `newsletter:${normalizedEmail}`;

    // Check if email already subscribed
    const existing = await prisma.newsletter.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing && !existing.unsubscribedAt) {
      return NextResponse.json(
        { error: "Already subscribed with this email" },
        { status: 400 }
      );
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({
      data: {
        identifier,
        token,
        expires,
      },
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const confirmUrl = `${appUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;

    let emailSent = false;
    try {
      await sendNewsletterConfirmation(normalizedEmail, confirmUrl);
      emailSent = true;
    } catch (error) {
      console.error("Newsletter confirmation email failed:", error);
    }

    return NextResponse.json(
      {
        success: true,
        requiresConfirmation: true,
        emailSent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}
