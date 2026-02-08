"use client";

import GermanyMap from "./components/GermanyMap";
import NewsletterSignup from "./components/NewsletterSignup";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const [showMap, setShowMap] = useState(false);
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState({
    cities: 0,
    processes: 0,
    reports: 0,
    users: 0,
  });

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/metrics");
        const data = await res.json();
        setMetrics({
          cities: data.cities || 0,
          processes: data.processes || 0,
          reports: data.reports || 0,
          users: data.users || 0,
        });
      } catch (error) {
        console.error("Failed to load metrics:", error);
      }
    }

    loadMetrics();
  }, []);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .map-button {
            display: none !important;
          }
          .hero-section {
            padding: 32px 16px !important;
          }
          .hero-heading {
            font-size: 24px !important;
            margin-bottom: 16px !important;
          }
          .hero-text {
            font-size: 15px !important;
            margin-bottom: 24px !important;
          }
          .hero-buttons {
            gap: 12px !important;
          }
          .hero-buttons a {
            padding: 12px 20px !important;
            font-size: 14px !important;
          }
        }
        @media (max-width: 480px) {
          .map-button {
            display: none !important;
          }
          .hero-section {
            padding: 24px 12px !important;
          }
          .hero-heading {
            font-size: 20px !important;
            margin-bottom: 12px !important;
            line-height: 1.3 !important;
          }
          .hero-text {
            font-size: 13px !important;
            margin-bottom: 20px !important;
          }
          .hero-buttons {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .hero-buttons a {
            width: 100% !important;
            padding: 12px 16px !important;
            font-size: 13px !important;
            min-height: 44px !important;
          }
        }
      `}</style>
      {/* Floating Map Button - Hidden on mobile */}
      <button
        onClick={() => setShowMap(!showMap)}
        className="map-button"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 500,
          padding: "12px 20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
        }}
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ display: "block" }}
        >
          <path d="M12 2.5c-3.31 0-6 2.63-6 5.88 0 4.41 5.02 11.07 5.24 11.35a.95.95 0 0 0 1.52 0c.22-.28 5.24-6.94 5.24-11.35C18 5.13 15.31 2.5 12 2.5zm0 8.46a2.58 2.58 0 1 1 0-5.16 2.58 2.58 0 0 1 0 5.16z" />
          <path d="M3 21.5 10.2 18.5l3.8 1.6 7-3.2v-2l-7 3.2-3.8-1.6L3 19.5v2z" />
        </svg>
        {showMap ? "Hide Map" : "Search in Map"}
      </button>

      {/* Full Page Map Overlay */}
      {showMap && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            paddingTop: "80px",
          }}
          onClick={() => setShowMap(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1400px",
              maxHeight: "calc(90vh - 80px)",
              background: "white",
              borderRadius: "16px",
              padding: "20px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}>
                  <path d="M12 2.5c-3.31 0-6 2.63-6 5.88 0 4.41 5.02 11.07 5.24 11.35a.95.95 0 0 0 1.52 0c.22-.28 5.24-6.94 5.24-11.35C18 5.13 15.31 2.5 12 2.5zm0 8.46a2.58 2.58 0 1 1 0-5.16 2.58 2.58 0 0 1 0 5.16z" />
                  <path d="M3 21.5 10.2 18.5l3.8 1.6 7-3.2v-2l-7 3.2-3.8-1.6L3 19.5v2z" />
                </svg>
                Interactive City Map
              </h2>
              <button
                onClick={() => setShowMap(false)}
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ✕ Close
              </button>
            </div>
            <GermanyMap />
            <div style={{
              marginTop: "12px",
              padding: "12px",
              background: "#f9fafb",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#6b7280",
              textAlign: "center",
            }}>
              💡 Click on city markers to view processing time statistics and details
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Gradient Background */}
      <div className="hero-section" style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "60px 20px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 className="hero-heading" style={{
            fontSize: "56px",
            fontWeight: 800,
            marginBottom: "24px",
            lineHeight: 1.2,
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            Real Processing Times for<br/>German Bureaucracy
          </h1>
          <p className="hero-text" style={{
            fontSize: "22px",
            opacity: 0.95,
            lineHeight: 1.6,
            marginBottom: "40px",
            maxWidth: "700px",
            margin: "0 auto 40px",
          }}>
            Anonymous, crowdsourced timelines for visas, residence permits, and more. 
            Know what to expect. Plan your life with confidence.
          </p>
          
          <div className="hero-buttons" style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}>
            <Link 
              href="/timelines"
              style={{
                padding: "16px 32px",
                background: "white",
                color: "#667eea",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "48px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
              }}
            >
              📊 Browse Timelines
            </Link>
            
            <Link 
              href="/submit"
              style={{
                padding: "16px 32px",
                background: "rgba(255,255,255,0.15)",
                color: "white",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: 700,
                textDecoration: "none",
                border: "2px solid rgba(255,255,255,0.5)",
                backdropFilter: "blur(10px)",
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "48px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                e.currentTarget.style.border = "2px solid rgba(255,255,255,0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.border = "2px solid rgba(255,255,255,0.5)";
              }}
            >
              ✍️ Share Your Timeline
            </Link>
          </div>

          {/* Auth Status */}
          {!session && (
            <div style={{ marginTop: "24px" }}>
              <button
                onClick={() => signIn()}
                style={{
                  background: "transparent",
                  color: "white",
                  border: "none",
                  fontSize: "14px",
                  cursor: "pointer",
                  opacity: 0.8,
                  textDecoration: "underline",
                }}
              >
                Sign in to contribute
              </button>
            </div>
          )}
        </div>
      </div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" }}>
        {/* Stats Section */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px",
          marginBottom: "60px",
        }}>
          <div style={{
            background: "white",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            textAlign: "center",
            border: "1px solid #f3f4f6",
          }}>
            <div style={{ fontSize: "48px", fontWeight: 800, color: "#667eea", marginBottom: "8px" }}>
              {metrics.cities}
            </div>
            <div style={{ fontSize: "16px", color: "#6b7280", fontWeight: 600 }}>
              Cities Covered
            </div>
          </div>
          
          <div style={{
            background: "white",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            textAlign: "center",
            border: "1px solid #f3f4f6",
          }}>
            <div style={{ fontSize: "48px", fontWeight: 800, color: "#764ba2", marginBottom: "8px" }}>
              {metrics.processes}
            </div>
            <div style={{ fontSize: "16px", color: "#6b7280", fontWeight: 600 }}>
              Process Types
            </div>
          </div>
          
          <div style={{
            background: "white",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            textAlign: "center",
            border: "1px solid #f3f4f6",
          }}>
            <div style={{ fontSize: "48px", fontWeight: 800, color: "#10b981", marginBottom: "8px" }}>
              {metrics.reports}
            </div>
            <div style={{ fontSize: "16px", color: "#6b7280", fontWeight: 600 }}>
              Total Submissions
            </div>
          </div>

          <div style={{
            background: "white",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            textAlign: "center",
            border: "1px solid #f3f4f6",
          }}>
            <div style={{ fontSize: "48px", fontWeight: 800, color: "#0ea5e9", marginBottom: "8px" }}>
              {metrics.users}
            </div>
            <div style={{ fontSize: "16px", color: "#6b7280", fontWeight: 600 }}>
              Accounts
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "32px",
          marginBottom: "60px",
        }}>
          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            border: "1px solid #f3f4f6",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
            <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
              Real Data
            </h3>
            <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#6b7280" }}>
              Actual processing times from real applicants. No guesswork, no official estimates that never match reality.
            </p>
          </div>

          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            border: "1px solid #f3f4f6",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
            <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
              Completely Anonymous
            </h3>
            <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#6b7280" }}>
              Share your experience without worries. We don't store personal data. Authentication is only for verification.
            </p>
          </div>

          <div style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            border: "1px solid #f3f4f6",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌍</div>
            <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px", color: "#1a1a1a" }}>
              All Germany
            </h3>
            <p style={{ fontSize: "16px", lineHeight: 1.7, color: "#6b7280" }}>
              Coverage across {metrics.cities} German cities. From Berlin to Munich, Hamburg to Stuttgart. Find your local office.
            </p>
          </div>
        </div>

        {/* Testimonials Section */}
        <div style={{ marginTop: "80px" }}>
          <h2 style={{
            fontSize: "36px",
            fontWeight: 800,
            textAlign: "center",
            marginBottom: "16px",
            color: "#1a1a1a"
          }}>
            💬 What People Are Saying
          </h2>
          <p style={{
            fontSize: "18px",
            textAlign: "center",
            color: "#6b7280",
            marginBottom: "48px",
            maxWidth: "700px",
            margin: "0 auto 48px"
          }}>
            Real feedback from people who have used TerminTacho
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}>
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "1px solid #f3f4f6",
            }}>
              <div style={{ fontSize: "24px", marginBottom: "16px" }}>⭐⭐⭐⭐⭐</div>
              <p style={{
                fontSize: "16px",
                lineHeight: 1.7,
                color: "#374151",
                marginBottom: "16px",
                fontStyle: "italic"
              }}>
                "Finally! Real processing times instead of optimistic estimates. Helped me plan my life around the actual wait time in Berlin."
              </p>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#667eea" }}>
                Anonymous User • Berlin
              </div>
            </div>

            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "1px solid #f3f4f6",
            }}>
              <div style={{ fontSize: "24px", marginBottom: "16px" }}>⭐⭐⭐⭐⭐</div>
              <p style={{
                fontSize: "16px",
                lineHeight: 1.7,
                color: "#374151",
                marginBottom: "16px",
                fontStyle: "italic"
              }}>
                "Love that it's completely anonymous. I was comfortable sharing my timeline without worrying about data privacy."
              </p>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#667eea" }}>
                Anonymous User • Munich
              </div>
            </div>

            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "1px solid #f3f4f6",
            }}>
              <div style={{ fontSize: "24px", marginBottom: "16px" }}>⭐⭐⭐⭐⭐</div>
              <p style={{
                fontSize: "16px",
                lineHeight: 1.7,
                color: "#374151",
                marginBottom: "16px",
                fontStyle: "italic"
              }}>
                "Exactly what I needed! The crowdsourced data gave me realistic expectations. Way better than official websites."
              </p>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#667eea" }}>
                Anonymous User • Hamburg
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "60px 20px",
          marginTop: "80px",
          textAlign: "center",
        }}>
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{
              fontSize: "36px",
              fontWeight: 800,
              marginBottom: "16px",
            }}>
              📬 Stay Updated
            </h2>
            <p style={{
              fontSize: "18px",
              marginBottom: "40px",
              opacity: 0.95,
            }}>
              Get notified when new processing times are submitted for your city or process.
            </p>
            <NewsletterSignup />
          </div>
        </div>
      </main>
    </>
  );
}
