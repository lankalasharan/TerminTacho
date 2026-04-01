"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

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

type Office = {
  id: string;
  city: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
};

type Report = {
  office?: { city?: string | null } | null;
  processType?: { name?: string | null } | null;
};

const GERMANY_CENTER = { lat: 51.1657, lng: 10.4515 };
const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  Berlin: { lat: 52.52, lng: 13.405 },
  Hamburg: { lat: 53.5511, lng: 9.9937 },
  Munich: { lat: 48.1351, lng: 11.582 },
  Cologne: { lat: 50.9375, lng: 6.9603 },
  "Frankfurt am Main": { lat: 50.1109, lng: 8.6821 },
  Stuttgart: { lat: 48.7758, lng: 9.1829 },
  Düsseldorf: { lat: 51.2277, lng: 6.7735 },
  Dortmund: { lat: 51.5136, lng: 7.4653 },
  Essen: { lat: 51.4556, lng: 7.0116 },
  Leipzig: { lat: 51.3397, lng: 12.3731 },
  Bremen: { lat: 53.0793, lng: 8.8017 },
  Dresden: { lat: 51.0504, lng: 13.7373 },
  Hanover: { lat: 52.3759, lng: 9.732 },
  Nuremberg: { lat: 49.4521, lng: 11.0767 },
  Duisburg: { lat: 51.4344, lng: 6.7623 },
  Bochum: { lat: 51.4818, lng: 7.2162 },
  Wuppertal: { lat: 51.2562, lng: 7.1508 },
  Bielefeld: { lat: 52.0302, lng: 8.532 },
  Bonn: { lat: 50.7374, lng: 7.0982 },
  Münster: { lat: 51.9607, lng: 7.6261 },
  Karlsruhe: { lat: 49.0069, lng: 8.4037 },
  Mannheim: { lat: 49.4875, lng: 8.466 },
  Augsburg: { lat: 48.3705, lng: 10.8978 },
  Wiesbaden: { lat: 50.0826, lng: 8.24 },
};

export default function OfficesIndexPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [processTypes, setProcessTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [processFilter, setProcessFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [optionsRes, reportsRes] = await Promise.all([
          fetch("/api/options"),
          fetch("/api/reports"),
        ]);
        const optionsData = await optionsRes.json();
        const reportsData = await reportsRes.json();
        setOffices(optionsData.offices || []);
        setProcessTypes((optionsData.processTypes || []).map((p: { name: string }) => p.name));
        setReports(reportsData.reports || []);
      } catch (error) {
        console.error("Failed to load offices:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  const cityProcessMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    reports.forEach((report) => {
      const city = report.office?.city || "";
      const process = report.processType?.name || "";
      if (!city || !process) return;
      const set = map.get(city) || new Set<string>();
      set.add(process);
      map.set(city, set);
    });
    return map;
  }, [reports]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return offices;
    return offices.filter((o) =>
      [o.city, o.name, o.address, o.phone].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [offices, query]);

  const filteredOffices = useMemo(() => {
    if (!processFilter) return filtered;
    return filtered.filter((office) => cityProcessMap.get(office.city)?.has(processFilter));
  }, [filtered, processFilter, cityProcessMap]);

  const cityCards = useMemo(() => {
    const map = new Map<string, { city: string; offices: Office[] }>();
    filteredOffices.forEach((office) => {
      const existing = map.get(office.city);
      if (existing) {
        existing.offices.push(office);
      } else {
        map.set(office.city, { city: office.city, offices: [office] });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.city.localeCompare(b.city));
  }, [filteredOffices]);

  const cardGradients = [
    "linear-gradient(135deg, #fdf2f8 0%, var(--tt-primary-soft) 100%)",
    "linear-gradient(135deg, #ecfeff 0%, #f0fdf4 100%)",
    "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)",
    "linear-gradient(135deg, var(--tt-surface-muted) 0%, #e0e7ff 100%)",
    "linear-gradient(135deg, #fef2f2 0%, #f0f9ff 100%)",
  ];

  return (
    <main className="tt-section">
      <div className="tt-container" style={{ maxWidth: "1200px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M7 7h3M7 11h3M7 15h3M14 7h3M14 11h3M14 15h3" />
          </svg>
          <span>Offices</span>
        </h1>
        <p style={{ color: "var(--tt-text-muted)" }}>
          Browse all offices and open details to see timelines and reviews.
        </p>
      </div>

      <style>{`
        .office-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }
        .office-filters {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .office-list {
          display: grid;
          gap: 12px;
        }
        .office-card {
          border: 1px solid var(--tt-border);
          border-radius: 12px;
          padding: 14px;
          background: var(--tt-surface);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          display: grid;
          gap: 6px;
        }
        .office-map-wrap {
          position: sticky;
          top: 96px;
        }
        @media (max-width: 980px) {
          .office-layout {
            grid-template-columns: 1fr;
          }
          .office-map-wrap {
            position: static;
          }
          .office-filters {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="office-filters">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city, office name, address..."
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1px solid var(--tt-border)",
            borderRadius: 8,
            fontSize: 14,
          }}
        />
        <select
          value={processFilter}
          onChange={(e) => setProcessFilter(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1px solid var(--tt-border)",
            borderRadius: 8,
            fontSize: 14,
            background: "white",
          }}
        >
          <option value="">All Processes</option>
          {processTypes.map((process) => (
            <option key={process} value={process}>
              {process}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--tt-text-muted)" }}>Loading offices…</div>
      ) : filteredOffices.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--tt-text-muted)" }}>
          No offices found.
        </div>
      ) : (
        <div className="office-layout">
          <div className="office-list">
            {cityCards.map((group, idx) => (
              <Link
                key={group.city}
                href={`/offices/${encodeURIComponent(group.city)}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="office-card" style={{ background: cardGradients[idx % cardGradients.length] }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#1f2937" }}>
                    {group.city}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#4b5563" }}>
                    {group.offices[0]?.name}
                    {group.offices.length > 1 ? ` +${group.offices.length - 1} more` : ""}
                  </div>
                  {group.offices[0]?.address ? (
                    <div style={{ fontSize: 12, color: "var(--tt-text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                      <span>{group.offices[0].address}</span>
                    </div>
                  ) : null}
                  <div style={{ marginTop: "auto", fontSize: 12, color: "var(--tt-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>View details</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m13 5 7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="office-map-wrap">
            <div className="tt-card" style={{ padding: 12 }}>
              <MapContainer
                center={[GERMANY_CENTER.lat, GERMANY_CENTER.lng]}
                zoom={6}
                style={{ height: "min(600px, 70vh)", width: "100%", borderRadius: "12px" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {cityCards.map((group) => {
                  const coords = cityCoordinates[group.city] || GERMANY_CENTER;
                  return (
                    <Marker key={group.city} position={[coords.lat, coords.lng]}>
                      <Popup>
                        <div style={{ minWidth: "200px" }}>
                          <div style={{ fontSize: "16px", fontWeight: 700, color: "#1f2937", marginBottom: 6 }}>
                            {group.city}
                          </div>
                          <div style={{ fontSize: "13px", color: "#4b5563", marginBottom: 10 }}>
                            {group.offices.length} {group.offices.length === 1 ? "office" : "offices"}
                          </div>
                          <Link
                            href={`/offices/${encodeURIComponent(group.city)}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "6px 10px",
                              background: "var(--tt-primary-strong)",
                              color: "white",
                              borderRadius: "6px",
                              textDecoration: "none",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            View details
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12h14" />
                              <path d="m13 5 7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  );
}

