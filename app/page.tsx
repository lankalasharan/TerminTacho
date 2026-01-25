"use client";

import GermanyMap from "./components/GermanyMap";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const [showMap, setShowMap] = useState(false);
  const { data: session } = useSession();

  return (
    <>
      {/* Hero Section with Gradient Background */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "80px 20px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{
            fontSize: "56px",
            fontWeight: 800,
            marginBottom: "24px",
            lineHeight: 1.2,
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            Real Processing Times for<br/>German Bureaucracy
          </h1>
          <p style={{
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
          
          <div style={{
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
                fontSize: "18px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transition: "transform 0.2s, box-shadow 0.2s",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
            >
              📊 Browse Timelines
            </Link>
            
            <Link 
              href="/submit"
              style={{
                padding: "16px 32px",
                background: "rgba(255,255,255,0.2)",
                color: "white",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: 700,
                textDecoration: "none",
                border: "2px solid white",
                backdropFilter: "blur(10px)",
                transition: "transform 0.2s, background 0.2s",
                display: "inline-block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.background = "rgba(255,255,255,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
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
              74
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
              47
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
              100%
            </div>
            <div style={{ fontSize: "16px", color: "#6b7280", fontWeight: 600 }}>
              Anonymous
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
              Coverage across 74 German cities. From Berlin to Munich, Hamburg to Stuttgart. Find your local office.
            </p>
          </div>
        </div>

        {/* Interactive Map Section */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
          border: "1px solid #f3f4f6",
        }}>
          <div style={{
            padding: "40px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            textAlign: "center",
          }}>
            <h2 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "12px" }}>
              🗺️ Explore Offices on Map
            </h2>
            <p style={{ fontSize: "18px", opacity: 0.95, marginBottom: "24px", maxWidth: "600px", margin: "0 auto 24px" }}>
              Click on any city to see detailed statistics and processing time reports
            </p>
            <button
              onClick={() => setShowMap(!showMap)}
              style={{
                padding: "14px 32px",
                background: "white",
                color: "#667eea",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              }}
            >
              {showMap ? "Hide Map 🔼" : "Show Interactive Map 🔍"}
            </button>
          </div>

          {showMap && (
            <div>
              <GermanyMap />
              <div style={{
                padding: "20px",
                background: "#f9fafb",
                borderTop: "1px solid #e5e7eb",
                fontSize: "14px",
                color: "#6b7280",
                textAlign: "center"
              }}>
                💡 <strong>Tip:</strong> Click markers for details • Zoom in/out to explore • Hover for quick info
              </div>
            </div>
          )}
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
      </main>
    </>
  );
}
