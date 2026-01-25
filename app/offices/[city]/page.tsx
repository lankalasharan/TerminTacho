"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officeId: data.office.id,
          ...reviewForm,
        }),
      });

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
        // Refresh data
        const newData = await fetch(`/api/offices/${city}`).then(r => r.json());
        setData(newData);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
        <p style={{ color: "#6b7280" }}>Loading office details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>❌</div>
        <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>Office Not Found</h1>
        <Link href="/timelines" style={{ color: "#667eea" }}>← Back to Timelines</Link>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return "⭐".repeat(Math.round(rating));
  };

  return (
    <>
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "60px 20px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "16px" }}>
            <Link href="/timelines" style={{ color: "white", opacity: 0.9, textDecoration: "none", fontSize: "14px" }}>
              ← Back to All Offices
            </Link>
          </div>
          <h1 style={{ fontSize: "48px", fontWeight: 800, marginBottom: "12px" }}>
            📍 {data.office.city}
          </h1>
          <p style={{ fontSize: "20px", opacity: 0.95, marginBottom: "24px" }}>
            {data.office.name}
          </p>

          {/* Quick Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px",
            marginTop: "32px",
          }}>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "20px", borderRadius: "12px", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "32px", fontWeight: 800 }}>{data.statistics.avgProcessingDays}</div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>Avg. Days</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "20px", borderRadius: "12px", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "32px", fontWeight: 800 }}>{data.statistics.successRate}%</div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>Success Rate</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "20px", borderRadius: "12px", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "32px", fontWeight: 800 }}>{data.statistics.avgRating.toFixed(1)}</div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>Avg. Rating</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", padding: "20px", borderRadius: "12px", backdropFilter: "blur(10px)" }}>
              <div style={{ fontSize: "32px", fontWeight: 800 }}>{data.statistics.totalReports}</div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>Reports</div>
            </div>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" }}>
        {/* Contact Information */}
        {(data.office.address || data.office.phone || data.office.website) && (
          <div style={{
            background: "white",
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            marginBottom: "40px",
            border: "1px solid #f3f4f6",
          }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "#1a1a1a" }}>
              📞 Contact Information
            </h2>
            {data.office.address && <p style={{ marginBottom: "8px", color: "#374151" }}>📍 {data.office.address}</p>}
            {data.office.phone && <p style={{ marginBottom: "8px", color: "#374151" }}>☎️ {data.office.phone}</p>}
            {data.office.website && (
              <p style={{ color: "#374151" }}>
                🌐 <a href={data.office.website} target="_blank" rel="noopener noreferrer" style={{ color: "#667eea" }}>
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
          border: "1px solid #f3f4f6",
        }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "#1a1a1a" }}>
            📊 Processing Times by Type
          </h2>
          <div style={{ display: "grid", gap: "16px" }}>
            {data.processStats.map((stat) => (
              <div key={stat.name} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                background: "#f9fafb",
                borderRadius: "8px",
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{stat.name}</div>
                  <div style={{ fontSize: "14px", color: "#6b7280" }}>{stat.count} reports</div>
                </div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#667eea" }}>
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
          border: "1px solid #f3f4f6",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a" }}>
              ⭐ Reviews ({data.statistics.totalReviews})
            </h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
              background: "#f9fafb",
              borderRadius: "12px",
              marginBottom: "24px",
            }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Overall Rating *</label>
                <select
                  value={reviewForm.overallRating}
                  onChange={(e) => setReviewForm({ ...reviewForm, overallRating: parseInt(e.target.value) })}
                  style={{ padding: "8px", borderRadius: "6px", border: "2px solid #e5e7eb", width: "100%" }}
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
                    style={{ padding: "8px", borderRadius: "6px", border: "2px solid #e5e7eb", width: "100%" }}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>Staff Friendliness</label>
                  <select
                    value={reviewForm.staffRating}
                    onChange={(e) => setReviewForm({ ...reviewForm, staffRating: parseInt(e.target.value) })}
                    style={{ padding: "8px", borderRadius: "6px", border: "2px solid #e5e7eb", width: "100%" }}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 600 }}>Processing Speed</label>
                  <select
                    value={reviewForm.speedRating}
                    onChange={(e) => setReviewForm({ ...reviewForm, speedRating: parseInt(e.target.value) })}
                    style={{ padding: "8px", borderRadius: "6px", border: "2px solid #e5e7eb", width: "100%" }}
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
                  style={{ padding: "10px", borderRadius: "6px", border: "2px solid #e5e7eb", width: "100%", fontSize: "14px" }}
                  placeholder="e.g., Quick and helpful service"
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>Your Experience *</label>
                <textarea
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                  rows={4}
                  style={{ padding: "10px", borderRadius: "6px", border: "2px solid #e5e7eb", width: "100%", fontSize: "14px", fontFamily: "inherit" }}
                  placeholder="Share your experience with this office..."
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                    color: "#6b7280",
                    border: "2px solid #e5e7eb",
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
            <p style={{ color: "#6b7280", textAlign: "center", padding: "40px 20px" }}>
              No reviews yet. Be the first to review this office!
            </p>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {data.recentReviews.map((review: any) => (
                <div key={review.id} style={{
                  padding: "20px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "18px", marginBottom: "4px" }}>
                        {renderStars(review.overallRating)}
                      </div>
                      {review.title && (
                        <div style={{ fontWeight: 600, color: "#1a1a1a", marginBottom: "4px" }}>
                          {review.title}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p style={{ color: "#374151", lineHeight: 1.6 }}>{review.content}</p>
                  {review.processType && (
                    <div style={{ marginTop: "12px", fontSize: "14px", color: "#667eea" }}>
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
          border: "1px solid #f3f4f6",
        }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "20px", color: "#1a1a1a" }}>
            📝 Recent Timeline Reports
          </h2>
          {data.recentReports.length === 0 ? (
            <p style={{ color: "#6b7280", textAlign: "center", padding: "20px" }}>No reports yet</p>
          ) : (
            <div style={{ display: "grid", gap: "16px" }}>
              {data.recentReports.map((report: any) => {
                const processingDays = report.decisionAt
                  ? Math.floor((new Date(report.decisionAt).getTime() - new Date(report.submittedAt).getTime()) / (1000 * 60 * 60 * 24))
                  : null;

                return (
                  <div key={report.id} style={{
                    padding: "16px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    borderLeft: `4px solid ${report.status === 'approved' ? '#10b981' : report.status === 'rejected' ? '#ef4444' : '#f59e0b'}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{report.processType.name}</div>
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
                      <div style={{ fontSize: "14px", color: "#667eea", fontWeight: 600 }}>
                        ⏱️ {processingDays} days processing time
                      </div>
                    )}
                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>
                      Submitted {new Date(report.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
