"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DataAccessGate from "../../components/DataAccessGate";
import TurnstileWidget from "../../components/Turnstile";
import TrustBadge from "../../components/TrustBadge";

interface OfficeData {
  office: {
    id: string;
    city: string;
    name: string;
    address?: string;
    phone?: string;
    website?: string;
  };
  statistics: {
    totalReports: number;
    approvedReports: number;
    rejectedReports: number;
    pendingReports: number;
    successRate: number;
    avgProcessingDays: number;
    avgRating: number;
    totalReviews: number;
  };
  processStats: Array<{
    name: string;
    count: number;
    avgDays: number | null;
  }>;
  recentReports: any[];
  recentReviews: any[];
}

export default function OfficePage() {
  const params = useParams();
  const city = params.city as string;
  const [data, setData] = useState<OfficeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  const [reviewForm, setReviewForm] = useState({
    overallRating: 5,
    serviceRating: 5,
    staffRating: 5,
    speedRating: 5,
    title: "",
    content: "",
    processType: "",
  });

  useEffect(() => {
    fetch(`/api/offices/${city}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [city]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    setReviewMsg(null);
    setCaptchaError(null);

    if (siteKey && !turnstileToken) {
      setReviewMsg("Error: Please complete the CAPTCHA.");
      setCaptchaError("Please complete the CAPTCHA.");
      return;
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officeId: data.office.id,
          ...reviewForm,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const detail = Array.isArray(errorData?.details)
          ? errorData.details.map((d: any) => d.message).join(" ")
          : "";
        const reasons = Array.isArray(errorData?.reasons)
          ? errorData.reasons.join(" ")
          : "";
        setReviewMsg(
          `Error: ${errorData?.error || "Failed to submit review"}${detail ? ` — ${detail}` : ""}${reasons ? ` — ${reasons}` : ""}`
        );
        return;
      }

      if (response.ok) {
        setShowReviewForm(false);
        setReviewForm({
          overallRating: 5,
          serviceRating: 5,
          staffRating: 5,
          speedRating: 5,
          title: "",
          content: "",
          processType: "",
        });
        setTurnstileToken("");
        setReviewMsg("Success: Review submitted successfully!");
        // Refresh data
        const newData = await fetch(`/api/offices/${city}`).then(r => r.json());
        setData(newData);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewMsg("Error: Failed to submit review. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
        </div>
        <p style={{ color: "var(--tt-text-muted)" }}>Loading office details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </div>
        <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Office Not Found</h1>
        <Link href="/timelines" style={{ color: "var(--tt-primary-strong)", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to Timelines
        </Link>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    const stars = Math.max(1, Math.round(rating));
    return (
      <div style={{ display: "inline-flex", gap: "4px" }} aria-label={`${stars} star rating`}>
        {Array.from({ length: stars }).map((_, idx) => (
          <svg key={idx} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l2.9 6.1 6.7.9-4.8 4.6 1.2 6.6L12 17.8 6 20.2l1.2-6.6L2.4 9l6.7-.9L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <DataAccessGate softGate>
      <>
      <section className="tt-hero">
        <div className="tt-container">
          <div style={{ marginBottom: "12px" }}>
            <Link href="/timelines" style={{ color: "var(--tt-text-muted)", textDecoration: "none", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              Back to All Offices
            </Link>
          </div>
          <h1 className="tt-hero-title">
            {data.office.city}
          </h1>
          <p className="tt-hero-subtitle" style={{ marginLeft: 0, marginRight: 0 }}>
            {data.office.name}
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link
              href="/submit"
              className="tt-btn-primary"
              style={{ padding: "12px 20px", borderRadius: "12px", textDecoration: "none" }}
            >
              Submit Timeline
            </Link>
          </div>

          <div className="tt-stat-grid" style={{ marginTop: "32px" }}>
            <div className="tt-stat-card">
              <h3>Avg. Days</h3>
              <strong>{data.statistics.totalReports > 0 ? data.statistics.avgProcessingDays : "—"}</strong>
            </div>
            <div className="tt-stat-card">
              <h3>Success Rate</h3>
              <strong>{data.statistics.totalReports > 0 ? `${data.statistics.successRate}%` : "—"}</strong>
            </div>
            <div className="tt-stat-card">
              <h3>Avg. Rating</h3>
              <strong>{data.statistics.totalReviews > 0 ? data.statistics.avgRating.toFixed(1) : "—"}</strong>
            </div>
            <div className="tt-stat-card">
              <h3>Reports</h3>
              <strong>{data.statistics.totalReports > 0 ? data.statistics.totalReports : "Be first!"}</strong>
            </div>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" }}>
        {/* Contact Information */}
        {(data.office.address || data.office.phone || data.office.website) && (
          <div style={{
            background: "white",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            marginBottom: "40px",
            border: "1px solid var(--tt-surface-muted)",
          }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--tt-text)", display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.9v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L8 9.5a16 16 0 0 0 6 6l1.17-1.17a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.9z" />
              </svg>
              Contact Information
            </h2>
            {data.office.address && (
              <p style={{ marginBottom: "8px", color: "var(--tt-text-strong)", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                <span>{data.office.address}</span>
              </p>
            )}
            {data.office.phone && (
              <p style={{ marginBottom: "8px", color: "var(--tt-text-strong)", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.9v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.12.86.3 1.7.54 2.5a2 2 0 0 1-.45 2.11L8 9.5a16 16 0 0 0 6 6l1.17-1.17a2 2 0 0 1 2.11-.45c.8.24 1.64.42 2.5.54A2 2 0 0 1 22 16.9z" />
                </svg>
                <span>{data.office.phone}</span>
              </p>
            )}
            {data.office.website && (
              <p style={{ color: "var(--tt-text-strong)", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <a href={data.office.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--tt-primary-strong)" }}>
                  {data.office.website}
                </a>
              </p>
            )}
          </div>
        )}

        {/* Process Statistics */}
        <div style={{
          background: "white",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          marginBottom: "40px",
          border: "1px solid var(--tt-surface-muted)",
        }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--tt-text)", display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 3v18h18" />
              <path d="M7 13h3v5H7z" />
              <path d="M12 9h3v9h-3z" />
              <path d="M17 5h3v13h-3z" />
            </svg>
            Processing Times by Type
          </h2>
          <div style={{ display: "grid", gap: "16px" }}>
            {data.processStats.map((stat) => (
              <div key={stat.name} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                background: "var(--tt-surface-soft)",
                borderRadius: "8px",
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--tt-text)" }}>{stat.name}</div>
                  <div style={{ fontSize: "14px", color: "var(--tt-text-muted)" }}>
                    {stat.count > 0 ? `${stat.count} reports` : (
                      <Link href="/submit" style={{ color: "var(--tt-primary-strong)", textDecoration: "none", fontWeight: 600 }}>
                        Be the first to report →
                      </Link>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: stat.count > 0 ? "var(--tt-primary-strong)" : "var(--tt-text-muted)" }}>
                  {stat.count > 0 ? (stat.avgDays !== null ? `${stat.avgDays} days` : "Pending") : "No data yet"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{
          background: "white",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          marginBottom: "40px",
          border: "1px solid var(--tt-surface-muted)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--tt-text)", display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l2.9 6.1 6.7.9-4.8 4.6 1.2 6.6L12 17.8 6 20.2l1.2-6.6L2.4 9l6.7-.9L12 2z" />
              </svg>
              Reviews ({data.statistics.totalReviews})
            </h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Write a Review
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} style={{
              padding: "24px",
              background: "var(--tt-surface-soft)",
              borderRadius: "12px",
              marginBottom: "24px",
            }}>
              {reviewMsg && (
                <div style={{
                  marginBottom: "16px",
                  padding: "12px",
                  borderRadius: "8px",
                  background: reviewMsg.startsWith("Success:") ? "#d1fae5" : "#fee2e2",
                  border: `1px solid ${reviewMsg.startsWith("Success:") ? "#a7f3d0" : "#fecaca"}`,
                  fontSize: "13px",
                  fontWeight: 600,
                }}>
                  {reviewMsg}
                </div>
              )}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Overall Rating *</label>
                <select
                  value={reviewForm.overallRating}
                  onChange={(e) => setReviewForm({ ...reviewForm, overallRating: parseInt(e.target.value) })}
                  style={{ padding: "8px", borderRadius: "6px", border: "2px solid var(--tt-border)", width: "100%" }}
                  required
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>Service Quality</label>
                  <select
                    value={reviewForm.serviceRating}
                    onChange={(e) => setReviewForm({ ...reviewForm, serviceRating: parseInt(e.target.value) })}
                    style={{ padding: "8px", borderRadius: "6px", border: "2px solid var(--tt-border)", width: "100%" }}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>Staff Friendliness</label>
                  <select
                    value={reviewForm.staffRating}
                    onChange={(e) => setReviewForm({ ...reviewForm, staffRating: parseInt(e.target.value) })}
                    style={{ padding: "8px", borderRadius: "6px", border: "2px solid var(--tt-border)", width: "100%" }}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>Processing Speed</label>
                  <select
                    value={reviewForm.speedRating}
                    onChange={(e) => setReviewForm({ ...reviewForm, speedRating: parseInt(e.target.value) })}
                    style={{ padding: "8px", borderRadius: "6px", border: "2px solid var(--tt-border)", width: "100%" }}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Review Title</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  style={{ padding: "10px", borderRadius: "6px", border: "2px solid var(--tt-border)", width: "100%", fontSize: "14px" }}
                  placeholder="e.g., Quick and helpful service"
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Your Experience *</label>
                <textarea
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                  rows={4}
                  style={{ padding: "10px", borderRadius: "6px", border: "2px solid var(--tt-border)", width: "100%", fontSize: "14px", fontFamily: "inherit" }}
                  placeholder="Share your experience with this office..."
                  required
                />
              </div>

              {siteKey && (
                <div style={{ marginBottom: "16px" }}>
                  <TurnstileWidget
                    siteKey={siteKey}
                    onVerify={setTurnstileToken}
                    onExpire={() => setCaptchaError("CAPTCHA expired. Please try again.")}
                    onError={() => setCaptchaError("CAPTCHA failed. Please try again.")}
                  />
                  {captchaError && (
                    <div style={{ marginTop: "8px", fontSize: "12px", color: "#991b1b" }}>
                      {captchaError}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  style={{
                    padding: "12px 24px",
                    background: "white",
                    color: "var(--tt-text-muted)",
                    border: "2px solid var(--tt-border)",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {data.recentReviews.length === 0 ? (
            <p style={{ color: "var(--tt-text-muted)", textAlign: "center", padding: "40px 20px" }}>
              No reviews yet. Be the first to review this office!
            </p>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {data.recentReviews.map((review: any) => (
                <div key={review.id} style={{
                  padding: "20px",
                  border: "1px solid var(--tt-border)",
                  borderRadius: "12px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "18px", marginBottom: "4px" }}>
                        {renderStars(review.overallRating)}
                      </div>
                      {review.title && (
                        <div style={{ fontWeight: 600, color: "var(--tt-text)", marginBottom: "4px" }}>
                          {review.title}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--tt-muted)" }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p style={{ color: "var(--tt-text-strong)", lineHeight: 1.6 }}>{review.content}</p>
                  {review.processType && (
                    <div style={{ marginTop: "12px", fontSize: "14px", color: "var(--tt-primary-strong)" }}>
                      Process: {review.processType}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div style={{
          background: "white",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid var(--tt-surface-muted)",
        }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--tt-text)", display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            Recent Timeline Reports
          </h2>
          {data.recentReports.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: "var(--tt-text-muted)", marginBottom: "16px", fontSize: "16px" }}>
                No timelines submitted yet for this office.
              </p>
              <Link
                href="/submit"
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
                  color: "white",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Be the first — Submit your timeline →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {data.recentReports.map((report: any) => {
                const processingDays = report.decisionAt
                  ? Math.floor((new Date(report.decisionAt).getTime() - new Date(report.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <div key={report.id} style={{
                    padding: "16px",
                    background: "var(--tt-surface-soft)",
                    borderRadius: "8px",
                    borderLeft: `4px solid ${report.status === 'approved' ? 'var(--tt-success)' : report.status === 'rejected' ? '#ef4444' : '#f59e0b'}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div style={{ fontWeight: 600, color: "var(--tt-text)" }}>{report.processType.name}</div>
                      <div style={{
                        padding: "4px 12px",
                        background: report.status === 'approved' ? '#d1fae5' : report.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                        color: report.status === 'approved' ? '#065f46' : report.status === 'rejected' ? '#991b1b' : '#92400e',
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}>
                        {report.status}
                      </div>
                    </div>
                    {processingDays !== null && (
                      <div style={{ fontSize: "14px", color: "var(--tt-primary-strong)", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 3" />
                        </svg>
                        <span>{processingDays} days processing time</span>
                      </div>
                    )}
                    <div style={{ fontSize: "12px", color: "var(--tt-muted)", marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                      <span>Submitted {new Date(report.submittedAt).toLocaleDateString()}</span>
                      <TrustBadge reportId={report.id} trustLevel={report.trustLevel ?? "unverified"} matchCount={report.matchCount ?? 0} isAdminSeeded={report.isAdminSeeded} sourceUrl={report.sourceUrl} adminNote={report.adminNote} compact />
                    </div>
                    {report.notes && (
                      <div style={{ marginTop: "10px", fontSize: "13px", color: "var(--tt-text-strong)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginTop: 2 }}>
                          <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                        </svg>
                        <span>{report.notes}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      </>
    </DataAccessGate>
  );
}

