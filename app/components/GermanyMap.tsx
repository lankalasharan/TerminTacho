"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

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

// City coordinates (seed list) + dynamic geocoding fallback for new cities
const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  "Berlin": { lat: 52.52, lng: 13.405 },
  "Hamburg": { lat: 53.5511, lng: 9.9937 },
  "Munich": { lat: 48.1351, lng: 11.582 },
  "Cologne": { lat: 50.9375, lng: 6.9603 },
  "Frankfurt am Main": { lat: 50.1109, lng: 8.6821 },
  "Stuttgart": { lat: 48.7758, lng: 9.1829 },
  "Düsseldorf": { lat: 51.2277, lng: 6.7735 },
  "Dortmund": { lat: 51.5136, lng: 7.4653 },
  "Essen": { lat: 51.4556, lng: 7.0116 },
  "Leipzig": { lat: 51.3397, lng: 12.3731 },
  "Bremen": { lat: 53.0793, lng: 8.8017 },
  "Dresden": { lat: 51.0504, lng: 13.7373 },
  "Hanover": { lat: 52.3759, lng: 9.732 },
  "Nuremberg": { lat: 49.4521, lng: 11.0767 },
  "Duisburg": { lat: 51.4344, lng: 6.7623 },
  "Bochum": { lat: 51.4818, lng: 7.2162 },
  "Wuppertal": { lat: 51.2562, lng: 7.1508 },
  "Bielefeld": { lat: 52.0302, lng: 8.532 },
  "Bonn": { lat: 50.7374, lng: 7.0982 },
  "Münster": { lat: 51.9607, lng: 7.6261 },
  "Karlsruhe": { lat: 49.0069, lng: 8.4037 },
  "Mannheim": { lat: 49.4875, lng: 8.4660 },
  "Augsburg": { lat: 48.3705, lng: 10.8978 },
  "Wiesbaden": { lat: 50.0826, lng: 8.2400 },
};

interface CityStats {
  city: string;
  count: number;
  avgDays: number | null;
  lat: number;
  lng: number;
}

type CoordCache = Record<string, { lat: number; lng: number }>;

function MapInstanceTracker({ onReady }: { onReady: (map: any) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

function loadCoordCache(): CoordCache {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("tt_city_coords_v1");
    return raw ? (JSON.parse(raw) as CoordCache) : {};
  } catch {
    return {};
  }
}

function saveCoordCache(cache: CoordCache) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("tt_city_coords_v1", JSON.stringify(cache));
  } catch {
    // ignore quota errors
  }
}

async function geocodeCity(city: string): Promise<{ lat: number; lng: number } | null> {
  const query = encodeURIComponent(`${city}, Germany`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) return null;
  const data = await res.json();
  const first = Array.isArray(data) ? data[0] : null;
  if (!first?.lat || !first?.lon) return null;
  return { lat: parseFloat(first.lat), lng: parseFloat(first.lon) };
}

export default function GermanyMap() {
  const [isMounted, setIsMounted] = useState(false);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapQuery, setMapQuery] = useState("");
  const [mapInstance, setMapInstance] = useState<any>(null);

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

    // Fetch real data from API
    async function loadData() {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        const reports = data.reports || [];

        // Calculate stats per city
        const statsMap: { [city: string]: { count: number; totalDays: number; completedCount: number } } = {};
        
        reports.forEach((report: any) => {
          const city = report.office.city;
          if (!statsMap[city]) {
            statsMap[city] = { count: 0, totalDays: 0, completedCount: 0 };
          }
          statsMap[city].count++;
          
          if (report.decisionAt) {
            const days = Math.floor(
              (new Date(report.decisionAt).getTime() - new Date(report.submittedAt).getTime()) / 
              (1000 * 60 * 60 * 24)
            );
            statsMap[city].totalDays += days;
            statsMap[city].completedCount++;
          }
        });

        // Build city list from reports + seed coordinates
        const citySet = new Set<string>([
          ...Object.keys(cityCoordinates),
          ...Object.keys(statsMap),
        ]);

        const coordCache = loadCoordCache();
        const coordsMap: CoordCache = {
          ...cityCoordinates,
          ...coordCache,
        };

        const missingCities = Array.from(citySet).filter((city) => !coordsMap[city]);

        if (missingCities.length > 0) {
          const results = await Promise.all(
            missingCities.map(async (city) => ({
              city,
              coords: await geocodeCity(city),
            }))
          );

          results.forEach(({ city, coords }) => {
            if (coords) {
              coordsMap[city] = coords;
              coordCache[city] = coords;
            }
          });

          saveCoordCache(coordCache);
        }

        const stats: CityStats[] = Array.from(citySet)
          .map((city) => {
            const data = statsMap[city];
            const coords = coordsMap[city];
            if (!coords) return null;
            return {
              city,
              count: data?.count || 0,
              avgDays: data?.completedCount ? Math.round(data.totalDays / data.completedCount) : null,
              lat: coords.lat,
              lng: coords.lng,
            };
          })
          .filter((item): item is CityStats => Boolean(item));

        setCityStats(stats);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load map data:", error);
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (!isMounted) {
    return (
      <div style={{
        height: "600px",
        background: "#f3f4f6",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        color: "#6b7280"
      }}>
        Loading map...
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        height: "600px",
        background: "#f3f4f6",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        color: "#6b7280"
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
        }
        .map-search-form {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 8px 10px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        }
        .map-search-icon {
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .map-search-input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 14px;
          padding: 6px 4px;
          font-family: inherit;
          color: #111827;
        }
        .map-search-button {
          background: #111827;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
          min-height: 36px;
        }
        .map-toolbar-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .map-toolbar-link {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          color: #111827;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
        }
        .map-search-results {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 6px;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
          max-height: 220px;
          overflow: auto;
        }
        .map-search-result {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 10px;
          border-radius: 8px;
          text-decoration: none;
          color: #111827;
          font-size: 13px;
          font-weight: 600;
        }
        .map-search-result:hover {
          background: #f3f4f6;
        }
        .map-search-meta {
          color: #6b7280;
          font-size: 12px;
          font-weight: 500;
        }
        .map-search-empty {
          padding: 10px 12px;
          font-size: 12px;
          color: #6b7280;
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
        style={{ height: "600px", width: "100%", borderRadius: "12px" }}
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
                    <div style={{ marginBottom: "8px", color: "#9ca3af", fontSize: "13px" }}>
                      No reports yet. Be the first to submit! 📝
                    </div>
                  )}
                  <Link
                    href={`/offices/${encodeURIComponent(stat.city)}`}
                    style={{
                      display: "inline-block",
                      marginTop: "8px",
                      padding: "6px 12px",
                      background: "#667eea",
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
