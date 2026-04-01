import { NextResponse } from "next/server";
import { Resend } from "resend";
import { PrismaClient } from "@prisma/client";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyTurnstileToken } from "@/lib/turnstile";

const resend = new Resend(process.env.RESEND_API_KEY);
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 submissions per IP per hour
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimit(clientIp, 5, 3600000); // 5 requests per hour

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { name, email, subject, message, turnstileToken } = await request.json();

    const captchaCheck = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!captchaCheck.success) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed" },
        { status: 403 }
      );
    }

    // Validate inputs
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Store in database
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "noreply@termintacho.de",
      to: "termintacho@gmail.com",
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p><small>Submitted at: ${new Date().toISOString()}</small></p>
      `,
    });

    // Send confirmation email to user
    await resend.emails.send({
      from: "noreply@termintacho.de",
      to: email,
      subject: "We received your message",
      html: `
        <h2>Thank you for contacting us!</h2>
        <p>Hi ${name},</p>
        <p>We've received your message and will get back to you within 2-3 business days.</p>
        <p><strong>Your message details:</strong></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p>Best regards,<br>The Termintacho Team</p>
      `,
    });

    return NextResponse.json(
      {
        message: "Message sent successfully",
        submissionId: submission.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
