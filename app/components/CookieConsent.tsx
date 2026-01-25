"use client";

import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "white",
      boxShadow: "0 -4px 12px rgba(0,0,0,0.15)",
      padding: "24px",
      zIndex: 9999,
      animation: "slideUp 0.3s ease",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "24px",
        flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <span style={{ fontSize: "24px" }}>🍪</span>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
              We Use Cookies
            </h3>
          </div>
          <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.6, margin: 0 }}>
            We use essential cookies to keep you signed in and make our website work. Optional cookies help us improve your experience. 
            You can choose to accept or decline optional cookies. See our{" "}
            <a href="/cookies" style={{ color: "#667eea", textDecoration: "underline" }}>Cookie Policy</a> and{" "}
            <a href="/privacy" style={{ color: "#667eea", textDecoration: "underline" }}>Privacy Policy</a> for details.
          </p>
        </div>
        
        <div style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}>
          <button
            onClick={handleDecline}
            style={{
              padding: "12px 24px",
              background: "white",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#9ca3af";
              e.currentTarget.style.color = "#1a1a1a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            Decline Optional
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "white",
              cursor: "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Accept All Cookies
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
