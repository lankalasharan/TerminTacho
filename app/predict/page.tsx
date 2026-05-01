"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Office = { id: string; city: string; name: string };
type ProcessType = { id: string; name: string };

interface Prediction {
  min: number | null;
  max: number | null;
  median: number | null;
  count: number;
  verifiedCount: number;
  confidence: "low" | "medium" | "high";
  sentimentBreakdown: { fast: number; average: number; slow: number };
  sentimentOnly?: boolean;
}

function normalizeProcessLabel(label: string): string {
  return label
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const CONFIDENCE_CONFIG = {
  low: { label: "Low confidence", color: "#9ca3af", bg: "#f3f4f6", description: "Based on fewer than 4 reports" },
  medium: { label: "Medium confidence", color: "#d97706", bg: "#fffbeb", description: "Based on 4–9 reports" },
  high: { label: "High confidence", color: "#059669", bg: "#ecfdf5", description: "Based on 10+ reports" },
};

export default function PredictPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [officeId, setOfficeId] = useState("");
  const [processTypeId, setProcessTypeId] = useState("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/options");
      const data = await res.json();
      setOffices(data.offices || []);
      setProcessTypes(data.processTypes || []);
    }
    load();
  }, []);

  async function handlePredict() {
    if (!processTypeId) return;
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const params = new URLSearchParams({ processTypeId });
      if (officeId) params.set("officeId", officeId);
      const res = await fetch(`/api/predict?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not load prediction.");
      setPrediction(data);
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const confidenceCfg = prediction ? CONFIDENCE_CONFIG[prediction.confidence] : null;
  const totalSentiment = prediction ? (prediction.sentimentBreakdown.fast + prediction.sentimentBreakdown.average + prediction.sentimentBreakdown.slow) : 0;

  return (
    <>
      <section style={{ background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)", padding: "56px 0 48px", textAlign: "center" }}>
        <div className="tt-container">
          <div className="tt-chip" style={{ margin: "0 auto 16px", background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}>
            Community-powered estimates
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, color: "white", marginBottom: "12px", lineHeight: 1.2 }}>
            Wait Time Predictor
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.85)", maxWidth: "520px", margin: "0 auto" }}>
            Estimate how long your immigration process might take based on real community reports.
          </p>
        </div>
      </section>

      <main className="tt-section" style={{ minHeight: "60vh" }}>
        <div className="tt-container" style={{ maxWidth: "680px" }}>
          <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "1px solid var(--tt-border)", overflow: "hidden" }}>
            <div style={{ padding: "28px 28px 0" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "#111827" }}>Choose your process</h2>
              <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr 1fr" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Process Type <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <div className="tt-select-wrap">
                    <select
                      value={processTypeId}
                      onChange={(e) => setProcessTypeId(e.target.value)}
                      className="tt-submit-input tt-submit-select"
                    >
                      <option value="">Select process…</option>
                      {processTypes.map((p) => (
                        <option key={p.id} value={p.id}>{normalizeProcessLabel(p.name)}</option>
                      ))}
                    </select>
                    <span className="tt-select-caret" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    City <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <div className="tt-select-wrap">
                    <select
                      value={officeId}
                      onChange={(e) => setOfficeId(e.target.value)}
                      className="tt-submit-input tt-submit-select"
                    >
                      <option value="">All cities</option>
                      {offices.map((o) => (
                        <option key={o.id} value={o.id}>{o.city}</option>
                      ))}
                    </select>
                    <span className="tt-select-caret" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handlePredict}
                disabled={!processTypeId || loading}
                className="tt-btn-primary"
                style={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "13px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: (!processTypeId || loading) ? "not-allowed" : "pointer",
                  opacity: (!processTypeId || loading) ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? (
                  <><span className="tt-submit-spinner" aria-hidden="true" /> Calculating...</>
                ) : (
                  <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg>
                    Predict wait time</>
                )}
              </button>
            </div>

            {error && (
              <div style={{ margin: "20px 28px 0", padding: "12px 16px", background: "#fee2e2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", color: "#991b1b" }}>
                {error}
              </div>
            )}

            {prediction && !loading && (
              <div style={{ padding: "28px" }}>
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px" }}>
                  {/* Main estimate */}
                  <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {prediction.sentimentOnly ? "Community Sentiment" : "Estimated Wait Time"}
                    </div>
                    {prediction.sentimentOnly ? (
                      <div style={{ fontSize: "14px", color: "#374151", padding: "12px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px" }}>
                        Not enough date-based reports yet — showing sentiment from {prediction.count} community reports below.
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "8px" }}>
                          <span style={{ fontSize: "56px", fontWeight: 800, color: "#111827", lineHeight: 1 }}>{prediction.median}</span>
                          <span style={{ fontSize: "22px", fontWeight: 600, color: "#6b7280" }}>days</span>
                        </div>
                        <div style={{ fontSize: "14px", color: "#9ca3af", marginTop: "6px" }}>
                          Range: {prediction.min}–{prediction.max} days based on {prediction.count} reports
                        </div>
                      </>
                    )}
                  </div>

                  {/* Confidence badge */}
                  {!prediction.sentimentOnly && (
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 14px",
                      background: confidenceCfg!.bg,
                      color: confidenceCfg!.color,
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: 700,
                      border: `1px solid ${confidenceCfg!.color}30`,
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      {confidenceCfg!.label} — {confidenceCfg!.description}
                    </div>
                  </div>
                  )}

                  {/* Sentiment breakdown */}
                  {totalSentiment > 0 && (
                    <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "12px" }}>Community sentiment</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                        {[
                          { key: "fast", label: "Fast", color: "#059669", bg: "#ecfdf5", value: prediction.sentimentBreakdown.fast },
                          { key: "average", label: "Average", color: "#d97706", bg: "#fffbeb", value: prediction.sentimentBreakdown.average },
                          { key: "slow", label: "Slow", color: "#dc2626", bg: "#fef2f2", value: prediction.sentimentBreakdown.slow },
                        ].map((s) => {
                          const pct = totalSentiment > 0 ? Math.round((s.value / totalSentiment) * 100) : 0;
                          return (
                            <div key={s.key} style={{ background: s.bg, borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                              <div style={{ fontSize: "20px", fontWeight: 800, color: s.color }}>{pct}%</div>
                              <div style={{ fontSize: "11px", fontWeight: 600, color: s.color }}>{s.label}</div>
                              <div style={{ fontSize: "10px", color: "#9ca3af" }}>{s.value} reports</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Data transparency note */}
                  <div style={{ fontSize: "12px", color: "#9ca3af", borderTop: "1px solid #e5e7eb", paddingTop: "14px", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: "1px", flexShrink: 0 }} aria-hidden="true">
                      <circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M12 16h.01" />
                    </svg>
                    <span>
                      Estimates are based on community-submitted reports ({prediction.verifiedCount} verified, {prediction.count - prediction.verifiedCount} unverified).
                      Actual times may vary. <Link href="/submit" style={{ color: "var(--tt-primary)", textDecoration: "none", fontWeight: 600 }}>Add your experience →</Link>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {!prediction && !loading && (
              <div style={{ padding: "28px", borderTop: "1px solid #e5e7eb", marginTop: "20px", textAlign: "center" }}>
                <div style={{ fontSize: "40px", marginBottom: "10px" }}>⏳</div>
                <p style={{ fontSize: "14px", color: "#9ca3af" }}>Select a process type above to see a prediction.</p>
              </div>
            )}
          </div>

          {/* CTA to contribute */}
          <div style={{ marginTop: "24px", background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)", border: "1px solid #a7f3d0", borderRadius: "12px", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#065f46", marginBottom: "4px" }}>Help improve these predictions</div>
              <div style={{ fontSize: "13px", color: "#047857" }}>The more reports we have, the more accurate the estimates become.</div>
            </div>
            <Link href="/submit" className="tt-btn-primary" style={{ textDecoration: "none", padding: "10px 20px", borderRadius: "8px", whiteSpace: "nowrap", fontSize: "14px" }}>
              Add my experience
            </Link>
          </div>

          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <Link href="/timelines" style={{ fontSize: "13px", color: "#9ca3af", textDecoration: "none" }}>
              ← Browse all timelines
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
