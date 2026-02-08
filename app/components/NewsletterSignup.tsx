"use client";

import { useState } from "react";
import TurnstileWidget from "./Turnstile";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setCaptchaError(null);

    if (siteKey && !turnstileToken) {
      setLoading(false);
      setCaptchaError("Please complete the CAPTCHA.");
      return;
    }

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to subscribe");

      setMessage({ type: "success", text: "✅ Successfully subscribed!" });
      setEmail("");
      setTurnstileToken("");
    } catch (error: any) {
      setMessage({ type: "error", text: `❌ ${error.message || "Error subscribing"}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "12px",
      padding: "40px 24px",
      textAlign: "center",
      color: "white",
    }}>
      <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
        📧 Stay Updated
      </h3>
      <p style={{ fontSize: "16px", marginBottom: "24px", opacity: 0.9 }}>
        Get notified when new processing time data is available
      </p>

      <form onSubmit={handleSubscribe} style={{ display: "flex", gap: "12px", maxWidth: "500px", margin: "0 auto" }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            background: "white",
            color: "#667eea",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </form>

      {siteKey && (
        <div style={{ marginTop: "16px" }}>
          <TurnstileWidget
            siteKey={siteKey}
            onVerify={setTurnstileToken}
            onExpire={() => setCaptchaError("CAPTCHA expired. Please try again.")}
            onError={() => setCaptchaError("CAPTCHA failed. Please try again.")}
          />
          {captchaError && (
            <p style={{ marginTop: "8px", fontSize: "13px", color: "#fee2e2" }}>
              {captchaError}
            </p>
          )}
        </div>
      )}

      {message && (
        <p style={{
          marginTop: "12px",
          fontSize: "14px",
          color: message.type === "success" ? "#d1fae5" : "#fee2e2",
        }}>
          {message.text}
        </p>
      )}
    </div>
  );
}
