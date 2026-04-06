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

function getProcessCategory(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("student") || l.includes("phd") || l.includes("language course")) return "student";
  if (l.includes("work") || l.includes("blue card") || l.includes("employment") || l.includes("ict")) return "work";
  if (l.includes("family") || l.includes("spouse") || l.includes("child") || l.includes("parent")) return "family";
  if (l.includes("residence") || l.includes("settlement") || l.includes("address")) return "residence";
  if (l.includes("bank") || l.includes("tax") || l.includes("financial") || l.includes("blocked account")) return "finance";
  if (l.includes("citizenship") || l.includes("naturalization")) return "citizenship";
  if (l.includes("driver") || l.includes("vehicle")) return "transport";
  if (l.includes("business") || l.includes("entrepreneur") || l.includes("startup") || l.includes("investor")) return "business";
  return "document";
}

function getCategoryIconSvg(category: string): string {
  switch (category) {
    case "student":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='var(--tt-primary-strong)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 10 12 4 2 10l10 6 10-6Z'/><path d='M6 12v5c0 .8 3 2 6 2s6-1.2 6-2v-5'/></svg>";
    case "work":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#059669' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'/></svg>";
    case "family":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#db2777' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-3-3.87'/><path d='M4 21v-2a4 4 0 0 1 3-3.87'/><circle cx='12' cy='7' r='4'/></svg>";
    case "residence":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='var(--tt-primary-strong)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 11 12 3l9 8'/><path d='M5 10v11h14V10'/></svg>";
    case "finance":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='var(--tt-primary)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='5' width='18' height='14' rx='2'/><path d='M3 10h18'/></svg>";
    case "citizenship":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#a855f7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>";
    case "transport":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#f97316' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 16l1-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2l1 4'/><circle cx='7.5' cy='18.5' r='1.5'/><circle cx='16.5' cy='18.5' r='1.5'/></svg>";
    case "business":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#f59e0b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'/></svg>";
    default:
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='var(--tt-text-muted)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><path d='M14 2v6h6'/></svg>";
  }
}

