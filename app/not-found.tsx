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
          background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
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
          color: "var(--tt-text)",
          marginBottom: "16px",
        }}>
          Page Not Found
        </h1>
        
        <p style={{
          fontSize: "18px",
          color: "var(--tt-text-muted)",
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
              background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
              color: "white",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 700,
              textDecoration: "none",
              transition: "transform 0.2s, box-shadow 0.2s",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 16px rgba(28, 144, 216, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 11l9-8 9 8" />
              <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
            </svg>
            Go Home
          </Link>
          
          <Link
            href="/timelines"
            style={{
              padding: "14px 32px",
              background: "white",
              color: "var(--tt-primary-strong)",
              border: "2px solid var(--tt-primary-strong)",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 700,
              textDecoration: "none",
              transition: "transform 0.2s, background 0.2s",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = "var(--tt-surface-muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "white";
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 19h16" />
              <path d="M6 15l4-4 3 3 5-6" />
            </svg>
            Browse Timelines
          </Link>
        </div>

        {/* Helpful Links */}
        <div style={{ marginTop: "48px" }}>
          <p style={{ fontSize: "14px", color: "var(--tt-muted)", marginBottom: "16px" }}>
            Quick Links:
          </p>
          <div style={{
            display: "flex",
            gap: "24px",
            justifyContent: "center",
            flexWrap: "wrap",
            fontSize: "14px",
          }}>
            <Link href="/submit" style={{ color: "var(--tt-primary-strong)", textDecoration: "none" }}>
              Submit Timeline
            </Link>
            <Link href="/contact" style={{ color: "var(--tt-primary-strong)", textDecoration: "none" }}>
              Contact
            </Link>
            <Link href="/faq" style={{ color: "var(--tt-primary-strong)", textDecoration: "none" }}>
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}


