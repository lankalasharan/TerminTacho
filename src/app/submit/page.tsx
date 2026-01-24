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
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Submit a timeline</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Anonymous, community-reported waiting times (not official).
      </p>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}

      <form onSubmit={onSubmit} style={{ marginTop: 24, display: "grid", gap: 12 }}>
        <label>
          City / Office
          <select
            value={officeId}
            onChange={(e) => setOfficeId(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #ccc" }}
            required
          >
            <option value="">Select an office…</option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>
                {o.city} — {o.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Process type
          <select
            value={processTypeId}
            onChange={(e) => setProcessTypeId(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #ccc" }}
            required
          >
            <option value="">Select a process…</option>
            {processTypes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Method
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #ccc" }}
          >
            <option value="online">online</option>
            <option value="email">email</option>
            <option value="in-person">in-person</option>
          </select>
        </label>

        <label>
          Submitted date
          <input
            type="date"
            value={submittedAt}
            onChange={(e) => setSubmittedAt(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #ccc" }}
            required
          />
        </label>

        <label>
          Decision date (optional)
          <input
            type="date"
            value={decisionAt}
            onChange={(e) => setDecisionAt(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #ccc" }}
          />
        </label>

        <label>
          Status
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #ccc" }}
          >
            <option value="pending">pending</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
            <option value="withdrawn">withdrawn</option>
          </select>
        </label>

        <label>
          Notes (optional)
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: 10, border: "1px solid #ccc" }}
          />
        </label>

        <button
          disabled={loading}
          style={{
            padding: 12,
            border: "1px solid #ccc",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </main>
  );
}
