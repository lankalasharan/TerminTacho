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
  const [statusFilter, setStatusFilter] = useState("");

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

  const cities = [...new Set(reports.map(r => r.office.city))].sort();
  const processTypes = [...new Set(reports.map(r => r.processType.name))].sort();

  const filteredReports = reports.filter(r => {
    if (cityFilter && r.office.city !== cityFilter) return false;
    if (processFilter && r.processType.name !== processFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  const completedReports = filteredReports.filter(r => r.decisionAt);
  const waitingDays = completedReports.map(r => calculateDays(r.submittedAt, r.decisionAt)).filter(d => d !== null) as number[];
  const avgDays = waitingDays.length > 0 ? Math.round(waitingDays.reduce((a, b) => a + b, 0) / waitingDays.length) : null;
  const minDays = waitingDays.length > 0 ? Math.min(...waitingDays) : null;
  const maxDays = waitingDays.length > 0 ? Math.max(...waitingDays) : null;

  return (
    <>
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "60px 20px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{
            fontSize: "48px",
            fontWeight: 800,
            marginBottom: "16px",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            📊 Processing Timelines
          </h1>
          <p style={{
            fontSize: "20px",
            opacity: 0.95,
            marginBottom: "32px",
          }}>
            Real experiences from <strong>{reports.length}</strong> community reports
          </p>

          {/* Statistics Bar */}
          {completedReports.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "16px",
              marginTop: "32px",
            }}>
              <div style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.3)",
              }}>
                <div style={{ fontSize: "32px", fontWeight: 800, marginBottom: "4px" }}>
                  {avgDays}
                </div>
                <div style={{ fontSize: "14px", opacity: 0.9 }}>Avg Days</div>
              </div>
              
              <div style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.3)",
              }}>
                <div style={{ fontSize: "32px", fontWeight: 800, marginBottom: "4px" }}>
                  {minDays}
                </div>
                <div style={{ fontSize: "14px", opacity: 0.9 }}>Fastest</div>
              </div>
              
              <div style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.3)",
              }}>
                <div style={{ fontSize: "32px", fontWeight: 800, marginBottom: "4px" }}>
                  {maxDays}
                </div>
                <div style={{ fontSize: "14px", opacity: 0.9 }}>Longest</div>
              </div>
              
              <div style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.3)",
              }}>
                <div style={{ fontSize: "32px", fontWeight: 800, marginBottom: "4px" }}>
                  {completedReports.length}
                </div>
                <div style={{ fontSize: "14px", opacity: 0.9 }}>Completed</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
        {/* Filters */}
        <div style={{
          background: "white",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          marginBottom: "32px",
          border: "1px solid #f3f4f6",
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", color: "#1a1a1a" }}>
            🔍 Filter Reports
          </h2>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}>
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151"
              }}>
                City
              </label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  cursor: "pointer",
                  background: "white",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
              >
                <option value="">All Cities ({cities.length})</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151"
              }}>
                Process Type
              </label>
              <select
                value={processFilter}
                onChange={(e) => setProcessFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  cursor: "pointer",
                  background: "white",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
              >
                <option value="">All Processes ({processTypes.length})</option>
                {processTypes.map(pt => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151"
              }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  cursor: "pointer",
                  background: "white",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e5e7eb"}
              >
                <option value="">All Statuses</option>
                <option value="approved">✅ Approved</option>
                <option value="pending">⏳ Pending</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>
          </div>

          {(cityFilter || processFilter || statusFilter) && (
            <button
              onClick={() => {
                setCityFilter("");
                setProcessFilter("");
                setStatusFilter("");
              }}
              style={{
                marginTop: "16px",
                padding: "10px 20px",
                background: "#f3f4f6",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                color: "#6b7280",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#e5e7eb"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#f3f4f6"}
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div style={{
          marginBottom: "24px",
          fontSize: "16px",
          color: "#6b7280",
          fontWeight: 600,
        }}>
          Showing {filteredReports.length} {filteredReports.length === 1 ? "report" : "reports"}
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            <div style={{ fontSize: "18px" }}>Loading timelines...</div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: "16px",
            border: "1px solid #f3f4f6",
          }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>📭</div>
            <div style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px", color: "#1a1a1a" }}>
              No reports found
            </div>
            <div style={{ fontSize: "16px", color: "#6b7280" }}>
              Try adjusting your filters or be the first to share your experience!
            </div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gap: "20px",
          }}>
            {filteredReports.map(report => {
              const days = calculateDays(report.submittedAt, report.decisionAt);
              const statusColors = {
                approved: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
                pending: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
                rejected: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
              };
              const statusColor = statusColors[report.status as keyof typeof statusColors] || statusColors.pending;

              return (
                <div
                  key={report.id}
                  style={{
                    background: "white",
                    padding: "28px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    border: "1px solid #f3f4f6",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "16px",
                    marginBottom: "16px",
                  }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <h3 style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        marginBottom: "8px",
                        color: "#1a1a1a",
                      }}>
                        {report.processType.name}
                      </h3>
                      <div style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}>
                        📍 {report.office.city} • {report.office.name}
                      </div>
                    </div>

                    <div style={{
                      padding: "8px 16px",
                      background: statusColor.bg,
                      border: `2px solid ${statusColor.border}`,
                      color: statusColor.text,
                      borderRadius: "20px",
                      fontSize: "14px",
                      fontWeight: 700,
                      textTransform: "capitalize",
                    }}>
                      {report.status === "approved" && "✅"} 
                      {report.status === "pending" && "⏳"} 
                      {report.status === "rejected" && "❌"} 
                      {report.status}
                    </div>
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "16px",
                    padding: "16px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px", fontWeight: 600 }}>
                        Method
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: 600, color: "#374151" }}>
                        {report.method === "online" ? "🌐" : "🏢"} {report.method}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px", fontWeight: 600 }}>
                        Submitted
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: 600, color: "#374151" }}>
                        {new Date(report.submittedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {report.decisionAt && (
                      <>
                        <div>
                          <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px", fontWeight: 600 }}>
                            Decision
                          </div>
                          <div style={{ fontSize: "16px", fontWeight: 600, color: "#374151" }}>
                            {new Date(report.decisionAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px", fontWeight: 600 }}>
                            Processing Time
                          </div>
                          <div style={{ fontSize: "20px", fontWeight: 800, color: "#667eea" }}>
                            {days} days
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div style={{ fontSize: "12px", color: "#9ca3af", textAlign: "right" }}>
                    Reported {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
