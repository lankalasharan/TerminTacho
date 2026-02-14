"use client";

import Link from "next/link";

export default function APIDocsPage() {
  return (
    <>
      <section className="tt-hero">
        <div className="tt-container" style={{ textAlign: "center" }}>
          <div className="tt-chip" style={{ margin: "0 auto" }}>
            API documentation
          </div>
          <h1 className="tt-hero-title">Build with TerminTacho.</h1>
          <p className="tt-hero-subtitle">
            Integrate real processing-time intelligence into your own tools.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" }}>
        {/* Base URL */}
        <section style={{ marginBottom: "60px" }}>
          <h2 style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "24px",
            color: "var(--tt-text)",
          }}>
            Base URL
          </h2>
          <div style={{
            background: "var(--tt-surface-muted)",
            padding: "16px 20px",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "14px",
            overflowX: "auto",
          }}>
            https://termintacho.com/api
          </div>
        </section>

        {/* Endpoints */}
        <section>
          <h2 style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "32px",
            color: "var(--tt-text)",
          }}>
            Endpoints
          </h2>

          <div style={{
            display: "grid",
            gap: "32px",
          }}>
            {/* Search Endpoint */}
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid var(--tt-border)",
            }}>
              <h3 style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "16px",
                color: "var(--tt-primary-strong)",
              }}>
                🔍 Search
              </h3>
              <div style={{
                background: "var(--tt-surface-muted)",
                padding: "12px 16px",
                borderRadius: "6px",
                fontFamily: "monospace",
                fontSize: "14px",
                marginBottom: "16px",
              }}>
                GET /search?q=query
              </div>
              <p style={{
                fontSize: "16px",
                color: "var(--tt-text-muted)",
                marginBottom: "16px",
              }}>
                Search cities, processes, FAQ pages, and content.
              </p>
              <div>
                <strong style={{ color: "var(--tt-text)" }}>Parameters:</strong>
                <ul style={{
                  fontSize: "14px",
                  color: "var(--tt-text-muted)",
                  lineHeight: 1.8,
                }}>
                  <li><code>q</code> (required): Search query string</li>
                </ul>
              </div>
              <div style={{
                background: "#f0f4ff",
                padding: "16px",
                borderRadius: "6px",
                marginTop: "16px",
                fontSize: "13px",
                color: "#4c51bf",
                fontFamily: "monospace",
              }}>
                curl "https://termintacho.com/api/search?q=munich"
              </div>
            </div>

            {/* Leaderboard Endpoint */}
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid var(--tt-border)",
            }}>
              <h3 style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "16px",
                color: "var(--tt-success)",
              }}>
                🏆 Leaderboard
              </h3>
              <div style={{
                background: "var(--tt-surface-muted)",
                padding: "12px 16px",
                borderRadius: "6px",
                fontFamily: "monospace",
                fontSize: "14px",
                marginBottom: "16px",
              }}>
                GET /leaderboard
              </div>
              <p style={{
                fontSize: "16px",
                color: "var(--tt-text-muted)",
                marginBottom: "16px",
              }}>
                Get top contributors and their statistics.
              </p>
              <div style={{
                background: "#f0fdf4",
                padding: "16px",
                borderRadius: "6px",
                marginTop: "16px",
                fontSize: "13px",
                color: "#047857",
                fontFamily: "monospace",
              }}>
                curl "https://termintacho.com/api/leaderboard"
              </div>
            </div>

            {/* Sitemap Endpoint */}
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid var(--tt-border)",
            }}>
              <h3 style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "16px",
                color: "#f59e0b",
              }}>
                🗺️ Sitemap
              </h3>
              <div style={{
                background: "var(--tt-surface-muted)",
                padding: "12px 16px",
                borderRadius: "6px",
                fontFamily: "monospace",
                fontSize: "14px",
                marginBottom: "16px",
              }}>
                GET /sitemap.xml
              </div>
              <p style={{
                fontSize: "16px",
                color: "var(--tt-text-muted)",
                marginBottom: "16px",
              }}>
                Get XML sitemap for search engine indexing.
              </p>
              <div style={{
                background: "#fef3c7",
                padding: "16px",
                borderRadius: "6px",
                marginTop: "16px",
                fontSize: "13px",
                color: "#92400e",
                fontFamily: "monospace",
              }}>
                curl "https://termintacho.com/api/sitemap.xml"
              </div>
            </div>

            {/* Newsletter Endpoint */}
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid var(--tt-border)",
            }}>
              <h3 style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "16px",
                color: "#ec4899",
              }}>
                📬 Newsletter
              </h3>
              <div style={{
                background: "var(--tt-surface-muted)",
                padding: "12px 16px",
                borderRadius: "6px",
                fontFamily: "monospace",
                fontSize: "14px",
                marginBottom: "16px",
              }}>
                POST /newsletter
              </div>
              <p style={{
                fontSize: "16px",
                color: "var(--tt-text-muted)",
                marginBottom: "16px",
              }}>
                Subscribe to the newsletter for updates.
              </p>
              <div>
                <strong style={{ color: "var(--tt-text)" }}>Request Body:</strong>
                <div style={{
                  background: "var(--tt-surface-muted)",
                  padding: "12px 16px",
                  borderRadius: "6px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  marginTop: "8px",
                  overflowX: "auto",
                }}>
                  {`{"email": "user@example.com"}`}
                </div>
              </div>
              <div style={{
                background: "#fce7f3",
                padding: "16px",
                borderRadius: "6px",
                marginTop: "16px",
                fontSize: "13px",
                color: "#831843",
                fontFamily: "monospace",
              }}>
                curl -X POST "https://termintacho.com/api/newsletter" \
                {"\n"}  -H "Content-Type: application/json" \
                {"\n"}  -d '{`{"email": "user@example.com"}`}'
              </div>
            </div>
          </div>
        </section>

        {/* Rate Limiting */}
        <section style={{ marginTop: "60px", paddingTop: "60px", borderTop: "2px solid var(--tt-border)" }}>
          <h2 style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "24px",
            color: "var(--tt-text)",
          }}>
            Rate Limiting
          </h2>
          <div style={{
            background: "#fff3cd",
            padding: "20px",
            borderRadius: "8px",
            borderLeft: "4px solid #f59e0b",
            color: "#92400e",
          }}>
            <strong>Rate Limit:</strong> 100 requests per minute per IP address
          </div>
        </section>

        {/* Support */}
        <section style={{ marginTop: "60px", paddingTop: "60px", borderTop: "2px solid var(--tt-border)" }}>
          <h2 style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "24px",
            color: "var(--tt-text)",
          }}>
            Support
          </h2>
          <p style={{
            fontSize: "16px",
            color: "var(--tt-text-muted)",
            marginBottom: "16px",
          }}>
            For issues or questions about the API, please contact us at{" "}
            <Link href="/contact" style={{ color: "var(--tt-primary-strong)", textDecoration: "none" }}>
              contact page
            </Link>
            .
          </p>
        </section>
      </main>
    </>
  );
}

