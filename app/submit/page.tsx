"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import TurnstileWidget from "../components/Turnstile";

type Office = { id: string; city: string; name: string };
type ProcessType = { id: string; name: string };

function normalizeProcessLabel(label: string): string {
  return label
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const SENTIMENT_OPTIONS = [
  {
    value: "fast",
    label: "Fast",
    description: "Under 4 weeks, things are moving",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    hoverBorder: "#059669",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l3 3 5-6" />
      </svg>
    ),
  },
  {
    value: "average",
    label: "Average",
    description: "Expected delays, nothing unusual",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fcd34d",
    hoverBorder: "#d97706",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    value: "slow",
    label: "Slow",
    description: "Significantly delayed, frustrating",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    hoverBorder: "#dc2626",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    ),
  },
];

const STEPS = ["sentiment", "process", "dates", "notes", "submit"] as const;
type Step = typeof STEPS[number];

export default function SubmitPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [offices, setOffices] = useState<Office[]>([]);
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);

  const [currentStep, setCurrentStep] = useState<Step>("sentiment");

  const [sentiment, setSentiment] = useState<"fast" | "average" | "slow" | "">("");
  const [officeId, setOfficeId] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [processTypeId, setProcessTypeId] = useState("");
  const [customProcessType, setCustomProcessType] = useState("");
  const [method, setMethod] = useState("online");
  const [submittedAt, setSubmittedAt] = useState("");
  const [decisionAt, setDecisionAt] = useState("");
  const [status, setStatus] = useState("approved");
  const [notes, setNotes] = useState("");
  const [reminderOptIn, setReminderOptIn] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const [turnstileToken, setTurnstileToken] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quickPulseSaved, setQuickPulseSaved] = useState(false);

  // Admin detection: done server-side. Client-side we check NEXT_PUBLIC_ADMIN_EMAILS for UI only.
  const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = sessionStatus === "authenticated" && !!session?.user?.email && adminEmails.includes(session.user.email);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/options");
      const data = await res.json();
      setOffices(data.offices || []);
      setProcessTypes(data.processTypes || []);
    }
    load();
  }, []);

  async function saveQuickPulse(s: string, oId: string, oCity: string, ptId: string, ptName: string) {
    if (quickPulseSaved) return;
    if (!s || (!oId && !oCity) || (!ptId && !ptName)) return;
    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officeId: oId || null,
          officeCity: oCity || null,
          processTypeId: ptId || null,
          processTypeName: ptName || null,
          sentiment: s,
          turnstileToken: "",
        }),
      });
      setQuickPulseSaved(true);
    } catch { /* non-fatal */ }
  }

  function handleSentimentSelect(value: "fast" | "average" | "slow") {
    setSentiment(value);
    // Don't auto-advance — office/city is now on this same step
  }

  function handleSentimentStepNext() {
    if (!sentiment || (!officeId && !customCity.trim())) return;
    setCurrentStep("process");
  }

  function handleProcessNext() {
    if (!processTypeId && !customProcessType.trim()) return;
    saveQuickPulse(sentiment, officeId, customCity.trim(), processTypeId, customProcessType.trim());
    setCurrentStep("dates");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setCaptchaError(null);
    setLoading(true);
    try {
      if (!officeId && !customCity.trim()) throw new Error("Please select an office or enter a city.");
      if (siteKey && !turnstileToken) throw new Error("Please complete the CAPTCHA.");

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officeId: officeId || null,
          officeCity: customCity.trim() || null,
          processTypeId: processTypeId || null,
          processTypeName: customProcessType.trim() || null,
          method,
          submittedAt: submittedAt || undefined,
          decisionAt: decisionAt || null,
          status,
          notes,
          turnstileToken,
          sentiment: sentiment || null,
          reminderOptIn: sessionStatus === "authenticated" ? reminderOptIn : false,
          sourceUrl: isAdmin ? sourceUrl : undefined,
          adminNote: isAdmin ? adminNote : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit.");
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err?.message || "Unknown error");
      if (String(err?.message || "").toLowerCase().includes("captcha")) {
        setCaptchaError(err?.message || "Please complete the CAPTCHA.");
      }
    } finally {
      setLoading(false);
    }
  }

  const stepIndex = STEPS.indexOf(currentStep);
  const progressPct = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  if (submitted) {
    return (
      <>
        <section className="tt-hero tt-submit-hero">
          <div className="tt-container" style={{ textAlign: "center" }}>
            <h1 className="tt-hero-title">Thank you!</h1>
            <p className="tt-hero-subtitle">Your report is helping others plan their appointments.</p>
          </div>
        </section>
        <main className="tt-section tt-submit-shell">
          <div className="tt-container tt-submit-container">
            <div className="tt-submit-card">
              <div style={{ padding: "48px 32px", textAlign: "center" }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 16px" }} aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
                </svg>
                <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px", color: "#111827" }}>Report submitted</h2>
                <p style={{ color: "#6b7280", marginBottom: "28px" }}>Your experience is now part of the community dataset.</p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <a href="/timelines" className="tt-btn-primary" style={{ textDecoration: "none", padding: "12px 24px", borderRadius: "8px" }}>View timelines</a>
                  <a href="/predict" style={{ textDecoration: "none", padding: "12px 24px", borderRadius: "8px", border: "1px solid #e5e7eb", color: "#374151", fontWeight: 600, fontSize: "14px" }}>Check wait predictor</a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <section className="tt-hero tt-submit-hero">
        <div className="tt-container" style={{ textAlign: "center" }}>
          <div className="tt-chip" style={{ margin: "0 auto" }}>Secure &amp; not publicly attributed</div>
          <h1 className="tt-hero-title">Share your experience.</h1>
          <p className="tt-hero-subtitle">Help fellow expatriates navigate German bureaucracy. Anonymous submissions welcome.</p>
        </div>
      </section>

      <main className="tt-section tt-submit-shell">
        <div className="tt-container tt-submit-container">
          <div className="tt-submit-card">
            <div className="tt-submit-progress">
              <span className="tt-submit-progress-bar" style={{ width: `${progressPct}%`, transition: "width 0.3s ease" }} />
            </div>

            <div className="tt-submit-body">
              {errorMsg && (
                <div className="tt-submit-message" style={{ background: "#fee2e2", border: "1px solid #fecaca", marginBottom: "20px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    {errorMsg}
                  </span>
                </div>
              )}

              {/* Step 1: Sentiment + Office */}
              {currentStep === "sentiment" && (
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px", color: "#111827" }}>How is the wait at your office?</h2>
                  <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "22px" }}>Just your general feeling — one tap is enough to help others.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                    {SENTIMENT_OPTIONS.map((opt) => (
                      <button key={opt.value} type="button" onClick={() => handleSentimentSelect(opt.value as any)}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "20px 12px", borderRadius: "12px", border: sentiment === opt.value ? `2px solid ${opt.hoverBorder}` : `2px solid ${opt.border}`, background: sentiment === opt.value ? opt.bg : "white", cursor: "pointer", transition: "all 0.15s", boxShadow: sentiment === opt.value ? `0 0 0 3px ${opt.hoverBorder}30` : "none" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = opt.hoverBorder; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = sentiment === opt.value ? opt.hoverBorder : opt.border; e.currentTarget.style.boxShadow = sentiment === opt.value ? `0 0 0 3px ${opt.hoverBorder}30` : "none"; }}
                      >
                        {opt.icon}
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: opt.color }}>{opt.label}</div>
                          <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "3px", lineHeight: 1.4 }}>{opt.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Context note */}
                  <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "14px", textAlign: "center", lineHeight: 1.5 }}>
                    This is just your general feeling. Continue below to add exact dates for more accurate community data.
                  </p>

                  {/* Office / City selection */}
                  <div style={{ marginTop: "20px", borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
                    <label style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>Which Ausländerbehörde / city?</label>
                    <div className="tt-select-wrap" style={{ marginBottom: "10px" }}>
                      <select value={officeId} onChange={(e) => { setOfficeId(e.target.value); if (e.target.value) setCustomCity(""); }} className="tt-submit-input tt-submit-select">
                        <option value="">Select an office…</option>
                        {offices.map((o) => <option key={o.id} value={o.id}>{o.city} — {o.name}</option>)}
                      </select>
                      <span className="tt-select-caret" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg></span>
                    </div>
                    <label className="tt-submit-subtitle" style={{ marginBottom: "6px", display: "block" }}>Can't find your city?</label>
                    <input type="text" value={customCity} onChange={(e) => { setCustomCity(e.target.value); if (e.target.value.trim()) setOfficeId(""); }} placeholder="City or town (e.g., Heidelberg)" className="tt-submit-input" />
                  </div>

                  <button type="button" onClick={handleSentimentStepNext} disabled={!sentiment || (!officeId && !customCity.trim())}
                    style={{ marginTop: "20px", width: "100%", padding: "12px 18px", borderRadius: "8px", border: "none", background: (!sentiment || (!officeId && !customCity.trim())) ? "#e5e7eb" : "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)", color: (!sentiment || (!officeId && !customCity.trim())) ? "#9ca3af" : "white", fontWeight: 700, fontSize: "14px", cursor: (!sentiment || (!officeId && !customCity.trim())) ? "not-allowed" : "pointer" }}>
                    Continue →
                  </button>
                </div>
              )}

              {/* Step 3: Process */}
              {currentStep === "process" && (
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", color: "#111827" }}>What type of permit?</h2>
                  <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>Select the process that applies to your case.</p>
                  <div className="tt-submit-field">
                    <div className="tt-select-wrap">
                      <select value={processTypeId} onChange={(e) => { setProcessTypeId(e.target.value); if (e.target.value) setCustomProcessType(""); }} className="tt-submit-input tt-submit-select">
                        <option value="">Select a process…</option>
                        {processTypes.map((p) => <option key={p.id} value={p.id}>{normalizeProcessLabel(p.name)}</option>)}
                      </select>
                      <span className="tt-select-caret" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg></span>
                    </div>
                    <div className="tt-submit-subfields" style={{ marginTop: "12px" }}>
                      <label className="tt-submit-subtitle">Not listed? Add it:</label>
                      <input type="text" value={customProcessType} onChange={(e) => { setCustomProcessType(e.target.value); if (e.target.value.trim()) setProcessTypeId(""); }} placeholder="e.g., Visa Appointment Booking" className="tt-submit-input" />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <button type="button" onClick={() => setCurrentStep("sentiment")} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "white", color: "#374151", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>← Back</button>
                    <button type="button" onClick={handleProcessNext} disabled={!processTypeId && !customProcessType.trim()} style={{ flex: 1, padding: "10px 18px", borderRadius: "8px", border: "none", background: (!processTypeId && !customProcessType.trim()) ? "#e5e7eb" : "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)", color: (!processTypeId && !customProcessType.trim()) ? "#9ca3af" : "white", fontWeight: 700, fontSize: "14px", cursor: (!processTypeId && !customProcessType.trim()) ? "not-allowed" : "pointer" }}>Continue →</button>
                  </div>
                </div>
              )}

              {/* Step 3: Dates (optional) */}
              {currentStep === "dates" && (
                <div>
                  <div style={{ background: "#f0fdf4", border: "1px solid #a7f3d0", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", fontSize: "13px", color: "#065f46" }}>
                    ✓ Your experience has been recorded. Add exact dates for more accurate predictions.
                  </div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", color: "#111827" }}>Add exact dates?</h2>
                  <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>Helps calculate precise wait times. Completely optional.</p>
                  <div className="tt-submit-grid">
                    <div className="tt-submit-field">
                      <label className="tt-submit-label">Application Method</label>
                      <div className="tt-select-wrap">
                        <select value={method} onChange={(e) => setMethod(e.target.value)} className="tt-submit-input tt-submit-select">
                          <option value="online">Online</option>
                          <option value="email">Email</option>
                          <option value="in-person">In-Person</option>
                        </select>
                        <span className="tt-select-caret" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg></span>
                      </div>
                    </div>
                    <div className="tt-submit-field">
                      <label className="tt-submit-label">Current Status</label>
                      <div className="tt-select-wrap">
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="tt-submit-input tt-submit-select">
                          <option value="approved">Accepted</option>
                          <option value="rejected">Rejected</option>
                          <option value="pending">Still waiting</option>
                        </select>
                        <span className="tt-select-caret" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg></span>
                      </div>
                    </div>
                    <div className="tt-submit-field">
                      <label className="tt-submit-label">Date Submitted</label>
                      <input type="date" value={submittedAt} onChange={(e) => setSubmittedAt(e.target.value)} className="tt-submit-input" />
                    </div>
                    <div className="tt-submit-field">
                      <label className="tt-submit-label">Decision Date <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
                      <input type="date" value={decisionAt} onChange={(e) => setDecisionAt(e.target.value)} className="tt-submit-input" />
                      <p className="tt-submit-help">Leave empty if still waiting</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <button type="button" onClick={() => setCurrentStep("process")} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "white", color: "#374151", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>← Back</button>
                    <button type="button" onClick={() => setCurrentStep("notes")} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "white", color: "#6b7280", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>Skip</button>
                    <button type="button" onClick={() => setCurrentStep("notes")} style={{ flex: 1, padding: "10px 18px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)", color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Continue →</button>
                  </div>
                </div>
              )}

              {/* Step 5: Notes (optional) */}
              {currentStep === "notes" && (
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", color: "#111827" }}>Any useful context?</h2>
                  <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>Tips like "portal was down, had to call" are extremely valuable. Completely optional.</p>
                  <div className="tt-submit-field">
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="e.g., Needed additional documents, appointment took 2 hours..." className="tt-submit-input" style={{ minHeight: 110 }} />
                  </div>
                  {isAdmin && (
                    <div style={{ marginTop: "16px", padding: "16px", border: "2px dashed #7c3aed", borderRadius: "10px", background: "#f5f3ff" }}>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "#7c3aed", marginBottom: "12px" }}>Admin Seed Fields</p>
                      <div className="tt-submit-field" style={{ marginBottom: "10px" }}>
                        <label className="tt-submit-label">Source URL (courtesy link)</label>
                        <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://facebook.com/groups/..." className="tt-submit-input" />
                      </div>
                      <div className="tt-submit-field">
                        <label className="tt-submit-label">Admin context note</label>
                        <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2} placeholder="Summarized from public community discussion." className="tt-submit-input" style={{ minHeight: 70 }} />
                      </div>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <button type="button" onClick={() => setCurrentStep("dates")} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "white", color: "#374151", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>← Back</button>
                    <button type="button" onClick={() => setCurrentStep("submit")} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "white", color: "#6b7280", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>Skip</button>
                    <button type="button" onClick={() => setCurrentStep("submit")} style={{ flex: 1, padding: "10px 18px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)", color: "white", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>Continue →</button>
                  </div>
                </div>
              )}

              {/* Step 6: Submit */}
              {currentStep === "submit" && (
                <form onSubmit={onSubmit}>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", color: "#111827" }}>Ready to submit</h2>
                  <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "20px" }}>Submit anonymously (Unverified badge) or sign in for a Verified badge that others trust more.</p>
                  <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "16px", marginBottom: "20px", fontSize: "13px", color: "#374151", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {sentiment && <div><strong>Experience:</strong> {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</div>}
                    {(officeId || customCity) && <div><strong>Office:</strong> {offices.find(o => o.id === officeId)?.city || customCity}</div>}
                    {(processTypeId || customProcessType) && <div><strong>Process:</strong> {normalizeProcessLabel(processTypes.find(p => p.id === processTypeId)?.name || customProcessType)}</div>}
                    {submittedAt && <div><strong>Submitted:</strong> {new Date(submittedAt).toLocaleDateString("de-DE")}</div>}
                    {decisionAt && <div><strong>Decision:</strong> {new Date(decisionAt).toLocaleDateString("de-DE")}</div>}
                  </div>
                  {sessionStatus === "authenticated" && (
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px", cursor: "pointer", fontSize: "13px", color: "#374151" }}>
                      <input type="checkbox" checked={reminderOptIn} onChange={(e) => setReminderOptIn(e.target.checked)} style={{ marginTop: "2px", cursor: "pointer" }} />
                      <span>Email me in ~8 weeks to confirm my outcome — helps others see if the data is still accurate. Unsubscribe any time.</span>
                    </label>
                  )}
                  {siteKey && (
                    <div className="tt-submit-captcha">
                      <TurnstileWidget siteKey={siteKey} onVerify={setTurnstileToken} onExpire={() => setCaptchaError("CAPTCHA expired. Please try again.")} onError={() => setCaptchaError("CAPTCHA failed. Please try again.")} />
                      {captchaError && <div className="tt-submit-help" style={{ color: "#991b1b" }}>{captchaError}</div>}
                    </div>
                  )}
                  <div style={{ display: "grid", gap: "10px", marginTop: "20px" }}>
                    <button type="submit" disabled={loading} className="tt-btn-primary tt-submit-button" style={{ cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
                      <span className="tt-submit-button-label">
                        {loading ? (
                          <><span className="tt-submit-spinner" aria-hidden="true" /> Submitting...</>
                        ) : (
                          <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
                            {sessionStatus === "authenticated" ? "Submit as Verified" : "Submit anonymously (Unverified)"}</>
                        )}
                      </span>
                    </button>
                    {sessionStatus !== "authenticated" && (
                      <button type="button" onClick={() => signIn(undefined, { callbackUrl: "/submit" })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "2px solid #059669", background: "white", color: "#059669", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
                        Sign in to submit as Verified →
                      </button>
                    )}
                  </div>
                  <button type="button" onClick={() => setCurrentStep("notes")} style={{ marginTop: "10px", background: "none", border: "none", color: "#9ca3af", fontSize: "13px", cursor: "pointer", padding: "4px 0" }}>← Back</button>
                </form>
              )}
            </div>
          </div>

          <div className="tt-submit-back">
            <a href="/timelines" className="tt-submit-back-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></svg>
              Back to timelines
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