function getProcessIcon(label: string): string {
  const svg = getCategoryIconSvg(getProcessCategory(label));
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function SubmitPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [offices, setOffices] = useState<Office[]>([]);
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [officeId, setOfficeId] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [customOfficeName, setCustomOfficeName] = useState("");
  const [processTypeId, setProcessTypeId] = useState("");
  const [customProcessType, setCustomProcessType] = useState("");
  const [processOpen, setProcessOpen] = useState(false);
  const [method, setMethod] = useState("online");
  const [methodOpen, setMethodOpen] = useState(false);
  const [submittedAt, setSubmittedAt] = useState("");
  const [decisionAt, setDecisionAt] = useState("");
  const [status, setStatus] = useState("pending");
  const [statusOpen, setStatusOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/options");
      const data = await res.json();
      setOffices(data.offices || []);
      setProcessTypes(data.processTypes || []);
    }
    load();
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-process-dropdown]")) setProcessOpen(false);
      if (!target?.closest("[data-method-dropdown]")) setMethodOpen(false);
      if (!target?.closest("[data-status-dropdown]")) setStatusOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setCaptchaError(null);

    // Block submission if user is not authenticated
    if (sessionStatus !== "authenticated") {
      setMsg("__AUTH_REQUIRED__");
      return;
    }

    setLoading(true);

    try {
      if (!officeId && !customCity.trim()) {
        throw new Error("Please select an office or enter a city.");
      }

      if (siteKey && !turnstileToken) {
        throw new Error("Please complete the CAPTCHA.");
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officeId: officeId || null,
          officeCity: customCity.trim() || null,
          officeName: customOfficeName.trim() || null,
          processTypeId: processTypeId || null,
          processTypeName: customProcessType.trim() || null,
          method,
          submittedAt,
          decisionAt: decisionAt || null,
          status,
          notes,
          turnstileToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit.");

      setMsg("✅ Submitted successfully!");
      setDecisionAt("");
      setNotes("");
      setStatus("pending");
      setTurnstileToken("");
    } catch (err: any) {
      setMsg("❌ " + (err?.message || "Unknown error"));
      if (String(err?.message || "").toLowerCase().includes("captcha")) {
        setCaptchaError(err?.message || "Please complete the CAPTCHA.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="tt-hero tt-submit-hero">
        <div className="tt-container" style={{ textAlign: "center" }}>
          <div className="tt-chip" style={{ margin: "0 auto" }}>
            Secure and anonymous
          </div>
          <h1 className="tt-hero-title">
            Submit your wait time.
          </h1>
          <p className="tt-hero-subtitle">
            Help fellow expatriates navigate German bureaucracy. Your data is 100% anonymous and used only for community insights.
          </p>
        </div>
      </section>

      <main className="tt-section tt-submit-shell">
        <div className="tt-container tt-submit-container">
          {msg && (
            <div
              className="tt-submit-message"
              style={{
                background: msg === "__AUTH_REQUIRED__" ? "#fffbeb" : msg.startsWith("✅") ? "#d1fae5" : "#fee2e2",
                border: `1px solid ${msg === "__AUTH_REQUIRED__" ? "#fcd34d" : msg.startsWith("✅") ? "#a7f3d0" : "#fecaca"}`,
              }}
            >
              {msg === "__AUTH_REQUIRED__" ? (
                <span>
                  Please{" "}
                  <button
                    type="button"
                    onClick={() => signIn(undefined, { callbackUrl: "/submit" })}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      color: "#b45309",
                      fontWeight: 700,
                      textDecoration: "underline",
                      cursor: "pointer",
                      fontSize: "inherit",
                    }}
                  >
                    log in
                  </button>
                  {" "}to submit your data. Your form data is preserved — just sign in and try again.
                </span>
              ) : (
                msg
              )}
            </div>
          )}

          <div className="tt-submit-card">
            <div className="tt-submit-progress">
              <span className="tt-submit-progress-bar" />
            </div>
            <div className="tt-submit-body">
              <div className="tt-submit-info">
                <span className="tt-submit-info-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <div>
                  <p className="tt-submit-info-title">Sign in required to submit.</p>
                  <p className="tt-submit-info-text">
                    {sessionStatus === "authenticated"
                      ? `Signed in as ${session?.user?.email ?? "you"}. You can submit below.`
                      : "Fill in your data and sign in when you press Submit — your data is preserved."}
                  </p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="16" rx="2" />
                          <path d="M7 8h2M7 12h2M7 16h2M11 8h2M11 12h2M11 16h2M15 8h2M15 12h2M15 16h2" />
                        </svg>
                      </span>
                      City / Office *
                    </label>
                    <div className="tt-select-wrap">
                      <select
                        value={officeId}
                        onChange={(e) => {
                          setOfficeId(e.target.value);
                          if (e.target.value) {
                            setCustomCity("");
                            setCustomOfficeName("");
                          }
                        }}
                        className="tt-submit-input tt-submit-select"
                      >
                        <option value="">Select an office…</option>
                        {offices.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.city} — {o.name}
                          </option>
                        ))}
                      </select>
                      <span className="tt-select-caret" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </div>
                    <p className="tt-submit-help">The Ausländerbehörde where you applied</p>
                    <div className="tt-submit-subfields">
                      <label className="tt-submit-subtitle">Can’t find your city? Add it here:</label>
                      <input
                        type="text"
                        value={customCity}
                        onChange={(e) => {
                          setCustomCity(e.target.value);
                          if (e.target.value.trim()) setOfficeId("");
                        }}
                        placeholder="City or town (e.g., Heidelberg)"
                        className="tt-submit-input"
                      />
                      <input
                        type="text"
                        value={customOfficeName}
                        onChange={(e) => setCustomOfficeName(e.target.value)}
                        placeholder="Office name (optional)"
                        className="tt-submit-input"
                      />
                      <p className="tt-submit-help">
                        If you enter a city here, we’ll create it and it will appear on the map automatically.
                      </p>
                    </div>
                  </div>

                  <div className="tt-submit-field tt-span-2" data-process-dropdown>
                    <label className="tt-submit-label">
                      <span className="tt-submit-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                        </svg>
                      </span>
                      Process Type *
                    </label>
                    <button
                      type="button"
                      onClick={() => setProcessOpen(!processOpen)}
                      className="tt-submit-select-button"
                    >
                      <span className="tt-submit-select-value">
                        <img
                          src={getProcessIcon(
                            processTypes.find((p) => p.id === processTypeId)?.name || "All Processes"
                          )}
                          alt=""
                          width={18}
                          height={18}
                          style={{ display: "block" }}
                        />
                        <span>
                          {processTypeId
                            ? normalizeProcessLabel(processTypes.find((p) => p.id === processTypeId)?.name || "")
                            : customProcessType.trim()
                            ? customProcessType.trim()
                            : "Select a process…"}
                        </span>
                      </span>
                      <span className="tt-select-caret" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </button>

                    {processOpen && (
                      <div className="tt-submit-dropdown">
                        {processTypes.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setProcessTypeId(p.id);
                              setCustomProcessType("");
                              setProcessOpen(false);
                            }}
                            className="tt-submit-option"
                          >
                            <img
                              src={getProcessIcon(p.name)}
                              alt=""
                              width={18}
                              height={18}
                              style={{ display: "block" }}
                            />
                            <span>{normalizeProcessLabel(p.name)}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="tt-submit-subfields">
                      <label className="tt-submit-subtitle">Can’t find your process? Add it here:</label>
                      <input
                        type="text"
                        value={customProcessType}
                        onChange={(e) => {
                          setCustomProcessType(e.target.value);
                          if (e.target.value.trim()) setProcessTypeId("");
                        }}
                        placeholder="Custom process type (e.g., Visa Appointment Booking)"
                        className="tt-submit-input"
                      />
                      <p className="tt-submit-help">
                        If you enter a custom process, it will be created and available for others.
                      </p>
                    </div>

                    <p className="tt-submit-help">Type of permit or document you applied for</p>
                  </div>

                  <div className="tt-submit-field" data-method-dropdown>
                    <label className="tt-submit-label">
                      <span className="tt-submit-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="5" width="18" height="14" rx="2" />
                          <path d="m3 7 9 6 9-6" />
                        </svg>
                      </span>
                      Application Method *
                    </label>
                    <button
                      type="button"
                      onClick={() => setMethodOpen(!methodOpen)}
                      className="tt-submit-select-button"
                    >
                      <span className="tt-submit-select-value">
                        {method === "online" && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="14" rx="2" />
                            <path d="M8 20h8" />
                            <path d="M12 18v-2" />
                          </svg>
                        )}
                        {method === "email" && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="m3 7 9 6 9-6" />
                          </svg>
                        )}
                        {method === "in-person" && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="16" rx="2" />
                            <path d="M7 8h10" />
                            <path d="M7 12h10" />
                          </svg>
                        )}
                        <span>
                          {method === "online" ? "Online" : method === "email" ? "Email" : "In-Person"}
                        </span>
                      </span>
                      <span className="tt-select-caret" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </button>
                    {methodOpen && (
                      <div className="tt-submit-dropdown">
                        <button
                          type="button"
                          className="tt-submit-option"
                          onClick={() => {
                            setMethod("online");
                            setMethodOpen(false);
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="14" rx="2" />
                            <path d="M8 20h8" />
                            <path d="M12 18v-2" />
                          </svg>
                          <span>Online</span>
                        </button>
                        <button
                          type="button"
                          className="tt-submit-option"
                          onClick={() => {
                            setMethod("email");
                            setMethodOpen(false);
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="m3 7 9 6 9-6" />
                          </svg>
                          <span>Email</span>
                        </button>
                        <button
                          type="button"
                          className="tt-submit-option"
                          onClick={() => {
                            setMethod("in-person");
                            setMethodOpen(false);
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="16" rx="2" />
                            <path d="M7 8h10" />
                            <path d="M7 12h10" />
                          </svg>
                          <span>In-Person</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="tt-submit-field" data-status-dropdown>
                    <label className="tt-submit-label">
                      <span className="tt-submit-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19h16" />
                          <path d="M6 15l4-4 3 3 5-6" />
                        </svg>
                      </span>
                      Current Status *
                    </label>
                    <button
                      type="button"
                      onClick={() => setStatusOpen(!statusOpen)}
                      className="tt-submit-select-button"
                    >
                      <span className="tt-submit-select-value">
                        {status === "pending" && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                          </svg>
                        )}
                        {status === "approved" && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        )}
                        {status === "rejected" && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 6 6 18" />
                            <path d="M6 6 18 18" />
                          </svg>
                        )}
                        {status === "withdrawn" && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 12H7" />
                            <path d="m11 16-4-4 4-4" />
                          </svg>
                        )}
                        <span>
                          {status === "pending"
                            ? "Pending / Waiting"
                            : status === "approved"
                            ? "Approved"
                            : status === "rejected"
                            ? "Rejected"
                            : "Withdrawn"}
                        </span>
                      </span>
                      <span className="tt-select-caret" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </span>
                    </button>
                    {statusOpen && (
                      <div className="tt-submit-dropdown">
                        <button
                          type="button"
                          className="tt-submit-option"
                          onClick={() => {
                            setStatus("pending");
                            setStatusOpen(false);
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                          </svg>
                          <span>Pending / Waiting</span>
                        </button>
                        <button
                          type="button"
                          className="tt-submit-option"
                          onClick={() => {
                            setStatus("approved");
                            setStatusOpen(false);
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          <span>Approved</span>
                        </button>
                        <button
                          type="button"
                          className="tt-submit-option"
                          onClick={() => {
                            setStatus("rejected");
                            setStatusOpen(false);
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 6 6 18" />
                            <path d="M6 6 18 18" />
                          </svg>
                          <span>Rejected</span>
                        </button>
                        <button
                          type="button"
                          className="tt-submit-option"
                          onClick={() => {
                            setStatus("withdrawn");
                            setStatusOpen(false);
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M20 12H7" />
                            <path d="m11 16-4-4 4-4" />
                          </svg>
                          <span>Withdrawn</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="tt-submit-field">
                    <label className="tt-submit-label">
                      <span className="tt-submit-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                      </span>
                      Submitted Date *
                    </label>
                    <input
                      type="date"
                      value={submittedAt}
                      onChange={(e) => setSubmittedAt(e.target.value)}
                      className="tt-submit-input"
                      required
                    />
                  </div>

                  <div className="tt-submit-field">
                    <label className="tt-submit-label">
                      <span className="tt-submit-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                          <path d="m9 14 2 2 4-4" />
                        </svg>
                      </span>
                      Decision Date
                    </label>
                    <input
                      type="date"
                      value={decisionAt}
                      onChange={(e) => setDecisionAt(e.target.value)}
                      className="tt-submit-input"
                    />
                    <p className="tt-submit-help">Leave empty if still waiting</p>
                  </div>

                  <div className="tt-submit-field tt-span-2">
                    <label className="tt-submit-label">
                      <span className="tt-submit-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                        </svg>
                      </span>
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="e.g., Had to provide additional documents, appointment took 2 hours, etc."
                      className="tt-submit-input"
                      style={{ minHeight: 120 }}
                    />
                  </div>
                </div>

                {siteKey && (
                  <div className="tt-submit-captcha">
                    <TurnstileWidget
                      siteKey={siteKey}
                      onVerify={setTurnstileToken}
                      onExpire={() => setCaptchaError("CAPTCHA expired. Please try again.")}
                      onError={() => setCaptchaError("CAPTCHA failed. Please try again.")}
                    />
                    {captchaError && (
                      <div className="tt-submit-help" style={{ color: "#991b1b" }}>
                        {captchaError}
                      </div>
                    )}
                  </div>
                )}

                <button
                  disabled={loading}
                  className="tt-btn-primary tt-submit-button"
                  style={{
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <span className="tt-submit-button-label">
                      <span className="tt-submit-spinner" aria-hidden="true" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="tt-submit-button-label">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                      Submit Timeline
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="tt-submit-back">
            <a href="/timelines" className="tt-submit-back-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m11 18-6-6 6-6" />
              </svg>
              Back to timelines
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

