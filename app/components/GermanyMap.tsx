"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { CITY_COORDINATES, DEFAULT_COORDINATES } from "@/lib/cityCoordinates";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

// Coordinate lookup is handled by the comprehensive CITY_COORDINATES map from lib/cityCoordinates

interface CityStats {
  city: string;
  count: number;
  avgDays: number | null;
  lat: number;
  lng: number;
}

function MapInstanceTracker({ onReady }: { onReady: (map: any) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

// No longer using external geocoding API to avoid CORS errors
// Use fallback coordinates for unknown cities instead

export default function GermanyMap() {
  const [isMounted, setIsMounted] = useState(false);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapQuery, setMapQuery] = useState("");
  const [mapInstance, setMapInstance] = useState<any>(null);

  const buildCityStats = (offices: any[], reports: any[]): CityStats[] => {
    const statsMap: { [city: string]: { count: number; totalDays: number; completedCount: number } } = {};

    reports.forEach((report) => {
      const city = report?.office?.city || report?.officeCity;
      if (!city) return;

      if (!statsMap[city]) {
        statsMap[city] = { count: 0, totalDays: 0, completedCount: 0 };
      }

      statsMap[city].count++;

      if (report.decisionAt && report.submittedAt) {
        const days = Math.floor(
          (new Date(report.decisionAt).getTime() - new Date(report.submittedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        statsMap[city].totalDays += days;
        statsMap[city].completedCount++;
      }
    });

    // Collect all cities from offices (same source as the offices page)
    const allCities = new Set<string>();
    const officeCoordsByCity: Record<string, { lat: number; lng: number }> = {};
    offices.forEach((o: any) => {
      const city = o.city;
      if (!city) return;
      allCities.add(city);
      if (o.lat && o.lng && !officeCoordsByCity[city]) {
        officeCoordsByCity[city] = { lat: o.lat, lng: o.lng };
      }
    });
    // Also include any city that only appears in reports
    Object.keys(statsMap).forEach((c) => allCities.add(c));

    return Array.from(allCities).map((city) => {
      const data = statsMap[city];
      // Coordinate priority: 1) DB-stored  2) static library  3) Germany center
      const coords = officeCoordsByCity[city] ?? CITY_COORDINATES[city] ?? DEFAULT_COORDINATES;
      return {
        city,
        count: data?.count ?? 0,
        avgDays: data?.completedCount ? Math.round(data.totalDays / data.completedCount) : null,
        lat: coords.lat,
        lng: coords.lng,
      } as CityStats;
    });
  };

  useEffect(() => {
    setIsMounted(true);
    
    // Fix Leaflet default marker icon issue with Next.js
    if (typeof window !== 'undefined') {
      const L = require('leaflet');
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    }

    // Fetch offices and reports in parallel so the map matches the offices page
    async function loadData() {
      try {
        const [optionsRes, reportsRes] = await Promise.all([
          fetch("/api/options"),
          fetch("/api/reports"),
        ]);
        const optionsData = optionsRes.ok ? await optionsRes.json() : {};
        const reportsData = reportsRes.ok ? await reportsRes.json() : {};
        const offices = Array.isArray(optionsData?.offices) ? optionsData.offices : [];
        const reports = Array.isArray(reportsData?.reports) ? reportsData.reports : [];

        const stats = buildCityStats(offices, reports);
        setCityStats(stats);
      } catch (error) {
        console.error("Failed to load map data:", error);
        setCityStats([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (!isMounted) {
    return (
      <div style={{
        height: "600px",
        background: "var(--tt-surface-muted)",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        color: "var(--tt-text-muted)"
      }}>
        Loading map...
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        height: "600px",
        background: "var(--tt-surface-muted)",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        color: "var(--tt-text-muted)"
      }}>
        Loading map data...
      </div>
    );
  }

  const normalizedQuery = mapQuery.trim().toLowerCase();
  const matches = normalizedQuery
    ? cityStats.filter((stat) => stat.city.toLowerCase().includes(normalizedQuery))
    : [];

  const handleMapSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapInstance || matches.length === 0) return;
    const target = matches[0];
    mapInstance.flyTo([target.lat, target.lng], 10, { duration: 0.6 });
  };

  return (
    <div style={{ position: "relative", zIndex: 0 }}>
      <style>{`
        .map-toolbar {
          position: absolute;
          top: 16px;
          left: 16px;
          right: 16px;
          z-index: 500;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: auto;
          max-width: 100%;
        }
        .map-search-form {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--tt-surface);
          border: 1px solid var(--tt-border);
          border-radius: 12px;
          padding: 8px 10px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
          width: 100%;
        }
        .map-search-icon {
          color: var(--tt-text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .map-search-input {
          border: none;
          outline: none;
          flex: 1;
          font-size: clamp(13px, 2.6vw, 14px);
          padding: 6px 4px;
          font-family: inherit;
          color: var(--tt-text);
          min-width: 0;
        }
        .map-search-button {
          background: var(--tt-text);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: clamp(12px, 2.4vw, 13px);
          font-weight: 700;
          min-height: 36px;
        }
        .map-toolbar-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          width: 100%;
        }
        .map-toolbar-link {
          background: var(--tt-surface);
          border: 1px solid var(--tt-border);
          border-radius: 999px;
          padding: 6px 12px;
          font-size: clamp(12px, 2.4vw, 13px);
          font-weight: 700;
          text-decoration: none;
          color: var(--tt-text);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
        }
        .map-search-results {
          background: var(--tt-surface);
          border: 1px solid var(--tt-border);
          border-radius: 12px;
          padding: 6px;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
          max-height: 220px;
          overflow: auto;
          max-width: 100%;
        }
        .map-search-result {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--tt-text);
          font-size: 13px;
          font-weight: 600;
        }
        .map-search-result:hover {
          background: var(--tt-surface-muted);
        }
        .map-search-meta {
          color: var(--tt-text-muted);
          font-size: 12px;
          font-weight: 500;
        }
        .map-search-empty {
          padding: 10px 12px;
          font-size: 12px;
          color: var(--tt-text-muted);
        }
        @media (max-width: 768px) {
          .map-toolbar {
            top: 12px;
            left: 12px;
            right: 12px;
          }
          .map-search-form {
            flex-direction: column;
            align-items: stretch;
          }
          .map-search-button {
            width: 100%;
          }
          .map-toolbar-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .map-toolbar-link {
            width: 100%;
            text-align: center;
          }
        }
        @media (max-width: 480px) {
          .map-search-form {
            padding: 8px;
          }
          .map-search-button {
            min-height: 40px;
          }
          .map-toolbar-link {
            padding: 8px 10px;
          }
        }
      `}</style>

      <div className="map-toolbar">
        <form onSubmit={handleMapSearch} className="map-search-form">
          <span className="map-search-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </span>
          <input
            type="text"
            value={mapQuery}
            onChange={(e) => setMapQuery(e.target.value)}
            placeholder="Search a city"
            className="map-search-input"
            aria-label="Search cities on map"
          />
          <button type="submit" className="map-search-button">
            Find
          </button>
        </form>
        <div className="map-toolbar-actions">
          <Link href="/offices" className="map-toolbar-link">
            Browse Offices
          </Link>
          <Link href="/submit" className="map-toolbar-link">
            Submit Timeline
          </Link>
        </div>
        {normalizedQuery && (
          <div className="map-search-results" role="listbox">
            {matches.length > 0 ? (
              matches.slice(0, 6).map((stat) => (
                <Link
                  key={stat.city}
                  href={`/offices/${encodeURIComponent(stat.city)}`}
                  className="map-search-result"
                >
                  <span>{stat.city}</span>
                  <span className="map-search-meta">{stat.count} reports</span>
                </Link>
              ))
            ) : (
              <div className="map-search-empty">No matching cities found.</div>
            )}
          </div>
        )}
      </div>
      <MapContainer
        center={[51.1657, 10.4515]} // Center of Germany
        zoom={6}
        style={{ height: "min(600px, 70vh)", width: "100%", borderRadius: "12px" }}
      >
        <MapInstanceTracker onReady={setMapInstance} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {cityStats.map((stat) => (
          <Marker key={stat.city} position={[stat.lat, stat.lng]}>
            <Popup>
              <div style={{ minWidth: "200px" }}>
                <h3 style={{ 
                  fontSize: "16px", 
                  fontWeight: "700", 
                  marginBottom: "8px",
                  color: "#1f2937"
                }}>
                  {stat.city}
                </h3>
                <div style={{ fontSize: "14px", color: "#4b5563", lineHeight: "1.6" }}>
                  {stat.count > 0 ? (
                    <>
                      <div style={{ marginBottom: "4px" }}>
                        📊 <strong>{stat.count}</strong> {stat.count === 1 ? "report" : "reports"}
                      </div>
                      {stat.avgDays !== null && (
                        <div style={{ marginBottom: "8px" }}>
                          ⏱️ Avg. time: <strong>~{stat.avgDays} days</strong>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ marginBottom: "8px", color: "var(--tt-muted)", fontSize: "13px" }}>
                      No reports yet. Be the first to submit! 📝
                    </div>
                  )}
                  <Link
                    href={`/offices/${encodeURIComponent(stat.city)}`}
                    style={{
                      display: "inline-block",
                      marginTop: "8px",
                      padding: "6px 12px",
                      background: "var(--tt-primary-strong)",
                      color: "white",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

