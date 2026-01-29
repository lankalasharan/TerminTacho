"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setQuery("");
      setIsOpen(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <style>{`
        @media (max-width: 768px) {
          .search-form {
            right: -12px !important;
            width: 280px !important;
          }
          .search-input {
            width: 100% !important;
            font-size: 13px !important;
          }
        }
        @media (max-width: 480px) {
          .search-form {
            right: -20px !important;
            width: calc(100vw - 40px) !important;
            max-width: 320px !important;
          }
          .search-input {
            width: 100% !important;
            font-size: 13px !important;
            padding: 10px !important;
          }
        }
      `}</style>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "#f3f4f6",
          border: "1px solid #e5e7eb",
          cursor: "pointer",
          fontSize: "16px",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "44px",
          minHeight: "44px",
          borderRadius: "8px",
          transition: "all 0.2s ease",
          color: "#6b7280",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#e5e7eb";
          e.currentTarget.style.color = "#374151";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#f3f4f6";
          e.currentTarget.style.color = "#6b7280";
        }}
        aria-label="Search"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </button>

      {isOpen && (
        <form
          onSubmit={handleSearch}
          className="search-form"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            background: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            marginTop: "8px",
            zIndex: 1000,
            width: "280px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
            <input
              type="text"
              placeholder="Search cities, processes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              aria-label="Search query"
              className="search-input"
              style={{
                padding: "12px 14px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                width: "100%",
                fontFamily: "inherit",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <button
              type="submit"
              aria-label="Search"
              style={{
                padding: "12px 16px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                minHeight: "44px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Search
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
