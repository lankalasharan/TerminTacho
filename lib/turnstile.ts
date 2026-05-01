type TurnstileVerifyResponse = {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
};

export type TurnstileVerificationResult = {
  success: boolean;
  skipped?: boolean;
  errorCodes?: string[];
};

export async function verifyTurnstileToken(
  token: string | null | undefined,
  ipAddress?: string | null
): Promise<TurnstileVerificationResult> {
  // Always bypass CAPTCHA in non-production environments
  if (process.env.NODE_ENV !== "production") {
    return { success: true, skipped: true };
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { success: false, errorCodes: ["missing-secret"] };
  }

  if (!token) {
    return { success: false, errorCodes: ["missing-input-response"] };
  }

  const body = new URLSearchParams();
  body.append("secret", secret);
  body.append("response", token);
  if (ipAddress) body.append("remoteip", ipAddress);

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      return { success: false, errorCodes: ["siteverify-failed"] };
    }

    const data = (await res.json()) as TurnstileVerifyResponse;
    return { success: Boolean(data.success), errorCodes: data["error-codes"] };
  } catch {
    return { success: false, errorCodes: ["siteverify-exception"] };
  }
}
