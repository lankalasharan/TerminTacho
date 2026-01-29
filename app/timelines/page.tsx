"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import GermanyMap from "../components/GermanyMap";
import ShareButtons from "../components/ShareButtons";
import {
  calculateRelevanceWeight,
  calculateWeightedAverage,
  getDataAgeLabel,
  getRelevanceBadgeStyle,
} from "@/lib/relevance";

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

function getPercentile(arr: number[], percentile: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

function getDayRange(days: number): string {
  if (days <= 30) return "0-30 days";
  if (days <= 60) return "31-60 days";
  if (days <= 90) return "61-90 days";
  if (days <= 120) return "91-120 days";
  return "120+ days";
}

export default function TimelinesPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [allProcessTypes, setAllProcessTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [processFilter, setProcessFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [reportsRes, optionsRes] = await Promise.all([
        fetch("/api/reports"),
        fetch("/api/options")
      ]);
      const reportsData = await reportsRes.json();
      const optionsData = await optionsRes.json();
      
      setReports(reportsData.reports || []);
      
      // Get unique cities from all offices
      const cities = [...new Set((optionsData.offices || []).map((o: any) => o.city))].sort() as string[];
      setAllCities(cities);
      
      // Get all process types
      const processes = ((optionsData.processTypes || []).map((p: any) => p.name).sort()) as string[];
      setAllProcessTypes(processes);
      
      setLoading(false);
    }
    load();
  }, []);

  const cities = allCities;
  const processTypes = allProcessTypes;

  const filteredReports = reports.filter(r => {
    if (cityFilter && r.office.city !== cityFilter) return false;
    if (processFilter && r.processType.name !== processFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  // Calculate comprehensive statistics with relevance weighting
  const completedReports = filteredReports.filter(r => r.decisionAt);
  const pendingReports = filteredReports.filter(r => !r.decisionAt);
  const approvedReports = filteredReports.filter(r => r.status === "approved");
  const rejectedReports = filteredReports.filter(r => r.status === "rejected");

  const waitingDays = completedReports
    .map(r => calculateDays(r.submittedAt, r.decisionAt))
    .filter(d => d !== null) as number[];

  // Calculate weighted average based on data age
  const weightsForAverage = completedReports
    .map(r => {
      const days = calculateDays(r.submittedAt, r.decisionAt);
      if (days === null) return 0;
      return calculateRelevanceWeight(r.submittedAt).weight;
    });

  const weightedAvgDays = waitingDays.length > 0
    ? calculateWeightedAverage(waitingDays, weightsForAverage)
    : null;

  const avgDays = weightedAvgDays; // Use weighted average instead of simple average
  const medianDays = waitingDays.length > 0 ? getPercentile(waitingDays, 50) : null;
  const p25Days = waitingDays.length > 0 ? getPercentile(waitingDays, 25) : null;
  const p75Days = waitingDays.length > 0 ? getPercentile(waitingDays, 75) : null;
  const minDays = waitingDays.length > 0 ? Math.min(...waitingDays) : null;
  const maxDays = waitingDays.length > 0 ? Math.max(...waitingDays) : null;

  const approvalRate = completedReports.length > 0 
    ? Math.round((approvedReports.length / completedReports.length) * 100) 
    : 0;

  // Distribution by time ranges
  const timeDistribution: { [key: string]: number } = {};
  waitingDays.forEach(days => {
    const range = getDayRange(days);
    timeDistribution[range] = (timeDistribution[range] || 0) + 1;
  });

  // Method distribution
  const onlineCount = filteredReports.filter(r => r.method === "online").length;
  const inPersonCount = filteredReports.filter(r => r.method === "in-person").length;

  // City statistics (with weighted averages)
  const cityStats: { [city: string]: { count: number; avgDays: number | null } } = {};
  cities.forEach(city => {
    const cityReports = filteredReports.filter(r => r.office.city === city);
    const cityCompleted = cityReports.filter(r => r.decisionAt);
    const cityDays = cityCompleted
      .map(r => calculateDays(r.submittedAt, r.decisionAt))
      .filter(d => d !== null) as number[];
    
    const cityWeights = cityCompleted
      .map(r => calculateRelevanceWeight(r.submittedAt).weight);
    
    const avg = cityDays.length > 0 
      ? calculateWeightedAverage(cityDays, cityWeights)
      : null;
    cityStats[city] = { count: cityReports.length, avgDays: avg };
  });

  // Process type statistics (with weighted averages)
  const processStats: { [process: string]: { count: number; avgDays: number | null } } = {};
  processTypes.forEach(process => {
    const processReports = filteredReports.filter(r => r.processType.name === process);
    const processCompleted = processReports.filter(r => r.decisionAt);
    const processDays = processCompleted
      .map(r => calculateDays(r.submittedAt, r.decisionAt))
      .filter(d => d !== null) as number[];
    
    const processWeights = processCompleted
      .map(r => calculateRelevanceWeight(r.submittedAt).weight);
    
    const avg = processDays.length > 0 
      ? calculateWeightedAverage(processDays, processWeights)
      : null;
    processStats[process] = { count: processReports.length, avgDays: avg };
  });

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .timeline-map-btn {
            padding: 8px 12px !important;
            font-size: 12px !important;
            top: 70px !important;
            right: 10px !important;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .filter-container {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .filter-item {
            width: 100% !important;
          }
          .reports-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .timeline-map-btn {
            padding: 6px 10px !important;
            font-size: 11px !important;
            top: 65px !important;
            right: 8px !important;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .stat-card {
            padding: 12px !important;
          }
          .stat-card h3 {
            font-size: 14px !important;
          }
          .stat-card p {
            font-size: 12px !important;
          }
          .filter-container {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .filter-item {
            width: 100% !important;
            font-size: 13px !important;
            padding: 8px !important;
          }
          .reports-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .report-card {
            padding: 12px !important;
          }
          .report-card h4 {
            font-size: 14px !important;
          }
          .report-card p {
            font-size: 12px !important;
          }
        }
      `}</style>
      {/* Floating Map Button */}
      <button
        className="timeline-map-btn"
        onClick={() => setShowMap(!showMap)}
        style={{
          position: "fixed",
          top: "80px",
          right: "20px",
          zIndex: 500,
          padding: "12px 20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
        }}
      >
        � {showMap ? "Hide Map" : "Search in Map"}
      </button>

      {/* Full Page Map Overlay */}
      {showMap && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            paddingTop: "80px",
          }}
          onClick={() => setShowMap(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "1400px",
              maxHeight: "calc(90vh - 80px)",
              background: "white",
              borderRadius: "16px",
              padding: "20px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}>
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
                🗺️ Interactive City Map
              </h2>
              <button
                onClick={() => setShowMap(false)}
                style={{
                  background: "#f3f4f6",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ✕ Close
              </button>
            </div>
            <GermanyMap />
            <div style={{
              marginTop: "12px",
              padding: "12px",
              background: "#f9fafb",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#6b7280",
              textAlign: "center",
            }}>
              💡 Click on city markers to view processing time statistics and details
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
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
            marginBottom: "16px",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            📊 Processing Times Dashboard
          </h1>
          <p style={{
            fontSize: "20px",
            opacity: 0.95,
            marginBottom: "8px",
          }}>
            Aggregated insights from <strong>{filteredReports.length}</strong> community reports
          </p>
          <p style={{
            fontSize: "16px",
            opacity: 0.85,
          }}>
            Real data ranges • Not exact values • Community driven
          </p>
          <div style={{ marginTop: "24px" }}>
            <ShareButtons 
              title="Check out TerminTacho - Real processing times for German bureaucracy" 
              url="/timelines"
              description="Crowdsourced processing times for German bureaucratic processes"
            />
          </div>
        </div>
      </div>

      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px" }}>
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
            🔍 Filter Data
          </h2>
          
          <div className="filter-container" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}>
            <div className="filter-item">
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
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city} ({cityStats[city]?.count || 0} reports)
                  </option>
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
                <option value="">All Processes</option>
                {processTypes.map(pt => (
                  <option key={pt} value={pt}>
                    {pt} ({processStats[pt]?.count || 0} reports)
                  </option>
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
        {/* Dashboard Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            <div style={{ fontSize: "18px" }}>Loading dashboard data...</div>
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
              No data available
            </div>
            <div style={{ fontSize: "16px", color: "#6b7280" }}>
              Try adjusting your filters or be the first to share your experience!
            </div>
          </div>
        ) : (
          <>
            {/* Key Statistics Cards */}
            <div className="stats-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              marginBottom: "32px",
            }}>
              {/* Processing Time Range Card */}
              <div className="stat-card" style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "32px",
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(102, 126, 234, 0.25)",
              }}>
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "12px", fontWeight: 600 }}>
                  📅 TYPICAL PROCESSING TIME
                </div>
                <div style={{ fontSize: "42px", fontWeight: 800, marginBottom: "8px" }}>
                  {p25Days} - {p75Days} days
                </div>
                <div style={{ fontSize: "14px", opacity: 0.85 }}>
                  Range covers 50% of all cases
                </div>
                <div style={{ fontSize: "13px", opacity: 0.75, marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.3)" }}>
                  Median: <strong>{medianDays} days</strong>
                </div>
              </div>

              {/* Approval Rate Card */}
              <div style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                padding: "32px",
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)",
              }}>
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "12px", fontWeight: 600 }}>
                  ✅ APPROVAL RATE
                </div>
                <div style={{ fontSize: "42px", fontWeight: 800, marginBottom: "8px" }}>
                  {approvalRate}%
                </div>
                <div style={{ fontSize: "14px", opacity: 0.85 }}>
                  Based on {completedReports.length} completed cases
                </div>
                <div style={{ fontSize: "13px", opacity: 0.75, marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.3)" }}>
                  Approved: <strong>{approvedReports.length}</strong> • Rejected: <strong>{rejectedReports.length}</strong>
                </div>
              </div>

              {/* Total Reports Card */}
              <div style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "white",
                padding: "32px",
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(245, 158, 11, 0.25)",
              }}>
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "12px", fontWeight: 600 }}>
                  📊 TOTAL REPORTS
                </div>
                <div style={{ fontSize: "42px", fontWeight: 800, marginBottom: "8px" }}>
                  {filteredReports.length}
                </div>
                <div style={{ fontSize: "14px", opacity: 0.85 }}>
                  Community contributions
                </div>
                <div style={{ fontSize: "13px", opacity: 0.75, marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.3)" }}>
                  Pending: <strong>{pendingReports.length}</strong> • Completed: <strong>{completedReports.length}</strong>
                </div>
              </div>
            </div>

            {/* Processing Time Distribution */}
            {Object.keys(timeDistribution).length > 0 && (
              <div style={{
                background: "white",
                padding: "32px",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                marginBottom: "32px",
                border: "1px solid #f3f4f6",
              }}>
                <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px", color: "#1a1a1a" }}>
                  ⏱️ Processing Time Distribution
                </h2>
                <div style={{ display: "grid", gap: "16px" }}>
                  {Object.entries(timeDistribution)
                    .sort((a, b) => {
                      const order = ["0-30 days", "31-60 days", "61-90 days", "91-120 days", "120+ days"];
                      return order.indexOf(a[0]) - order.indexOf(b[0]);
                    })
                    .map(([range, count]) => {
                      const percentage = Math.round((count / waitingDays.length) * 100);
                      return (
                        <div key={range}>
                          <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#374151",
                          }}>
                            <span>{range}</span>
                            <span>{count} reports ({percentage}%)</span>
                          </div>
                          <div style={{
                            width: "100%",
                            height: "32px",
                            background: "#f3f4f6",
                            borderRadius: "8px",
                            overflow: "hidden",
                            position: "relative",
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: "100%",
                              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              paddingRight: "12px",
                              color: "white",
                              fontSize: "13px",
                              fontWeight: 700,
                              minWidth: percentage > 10 ? "auto" : "0",
                            }}>
                              {percentage > 10 && `${percentage}%`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Submission Method Breakdown */}
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              marginBottom: "32px",
              border: "1px solid #f3f4f6",
            }}>
              <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px", color: "#1a1a1a" }}>
                📬 Submission Methods
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "24px",
              }}>
                <div style={{
                  padding: "24px",
                  background: "#f9fafb",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>🌐</div>
                  <div style={{ fontSize: "32px", fontWeight: 800, marginBottom: "4px", color: "#667eea" }}>
                    {onlineCount}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
                    Online Submissions
                  </div>
                  <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "8px" }}>
                    {Math.round((onlineCount / filteredReports.length) * 100)}% of total
                  </div>
                </div>
                <div style={{
                  padding: "24px",
                  background: "#f9fafb",
                  borderRadius: "12px",
                  border: "2px solid #e5e7eb",
                }}>
                  <div style={{ fontSize: "32px", marginBottom: "8px" }}>🏢</div>
                  <div style={{ fontSize: "32px", fontWeight: 800, marginBottom: "4px", color: "#10b981" }}>
                    {inPersonCount}
                  </div>
                  <div style={{ fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
                    In-Person Submissions
                  </div>
                  <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "8px" }}>
                    {Math.round((inPersonCount / filteredReports.length) * 100)}% of total
                  </div>
                </div>
              </div>
            </div>

            {/* City Breakdown */}
            {!cityFilter && cities.length > 0 && (
              <div style={{
                background: "white",
                padding: "32px",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                marginBottom: "32px",
                border: "1px solid #f3f4f6",
              }}>
                <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px", color: "#1a1a1a" }}>
                  📍 Processing Times by City
                </h2>
                <div className="reports-grid" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "20px",
                }}>
                  {cities
                    .filter(city => cityStats[city].avgDays !== null)
                    .sort((a, b) => (cityStats[a].avgDays || 0) - (cityStats[b].avgDays || 0))
                    .map(city => {
                      const stats = cityStats[city];
                      return (
                        <div
                          key={city}
                          className="report-card"
                          style={{
                            padding: "20px",
                            background: "#f9fafb",
                            borderRadius: "12px",
                            border: "2px solid #e5e7eb",
                            transition: "all 0.2s",
                            cursor: "pointer",
                          }}
                          onClick={() => setCityFilter(city)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#667eea";
                            e.currentTarget.style.background = "#f0f4ff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.background = "#f9fafb";
                          }}
                        >
                          <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#1a1a1a" }}>
                            {city}
                          </div>
                          <div style={{ fontSize: "28px", fontWeight: 800, color: "#667eea", marginBottom: "4px" }}>
                            ~{stats.avgDays} days
                          </div>
                          <div style={{ fontSize: "13px", color: "#6b7280" }}>
                            Based on {stats.count} {stats.count === 1 ? "report" : "reports"}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Process Type Breakdown */}
            {!processFilter && processTypes.length > 0 && (
              <div style={{
                background: "white",
                padding: "32px",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                marginBottom: "32px",
                border: "1px solid #f3f4f6",
              }}>
                <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px", color: "#1a1a1a" }}>
                  📋 Processing Times by Type
                </h2>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "20px",
                }}>
                  {processTypes
                    .filter(process => processStats[process].avgDays !== null)
                    .sort((a, b) => (processStats[a].avgDays || 0) - (processStats[b].avgDays || 0))
                    .map(process => {
                      const stats = processStats[process];
                      return (
                        <div
                          key={process}
                          style={{
                            padding: "20px",
                            background: "#f9fafb",
                            borderRadius: "12px",
                            border: "2px solid #e5e7eb",
                            transition: "all 0.2s",
                            cursor: "pointer",
                          }}
                          onClick={() => setProcessFilter(process)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#10b981";
                            e.currentTarget.style.background = "#f0fdf4";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.background = "#f9fafb";
                          }}
                        >
                          <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px", color: "#1a1a1a" }}>
                            {process}
                          </div>
                          <div style={{ fontSize: "28px", fontWeight: 800, color: "#10b981", marginBottom: "4px" }}>
                            ~{stats.avgDays} days
                          </div>
                          <div style={{ fontSize: "13px", color: "#6b7280" }}>
                            Based on {stats.count} {stats.count === 1 ? "report" : "reports"}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Info Banner - Updated with Relevance Explanation */}
            <div style={{
              background: "#fffbeb",
              border: "2px solid #fbbf24",
              borderRadius: "12px",
              padding: "20px",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
            }}>
              <div style={{ fontSize: "24px" }}>ℹ️</div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px", color: "#92400e" }}>
                  About This Data & Relevance Weighting
                </div>
                <div style={{ fontSize: "14px", color: "#78350f", lineHeight: 1.6, marginBottom: "12px" }}>
                  All statistics show aggregated ranges and averages from community reports, not exact individual values. 
                  Times may vary based on specific circumstances. This data is for informational purposes only.
                </div>
                <div style={{ fontSize: "13px", color: "#78350f", fontStyle: "italic", paddingTop: "12px", borderTop: "1px solid rgba(251, 191, 36, 0.3)" }}>
                  <strong>🎯 Data Relevance:</strong> Recent submissions ({"<"} 6 months) have full weight. Data 1-2 years old has reduced weight. 
                  Data older than 2 years may not reflect current processing times and has minimal impact on averages.
                </div>
              </div>
            </div>

            {/* Recent Submissions with Relevance Badges */}
            <div style={{
              background: "white",
              padding: "32px",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              marginTop: "32px",
              border: "1px solid #f3f4f6",
            }}>
              <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px", color: "#1a1a1a" }}>
                🕐 Recent Submissions (with Data Relevance)
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "16px",
              }}>
                {filteredReports
                  .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                  .slice(0, 12) // Show latest 12
                  .map(report => {
                    const relevance = calculateRelevanceWeight(report.submittedAt);
                    const badgeStyle = getRelevanceBadgeStyle(relevance.category);
                    const waitTime = calculateDays(report.submittedAt, report.decisionAt);
                    
                    return (
                      <div
                        key={report.id}
                        style={{
                          padding: "16px",
                          background: "#f9fafb",
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#d1d5db";
                          e.currentTarget.style.background = "#ffffff";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e5e7eb";
                          e.currentTarget.style.background = "#f9fafb";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {/* Relevance Badge */}
                        <div style={{
                          display: "inline-block",
                          padding: "4px 12px",
                          background: badgeStyle.bg,
                          color: badgeStyle.text,
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          marginBottom: "12px",
                        }}>
                          {badgeStyle.emoji} {relevance.category === "recent" ? "Recent" : relevance.category === "relevant" ? "Relevant" : "Older Data"}
                          {" "} ({getDataAgeLabel(relevance.ageInDays)})
                        </div>

                        {/* City & Process */}
                        <div style={{ marginBottom: "12px" }}>
                          <div style={{ fontSize: "13px", color: "#9ca3af", fontWeight: 600 }}>
                            📍 {report.office.city}
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a1a", marginTop: "4px" }}>
                            {report.processType.name}
                          </div>
                        </div>

                        {/* Status & Waiting Time */}
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "12px",
                          paddingTop: "12px",
                          borderTop: "1px solid #e5e7eb",
                        }}>
                          <div>
                            <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600 }}>
                              Status
                            </div>
                            <div style={{
                              fontSize: "14px",
                              fontWeight: 700,
                              marginTop: "4px",
                              color: report.status === "approved" ? "#10b981" : report.status === "rejected" ? "#ef4444" : "#f59e0b",
                            }}>
                              {report.status === "approved" ? "✅ Approved" : report.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
                            </div>
                          </div>
                          {waitTime !== null && (
                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600 }}>
                                Processing Time
                              </div>
                              <div style={{ fontSize: "18px", fontWeight: 800, color: "#667eea", marginTop: "4px" }}>
                                {waitTime}d
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Relevance Weight Indicator */}
                        <div style={{
                          fontSize: "11px",
                          color: "#9ca3af",
                          paddingTop: "12px",
                          borderTop: "1px solid #e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}>
                          <span>Data Weight: </span>
                          <div style={{
                            width: "60px",
                            height: "4px",
                            background: "#e5e7eb",
                            borderRadius: "2px",
                            overflow: "hidden",
                          }}>
                            <div style={{
                              width: `${relevance.weight * 100}%`,
                              height: "100%",
                              background: relevance.weight >= 0.9 ? "#10b981" : relevance.weight >= 0.6 ? "#f59e0b" : "#ef4444",
                              transition: "width 0.3s",
                            }} />
                          </div>
                          <span style={{ fontWeight: 700 }}>
                            {Math.round(relevance.weight * 100)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
