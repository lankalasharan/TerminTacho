import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNewsletterUpdate } from "@/lib/email";

export const runtime = "nodejs";

function isAuthorized(req: Request) {
  const token = process.env.NEWSLETTER_SEND_TOKEN;
  if (!token) return false;

  const header = req.headers.get("authorization") || "";
  if (header.startsWith("Bearer ") && header.slice(7) === token) return true;

  const direct = req.headers.get("x-newsletter-token");
  return direct === token;
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await req.json();
    const subject = String(payload?.subject || "TerminTacho update");
    const message = String(payload?.message || "New updates are now available on TerminTacho.");

    const recipients = await prisma.newsletter.findMany({
      where: { unsubscribedAt: null },
      select: { email: true },
    });

    let sent = 0;
    for (const recipient of recipients) {
      await sendNewsletterUpdate(recipient.email, message, subject);
      sent += 1;
    }

    return NextResponse.json({ success: true, sent }, { status: 200 });
  } catch (error: any) {
    console.error("Newsletter send error:", error);
    return NextResponse.json({ error: "Failed to send updates" }, { status: 500 });
  }
}
