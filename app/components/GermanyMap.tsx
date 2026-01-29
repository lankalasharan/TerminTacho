"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

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

// City coordinates
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

export default function GermanyMap() {
  const [isMounted, setIsMounted] = useState(false);
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [loading, setLoading] = useState(true);

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

        // Convert to array with coordinates - INCLUDE ALL CITIES FROM COORDINATES
        const stats: CityStats[] = Object.entries(cityCoordinates)
          .map(([city, coords]) => {
            const data = statsMap[city];
            return {
              city,
              count: data?.count || 0,
              avgDays: data?.completedCount ? Math.round(data.totalDays / data.completedCount) : null,
              lat: coords.lat,
              lng: coords.lng,
            };
          });

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

  return (
    <div style={{ position: "relative", zIndex: 0 }}>
      <MapContainer
        center={[51.1657, 10.4515]} // Center of Germany
        zoom={6}
        style={{ height: "600px", width: "100%", borderRadius: "12px" }}
      >
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
                  <a 
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
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
