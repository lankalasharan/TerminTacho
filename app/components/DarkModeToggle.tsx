"use client";

import { useDarkMode } from "@/app/context/DarkModeContext";

export default function DarkModeToggle() {
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      style={{
        background: isDark ? "var(--tt-text-strong)" : "var(--tt-surface-muted)",
        border: "1px solid " + (isDark ? "#4b5563" : "var(--tt-border)"),
        borderRadius: "8px",
        padding: "10px 12px",
        cursor: "pointer",
        fontSize: "16px",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
        minWidth: "44px",
        minHeight: "44px",
        color: isDark ? "#fbbf24" : "var(--tt-text-muted)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isDark ? "#4b5563" : "var(--tt-border)";
        e.currentTarget.style.color = isDark ? "#fcd34d" : "var(--tt-text-strong)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isDark ? "var(--tt-text-strong)" : "var(--tt-surface-muted)";
        e.currentTarget.style.color = isDark ? "#fbbf24" : "var(--tt-text-muted)";
      }}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      )}
    </button>
  );
}

