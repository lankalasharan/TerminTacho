import { Resend } from "resend";
import type { SendVerificationRequestParams } from "next-auth/providers/email";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationRequest({
  identifier,
  url,
  provider,
}: SendVerificationRequestParams) {
  // identifier = user's email
  // url = verification link
  // provider = provider config
  const { host } = new URL(url);
  await resend.emails.send({
    from: "noreply@termintacho.de",
    to: identifier,
    subject: `Sign in to ${host}`,
    html: `<p>Sign in as <strong>${identifier}</strong></p><p><a href="${url}">Click here to sign in</a></p><p>If you did not request this email, you can safely ignore it.</p>`
  });
}
