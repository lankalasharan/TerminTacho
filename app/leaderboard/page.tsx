"use client";

import { useEffect, useState } from "react";
import DataAccessGate from "../components/DataAccessGate";

type Contributor = {
  id: string;
  email?: string | null;
  reportsCount: number;
  rank: number;
};

export default function LeaderboardPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard");
        const data = await res.json();
        setContributors(data.contributors || []);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  function maskEmail(email?: string | null) {
    if (!email || !email.includes("@")) return "Anonymous";
    const [name] = email.split("@");
    const safe = name.slice(0, 3);
    return `${safe}***@***`;
  }

  const medalColors = ["#F59E0B", "#9CA3AF", "#CD7C47"];

  return (
    <DataAccessGate>
      <>
      <section className="tt-hero">
        <div className="tt-container" style={{ textAlign: "center" }}>
          <div className="tt-chip" style={{ margin: "0 auto" }}>
            Community leaders
          </div>
          <h1 className="tt-hero-title">Top contributors.</h1>
          <p className="tt-hero-subtitle">
            Recognizing the community members who keep TerminTacho current.
          </p>
        </div>
      </section>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
              </svg>
            </div>
            <p>Loading leaderboard...</p>
          </div>
        ) : contributors.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <p>No contributions yet. Be the first to submit!</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gap: "16px",
          }}>
            {contributors.map((contributor, index) => (
              <div
                key={contributor.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  padding: "24px",
                  background: "white",
                  border: "1px solid var(--tt-border)",
                  borderRadius: "12px",
                  boxShadow: index < 3 ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <div style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  minWidth: "50px",
                  textAlign: "center",
                  color: index < 3 ? medalColors[index] : "var(--tt-text-muted)",
                }}>
                  {index < 3 ? `#${index + 1}` : `#${index + 1}`}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--tt-text)",
                    marginBottom: "4px",
                  }}>
                    Anonymous Contributor
                  </h3>
                  <p style={{
                    fontSize: "14px",
                    color: "var(--tt-text-muted)",
                  }}>
                    {maskEmail(contributor.email)}
                  </p>
                </div>

                <div style={{
                  textAlign: "right",
                }}>
                  <div style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "var(--tt-primary-strong)",
                  }}>
                    {contributor.reportsCount}
                  </div>
                  <div style={{
                    fontSize: "12px",
                    color: "var(--tt-muted)",
                  }}>
                    Reports Submitted
                  </div>
                </div>

                {index < 3 && (
                  <div style={{
                    padding: "8px 16px",
                    background: `${index === 0 ? "#FCD34D" : index === 1 ? "#D1D5DB" : "#FED7AA"}`,
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--tt-text)",
                  }}>
                    {index === 0 ? "GOLD" : index === 1 ? "SILVER" : "BRONZE"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{
          marginTop: "60px",
          padding: "40px",
          background: "var(--tt-surface-soft)",
          borderRadius: "12px",
          textAlign: "center",
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "16px",
            color: "var(--tt-text)",
          }}>
            Want to join the leaderboard?
          </h2>
          <p style={{
            fontSize: "16px",
            color: "var(--tt-text-muted)",
            marginBottom: "24px",
          }}>
            Every submission helps the community. Share your experience and become a top contributor!
          </p>
          <a
            href="/submit"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(28, 144, 216, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Submit Your Timeline
          </a>
        </div>
      </main>
      </>
    </DataAccessGate>
  );
}


