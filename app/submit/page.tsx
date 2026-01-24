"use client";

import { useEffect, useState } from "react";

type Office = { id: string; city: string; name: string };
type ProcessType = { id: string; name: string };

export default function SubmitPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [officeId, setOfficeId] = useState("");
  const [processTypeId, setProcessTypeId] = useState("");
  const [method, setMethod] = useState("online");
  const [submittedAt, setSubmittedAt] = useState("");
  const [decisionAt, setDecisionAt] = useState("");
  const [status, setStatus] = useState("pending");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/options");
      const data = await res.json();
      setOffices(data.offices || []);
      setProcessTypes(data.processTypes || []);
    }
    load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officeId,
          processTypeId,
          method,
          submittedAt,
          decisionAt: decisionAt || null,
          status,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to submit.");

      setMsg("✅ Submitted successfully!");
      setDecisionAt("");
      setNotes("");
      setStatus("pending");
    } catch (err: any) {
      setMsg("❌ " + (err?.message || "Unknown error"));
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
            onChange={(e) => setOfficeId(e.target.value)}
            style={{ 
              width: "100%", 
              padding: 12, 
              border: "1px solid #d1d5db", 
              borderRadius: 6,
              fontSize: 14
            }}
            required
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
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
            📄 Process Type *
          </label>
          <select
            value={processTypeId}
            onChange={(e) => setProcessTypeId(e.target.value)}
            style={{ 
              width: "100%", 
              padding: 12, 
              border: "1px solid #d1d5db", 
              borderRadius: 6,
              fontSize: 14
            }}
            required
          >
            <option value="">Select a process…</option>
            {processTypes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
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
