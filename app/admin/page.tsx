"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type AdminReport = {
  id: string;
  status: string;
  submittedAt: string;
  decisionAt: string | null;
  method: string;
  createdAt: string;
  confidenceScore: number;
  userEmail: string | null;
  ipAddress: string | null;
  office: { city: string; name: string } | null;
  processType: { name: string } | null;
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  approved: { bg: "#dcfce7", color: "#16a34a" },
  rejected: { bg: "#fee2e2", color: "#dc2626" },
  withdrawn: { bg: "#f3f4f6", color: "#6b7280" },
  pending: { bg: "#fef3c7", color: "#d97706" },
};

export default function AdminPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const [reports, setReports] = useState<AdminReport[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Filters
  const [cityFilter, setCityFilter] = useState("");
  const [processFilter, setProcessFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appliedCity, setAppliedCity] = useState("");
  const [appliedProcess, setAppliedProcess] = useState("");
  const [appliedStatus, setAppliedStatus] = useState("");

  const pageSize = 50;

  const loadReports = useCallback(async (p: number, city: string, process: string, status: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      if (city) params.set("city", city);
      if (process) params.set("processType", process);
      if (status) params.set("status", status);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (res.status === 403) {
        setIsAdmin(false);
        return;
      }
      setIsAdmin(true);
      const data = await res.json();
      setReports(data.reports ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }
    if (sessionStatus === "authenticated") {
      loadReports(page, appliedCity, appliedProcess, appliedStatus);
    }
  }, [sessionStatus, page, appliedCity, appliedProcess, appliedStatus, loadReports, router]);

  async function handleDelete(reportId: string) {
    if (!window.confirm("Permanently delete this report? This cannot be undone.")) return;
    setDeletingId(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data?.error || "Failed to delete report.");
        return;
      }
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setTotal((prev) => prev - 1);
    } catch {
      alert("Failed to delete report.");
    } finally {
      setDeletingId(null);
    }
  }

  function applyFilters() {
    setPage(1);
    setAppliedCity(cityFilter);
    setAppliedProcess(processFilter);
    setAppliedStatus(statusFilter);
  }

  function clearFilters() {
    setCityFilter("");
    setProcessFilter("");
    setStatusFilter("");
    setPage(1);
    setAppliedCity("");
    setAppliedProcess("");
    setAppliedStatus("");
  }

  if (sessionStatus === "loading" || isAdmin === null) {
    return <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--tt-text-muted)" }}>Loading…</div>;
  }

  if (isAdmin === false) {
    return (
      <main style={{ padding: "80px 20px", textAlign: "center" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#b91c1c", marginBottom: "12px" }}>Access Denied</h1>
        <p style={{ color: "var(--tt-text-muted)" }}>You do not have permission to access this page.</p>
      </main>
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      <section style={{ background: "#1e1b4b", padding: "48px 20px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,0.1)", borderRadius: "999px",
            padding: "4px 14px", fontSize: "13px", color: "#a5b4fc",
            fontWeight: 600, marginBottom: "16px",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            Admin only
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>
            Admin Panel
          </h1>
          <p style={{ color: "#a5b4fc", fontSize: "16px" }}>
            Signed in as <strong style={{ color: "#e0e7ff" }}>{session?.user?.email}</strong>
            &nbsp;·&nbsp; {total} total reports
          </p>
        </div>
      </section>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>

        {/* Filters */}
        <div style={{
          background: "white", border: "1px solid var(--tt-border)",
          borderRadius: "16px", padding: "24px", marginBottom: "24px",
        }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)" }}>
            Filter Reports
          </h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 180px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--tt-text-muted)" }}>City</label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                placeholder="e.g. Berlin"
                style={{ padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--tt-border)", fontSize: "14px" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 220px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--tt-text-muted)" }}>Process Type</label>
              <input
                type="text"
                value={processFilter}
                onChange={(e) => setProcessFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                placeholder="e.g. Citizenship"
                style={{ padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--tt-border)", fontSize: "14px" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 150px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--tt-text-muted)" }}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: "9px 12px", borderRadius: "8px", border: "1px solid var(--tt-border)", fontSize: "14px", background: "white" }}
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={applyFilters}
                style={{
                  padding: "9px 20px", borderRadius: "8px", border: "none",
                  background: "#1e1b4b", color: "white", fontWeight: 700,
                  fontSize: "14px", cursor: "pointer",
                }}
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                style={{
                  padding: "9px 16px", borderRadius: "8px",
                  border: "1px solid var(--tt-border)", background: "white",
                  fontWeight: 600, fontSize: "14px", cursor: "pointer",
                  color: "var(--tt-text-muted)",
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div style={{ background: "white", border: "1px solid var(--tt-border)", borderRadius: "16px", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--tt-text-muted)" }}>Loading reports…</div>
          ) : reports.length === 0 ? (
            <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--tt-text-muted)" }}>No reports match your filters.</div>
          ) : (
            <>
              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 140px 100px 90px 80px",
                gap: "0",
                padding: "12px 20px",
                background: "#f8f9fa",
                borderBottom: "1px solid var(--tt-border)",
                fontSize: "11px", fontWeight: 700, color: "var(--tt-text-muted)",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                <span>Process / Office</span>
                <span>Submitter</span>
                <span>Submitted</span>
                <span>Status</span>
                <span>Confidence</span>
                <span></span>
              </div>

              {reports.map((r) => {
                const sc = STATUS_COLORS[r.status] ?? STATUS_COLORS.pending;
                const conf = Math.round((r.confidenceScore ?? 0) * 100);
                const confColor = conf >= 75 ? "#16a34a" : conf >= 50 ? "#d97706" : "#dc2626";

                return (
                  <div
                    key={r.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 140px 100px 90px 80px",
                      gap: "0",
                      padding: "14px 20px",
                      borderBottom: "1px solid var(--tt-border)",
                      alignItems: "center",
                    }}
                  >
                    {/* Process / Office */}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--tt-text)", marginBottom: "2px" }}>
                        {r.processType?.name ?? "—"}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--tt-text-muted)" }}>
                        {r.office ? `${r.office.city} — ${r.office.name}` : "—"}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--tt-text-muted)", marginTop: "2px" }}>
                        via {r.method} · ID: <code style={{ fontSize: "10px" }}>{r.id.slice(0, 8)}…</code>
                      </div>
                    </div>

                    {/* Submitter */}
                    <div>
                      <div style={{ fontSize: "13px", color: "var(--tt-text)", fontWeight: 600 }}>
                        {r.userEmail ?? <span style={{ color: "var(--tt-text-muted)", fontWeight: 400 }}>anonymous</span>}
                      </div>
                      {r.ipAddress && (
                        <div style={{ fontSize: "11px", color: "var(--tt-text-muted)", marginTop: "2px" }}>
                          IP: {r.ipAddress}
                        </div>
                      )}
                    </div>

                    {/* Submitted date */}
                    <div style={{ fontSize: "13px", color: "var(--tt-text-muted)" }}>
                      <div>{new Date(r.submittedAt).toLocaleDateString("de-DE")}</div>
                      <div style={{ fontSize: "11px", marginTop: "2px" }}>
                        Added {new Date(r.createdAt).toLocaleDateString("de-DE")}
                      </div>
                    </div>

                    {/* Status badge */}
                    <div>
                      <span style={{
                        padding: "4px 10px", borderRadius: "999px",
                        fontSize: "11px", fontWeight: 700,
                        background: sc.bg, color: sc.color,
                      }}>
                        {r.status}
                      </span>
                    </div>

                    {/* Confidence */}
                    <div style={{ fontSize: "13px", fontWeight: 700, color: confColor }}>
                      {conf}%
                    </div>

                    {/* Delete */}
                    <div>
                      <button
                        type="button"
                        disabled={deletingId === r.id}
                        onClick={() => handleDelete(r.id)}
                        style={{
                          background: deletingId === r.id ? "#fca5a5" : "#fee2e2",
                          color: "#b91c1c",
                          border: "1px solid #fca5a5",
                          borderRadius: "8px",
                          padding: "6px 12px",
                          fontWeight: 700,
                          fontSize: "12px",
                          cursor: deletingId === r.id ? "not-allowed" : "pointer",
                        }}
                      >
                        {deletingId === r.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              style={{
                padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--tt-border)",
                background: "white", cursor: page === 1 ? "not-allowed" : "pointer",
                fontWeight: 600, opacity: page === 1 ? 0.4 : 1,
              }}
            >
              ← Previous
            </button>
            <span style={{ padding: "8px 16px", fontSize: "14px", color: "var(--tt-text-muted)" }}>
              Page {page} of {totalPages} ({total} reports)
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--tt-border)",
                background: "white", cursor: page === totalPages ? "not-allowed" : "pointer",
                fontWeight: 600, opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </>
  );
}
