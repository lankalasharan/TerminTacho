"use client";

import GermanyMap from "./components/GermanyMap";
import NewsletterSignup from "./components/NewsletterSignup";
import OdometerNumber from "./components/OdometerNumber";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { normalizeProcessLabel } from "@/lib/processLabels";

export default function Home() {
  const [showMap, setShowMap] = useState(false);
  const { data: session } = useSession();
  const [metrics, setMetrics] = useState({
    cities: 0,
    processes: 0,
    reports: 0,
    users: 0,
  });
  const [predictProcessId, setPredictProcessId] = useState("");
  const [processTypes, setProcessTypes] = useState<{ id: string; name: string }[]>([]);

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

  useEffect(() => {
    async function loadProcessTypes() {
      try {
        const res = await fetch("/api/options");
        const data = await res.json();
        setProcessTypes(data.processTypes || []);
      } catch { /* non-fatal */ }
    }
    loadProcessTypes();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("map") === "1") {
      setShowMap(true);
    }
  }, []);

  return (
    <>
      {/* Floating Map Button */}
      <button
        onClick={() => setShowMap(!showMap)}
        className="map-button"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 500,
          padding: "12px 20px",
          background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: "999px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 10px 24px rgba(47, 183, 178, 0.35)",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 14px 28px rgba(47, 183, 178, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 10px 24px rgba(47, 183, 178, 0.35)";
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
        {showMap ? "Hide Map" : "Explore Map"}
      </button>

      {/* Full Page Map Overlay */}
      {showMap && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 16, 20, 0.7)",
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
              background: "var(--tt-surface)",
              borderRadius: "20px",
              padding: "20px",
              position: "relative",
              border: "1px solid var(--tt-border)",
              boxShadow: "var(--tt-shadow)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--tt-text)",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                Data Points Map
              </h2>
              <button
                onClick={() => setShowMap(false)}
                style={{
                  background: "var(--tt-surface-muted)",
                  border: "none",
                  borderRadius: "999px",
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--tt-text-muted)",
                }}
              >
                Close
              </button>
            </div>
            <GermanyMap />
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "var(--tt-surface-soft)",
                borderRadius: "10px",
                fontSize: "13px",
                color: "var(--tt-text-muted)",
                textAlign: "center",
              }}
            >
              Click on city markers to view processing time statistics and details.
            </div>
          </div>
        </div>
      )}

      <section className="tt-hero">
        <div className="tt-container" style={{ textAlign: "center" }}>
          <div className="tt-chip" style={{ margin: "0 auto" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "var(--tt-primary-strong)" }} />
            Live data from {metrics.cities || 0} cities
          </div>
          <h1 className="tt-hero-title">
            Navigating <br />
            <em>Bureaucracy</em>, together.
          </h1>
          <p className="tt-hero-subtitle">
            Real processing speeds for German offices, powered by people like you. Stop guessing and plan your next steps with confidence.
          </p>
          <div className="tt-hero-actions">
            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="tt-btn-primary"
            >
              Explore Heatmap
              <span aria-hidden="true">→</span>
            </button>
            <Link href="/timelines" className="tt-btn-ghost">
              View Reports
            </Link>
            <Link href="/submit" className="tt-btn-ghost">
              Submit Timeline
            </Link>
          </div>
          {!session && (
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={() => signIn()}
                style={{
                  background: "transparent",
                  color: "var(--tt-text-muted)",
                  border: "none",
                  fontSize: "14px",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Sign in to contribute
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="tt-section">
        <div className="tt-container">
          <div className="tt-stat-grid">
            <div className="tt-stat-card">
              <h3>Cities Covered</h3>
              <strong style={{ display: "block", lineHeight: 1 }}>
                <OdometerNumber value={metrics.cities} delay={0} />
              </strong>
              <div style={{ marginTop: "8px", color: "var(--tt-text-muted)", fontSize: "14px" }}>Live offices nationwide</div>
            </div>
            <div className="tt-stat-card">
              <h3>Process Types</h3>
              <strong style={{ display: "block", lineHeight: 1 }}>
                <OdometerNumber value={metrics.processes} delay={150} />
              </strong>
              <div style={{ marginTop: "8px", color: "var(--tt-text-muted)", fontSize: "14px" }}>Visas, permits, more</div>
            </div>
            <div className="tt-stat-card">
              <h3>Reports Today</h3>
              <strong style={{ display: "block", lineHeight: 1 }}>
                <OdometerNumber value={metrics.reports} delay={300} />
              </strong>
              <div style={{ marginTop: "8px", color: "var(--tt-text-muted)", fontSize: "14px" }}>Community updates</div>
            </div>
            <div className="tt-stat-card">
              <h3>Contributors</h3>
              <strong style={{ display: "block", lineHeight: 1 }}>
                <OdometerNumber value={metrics.users} delay={450} />
              </strong>
              <div style={{ marginTop: "8px", color: "var(--tt-text-muted)", fontSize: "14px" }}>Anonymous members</div>
            </div>
          </div>
        </div>
      </section>

      {/* Predictor Widget */}
      <section className="tt-section" style={{ paddingTop: 0 }}>
        <div className="tt-container">
          <div style={{
            background: "linear-gradient(135deg, #1a3a5c 0%, #1e4976 100%)",
            borderRadius: "20px",
            padding: "clamp(24px, 4vw, 48px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "32px",
            flexWrap: "wrap",
          }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: 700, marginBottom: "14px", border: "1px solid rgba(255,255,255,0.15)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
                Community-powered estimator
              </div>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 800, color: "white", lineHeight: 1.2, margin: "0 0 10px" }}>Predict your wait time</h2>
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "15px", margin: 0, lineHeight: 1.6 }}>
                Pick your process type and see how long others have waited — based on real community reports.
              </p>
            </div>
            <div style={{ flex: 1, minWidth: "260px", maxWidth: "400px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ position: "relative" }}>
                  <select
                    value={predictProcessId}
                    onChange={(e) => setPredictProcessId(e.target.value)}
                    style={{ width: "100%", padding: "13px 16px", paddingRight: "36px", borderRadius: "10px", border: "none", fontSize: "14px", fontWeight: 600, color: predictProcessId ? "#111827" : "#9ca3af", background: "white", appearance: "none", cursor: "pointer" }}
                  >
                    <option value="">Select your process type…</option>
                    {processTypes.map((p) => (
                      <option key={p.id} value={p.id}>{normalizeProcessLabel(p.name)}</option>
                    ))}
                  </select>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </div>
                <Link
                  href={predictProcessId ? `/predict?processTypeId=${predictProcessId}` : "/predict"}
                  style={{
                    textAlign: "center",
                    textDecoration: "none",
                    padding: "13px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "15px",
                    transition: "all 0.2s",
                    background: predictProcessId ? "white" : "rgba(255,255,255,0.25)",
                    color: predictProcessId ? "#1a3a5c" : "rgba(255,255,255,0.8)",
                  }}
                >
                  {predictProcessId ? "See my wait time →" : "Open predictor →"}
                </Link>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: "10px 0 0", textAlign: "center" }}>Anonymous · No sign-in required</p>
            </div>
          </div>
        </div>
      </section>

      <section className="tt-section">
        <div className="tt-container">
          <div className="tt-feature-grid">
            <div>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: "24px" }}>
                Crowdsourced transparency for everyone.
              </h2>
              <div style={{ display: "grid", gap: "20px" }}>
                <div className="tt-feature-item">
                  <div className="tt-feature-icon" aria-hidden="true">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2.46 12C3.73 7.94 7.52 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-5.06 7-9.54 7s-8.27-2.94-9.54-7z" />
                      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "18px" }}>Full Transparency</h4>
                    <p style={{ margin: 0, color: "var(--tt-text-muted)" }}>
                      See real-time data for wait times and appointment availability across Germany.
                    </p>
                  </div>
                </div>
                <div className="tt-feature-item">
                  <div className="tt-feature-icon" aria-hidden="true">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3v18h18" />
                      <path d="M7 14l3-3 4 4 5-6" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "18px" }}>Smart Predictions</h4>
                    <p style={{ margin: 0, color: "var(--tt-text-muted)" }}>
                      Weighted averages and relevance scoring highlight the most reliable timelines.
                    </p>
                  </div>
                </div>
                <div className="tt-feature-item">
                  <div className="tt-feature-icon" aria-hidden="true">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m11 17 2 2a2 2 0 0 0 3-3" />
                      <path d="m8 12 2 2a2 2 0 1 0 3-3" />
                      <path d="m5 7 2 2a2 2 0 1 0 3-3" />
                      <path d="m18 19 2-2" />
                      <path d="m22 15-6-6" />
                      <path d="m16 9-2 2" />
                      <path d="M2 7l6 6" />
                      <path d="m6 11 2-2" />
                    </svg>
                  </div>
                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "18px" }}>Help Others</h4>
                    <p style={{ margin: 0, color: "var(--tt-text-muted)" }}>
                      A quick 30-second report can save someone else weeks of uncertainty.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="tt-glass" style={{ borderRadius: "20px", padding: "16px" }}>
              <div style={{ height: "420px", borderRadius: "16px", overflow: "hidden" }}>
                <GermanyMap />
              </div>
              <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--tt-text-muted)" }}>
                Interactive map powered by live community submissions.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tt-section">
        <div className="tt-container">
          <div className="tt-cta" style={{ textAlign: "center" }}>
            <h2>Ready to make an impact?</h2>
            <p className="tt-cta-subtitle" style={{ maxWidth: "640px", margin: "0 auto 28px" }}>
              Your data contribution helps thousands of fellow citizens navigate the maze of public services.
            </p>
            <div className="tt-hero-actions" style={{ justifyContent: "center" }}>
              <Link href="/submit" className="tt-btn-primary">
                Submit Your Report
              </Link>
              <Link href="/faq" className="tt-btn-ghost">
                Learn How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="tt-section-tight">
        <div className="tt-container">
          <NewsletterSignup />
        </div>
      </section>
    </>
  );
}
