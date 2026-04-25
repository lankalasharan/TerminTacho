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

    const handleOpenSettings = () => {
      setShowBanner(true);
    };

    window.addEventListener("open-cookie-settings", handleOpenSettings);
    return () => {
      window.removeEventListener("open-cookie-settings", handleOpenSettings);
    };
  }, []);

  const handleAccept = async () => {
    localStorage.setItem("cookie-consent", "accepted");
    window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: "accepted" }));
    setShowBanner(false);
    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accepted" }),
      });
    } catch (error) {
      console.error("Consent log failed:", error);
    }
    window.location.reload();
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: "declined" }));
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 8v4"/>
              <path d="M12 16h.01"/>
            </svg>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--tt-text)", margin: 0 }}>
              We Use Cookies
            </h3>
          </div>
          <p style={{ fontSize: "14px", color: "var(--tt-text-muted)", lineHeight: 1.6, margin: 0 }}>
            We use essential cookies to keep you signed in and make our website work. Optional cookies help us improve your experience. 
            You can choose to accept or decline optional cookies. See our{" "}
            <a href="/cookies" style={{ color: "var(--tt-primary-strong)", textDecoration: "underline" }}>Cookie Policy</a> and{" "}
            <a href="/privacy" style={{ color: "var(--tt-primary-strong)", textDecoration: "underline" }}>Privacy Policy</a> for details.
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
              border: "2px solid var(--tt-border)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--tt-text-muted)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--tt-muted)";
              e.currentTarget.style.color = "var(--tt-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--tt-border)";
              e.currentTarget.style.color = "var(--tt-text-muted)";
            }}
          >
            Decline Optional
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
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
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(28, 144, 216, 0.4)";
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


