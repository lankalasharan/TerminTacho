"use client";

import { useEffect, useState } from "react";
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
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#4f46e5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 10 12 4 2 10l10 6 10-6Z'/><path d='M6 12v5c0 .8 3 2 6 2s6-1.2 6-2v-5'/></svg>";
    case "work":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#059669' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'/></svg>";
    case "family":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#db2777' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-3-3.87'/><path d='M4 21v-2a4 4 0 0 1 3-3.87'/><circle cx='12' cy='7' r='4'/></svg>";
    case "residence":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#2563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 11 12 3l9 8'/><path d='M5 10v11h14V10'/></svg>";
    case "finance":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#0ea5e9' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='5' width='18' height='14' rx='2'/><path d='M3 10h18'/></svg>";
    case "citizenship":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#a855f7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>";
    case "transport":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#f97316' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 16l1-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2l1 4'/><circle cx='7.5' cy='18.5' r='1.5'/><circle cx='16.5' cy='18.5' r='1.5'/></svg>";
    case "business":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#f59e0b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'/></svg>";
    default:
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#6b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><path d='M14 2v6h6'/></svg>";
  }
}

function getProcessIcon(label: string): string {
  const svg = getCategoryIconSvg(getProcessCategory(label));
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function SubmitPage() {
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
  const [submittedAt, setSubmittedAt] = useState("");
  const [decisionAt, setDecisionAt] = useState("");
  const [status, setStatus] = useState("pending");
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
      if (!target?.closest("[data-process-dropdown]") ) {
        setProcessOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    setCaptchaError(null);

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
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 20 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>➕ Submit Your Timeline</h1>
        <p style={{ marginTop: 8, opacity: 0.8, fontSize: 16, lineHeight: 1.6 }}>
          Help others by sharing your experience anonymously. Your data helps create realistic expectations.
        </p>
      </div>

      {msg && (
        <div style={{ 
          padding: 16, 
          marginBottom: 24, 
          borderRadius: 8,
          background: msg.startsWith("✅") ? "#d1fae5" : "#fee2e2",
          border: `1px solid ${msg.startsWith("✅") ? "#a7f3d0" : "#fecaca"}`,
          fontSize: 14,
          fontWeight: 600
        }}>
          {msg}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 20 }}>
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            🏢 City / Office *
          </label>
          <select
            value={officeId}
            onChange={(e) => {
              setOfficeId(e.target.value);
              if (e.target.value) {
                setCustomCity("");
                setCustomOfficeName("");
              }
            }}
            style={{ 
              width: "100%", 
              padding: 12, 
              border: "1px solid #d1d5db", 
              borderRadius: 6,
              fontSize: 14
            }}
          >
            <option value="">Select an office…</option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>
                {o.city} — {o.name}
              </option>
            ))}
          </select>
          <p style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
            The Ausländerbehörde where you applied
          </p>
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, opacity: 0.8 }}>
              Can’t find your city? Add it here:
            </label>
            <input
              type="text"
              value={customCity}
              onChange={(e) => {
                setCustomCity(e.target.value);
                if (e.target.value.trim()) setOfficeId("");
              }}
              placeholder="City or town (e.g., Heidelberg)"
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 14,
              }}
            />
            <input
              type="text"
              value={customOfficeName}
              onChange={(e) => setCustomOfficeName(e.target.value)}
              placeholder="Office name (optional)"
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 14,
              }}
            />
            <p style={{ fontSize: 11, opacity: 0.7 }}>
              If you enter a city here, we’ll create it and it will appear on the map automatically.
            </p>
          </div>
        </div>

        <div data-process-dropdown style={{ position: "relative" }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            📄 Process Type *
          </label>
          <button
            type="button"
            onClick={() => setProcessOpen(!processOpen)}
            style={{
              width: "100%",
              padding: 12,
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: 14,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            <span style={{ color: "#9ca3af" }}>▾</span>
          </button>

          {processOpen && (
            <div
              style={{
                position: "absolute",
                zIndex: 50,
                marginTop: 8,
                width: "100%",
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                maxHeight: 320,
                overflowY: "auto",
              }}
            >
              {processTypes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setProcessTypeId(p.id);
                    setCustomProcessType("");
                    setProcessOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "white",
                    border: "none",
                    borderBottom: "1px solid #f3f4f6",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <img
                    src={getProcessIcon(p.name)}
                    alt=""
                    width={18}
                    height={18}
                    style={{ display: "block" }}
                  />
                  <span style={{ fontSize: 14 }}>{normalizeProcessLabel(p.name)}</span>
                </button>
              ))}
            </div>
          )}

          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600, opacity: 0.8 }}>
              Can’t find your process? Add it here:
            </label>
            <input
              type="text"
              value={customProcessType}
              onChange={(e) => {
                setCustomProcessType(e.target.value);
                if (e.target.value.trim()) setProcessTypeId("");
              }}
              placeholder="Custom process type (e.g., Visa Appointment Booking)"
              style={{
                width: "100%",
                padding: 12,
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: 14,
              }}
            />
            <p style={{ fontSize: 11, opacity: 0.7 }}>
              If you enter a custom process, it will be created and available for others.
            </p>
          </div>

          <p style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
            Type of permit or document you applied for
          </p>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            📮 Application Method *
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ 
              width: "100%", 
              padding: 12, 
              border: "1px solid #d1d5db", 
              borderRadius: 6,
              fontSize: 14
            }}
          >
            <option value="online">💻 Online</option>
            <option value="email">📧 Email</option>
            <option value="in-person">🏢 In-Person</option>
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              📅 Submitted Date *
            </label>
            <input
              type="date"
              value={submittedAt}
              onChange={(e) => setSubmittedAt(e.target.value)}
              style={{ 
                width: "100%", 
                padding: 12, 
                border: "1px solid #d1d5db", 
                borderRadius: 6,
                fontSize: 14
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
              ✅ Decision Date
            </label>
            <input
              type="date"
              value={decisionAt}
              onChange={(e) => setDecisionAt(e.target.value)}
              style={{ 
                width: "100%", 
                padding: 12, 
                border: "1px solid #d1d5db", 
                borderRadius: 6,
                fontSize: 14
              }}
            />
            <p style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
              Leave empty if still waiting
            </p>
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            📊 Current Status *
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ 
              width: "100%", 
              padding: 12, 
              border: "1px solid #d1d5db", 
              borderRadius: 6,
              fontSize: 14
            }}
          >
            <option value="pending">⏳ Pending / Waiting</option>
            <option value="approved">✅ Approved</option>
            <option value="rejected">❌ Rejected</option>
            <option value="withdrawn">🔙 Withdrawn</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            💬 Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="e.g., Had to provide additional documents, appointment took 2 hours, etc."
            style={{ 
              width: "100%", 
              padding: 12, 
              border: "1px solid #d1d5db", 
              borderRadius: 6,
              fontSize: 14,
              fontFamily: "inherit"
            }}
          />
        </div>

        {siteKey && (
          <div style={{ marginTop: 16 }}>
            <TurnstileWidget
              siteKey={siteKey}
              onVerify={setTurnstileToken}
              onExpire={() => setCaptchaError("CAPTCHA expired. Please try again.")}
              onError={() => setCaptchaError("CAPTCHA failed. Please try again.")}
            />
            {captchaError && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#991b1b" }}>
                {captchaError}
              </div>
            )}
          </div>
        )}

        <button
          disabled={loading}
          style={{
            padding: 16,
            background: loading ? "#9ca3af" : "#16a34a",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          }}
        >
          {loading ? "⏳ Submitting..." : "✅ Submit Timeline"}
        </button>

        <p style={{ fontSize: 12, opacity: 0.7, textAlign: "center", marginTop: 8 }}>
          🔒 Your submission is completely anonymous. No personal data is stored.
        </p>
      </form>

      <div style={{ marginTop: 40, textAlign: "center" }}>
        <a href="/timelines" style={{ color: "#2563eb", textDecoration: "underline" }}>
          ← Back to timelines
        </a>
      </div>
    </main>
  );
}
