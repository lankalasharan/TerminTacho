"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserStats = {
  totalSubmissions: number;
  totalReviews: number;
  lastSubmission: string | null;
};

type UserReport = {
  id: string;
  status: string;
  submittedAt: string;
  createdAt: string;
  processType: { name: string } | null;
  office: { city: string; name: string } | null;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      loadStats();
      loadReports();
    }
  }, [session]);

  async function loadStats() {
    try {
      const res = await fetch("/api/user/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadReports() {
    try {
      const res = await fetch("/api/user/reports");
      const data = await res.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setReportsLoading(false);
    }
  }

  async function handleDeleteReport(reportId: string) {
    if (!window.confirm("Delete this report? This cannot be undone.")) return;
    setDeletingId(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "user_request" }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data?.error || "Failed to delete report.");
        return;
      }
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setStats((prev) => prev ? { ...prev, totalSubmissions: prev.totalSubmissions - 1 } : prev);
    } catch {
      alert("Failed to delete report.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError(null);

    if (!deleteConfirm) {
      setDeleteError("Please check the box to confirm account removal.");
      return;
    }

    const confirmed = window.confirm(
      "This will permanently delete your account and all your contributions. Continue?"
    );

    if (!confirmed) return;

    setDeleteLoading(true);
    try {
      const res = await fetch("/api/user/delete", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to delete account");
      }
      await signOut({ callbackUrl: "/" });
    } catch (error: any) {
      setDeleteError(error?.message || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (status === "loading") {
    return <div style={{ padding: "60px 20px", textAlign: "center" }}>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <section className="tt-hero">
        <div className="tt-container" style={{ textAlign: "center" }}>
          <div className="tt-chip" style={{ margin: "0 auto" }}>
            Account overview
          </div>
          <h1 className="tt-hero-title">My dashboard.</h1>
          <p className="tt-hero-subtitle">
            Welcome, {session.user?.email || "User"}! Track your contributions and next steps.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center" }}>Loading your stats...</div>
        ) : stats ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "24px",
            marginBottom: "40px",
          }}>
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid var(--tt-border)",
              textAlign: "center",
            }}>
              <div style={{ marginBottom: "12px", color: "var(--tt-primary-strong)" }}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="20" x2="20" y2="20" />
                  <rect x="5" y="10" width="3" height="8" rx="1" />
                  <rect x="10.5" y="6" width="3" height="12" rx="1" />
                  <rect x="16" y="12" width="3" height="6" rx="1" />
                </svg>
              </div>
              <div style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "var(--tt-primary-strong)",
                marginBottom: "8px",
              }}>
                {stats.totalSubmissions}
              </div>
              <div style={{ fontSize: "14px", color: "var(--tt-text-muted)", fontWeight: 600 }}>
                Total Submissions
              </div>
            </div>

            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid var(--tt-border)",
              textAlign: "center",
            }}>
              <div style={{ marginBottom: "12px", color: "var(--tt-success)" }}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="12 3 15 9 22 9 16.5 13.5 18.5 20 12 16 5.5 20 7.5 13.5 2 9 9 9 12 3" />
                </svg>
              </div>
              <div style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "var(--tt-success)",
                marginBottom: "8px",
              }}>
                {stats.totalReviews}
              </div>
              <div style={{ fontSize: "14px", color: "var(--tt-text-muted)", fontWeight: 600 }}>
                Total Reviews
              </div>
            </div>

            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid var(--tt-border)",
              textAlign: "center",
            }}>
              <div style={{ marginBottom: "12px", color: "var(--tt-text)" }}>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <line x1="16" y1="3" x2="16" y2="7" />
                  <line x1="8" y1="3" x2="8" y2="7" />
                  <line x1="3" y1="11" x2="21" y2="11" />
                  <rect x="7" y="14" width="4" height="4" rx="1" />
                </svg>
              </div>
              <div style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--tt-text)",
                marginBottom: "8px",
              }}>
                {stats.lastSubmission
                  ? new Date(stats.lastSubmission).toLocaleDateString()
                  : "Never"}
              </div>
              <div style={{ fontSize: "14px", color: "var(--tt-text-muted)", fontWeight: 600 }}>
                Last Submission
              </div>
            </div>
          </div>
        ) : null}

        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          border: "1px solid var(--tt-border)",
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "24px",
            color: "var(--tt-text)",
          }}>
            Quick Actions
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}>
            <a
              href="/submit"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px",
                background: "var(--tt-surface-soft)",
                border: "1px solid var(--tt-border)",
                borderRadius: "12px",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f0f4ff";
                e.currentTarget.style.borderColor = "var(--tt-primary-strong)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--tt-surface-soft)";
                e.currentTarget.style.borderColor = "var(--tt-border)";
              }}
            >
              <div style={{ marginBottom: "12px", color: "var(--tt-primary-strong)" }}>
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
                  <line x1="13" y1="6" x2="18" y2="11" />
                </svg>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--tt-text)" }}>
                Submit Timeline
              </div>
            </a>

            <a
              href="/timelines"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px",
                background: "var(--tt-surface-soft)",
                border: "1px solid var(--tt-border)",
                borderRadius: "12px",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f0fdf4";
                e.currentTarget.style.borderColor = "var(--tt-success)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--tt-surface-soft)";
                e.currentTarget.style.borderColor = "var(--tt-border)";
              }}
            >
              <div style={{ marginBottom: "12px", color: "var(--tt-success)" }}>
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="4" y1="20" x2="20" y2="20" />
                  <rect x="5" y="11" width="3" height="7" rx="1" />
                  <rect x="10.5" y="8" width="3" height="10" rx="1" />
                  <rect x="16" y="5" width="3" height="13" rx="1" />
                </svg>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--tt-text)" }}>
                Browse Timelines
              </div>
            </a>

            <a
              href="/leaderboard"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px",
                background: "var(--tt-surface-soft)",
                border: "1px solid var(--tt-border)",
                borderRadius: "12px",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef3c7";
                e.currentTarget.style.borderColor = "#f59e0b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--tt-surface-soft)";
                e.currentTarget.style.borderColor = "var(--tt-border)";
              }}
            >
              <div style={{ marginBottom: "12px", color: "#f59e0b" }}>
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M8 4h8v3a4 4 0 0 1-8 0V4z" />
                  <path d="M6 4H4a3 3 0 0 0 3 3" />
                  <path d="M18 4h2a3 3 0 0 1-3 3" />
                  <path d="M12 11v4" />
                  <path d="M9 19h6" />
                  <path d="M10 15h4" />
                </svg>
              </div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--tt-text)" }}>
                View Leaderboard
              </div>
            </a>
          </div>
        </div>

        <div
          style={{
            marginTop: "32px",
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            border: "1px solid var(--tt-border)",
          }}
        >
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px", color: "var(--tt-text)" }}>
            My Reports
          </h2>

          {reportsLoading ? (
            <div style={{ color: "var(--tt-text-muted)" }}>Loading your reports...</div>
          ) : reports.length === 0 ? (
            <div style={{ color: "var(--tt-text-muted)" }}>You have no submitted reports yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {reports.map((r) => {
                const statusColor =
                  r.status === "approved" ? "#16a34a" :
                  r.status === "rejected" ? "#dc2626" :
                  r.status === "withdrawn" ? "#6b7280" : "#d97706";
                const statusBg =
                  r.status === "approved" ? "#dcfce7" :
                  r.status === "rejected" ? "#fee2e2" :
                  r.status === "withdrawn" ? "#f3f4f6" : "#fef3c7";

                return (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      background: "var(--tt-surface-soft)",
                      borderRadius: "10px",
                      border: "1px solid var(--tt-border)",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: "15px", color: "var(--tt-text)", marginBottom: "4px" }}>
                        {r.processType?.name ?? "Unknown process"}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--tt-text-muted)" }}>
                        {r.office ? `${r.office.city} — ${r.office.name}` : "Unknown office"}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--tt-text-muted)", marginTop: "2px" }}>
                        Submitted {new Date(r.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: statusBg,
                        color: statusColor,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.status}
                    </span>
                    <button
                      type="button"
                      disabled={deletingId === r.id}
                      onClick={() => handleDeleteReport(r.id)}
                      style={{
                        background: deletingId === r.id ? "#fca5a5" : "#fee2e2",
                        color: "#b91c1c",
                        border: "1px solid #fca5a5",
                        borderRadius: "8px",
                        padding: "8px 14px",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: deletingId === r.id ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {deletingId === r.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: "32px",
            background: "#fff5f5",
            padding: "32px",
            borderRadius: "16px",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 700,
              marginBottom: "12px",
              color: "#b91c1c",
            }}
          >
            Delete account
          </h2>
          <p style={{ margin: "0 0 16px", color: "#7f1d1d" }}>
            This will permanently remove your account, submissions, reviews, votes, and any newsletter
            subscription tied to your email. This action cannot be undone.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(239, 68, 68, 0.35)",
                background: "#fff",
                fontSize: "14px",
                color: "#7f1d1d",
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              I understand this cannot be undone
            </label>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              style={{
                background: deleteLoading ? "#fca5a5" : "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "12px 18px",
                fontWeight: 700,
              }}
            >
              {deleteLoading ? "Deleting..." : "Delete my account"}
            </button>
          </div>
          {deleteError && (
            <div style={{ marginTop: "12px", color: "#b91c1c", fontWeight: 600 }}>
              {deleteError}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

