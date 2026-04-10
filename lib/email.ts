import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getFromAddress() {
  return process.env.EMAIL_FROM || "TerminTacho <noreply@termintacho.de>";
}

export async function sendNewsletterConfirmation(to: string, confirmUrl: string) {
  return resend.emails.send({
    from: getFromAddress(),
    to,
    subject: "Confirm your TerminTacho newsletter subscription",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2 style="margin: 0 0 12px;">Confirm your subscription</h2>
        <p>Please confirm your newsletter subscription to start receiving updates.</p>
        <p><a href="${confirmUrl}" style="color: #3e726a;">Confirm subscription</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
    text: `Please confirm your newsletter subscription by clicking this link:\n\n${confirmUrl}\n\nIf you did not request this, you can ignore this email.`,
  });
}

export async function sendNewsletterUpdate(to: string, message: string, subject?: string) {
  const appUrl = process.env.APP_URL || "https://termintacho.de";
  return resend.emails.send({
    from: getFromAddress(),
    to,
    subject: subject || "TerminTacho update",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <p>${message.replace(/\n/g, "<br />")}</p>
        <p><a href="${appUrl}" style="color: #3e726a;">Visit TerminTacho</a></p>
      </div>
    `,
    text: `${message}\n\nVisit: ${appUrl}`,
  });
}
