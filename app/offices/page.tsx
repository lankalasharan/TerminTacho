"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CITY_COORDINATES } from "@/lib/cityCoordinates";
import { getCanonicalProcessKey, normalizeProcessLabel } from "@/lib/processLabels";
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
  lat?: number | null;
  lng?: number | null;
};

type Report = {
  office?: { city?: string | null } | null;
  processType?: { name?: string | null } | null;
};

const GERMANY_CENTER = { lat: 51.1657, lng: 10.4515 };

function getProcessCategory(label: string): string {
  const normalizedLabel = normalizeProcessLabel(label).toLowerCase();
  if (normalizedLabel.includes("student") || normalizedLabel.includes("phd") || normalizedLabel.includes("language course")) return "student";
  if (normalizedLabel.includes("work") || normalizedLabel.includes("blue card") || normalizedLabel.includes("employment") || normalizedLabel.includes("ict")) return "work";
  if (normalizedLabel.includes("family") || normalizedLabel.includes("spouse") || normalizedLabel.includes("child") || normalizedLabel.includes("parent")) return "family";
  if (normalizedLabel.includes("residence") || normalizedLabel.includes("settlement") || normalizedLabel.includes("address")) return "residence";
  if (normalizedLabel.includes("bank") || normalizedLabel.includes("tax") || normalizedLabel.includes("financial") || normalizedLabel.includes("blocked account")) return "finance";
  if (normalizedLabel.includes("citizenship") || normalizedLabel.includes("naturalization")) return "citizenship";
  if (normalizedLabel.includes("driver") || normalizedLabel.includes("vehicle")) return "transport";
  if (normalizedLabel.includes("business") || normalizedLabel.includes("entrepreneur") || normalizedLabel.includes("startup") || normalizedLabel.includes("investor")) return "business";
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

export default function OfficesIndexPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [processTypes, setProcessTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [processFilter, setProcessFilter] = useState("");
  const [processOpen, setProcessOpen] = useState(false);

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

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("[data-process-dropdown]")) {
        setProcessOpen(false);
      }
    }

    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const cityProcessMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    reports.forEach((report) => {
      const city = report.office?.city || "";
      const process = report.processType?.name || "";
      if (!city || !process) return;
      const set = map.get(city) || new Set<string>();
      set.add(getCanonicalProcessKey(process));
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
    const selectedKey = getCanonicalProcessKey(processFilter);
    return filtered.filter((office) => cityProcessMap.get(office.city)?.has(selectedKey));
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
        .office-filter-dropdown {
          position: relative;
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
        <div className="office-filter-dropdown" data-process-dropdown>
          <button
            type="button"
            onClick={() => setProcessOpen((open) => !open)}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid var(--tt-border)",
              borderRadius: 8,
              fontSize: 14,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <img
                src={getProcessIcon(processFilter || "All Processes")}
                alt=""
                width={18}
                height={18}
                style={{ display: "block", flexShrink: 0 }}
              />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {processFilter ? normalizeProcessLabel(processFilter) : "All Processes"}
              </span>
            </span>
            <span className="tt-select-caret" aria-hidden="true" style={{ flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </button>

          {processOpen && (
            <div
              style={{
                position: "absolute",
                zIndex: 30,
                marginTop: 8,
                width: "100%",
                background: "white",
                border: "1px solid var(--tt-border)",
                borderRadius: 10,
                boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                maxHeight: 320,
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
                  gap: 10,
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
                  style={{ display: "block", flexShrink: 0 }}
                />
                <span style={{ fontSize: 14, fontWeight: 600 }}>All Processes</span>
              </button>
              {processTypes.map((process) => (
                <button
                  key={process}
                  type="button"
                  onClick={() => {
                    setProcessFilter(process);
                    setProcessOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "white",
                    border: "none",
                    borderBottom: "1px solid var(--tt-surface-muted)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <img
                    src={getProcessIcon(process)}
                    alt=""
                    width={18}
                    height={18}
                    style={{ display: "block", flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 14 }}>{normalizeProcessLabel(process)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
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
                  // Priority: 1) DB-stored coordinates (populated at submission time)
                  //           2) Comprehensive static map (lib/cityCoordinates.ts)
                  //           3) Center of Germany as last resort
                  const officeWithCoords = group.offices.find(o => o.lat && o.lng);
                  const coords = officeWithCoords
                    ? { lat: officeWithCoords.lat!, lng: officeWithCoords.lng! }
                    : (CITY_COORDINATES[group.city] || GERMANY_CENTER);
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

