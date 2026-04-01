import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getSmtpTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || "true") === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("Missing SMTP_USER or SMTP_PASS for email transport");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

function getFromAddress() {
  return process.env.EMAIL_FROM || process.env.SMTP_USER || "termintacho@gmail.com";
}

export async function sendNewsletterConfirmation(to: string, confirmUrl: string) {
  const subject = "Confirm your TerminTacho newsletter subscription";
  const text = `Please confirm your newsletter subscription by clicking this link:\n\n${confirmUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="margin: 0 0 12px;">Confirm your subscription</h2>
      <p>Please confirm your newsletter subscription to start receiving updates.</p>
      <p><a href="${confirmUrl}" style="color: #3e726a;">Confirm subscription</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  const transport = getSmtpTransporter();
  return transport.sendMail({
    from: getFromAddress(),
    to,
    subject,
    text,
    html,
  });
}

export async function sendNewsletterUpdate(to: string, message: string, subject?: string) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const finalSubject = subject || "TerminTacho update";
  const text = `${message}\n\nVisit: ${appUrl}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <p>${message.replace(/\n/g, "<br />")}</p>
      <p><a href="${appUrl}" style="color: #3e726a;">Visit TerminTacho</a></p>
    </div>
  `;

  const transport = getSmtpTransporter();
  return transport.sendMail({
    from: getFromAddress(),
    to,
    subject: finalSubject,
    text,
    html,
  });
}
