import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getFromAddress() {
  return process.env.EMAIL_FROM || "TerminTacho <noreply@termintacho.de>";
}

export async function sendNewsletterConfirmation(to: string, confirmUrl: string) {
  const appUrl = process.env.APP_URL || "https://termintacho.de";
  return resend.emails.send({
    from: getFromAddress(),
    to,
    subject: "Please confirm your TerminTacho subscription",
    html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f1f5f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f4;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#3e726a 0%,#5c8f86 100%);padding:36px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">&#9201; TerminTacho</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px;">Community processing time tracker</div>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#0f172a;">You're almost in! &#127881;</h1>
            <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">
              Thank you for subscribing to <strong>TerminTacho</strong> updates. We'll keep you informed whenever new immigration processing time data is available for your city.
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
              Just one step to go — please confirm your email address by clicking the button below:
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
              <tr>
                <td style="background:linear-gradient(135deg,#3e726a 0%,#5c8f86 100%);border-radius:10px;">
                  <a href="${confirmUrl}" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
                    &#10003; Confirm my subscription
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Or copy and paste this link into your browser:</p>
            <p style="margin:0 0 28px;font-size:12px;color:#9ca3af;word-break:break-all;">${confirmUrl}</p>
            <div style="background:#f8faf9;border-left:4px solid #5c8f86;border-radius:0 8px 8px 0;padding:14px 16px;">
              <p style="margin:0;font-size:13px;color:#374151;line-height:1.6;">
                This confirmation link expires in <strong>24 hours</strong>. If you didn't subscribe, you can safely ignore this email.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8faf9;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#374151;">TerminTacho</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
              Community-driven immigration processing time data for Germany.<br/>
              <a href="${appUrl}" style="color:#5c8f86;text-decoration:none;">${appUrl}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    text: `You're almost in!\n\nThank you for subscribing to TerminTacho. Please confirm your email by visiting:\n\n${confirmUrl}\n\nThis link expires in 24 hours. If you didn't subscribe, you can safely ignore this email.\n\n— TerminTacho\n${appUrl}`,
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
