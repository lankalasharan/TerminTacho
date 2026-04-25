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

      setMessage({ type: "success", text: "Please check your email and confirm your subscription." });
      setEmail("");
      setTurnstileToken("");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Error subscribing" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tt-newsletter">
      <div className="tt-newsletter-header">
        <span className="tt-newsletter-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </span>
        <h3 className="tt-newsletter-title">Stay Updated</h3>
      </div>
      <p className="tt-newsletter-subtitle">
        Get notified when new processing time data is available
      </p>

      <form onSubmit={handleSubscribe} className="tt-newsletter-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="tt-newsletter-input"
        />
        <button
          type="submit"
          disabled={loading}
          className="tt-newsletter-button"
          style={{
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {loading ? "..." : "Subscribe"}
        </button>
      </form>

      {siteKey && (
        <div style={{ marginTop: "16px", minHeight: "65px" }}>
          <TurnstileWidget
            siteKey={siteKey}
            onVerify={setTurnstileToken}
            onExpire={() => setCaptchaError("CAPTCHA expired. Please try again.")}
            onError={() => setCaptchaError("CAPTCHA failed. Please try again.")}
          />
          {captchaError && (
            <p className="tt-newsletter-message" style={{ color: "#fee2e2" }}>
              {captchaError}
            </p>
          )}
        </div>
      )}

      {message && (
        <p
          className="tt-newsletter-message"
          style={{ color: message.type === "success" ? "#d1fae5" : "#fee2e2" }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

