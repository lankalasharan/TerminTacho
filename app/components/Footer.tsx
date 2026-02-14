"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="tt-footer">
      <div className="tt-container">
        <div className="tt-footer-grid">
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "12px" }}>TerminTacho</h3>
            <p
              style={{
                fontSize: "14px",
                color: "var(--tt-text-muted)",
                lineHeight: 1.7,
                marginBottom: "16px",
              }}
            >
              Real, anonymous processing times for German bureaucracy. Crowdsourced by the community, for the community.
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span className="tt-pill">GDPR</span>
              <span className="tt-pill">Anonymous</span>
            </div>
          </div>

          <div>
            <h4>Platform</h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/" style={{ color: "var(--tt-text-muted)", textDecoration: "none" }}>
                Home
              </Link>
              <Link href="/timelines" style={{ color: "var(--tt-text-muted)", textDecoration: "none" }}>
                Browse Timelines
              </Link>
              <Link href="/submit" style={{ color: "var(--tt-text-muted)", textDecoration: "none" }}>
                Submit Timeline
              </Link>
              <Link href="/offices" style={{ color: "var(--tt-text-muted)", textDecoration: "none" }}>
                Offices
              </Link>
            </nav>
          </div>

          <div>
            <h4>Company</h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/blog" style={{ color: "var(--tt-text-muted)", textDecoration: "none" }}>
                Blog
              </Link>
              <Link href="/contact" style={{ color: "var(--tt-text-muted)", textDecoration: "none" }}>
                Contact
              </Link>
              <Link href="/faq" style={{ color: "var(--tt-text-muted)", textDecoration: "none" }}>
                FAQ
              </Link>
              <Link href="/leaderboard" style={{ color: "var(--tt-text-muted)", textDecoration: "none" }}>
                Leaderboard
              </Link>
            </nav>
          </div>

          <div>
            <h4>Legal</h4>
            <nav style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/privacy" style={{ color: "var(--tt-text-muted)", textDecoration: "none" }}>
                Privacy Policy
              </Link>
              <Link href="/terms" style={{ color: "var(--tt-text-muted)", textDecoration: "none" }}>
                Terms of Service
              </Link>
              <Link href="/cookies" style={{ color: "var(--tt-text-muted)", textDecoration: "none" }}>
                Cookie Policy
              </Link>
              <Link href="/imprint" style={{ color: "var(--tt-text-muted)", textDecoration: "none" }}>
                Imprint
              </Link>
            </nav>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--tt-border)",
            marginTop: "32px",
            paddingTop: "24px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "12px",
            fontSize: "12px",
            color: "var(--tt-text-muted)",
          }}
        >
          <span>© 2026 TerminTacho. Making bureaucracy transparent.</span>
          <span>Made in Germany 🇩🇪</span>
        </div>
      </div>
    </footer>
  );
}
