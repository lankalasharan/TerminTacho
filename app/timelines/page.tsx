"use client";

import { useEffect, useState } from "react";

type Report = {
  id: string;
  method: string;
  submittedAt: string;
  decisionAt: string | null;
  status: string;
  createdAt: string;
  office: { city: string; name: string };
  processType: { name: string };
};

export default function TimelinesPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReports(data.reports || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Timelines</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Community-reported waiting times (not official).
      </p>

      {loading ? (
        <p style={{ marginTop: 16 }}>Loading...</p>
      ) : reports.length === 0 ? (
        <p style={{ marginTop: 16 }}>No reports yet. Add the first one!</p>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {reports.map((r) => (
            <div key={r.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <div style={{ fontWeight: 700 }}>
                {r.office.city} — {r.processType.name}
              </div>
              <div style={{ marginTop: 6, opacity: 0.85 }}>
                Office: {r.office.name}
              </div>
              <div style={{ marginTop: 6 }}>
                Submitted: {r.submittedAt.slice(0, 10)} | Decision:{" "}
                {r.decisionAt ? r.decisionAt.slice(0, 10) : "—"} | Status: {r.status} | Method:{" "}
                {r.method}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
