"use client";

import Link from "next/link";

export default function APIDocsPage() {
  return (
    <>
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "60px 20px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: 800,
            marginBottom: "24px",
          }}>
            📚 API Documentation
          </h1>
          <p style={{
            fontSize: "20px",
            opacity: 0.9,
          }}>
            Build with TerminTacho
          </p>
        </div>
      </div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" }}>
        {/* Base URL */}
        <section style={{ marginBottom: "60px" }}>
          <h2 style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "24px",
            color: "#1a1a1a",
          }}>
            Base URL
          </h2>
          <div style={{
            background: "#f3f4f6",
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
            color: "#1a1a1a",
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
              border: "1px solid #e5e7eb",
            }}>
              <h3 style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "16px",
                color: "#667eea",
              }}>
                🔍 Search
              </h3>
              <div style={{
                background: "#f3f4f6",
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
                color: "#6b7280",
                marginBottom: "16px",
              }}>
                Search cities, processes, FAQ pages, and content.
              </p>
              <div>
                <strong style={{ color: "#1a1a1a" }}>Parameters:</strong>
                <ul style={{
                  fontSize: "14px",
                  color: "#6b7280",
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
              border: "1px solid #e5e7eb",
            }}>
              <h3 style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "16px",
                color: "#10b981",
              }}>
                🏆 Leaderboard
              </h3>
              <div style={{
                background: "#f3f4f6",
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
                color: "#6b7280",
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
              border: "1px solid #e5e7eb",
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
                background: "#f3f4f6",
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
                color: "#6b7280",
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
              border: "1px solid #e5e7eb",
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
                background: "#f3f4f6",
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
                color: "#6b7280",
                marginBottom: "16px",
              }}>
                Subscribe to the newsletter for updates.
              </p>
              <div>
                <strong style={{ color: "#1a1a1a" }}>Request Body:</strong>
                <div style={{
                  background: "#f3f4f6",
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
        <section style={{ marginTop: "60px", paddingTop: "60px", borderTop: "2px solid #e5e7eb" }}>
          <h2 style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "24px",
            color: "#1a1a1a",
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
        <section style={{ marginTop: "60px", paddingTop: "60px", borderTop: "2px solid #e5e7eb" }}>
          <h2 style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "24px",
            color: "#1a1a1a",
          }}>
            Support
          </h2>
          <p style={{
            fontSize: "16px",
            color: "#6b7280",
            marginBottom: "16px",
          }}>
            For issues or questions about the API, please contact us at{" "}
            <Link href="/contact" style={{ color: "#667eea", textDecoration: "none" }}>
              contact page
            </Link>
            .
          </p>
        </section>
      </main>
    </>
  );
}
