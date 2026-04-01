"use client";

import { useState } from "react";
import TurnstileWidget from "../components/Turnstile";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setCaptchaError(null);

    if (siteKey && !turnstileToken) {
      setStatus("idle");
      setCaptchaError("Please complete the CAPTCHA.");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, turnstileToken }),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTurnstileToken("");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <>
      <section className="tt-hero">
        <div className="tt-container" style={{ textAlign: "center" }}>
          <div className="tt-chip" style={{ margin: "0 auto" }}>
            Contact
          </div>
          <h1 className="tt-hero-title">Talk to us.</h1>
          <p className="tt-hero-subtitle">
            Have questions, feedback, or suggestions? We would love to hear from you.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 20px" }}>
        <div style={{
          background: "white",
          padding: "48px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid var(--tt-surface-muted)",
        }}>
          {status === "success" ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
            }}>
              <div style={{ fontSize: "64px", marginBottom: "24px" }}>✅</div>
              <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "12px", color: "var(--tt-text)" }}>
                Message Sent Successfully!
              </h2>
              <p style={{ fontSize: "16px", color: "var(--tt-text-muted)", marginBottom: "24px" }}>
                Thank you for contacting us. We'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setStatus("idle")}
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--tt-text-strong)"
                }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px",
                    border: "2px solid var(--tt-border)",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--tt-primary-strong)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "var(--tt-border)"}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--tt-text-strong)"
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px",
                    border: "2px solid var(--tt-border)",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--tt-primary-strong)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "var(--tt-border)"}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--tt-text-strong)"
                }}>
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px",
                    border: "2px solid var(--tt-border)",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--tt-primary-strong)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "var(--tt-border)"}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--tt-text-strong)"
                }}>
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "14px",
                    border: "2px solid var(--tt-border)",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--tt-primary-strong)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "var(--tt-border)"}
                />
              </div>

              {status === "error" && (
                <div style={{
                  padding: "12px",
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "8px",
                  marginBottom: "24px",
                  fontSize: "14px",
                }}>
                  ❌ Failed to send message. Please try again later.
                </div>
              )}

              {siteKey && (
                <div style={{ marginBottom: "16px" }}>
                  <TurnstileWidget
                    siteKey={siteKey}
                    onVerify={setTurnstileToken}
                    onExpire={() => setCaptchaError("CAPTCHA expired. Please try again.")}
                    onError={() => setCaptchaError("CAPTCHA failed. Please try again.")}
                  />
                  {captchaError && (
                    <div style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "#991b1b",
                    }}>
                      {captchaError}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: status === "sending" ? "var(--tt-muted)" : "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "18px",
                  fontWeight: 700,
                  cursor: status === "sending" ? "not-allowed" : "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (status !== "sending") {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(28, 144, 216, 0.4)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>

              <p style={{
                marginTop: "16px",
                fontSize: "12px",
                color: "var(--tt-muted)",
                textAlign: "center",
              }}>
                By submitting this form, you agree to our Privacy Policy and Terms of Service.
              </p>
            </form>
          )}
        </div>

        {/* Additional Contact Info */}
        <div style={{
          marginTop: "48px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px",
        }}>
          <div style={{
            padding: "32px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid var(--tt-surface-muted)",
            textAlign: "center",
          }}>
            <div style={{ marginBottom: "12px", color: "var(--tt-primary-strong)" }} aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--tt-text)" }}>
              Email
            </h3>
            <p style={{ fontSize: "14px", color: "var(--tt-text-muted)" }}>
              termintacho@gmail.com
            </p>
          </div>

          <div style={{
            padding: "32px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid var(--tt-surface-muted)",
            textAlign: "center",
          }}>
            <div style={{ marginBottom: "12px", color: "var(--tt-primary-strong)" }} aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="7" />
                <path d="M12 13V9" />
                <path d="M9 3h6" />
                <path d="M16.5 6.5l1.5-1.5" />
              </svg>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--tt-text)" }}>
              Response Time
            </h3>
            <p style={{ fontSize: "14px", color: "var(--tt-text-muted)" }}>
              Within 2-3 business days
            </p>
          </div>

          <div style={{
            padding: "32px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid var(--tt-surface-muted)",
            textAlign: "center",
          }}>
            <div style={{ marginBottom: "12px", color: "var(--tt-primary-strong)" }} aria-hidden="true">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3c3.7 0 7 3 7 7 0 4.4-4.3 8.6-6.3 10.4a1.1 1.1 0 0 1-1.4 0C9.3 18.6 5 14.4 5 10c0-4 3.3-7 7-7z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "var(--tt-text)" }}>
              Location
            </h3>
            <p style={{ fontSize: "14px", color: "var(--tt-text-muted)" }}>
              Based in Germany
            </p>
          </div>
        </div>
      </main>
    </>
  );
}


