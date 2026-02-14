"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import DataAccessGate from "../../components/DataAccessGate";
import TurnstileWidget from "../../components/Turnstile";

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
      setReviewMsg("❌ Please complete the CAPTCHA.");
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
          `❌ ${errorData?.error || "Failed to submit review"}${detail ? ` — ${detail}` : ""}${reasons ? ` — ${reasons}` : ""}`
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
        setReviewMsg("✅ Review submitted successfully!");
        // Refresh data
        const newData = await fetch(`/api/offices/${city}`).then(r => r.json());
        setData(newData);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewMsg("❌ Failed to submit review. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
        <p style={{ color: "var(--tt-text-muted)" }}>Loading office details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
        <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Office Not Found</h1>
        <Link href="/timelines" style={{ color: "var(--tt-primary-strong)" }}>← Back to Timelines</Link>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return "⭐".repeat(Math.round(rating));
  };

  return (
    <DataAccessGate>
      <>
      <section className="tt-hero">
        <div className="tt-container">
          <div style={{ marginBottom: "12px" }}>
            <Link href="/timelines" style={{ color: "var(--tt-text-muted)", textDecoration: "none", fontSize: "14px" }}>
              ← Back to All Offices
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
              <strong>{data.statistics.avgProcessingDays}</strong>
            </div>
            <div className="tt-stat-card">
              <h3>Success Rate</h3>
              <strong>{data.statistics.successRate}%</strong>
            </div>
            <div className="tt-stat-card">
              <h3>Avg. Rating</h3>
              <strong>{data.statistics.avgRating.toFixed(1)}</strong>
            </div>
            <div className="tt-stat-card">
              <h3>Reports</h3>
              <strong>{data.statistics.totalReports}</strong>
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
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--tt-text)" }}>
              📞 Contact Information
            </h2>
            {data.office.address && <p style={{ marginBottom: "8px", color: "var(--tt-text-strong)" }}>📍 {data.office.address}</p>}
            {data.office.phone && <p style={{ marginBottom: "8px", color: "var(--tt-text-strong)" }}>☎️ {data.office.phone}</p>}
            {data.office.website && (
              <p style={{ color: "var(--tt-text-strong)" }}>
                🌐 <a href={data.office.website} target="_blank" rel="noopener noreferrer" style={{ color: "var(--tt-primary-strong)" }}>
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
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--tt-text)" }}>
            📊 Processing Times by Type
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
                  <div style={{ fontSize: "14px", color: "var(--tt-text-muted)" }}>{stat.count} reports</div>
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--tt-primary-strong)" }}>
                  {stat.avgDays !== null ? `${stat.avgDays} days` : "N/A"}
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
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--tt-text)" }}>
              ⭐ Reviews ({data.statistics.totalReviews})
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
                  background: reviewMsg.startsWith("✅") ? "#d1fae5" : "#fee2e2",
                  border: `1px solid ${reviewMsg.startsWith("✅") ? "#a7f3d0" : "#fecaca"}`,
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
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{renderStars(n)} {n} Star{n > 1 ? 's' : ''}</option>)}
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
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>Staff Friendliness</label>
                  <select
                    value={reviewForm.staffRating}
                    onChange={(e) => setReviewForm({ ...reviewForm, staffRating: parseInt(e.target.value) })}
                    style={{ padding: "8px", borderRadius: "6px", border: "2px solid var(--tt-border)", width: "100%" }}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>Processing Speed</label>
                  <select
                    value={reviewForm.speedRating}
                    onChange={(e) => setReviewForm({ ...reviewForm, speedRating: parseInt(e.target.value) })}
                    style={{ padding: "8px", borderRadius: "6px", border: "2px solid var(--tt-border)", width: "100%" }}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
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
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "var(--tt-text)" }}>
            📝 Recent Timeline Reports
          </h2>
          {data.recentReports.length === 0 ? (
            <p style={{ color: "var(--tt-text-muted)", textAlign: "center", padding: "20px" }}>No reports yet</p>
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
                      <div style={{ fontSize: "14px", color: "var(--tt-primary-strong)", fontWeight: 600 }}>
                        ⏱️ {processingDays} days processing time
                      </div>
                    )}
                    <div style={{ fontSize: "12px", color: "var(--tt-muted)", marginTop: "8px" }}>
                      Submitted {new Date(report.submittedAt).toLocaleDateString()}
                    </div>
                    {report.notes && (
                      <div style={{ marginTop: "10px", fontSize: "13px", color: "var(--tt-text-strong)" }}>
                        💬 {report.notes}
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

