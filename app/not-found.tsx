"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{
      minHeight: "70vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{ textAlign: "center", maxWidth: "600px" }}>
        <div style={{
          fontSize: "120px",
          fontWeight: 800,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "24px",
        }}>
          404
        </div>
        
        <h1 style={{
          fontSize: "36px",
          fontWeight: 700,
          color: "#1a1a1a",
          marginBottom: "16px",
        }}>
          Page Not Found
        </h1>
        
        <p style={{
          fontSize: "18px",
          color: "#6b7280",
          lineHeight: 1.7,
          marginBottom: "32px",
        }}>
          Looks like you've wandered into uncharted territory. The page you're looking for doesn't exist or has been moved.
        </p>

        <div style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}>
          <Link
            href="/"
            style={{
              padding: "14px 32px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 700,
              textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            🏠 Go Home
          </Link>
          
          <Link
            href="/timelines"
            style={{
              padding: "14px 32px",
              background: "white",
              color: "#667eea",
              border: "2px solid #667eea",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 700,
              textDecoration: "none",
              transition: "transform 0.2s, background 0.2s",
              display: "inline-block",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "white";
            }}
          >
            📊 Browse Timelines
          </Link>
        </div>

        {/* Helpful Links */}
        <div style={{ marginTop: "48px" }}>
          <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "16px" }}>
            Quick Links:
          </p>
          <div style={{
            display: "flex",
            gap: "24px",
            justifyContent: "center",
            flexWrap: "wrap",
            fontSize: "14px",
          }}>
            <Link href="/submit" style={{ color: "#667eea", textDecoration: "none" }}>
              Submit Timeline
            </Link>
            <Link href="/contact" style={{ color: "#667eea", textDecoration: "none" }}>
              Contact
            </Link>
            <Link href="/faq" style={{ color: "#667eea", textDecoration: "none" }}>
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
