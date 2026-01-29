"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserStats = {
  totalSubmissions: number;
  totalReviews: number;
  lastSubmission: string | null;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      loadStats();
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

  if (status === "loading") {
    return <div style={{ padding: "60px 20px", textAlign: "center" }}>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "60px 20px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: 800,
            marginBottom: "24px",
          }}>
            👤 My Dashboard
          </h1>
          <p style={{
            fontSize: "20px",
            opacity: 0.9,
          }}>
            Welcome, {session.user?.email || "User"}!
          </p>
        </div>
      </div>

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
              border: "1px solid #e5e7eb",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📊</div>
              <div style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#667eea",
                marginBottom: "8px",
              }}>
                {stats.totalSubmissions}
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
                Total Submissions
              </div>
            </div>

            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>⭐</div>
              <div style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#10b981",
                marginBottom: "8px",
              }}>
                {stats.totalReviews}
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
                Total Reviews
              </div>
            </div>

            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📅</div>
              <div style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#1a1a1a",
                marginBottom: "8px",
              }}>
                {stats.lastSubmission
                  ? new Date(stats.lastSubmission).toLocaleDateString()
                  : "Never"}
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
                Last Submission
              </div>
            </div>
          </div>
        ) : null}

        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "24px",
            color: "#1a1a1a",
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
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f0f4ff";
                e.currentTarget.style.borderColor = "#667eea";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>✍️</div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a" }}>
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
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f0fdf4";
                e.currentTarget.style.borderColor = "#10b981";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>📊</div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a" }}>
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
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#fef3c7";
                e.currentTarget.style.borderColor = "#f59e0b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f9fafb";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>🏆</div>
              <div style={{ fontSize: "16px", fontWeight: 600, color: "#1a1a1a" }}>
                View Leaderboard
              </div>
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
