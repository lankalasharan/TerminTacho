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

function calculateDays(start: string, end: string | null): number | null {
  if (!end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

export default function TimelinesPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [processFilter, setProcessFilter] = useState("");

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

  // Extract unique cities and process types for filters
  const cities = [...new Set(reports.map(r => r.office.city))].sort();
  const processTypes = [...new Set(reports.map(r => r.processType.name))].sort();

  // Filter reports
  const filteredReports = reports.filter(r => {
    if (cityFilter && r.office.city !== cityFilter) return false;
    if (processFilter && r.processType.name !== processFilter) return false;
    return true;
  });

  // Calculate statistics
  const completedReports = filteredReports.filter(r => r.decisionAt);
  const waitingDays = completedReports.map(r => calculateDays(r.submittedAt, r.decisionAt)).filter(d => d !== null) as number[];
  const avgDays = waitingDays.length > 0 ? Math.round(waitingDays.reduce((a, b) => a + b, 0) / waitingDays.length) : null;
  const minDays = waitingDays.length > 0 ? Math.min(...waitingDays) : null;
  const maxDays = waitingDays.length > 0 ? Math.max(...waitingDays) : null;

  return (
    <main style={{ maxWidth: 1100, margin: "40px auto", padding: 16 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800 }}>📊 Processing Timelines</h1>
        <p style={{ marginTop: 8, opacity: 0.8, fontSize: 16 }}>
          Real experiences from {reports.length} community reports
        </p>
      </div>

      {/* Statistics Section */}
      {completedReports.length > 0 && (
        <div style={{ background: "#f0f9ff", padding: 24, borderRadius: 12, marginBottom: 32, border: "1px solid #bae6fd" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>📈 Statistics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16 }}>
            <div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>Average Wait</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#2563eb" }}>{avgDays} days</div>
            </div>
            <div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>Fastest</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>{minDays} days</div>
            </div>
            <div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>Longest</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#dc2626" }}>{maxDays} days</div>
            </div>
            <div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>Completed</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{completedReports.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Filter by City</label>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Filter by Process</label>
          <select
            value={processFilter}
            onChange={(e) => setProcessFilter(e.target.value)}
            style={{ width: "100%", padding: 10, border: "1px solid #d1d5db", borderRadius: 6 }}
          >
            <option value="">All Processes</option>
            {processTypes.map(pt => (
              <option key={pt} value={pt}>{pt}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p style={{ marginTop: 16, textAlign: "center" }}>Loading timelines...</p>
      ) : filteredReports.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "#f9fafb", borderRadius: 12 }}>
          <p style={{ fontSize: 18, marginBottom: 16 }}>No reports yet for these filters.</p>
          <a href="/submit" style={{ color: "#2563eb", textDecoration: "underline" }}>
            Be the first to submit!
          </a>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {filteredReports.map((r) => {
            const days = calculateDays(r.submittedAt, r.decisionAt);
            return (
              <div key={r.id} style={{ 
                border: "1px solid #e5e7eb", 
                padding: 20, 
                borderRadius: 10,
                background: "white",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
                      {r.office.city} — {r.processType.name}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 14, opacity: 0.7 }}>
                      {r.office.name}
                    </div>
                  </div>
                  {days !== null && (
                    <div style={{ 
                      padding: "6px 12px", 
                      background: "#dbeafe", 
                      borderRadius: 6,
                      fontWeight: 700,
                      color: "#1e40af"
                    }}>
                      {days} days
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
                  gap: 12,
                  marginTop: 12,
                  padding: 12,
                  background: "#f9fafb",
                  borderRadius: 6
                }}>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 2 }}>Submitted</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {new Date(r.submittedAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 2 }}>Decision</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {r.decisionAt ? new Date(r.decisionAt).toLocaleDateString('de-DE') : "Pending"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 2 }}>Status</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {r.status === 'approved' ? '✅ Approved' : 
                       r.status === 'rejected' ? '❌ Rejected' : 
                       '⏳ Pending'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 2 }}>Method</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {r.method === 'online' ? '💻 Online' : 
                       r.method === 'in-person' ? '🏢 In-Person' : 
                       '📮 Mail'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: 40, textAlign: "center" }}>
        <a 
          href="/submit"
          style={{ 
            display: "inline-block",
            padding: "12px 24px", 
            background: "#16a34a", 
            color: "white", 
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 16,
            fontWeight: 600
          }}
        >
          ➕ Submit Your Timeline
        </a>
      </div>
    </main>
  );
}
