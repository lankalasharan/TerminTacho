"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Office = {
  id: string;
  city: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
};

export default function OfficesIndexPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/options");
        const data = await res.json();
        setOffices(data.offices || []);
      } catch (error) {
        console.error("Failed to load offices:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return offices;
    return offices.filter((o) =>
      [o.city, o.name, o.address, o.phone].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [offices, query]);

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
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>🏢 Offices</h1>
        <p style={{ color: "var(--tt-text-muted)" }}>
          Browse all offices and open details to see timelines and reviews.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
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
      </div>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--tt-text-muted)" }}>Loading offices…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--tt-text-muted)" }}>
          No offices found.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((office, idx) => (
            <Link
              key={office.id}
              href={`/offices/${encodeURIComponent(office.city)}`}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  border: "1px solid var(--tt-border)",
                  borderRadius: 12,
                  padding: 16,
                  background: cardGradients[idx % cardGradients.length],
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, color: "#1f2937" }}>
                  {office.city}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#4b5563" }}>{office.name}</div>
                {office.address ? (
                  <div style={{ fontSize: 12, color: "var(--tt-text-muted)" }}>📍 {office.address}</div>
                ) : null}
                {office.website ? (
                  <div style={{ fontSize: 12, color: "var(--tt-primary-strong)" }}>{office.website}</div>
                ) : null}
                <div style={{ marginTop: "auto", fontSize: 12, color: "var(--tt-muted)" }}>
                  View details →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}

