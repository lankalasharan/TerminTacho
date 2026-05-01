"use client";

import { useState } from "react";

interface TrustBadgeProps {
  trustLevel: string;
  matchCount?: number;
  sourceUrl?: string;
  adminNote?: string;
  isAdminSeeded?: boolean;
  reportId: string;
  compact?: boolean;
  onMatched?: (newCount: number, newTrustLevel: string) => void;
}

const BADGE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  unverified: {
    label: "Unverified",
    color: "#6b7280",
    bg: "#f3f4f6",
    border: "#e5e7eb",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><path d="M12 16h.01" />
      </svg>
    ),
  },
  verified: {
    label: "Verified",
    color: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  community_verified: {
    label: "Community Verified",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  admin_digest: {
    label: "Admin Summary",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
};

export default function TrustBadge({
  trustLevel,
  matchCount = 0,
  sourceUrl,
  adminNote,
  isAdminSeeded,
  reportId,
  compact,
  onMatched,
}: TrustBadgeProps) {
  const [localMatchCount, setLocalMatchCount] = useState(matchCount);
  const [localTrustLevel, setLocalTrustLevel] = useState(trustLevel);
  const [matched, setMatched] = useState(false);
  const [loading, setLoading] = useState(false);

  const cfg = BADGE_CONFIG[localTrustLevel] ?? BADGE_CONFIG["unverified"];

  async function handleMatch() {
    if (matched || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/match`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLocalMatchCount(data.matchCount);
        setLocalTrustLevel(data.trustLevel);
        setMatched(true);
        onMatched?.(data.matchCount, data.trustLevel);
      } else if (data.alreadyMatched) {
        setMatched(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {/* Trust badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "3px 8px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.02em",
            color: cfg.color,
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
          }}
        >
          {cfg.icon}
          {cfg.label}
        </span>

        {/* Admin source link */}
        {localTrustLevel === "admin_digest" && sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "11px",
              color: "#7c3aed",
              textDecoration: "underline",
              textDecorationStyle: "dotted",
            }}
          >
            Source
          </a>
        )}
      </div>

      {/* Admin note */}
      {localTrustLevel === "admin_digest" && adminNote && (
        <p style={{ fontSize: "12px", color: "#6b7280", fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>
          {adminNote}
        </p>
      )}

      {/* Matches my experience button — only for unverified/community_verified */}
      {(localTrustLevel === "unverified" || localTrustLevel === "community_verified") && (
        <button
          onClick={handleMatch}
          disabled={matched || loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
            border: matched ? "1px solid #a7f3d0" : "1px solid #e5e7eb",
            background: matched ? "#ecfdf5" : "#f9fafb",
            color: matched ? "#059669" : "#6b7280",
            cursor: matched || loading ? "default" : "pointer",
            transition: "all 0.15s",
            width: "fit-content",
          }}
          onMouseEnter={(e) => {
            if (!matched && !loading) {
              e.currentTarget.style.borderColor = "#2563eb";
              e.currentTarget.style.color = "#2563eb";
            }
          }}
          onMouseLeave={(e) => {
            if (!matched && !loading) {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#6b7280";
            }
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill={matched ? "#059669" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          {matched ? "Matched!" : loading ? "..." : `Matches my experience${localMatchCount > 0 ? ` (${localMatchCount})` : ""}`}
        </button>
      )}
    </div>
  );
}
