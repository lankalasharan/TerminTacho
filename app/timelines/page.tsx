"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import GermanyMap from "../components/GermanyMap";
import ShareButtons from "../components/ShareButtons";
import DataAccessGate from "../components/DataAccessGate";
import KpiRibbon from "../components/insights/KpiRibbon";
import LeaderboardTable from "../components/insights/LeaderboardTable";
import { CityStat } from "@/lib/insightsUtils";
import {
  calculateWeightedAverage,
  getReportWeight,
} from "@/lib/relevance";
import { CITY_COORDINATES, DEFAULT_COORDINATES } from "@/lib/cityCoordinates";

// Dynamically import the map component to avoid SSR issues with Leaflet
const GermanyHeatMap = dynamic(
  () => import("../components/insights/GermanyHeatMap"),
  { ssr: false }
);

type Report = {
  id: string;
  method: string;
  submittedAt: string;
  decisionAt: string | null;
  status: string;
  createdAt: string;
  isOfficial?: boolean;
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

function getWeightedAverageDays(reports: Report[]): number | null {
  const days: number[] = [];
  const weights: number[] = [];

  reports.forEach((report) => {
    if (!report.decisionAt) return;
    const diff = calculateDays(report.submittedAt, report.decisionAt);
    if (diff === null || diff < 0) return;
    days.push(diff);
    weights.push(getReportWeight({ submittedAt: report.submittedAt, isOfficial: report.isOfficial }));
  });

  return days.length > 0 ? calculateWeightedAverage(days, weights) : null;
}

function normalizeProcessLabel(label: string): string {
  return label
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getProcessCategory(label: string): string {
  const l = label.toLowerCase();
  if (l.includes("student") || l.includes("phd") || l.includes("language course")) return "student";
  if (l.includes("work") || l.includes("blue card") || l.includes("employment") || l.includes("ict")) return "work";
  if (l.includes("family") || l.includes("spouse") || l.includes("child") || l.includes("parent")) return "family";
  if (l.includes("residence") || l.includes("settlement") || l.includes("address")) return "residence";
  if (l.includes("bank") || l.includes("tax") || l.includes("financial") || l.includes("blocked account")) return "finance";
  if (l.includes("citizenship") || l.includes("naturalization")) return "citizenship";
  if (l.includes("driver") || l.includes("vehicle")) return "transport";
  if (l.includes("business") || l.includes("entrepreneur") || l.includes("startup") || l.includes("investor")) return "business";
  return "document";
}

function getCategoryIconSvg(category: string): string {
  switch (category) {
    case "student":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='var(--tt-primary-strong)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 10 12 4 2 10l10 6 10-6Z'/><path d='M6 12v5c0 .8 3 2 6 2s6-1.2 6-2v-5'/></svg>";
    case "work":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#059669' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'/></svg>";
    case "family":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#db2777' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-3-3.87'/><path d='M4 21v-2a4 4 0 0 1 3-3.87'/><circle cx='12' cy='7' r='4'/></svg>";
    case "residence":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='var(--tt-primary-strong)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M3 11 12 3l9 8'/><path d='M5 10v11h14V10'/></svg>";
    case "finance":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='var(--tt-primary)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='5' width='18' height='14' rx='2'/><path d='M3 10h18'/></svg>";
    case "citizenship":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#a855f7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/></svg>";
    case "transport":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#f97316' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M5 16l1-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2l1 4'/><circle cx='7.5' cy='18.5' r='1.5'/><circle cx='16.5' cy='18.5' r='1.5'/></svg>";
    case "business":
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#f59e0b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='2' y='7' width='20' height='14' rx='2'/><path d='M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2'/></svg>";
    default:
      return "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='var(--tt-text-muted)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/><path d='M14 2v6h6'/></svg>";
  }
}

function getProcessIcon(label: string): string {
  const svg = getCategoryIconSvg(getProcessCategory(label));
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export default function TimelinesPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [allProcessTypes, setAllProcessTypes] = useState<string[]>([]);
  const [officeCoords, setOfficeCoords] = useState<Record<string, { lat: number; lng: number }>>({});
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [processFilter, setProcessFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [processOpen, setProcessOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const cities = allCities;
  const processTypes = allProcessTypes;

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    student: true,
    work: true,
    family: true,
    residence: true,
    business: true,
    document: true,
    citizenship: true,
    finance: true,
    transport: true,
  });

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

      // Build a city → coords map from DB-stored office lat/lng so newly added cities appear correctly
      const coordsFromDB: Record<string, { lat: number; lng: number }> = {};
      (optionsData.offices || []).forEach((o: any) => {
        if (o.city && o.lat && o.lng && !coordsFromDB[o.city]) {
          coordsFromDB[o.city] = { lat: o.lat, lng: o.lng };
        }
      });
      setOfficeCoords(coordsFromDB);
      
      // Get all process types
      const processes = ((optionsData.processTypes || []).map((p: any) => p.name).sort()) as string[];
      setAllProcessTypes(processes);
      
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("[data-process-dropdown]")) {
        setProcessOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

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

  const waitingDays: number[] = [];
  const weightsForAverage: number[] = [];
  completedReports.forEach((report) => {
    const days = calculateDays(report.submittedAt, report.decisionAt);
    if (days === null || days < 0) return;
    waitingDays.push(days);
    weightsForAverage.push(getReportWeight({ submittedAt: report.submittedAt, isOfficial: report.isOfficial }));
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
  // Derive city set from filteredReports directly so new cities from submissions appear immediately
  const reportCities = useMemo(
    () => [...new Set(filteredReports.map((r) => r.office.city))].sort(),
    [filteredReports]
  );

  const cityStats: { [city: string]: { count: number; avgDays: number | null } } = {};
  reportCities.forEach(city => {
    const cityReports = filteredReports.filter(r => r.office.city === city);
    const avg = getWeightedAverageDays(cityReports);
    cityStats[city] = { count: cityReports.length, avgDays: avg };
  });

  const cityInsightsStats = useMemo(() => {
    return reportCities
      .map((city) => {
        const cityData = cityStats[city];
        // Coordinate priority: 1) DB-stored office coords  2) static library  3) Germany centre
        const coords = officeCoords[city] ?? CITY_COORDINATES[city];

        if (!coords && cityData && cityData.count > 0) {
          console.warn(`⚠️ No coordinates found for city: "${city}" (${cityData.count} reports). Using default coordinates.`);
        }

        const finalCoords = coords || DEFAULT_COORDINATES;
        const avgDays = cityData?.avgDays ?? 0;
        const reports = cityData?.count ?? 0;

        let confidence: "low" | "medium" | "high";
        if (reports >= 10) confidence = "high";
        else if (reports >= 4) confidence = "medium";
        else confidence = "low";

        return {
          city,
          avgDays: Math.round(avgDays),
          reports,
          confidence,
          lat: finalCoords.lat,
          lng: finalCoords.lng,
        };
      })
      .filter((stat) => stat.reports > 0);
  }, [reportCities, cityStats, officeCoords]);

  // Process type statistics (with weighted averages)
  const processStats: { [process: string]: { count: number; avgDays: number | null } } = {};
  processTypes.forEach(process => {
    const processReports = filteredReports.filter(r => r.processType.name === process);
    const avg = getWeightedAverageDays(processReports);
    processStats[process] = { count: processReports.length, avgDays: avg };
  });

  return (
    <DataAccessGate>
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
          background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(28, 144, 216, 0.4)",
          transition: "all 0.2s",
          display: showMap ? "none" : "flex",
          alignItems: "center",
          gap: "8px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(28, 144, 216, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(28, 144, 216, 0.4)";
        }}
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ display: "block" }}
        >
          <path d="M12 2.5c-3.31 0-6 2.63-6 5.88 0 4.41 5.02 11.07 5.24 11.35a.95.95 0 0 0 1.52 0c.22-.28 5.24-6.94 5.24-11.35C18 5.13 15.31 2.5 12 2.5zm0 8.46a2.58 2.58 0 1 1 0-5.16 2.58 2.58 0 0 1 0 5.16z" />
          <path d="M3 21.5 10.2 18.5l3.8 1.6 7-3.2v-2l-7 3.2-3.8-1.6L3 19.5v2z" />
        </svg>
        {showMap ? "Hide Map" : "Search in Map"}
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
            zIndex: 90,
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
              <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--tt-text)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}>
                  <path d="M12 2.5c-3.31 0-6 2.63-6 5.88 0 4.41 5.02 11.07 5.24 11.35a.95.95 0 0 0 1.52 0c.22-.28 5.24-6.94 5.24-11.35C18 5.13 15.31 2.5 12 2.5zm0 8.46a2.58 2.58 0 1 1 0-5.16 2.58 2.58 0 0 1 0 5.16z" />
                  <path d="M3 21.5 10.2 18.5l3.8 1.6 7-3.2v-2l-7 3.2-3.8-1.6L3 19.5v2z" />
                </svg>
                Interactive City Map
              </h2>
              <button
                onClick={() => setShowMap(false)}
                style={{
                  background: "var(--tt-surface-muted)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--tt-text-muted)",
                }}
              >
                ✕ Close
              </button>
            </div>
            <GermanyMap />
            <div style={{
              marginTop: "12px",
              padding: "12px",
              background: "var(--tt-surface-soft)",
              borderRadius: "8px",
              fontSize: "13px",
              color: "var(--tt-text-muted)",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              Click on city markers to view processing time statistics and details
            </div>
          </div>
        </div>
      )}

      <section className="tt-hero">
        <div className="tt-container" style={{ textAlign: "center" }}>
          <div className="tt-chip" style={{ margin: "0 auto" }}>
            Processing intelligence
          </div>
          <h1 className="tt-hero-title">Processing Times Dashboard</h1>
          <p className="tt-hero-subtitle">
            Aggregated insights from {filteredReports.length} community reports. Real data ranges, not exact values.
          </p>
          <div style={{ marginTop: "24px" }}>
            <ShareButtons
              title="Check out TerminTacho - Real processing times for German bureaucracy"
              url="/timelines"
              description="Crowdsourced processing times for German bureaucratic processes"
            />
          </div>
        </div>
      </section>

      <main className="tt-section">
        <div className="tt-container" style={{ maxWidth: "1400px" }}>
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "16px",
        }}>
          <Link
            href="/offices"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "10px",
              background: "white",
              border: "1px solid var(--tt-border)",
              color: "#1f2937",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
              <path d="M9 22v-4h6v4"/>
              <path d="M8 6h.01"/>
              <path d="M16 6h.01"/>
              <path d="M12 6h.01"/>
              <path d="M12 10h.01"/>
              <path d="M12 14h.01"/>
              <path d="M16 10h.01"/>
              <path d="M16 14h.01"/>
              <path d="M8 10h.01"/>
              <path d="M8 14h.01"/>
            </svg>
            Browse Offices
          </Link>
        </div>
        {/* Filters */}
        <div style={{
          background: "var(--tt-surface)",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
          marginBottom: "32px",
          border: "1px solid var(--tt-border)",
        }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "24px", color: "var(--tt-text)", display: "flex", alignItems: "center", gap: "8px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            Filter Data
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
                color: "var(--tt-text-strong)"
              }}>
                City
              </label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid var(--tt-border)",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  cursor: "pointer",
                  background: "white",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "var(--tt-primary-strong)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "var(--tt-border)"}
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city} ({cityStats[city]?.count || 0} reports)
                  </option>
                ))}
              </select>
            </div>

            <div data-process-dropdown style={{ position: "relative" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--tt-text-strong)"
              }}>
                Process Type
              </label>
              <button
                type="button"
                onClick={() => setProcessOpen(!processOpen)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid var(--tt-border)",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  cursor: "pointer",
                  background: "white",
                  transition: "border-color 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "var(--tt-primary-strong)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "var(--tt-border)"}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={getProcessIcon(processFilter || "All Processes")}
                    alt=""
                    width={18}
                    height={18}
                    style={{ display: "block" }}
                  />
                  <span>
                    {processFilter ? normalizeProcessLabel(processFilter) : "All Processes"}
                  </span>
                </span>
                <span style={{ color: "var(--tt-muted)" }}>▾</span>
              </button>

              {processOpen && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 50,
                    marginTop: "8px",
                    width: "100%",
                    background: "white",
                    border: "1px solid var(--tt-border)",
                    borderRadius: "10px",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                    maxHeight: "320px",
                    overflowY: "auto",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setProcessFilter("");
                      setProcessOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: "white",
                      border: "none",
                      borderBottom: "1px solid var(--tt-surface-muted)",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <img
                      src={getProcessIcon("All Processes")}
                      alt=""
                      width={18}
                      height={18}
                      style={{ display: "block" }}
                    />
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>All Processes</span>
                  </button>
                  {processTypes.map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => {
                        setProcessFilter(pt);
                        setProcessOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "white",
                        border: "none",
                        borderBottom: "1px solid var(--tt-surface-muted)",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <img
                        src={getProcessIcon(pt)}
                        alt=""
                        width={18}
                        height={18}
                        style={{ display: "block" }}
                      />
                      <span style={{ fontSize: "14px" }}>
                        {normalizeProcessLabel(pt)} ({processStats[pt]?.count || 0} reports)
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--tt-text-strong)"
              }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid var(--tt-border)",
                  borderRadius: "8px",
                  fontSize: "16px",
                  outline: "none",
                  cursor: "pointer",
                  background: "white",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "var(--tt-primary-strong)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "var(--tt-border)"}
              >
                <option value="">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
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
                background: "var(--tt-surface-muted)",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                color: "var(--tt-text-muted)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-border)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
            >
              Clear All Filters
            </button>
          )}
        </div>
        {/* Dashboard Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--tt-muted)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
              </svg>
            </div>
            <div style={{ fontSize: "18px" }}>Loading dashboard data...</div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "white",
            borderRadius: "16px",
            border: "1px solid var(--tt-surface-muted)",
          }}>
            <div style={{ color: "white", marginBottom: "16px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px", color: "var(--tt-text)" }}>
              No data available
            </div>
            <div style={{ fontSize: "16px", color: "var(--tt-text-muted)" }}>
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
                background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
                color: "white",
                padding: "32px",
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(28, 144, 216, 0.25)",
              }}>
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  TYPICAL PROCESSING TIME
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
                background: "linear-gradient(135deg, var(--tt-success) 0%, #059669 100%)",
                color: "white",
                padding: "32px",
                borderRadius: "16px",
                boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)",
              }}>
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  APPROVAL RATE
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
                <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="20" x2="12" y2="10"/>
                    <line x1="18" y1="20" x2="18" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="16"/>
                  </svg>
                  TOTAL REPORTS
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
                border: "1px solid var(--tt-surface-muted)",
              }}>
                <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px", color: "var(--tt-text)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="20" x2="12" y2="10"/>
                    <line x1="18" y1="20" x2="18" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="16"/>
                  </svg>
                  Processing Time Distribution
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
                            color: "var(--tt-text-strong)",
                          }}>
                            <span>{range}</span>
                            <span>{count} reports ({percentage}%)</span>
                          </div>
                          <div style={{
                            width: "100%",
                            height: "32px",
                            background: "var(--tt-surface-muted)",
                            borderRadius: "8px",
                            overflow: "hidden",
                            position: "relative",
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: "100%",
                              background: "linear-gradient(90deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
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
              border: "1px solid var(--tt-surface-muted)",
            }}>
              <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px", color: "var(--tt-text)", display: "flex", alignItems: "center", gap: "8px" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 12H16l-2 3h-4l-2-3H2.5"/>
                  <path d="M5.5 5.1 2 12v6c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2v-6l-3.4-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.8 1.1z"/>
                </svg>
                Submission Methods
              </h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "24px",
              }}>
                <div style={{
                  padding: "24px",
                  background: "var(--tt-surface-soft)",
                  borderRadius: "12px",
                  border: "2px solid var(--tt-border)",
                }}>
                  <div style={{ marginBottom: "8px", color: "var(--tt-primary-strong)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 800, marginBottom: "4px", color: "var(--tt-primary-strong)" }}>
                    {onlineCount}
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--tt-text-muted)", fontWeight: 600 }}>
                    Online Submissions
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--tt-muted)", marginTop: "8px" }}>
                    {Math.round((onlineCount / filteredReports.length) * 100)}% of total
                  </div>
                </div>
                <div style={{
                  padding: "24px",
                  background: "var(--tt-surface-soft)",
                  borderRadius: "12px",
                  border: "2px solid var(--tt-border)",
                }}>
                  <div style={{ marginBottom: "8px", color: "var(--tt-success)" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                      <path d="M9 22v-4h6v4"/>
                      <path d="M8 6h.01"/>
                      <path d="M16 6h.01"/>
                      <path d="M12 6h.01"/>
                      <path d="M12 10h.01"/>
                      <path d="M12 14h.01"/>
                      <path d="M16 10h.01"/>
                      <path d="M16 14h.01"/>
                      <path d="M8 10h.01"/>
                      <path d="M8 14h.01"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: 800, marginBottom: "4px", color: "var(--tt-success)" }}>
                    {inPersonCount}
                  </div>
                  <div style={{ fontSize: "14px", color: "var(--tt-text-muted)", fontWeight: 600 }}>
                    In-Person Submissions
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--tt-muted)", marginTop: "8px" }}>
                    {Math.round((inPersonCount / filteredReports.length) * 100)}% of total
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Insights Dashboard */}
            {!cityFilter && cityInsightsStats.length > 0 && (
              <div style={{
                marginBottom: "32px",
              }}>
                {/* KPI Ribbon */}
                <div style={{ marginBottom: "24px" }}>
                  <KpiRibbon stats={cityInsightsStats} />
                </div>

                {/* Germany Map Heat View */}
                <div style={{
                  background: "white",
                  padding: "32px",
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  marginBottom: "24px",
                  border: "1px solid var(--tt-surface-muted)",
                }}>
                  <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    Processing Times by City - Interactive Map
                  </h2>
                  <p style={{ fontSize: "14px", color: "var(--tt-text-muted)", marginBottom: "20px" }}>
                    Click on any city marker to view detailed statistics
                  </p>
                  <GermanyHeatMap
                    stats={cityInsightsStats}
                    selectedCity={selectedCity}
                    onCitySelect={(city) => {
                      setSelectedCity(city);
                      // Also set the filter to show city-specific data below
                      if (city) setCityFilter(city);
                    }}
                  />
                </div>

                {/* City Leaderboard */}
                <div style={{
                  background: "white",
                  padding: "32px",
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  marginBottom: "24px",
                  border: "1px solid var(--tt-surface-muted)",
                }}>
                  <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "16px", color: "var(--tt-text)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                      <path d="M4 22h16"/>
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                    </svg>
                    City Leaderboard - Compare Processing Times
                  </h2>
                  <p style={{ fontSize: "14px", color: "var(--tt-text-muted)", marginBottom: "20px" }}>
                    Search, sort, and compare processing times across all cities
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: "var(--tt-surface-soft)",
                      border: "1px solid var(--tt-border)",
                      marginBottom: "16px",
                      fontSize: "13px",
                      color: "var(--tt-text-muted)",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "var(--tt-text)" }}>
                      Confidence = number of reports
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#10B981" }} />
                      High: 10+
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#F59E0B" }} />
                      Medium: 4-9
                    </span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "999px", background: "#9CA3AF" }} />
                      Low: 1-3
                    </span>
                  </div>
                  <LeaderboardTable
                    stats={cityInsightsStats}
                    selectedCity={selectedCity}
                    onCitySelect={(city) => {
                      setSelectedCity(city);
                      if (city) setCityFilter(city);
                    }}
                  />
                </div>
              </div>
            )}

            {/* Process Type Breakdown - Grouped by Category */}
            {!processFilter && processTypes.length > 0 && (() => {
              // Group process types by category
              const categorizedProcesses: Record<string, Array<{ name: string; stats: { count: number; avgDays: number | null } }>> = {};
              
              processTypes
                .filter(process => processStats[process].avgDays !== null)
                .forEach(process => {
                  const category = getProcessCategory(process);
                  if (!categorizedProcesses[category]) {
                    categorizedProcesses[category] = [];
                  }
                  categorizedProcesses[category].push({
                    name: process,
                    stats: processStats[process]
                  });
                });

              // Sort processes within each category by avgDays
              Object.keys(categorizedProcesses).forEach(cat => {
                categorizedProcesses[cat].sort((a, b) => (a.stats.avgDays || 0) - (b.stats.avgDays || 0));
              });

              // Calculate national average for comparison
              const nationalAvgDays = avgDays;

              // Category metadata
              const categoryMeta: Record<string, { label: string; color: string; iconSvg: string }> = {
                student: {
                  label: "Student & Education",
                  color: "var(--tt-primary-strong)",
                  iconSvg: getCategoryIconSvg("student")
                },
                work: {
                  label: "Work & Employment",
                  color: "var(--tt-success)",
                  iconSvg: getCategoryIconSvg("work")
                },
                family: {
                  label: "Family & Relationships",
                  color: "#ec4899",
                  iconSvg: getCategoryIconSvg("family")
                },
                residence: {
                  label: "Residence & Settlement",
                  color: "#8b5cf6",
                  iconSvg: getCategoryIconSvg("residence")
                },
                business: {
                  label: "Business & Investment",
                  color: "#f59e0b",
                  iconSvg: getCategoryIconSvg("business")
                },
                document: {
                  label: "Documents & Registration",
                  color: "#06b6d4",
                  iconSvg: getCategoryIconSvg("document")
                },
                citizenship: {
                  label: "Citizenship",
                  color: "#ef4444",
                  iconSvg: getCategoryIconSvg("citizenship")
                },
                finance: {
                  label: "Finance & Banking",
                  color: "#10b981",
                  iconSvg: getCategoryIconSvg("finance")
                },
                transport: {
                  label: "Transport & Vehicles",
                  color: "#6366f1",
                  iconSvg: getCategoryIconSvg("transport")
                },
              };

              const toggleCategory = (category: string) => {
                setExpandedCategories(prev => ({
                  ...prev,
                  [category]: !prev[category]
                }));
              };

              // Helper function to get performance color
              const getPerformanceColor = (avgDays: number, nationalAvg: number | null) => {
                if (!nationalAvg) return "var(--tt-primary)";
                const diff = avgDays - nationalAvg;
                if (diff <= -10) return "var(--tt-success)"; // Much faster
                if (diff <= 0) return "#10b981"; // Faster
                if (diff <= 10) return "#f59e0b"; // Slower
                return "#ef4444"; // Much slower
              };

              // Helper function to get confidence badge
              const getConfidenceBadge = (count: number) => {
                if (count >= 10) return { label: "High Confidence", color: "#10b981", bg: "#ecfdf5" };
                if (count >= 4) return { label: "Medium Confidence", color: "#f59e0b", bg: "#fffbeb" };
                return { label: "Low Confidence", color: "#ef4444", bg: "#fef2f2" };
              };

              return (
                <div style={{
                  background: "white",
                  padding: "32px",
                  borderRadius: "16px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  marginBottom: "32px",
                  border: "1px solid var(--tt-surface-muted)",
                }}>
                  <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px", color: "var(--tt-text)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                      <path d="M9 14h6"/>
                      <path d="M9 18h6"/>
                      <path d="M9 10h6"/>
                    </svg>
                    Processing Times by Category
                  </h2>
                  <p style={{ fontSize: "14px", color: "var(--tt-text-muted)", marginBottom: "24px" }}>
                    Organized by process type with performance indicators and data confidence levels
                  </p>

                  {/* Categories */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {Object.entries(categorizedProcesses)
                      .sort(([a], [b]) => {
                        const order = ["work", "student", "family", "residence", "business", "document", "citizenship", "finance", "transport"];
                        return order.indexOf(a) - order.indexOf(b);
                      })
                      .map(([category, processes]) => {
                        const meta = categoryMeta[category];
                        if (!meta) return null;
                        
                        const isExpanded = expandedCategories[category];
                        const totalProcesses = processes.length;

                        return (
                          <div
                            key={category}
                            style={{
                              border: "2px solid var(--tt-border)",
                              borderRadius: "12px",
                              overflow: "hidden",
                              transition: "all 0.2s",
                            }}
                          >
                            {/* Category Header */}
                            <button
                              onClick={() => toggleCategory(category)}
                              style={{
                                width: "100%",
                                padding: "16px 20px",
                                background: "var(--tt-surface-soft)",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer",
                                transition: "background 0.2s",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "var(--tt-surface-soft)"}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div dangerouslySetInnerHTML={{ __html: meta.iconSvg }} />
                                <div style={{ textAlign: "left" }}>
                                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--tt-text)" }}>
                                    {meta.label}
                                  </div>
                                  <div style={{ fontSize: "13px", color: "var(--tt-text-muted)", marginTop: "2px" }}>
                                    {totalProcesses} process {totalProcesses === 1 ? "type" : "types"}
                                  </div>
                                </div>
                              </div>
                              <div style={{
                                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                transition: "transform 0.2s",
                                color: "var(--tt-muted)",
                              }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="6 9 12 15 18 9"/>
                                </svg>
                              </div>
                            </button>

                            {/* Category Processes */}
                            {isExpanded && (
                              <div style={{
                                padding: "20px",
                                background: "white",
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                                gap: "16px",
                              }}>
                                {processes.map(({ name, stats }) => {
                                  const performanceColor = getPerformanceColor(stats.avgDays || 0, nationalAvgDays);
                                  const confidence = getConfidenceBadge(stats.count);
                                  const comparison = nationalAvgDays ? Math.round((stats.avgDays || 0) - nationalAvgDays) : null;

                                  return (
                                    <div
                                      key={name}
                                      style={{
                                        padding: "16px",
                                        background: "var(--tt-surface-soft)",
                                        borderRadius: "10px",
                                        border: "2px solid var(--tt-border)",
                                        transition: "all 0.2s",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => setProcessFilter(name)}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = performanceColor;
                                        e.currentTarget.style.background = "#ffffff";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "var(--tt-border)";
                                        e.currentTarget.style.background = "var(--tt-surface-soft)";
                                        e.currentTarget.style.boxShadow = "none";
                                      }}
                                    >
                                      {/* Confidence Badge */}
                                      <div style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        padding: "4px 10px",
                                        background: confidence.bg,
                                        color: confidence.color,
                                        borderRadius: "6px",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                        marginBottom: "10px",
                                      }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                        </svg>
                                        {confidence.label}
                                      </div>

                                      {/* Process Name */}
                                      <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px", color: "var(--tt-text)", lineHeight: 1.3 }}>
                                        {normalizeProcessLabel(name)}
                                      </div>

                                      {/* Processing Time */}
                                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" }}>
                                        <div style={{ fontSize: "28px", fontWeight: 800, color: performanceColor }}>
                                          ~{Math.round(stats.avgDays || 0)}
                                        </div>
                                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--tt-text-muted)" }}>
                                          days
                                        </div>
                                      </div>

                                      {/* Comparison to National Average */}
                                      {comparison !== null && (
                                        <div style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "4px",
                                          fontSize: "12px",
                                          fontWeight: 600,
                                          color: comparison > 0 ? "#ef4444" : "var(--tt-success)",
                                          marginBottom: "8px",
                                        }}>
                                          {comparison > 0 ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="18 15 12 9 6 15"/>
                                            </svg>
                                          ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="6 9 12 15 18 9"/>
                                            </svg>
                                          )}
                                          {comparison > 0 ? "+" : ""}{comparison} days vs avg
                                        </div>
                                      )}

                                      {/* Report Count */}
                                      <div style={{
                                        fontSize: "12px",
                                        color: "var(--tt-text-muted)",
                                        paddingTop: "8px",
                                        borderTop: "1px solid var(--tt-border)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                      }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                          <circle cx="9" cy="7" r="4"/>
                                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                        </svg>
                                        {stats.count} {stats.count === 1 ? "report" : "reports"}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              );
            })()}
          </>
        )}
        </div>
      </main>
      </>
    </DataAccessGate>
  );
}


