"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      background: "#1a1a1a",
      color: "white",
      padding: "60px 20px 30px",
      marginTop: "80px",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "40px",
          marginBottom: "40px",
        }}>
          {/* About Section */}
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
              TerminTacho
            </h3>
            <p style={{ fontSize: "14px", color: "#9ca3af", lineHeight: 1.7, marginBottom: "16px" }}>
              Real, anonymous processing times for German bureaucracy. Crowdsourced by the community, for the community.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              {/* Trust Badges */}
              <div style={{
                padding: "8px 12px",
                background: "#10b981",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}>
                🔒 GDPR
              </div>
              <div style={{
                padding: "8px 12px",
                background: "#667eea",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}>
                ✓ Anonymous
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
              Quick Links
            </h3>
            <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link href="/" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}>
                Home
              </Link>
              <Link href="/timelines" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}>
                Browse Timelines
              </Link>
              <Link href="/submit" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}>
                Submit Timeline
              </Link>
              <Link href="/contact" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}>
                Contact Us
              </Link>
              <Link href="/faq" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}>
                FAQ
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
              Legal
            </h3>
            <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link href="/privacy" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}>
                Privacy Policy
              </Link>
              <Link href="/terms" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}>
                Terms of Service
              </Link>
              <Link href="/cookies" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}>
                Cookie Policy
              </Link>
              <Link href="/imprint" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "white"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}>
                Imprint
              </Link>
            </nav>
          </div>

          {/* Community */}
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
              Community
            </h3>
            <p style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "16px" }}>
              Help others by sharing your timeline experience.
            </p>
            <Link 
              href="/submit"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              Contribute Now
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: "1px solid #374151",
          paddingTop: "30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}>
          <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>
            © 2026 TerminTacho. All rights reserved. Made with ❤️ for the community.
          </p>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>Made in Germany 🇩🇪</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
