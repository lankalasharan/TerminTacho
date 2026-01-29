"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "60px 20px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: 800,
            marginBottom: "16px",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            📧 Contact Us
          </h1>
          <p style={{
            fontSize: "20px",
            opacity: 0.95,
          }}>
            Have questions, feedback, or suggestions? We'd love to hear from you!
          </p>
        </div>
      </div>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 20px" }}>
        <div style={{
          background: "white",
          padding: "48px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid #f3f4f6",
        }}>
          {status === "success" ? (
            <div style={{
              textAlign: "center",
              padding: "40px 20px",
            }}>
              <div style={{ fontSize: "64px", marginBottom: "24px" }}>✅</div>
              <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
                Message Sent Successfully!
              </h2>
              <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "24px" }}>
                Thank you for contacting us. We'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setStatus("idle")}
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                  color: "#374151"
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
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151"
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
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151"
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
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151"
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
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "16px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
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

              <button
                type="submit"
                disabled={status === "sending"}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: status === "sending" ? "#9ca3af" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(102, 126, 234, 0.4)";
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
                color: "#9ca3af",
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
            border: "1px solid #f3f4f6",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📧</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#1a1a1a" }}>
              Email
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              lankalasharan@gmail.com
            </p>
          </div>

          <div style={{
            padding: "32px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #f3f4f6",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>⏱️</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#1a1a1a" }}>
              Response Time
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              Within 2-3 business days
            </p>
          </div>

          <div style={{
            padding: "32px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #f3f4f6",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🇩🇪</div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#1a1a1a" }}>
              Location
            </h3>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              Based in Germany
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
