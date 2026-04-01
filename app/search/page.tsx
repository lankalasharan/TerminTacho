"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type SearchResult = {
  id: string;
  type: "city" | "process" | "faq" | "page";
  title: string;
  description: string;
  url: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const renderTypeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "city":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s7-5.6 7-12a7 7 0 1 0-14 0c0 6.4 7 12 7 12z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        );
      case "process":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 8h10" />
            <path d="M7 12h10" />
            <path d="M7 16h6" />
          </svg>
        );
      case "faq":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4" />
            <path d="M12 17h.01" />
          </svg>
        );
      default:
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M8 13h8" />
            <path d="M8 17h6" />
          </svg>
        );
    }
  };

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    searchContent();
  }, [query]);

  async function searchContent() {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="tt-hero">
        <div className="tt-container" style={{ textAlign: "center" }}>
          <div className="tt-chip" style={{ margin: "0 auto" }}>
            Search
          </div>
          <h1 className="tt-hero-title">Find your answers.</h1>
          <p className="tt-hero-subtitle">
            Search cities, process types, FAQs, and documentation in one place.
          </p>
          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cities, process types, FAQs..."
              autoFocus
              className="tt-input"
              style={{ flex: 1, fontSize: "16px" }}
            />
          </div>
        </div>
      </section>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 20px" }}>
        {query.length < 2 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--tt-text-muted)",
          }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "56px", height: "56px", borderRadius: "16px", background: "var(--tt-surface-muted)", marginBottom: "16px", color: "var(--tt-text-muted)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <p>Enter at least 2 characters to search</p>
          </div>
        ) : loading ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--tt-muted)",
          }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "56px", height: "56px", borderRadius: "16px", background: "var(--tt-surface-muted)", marginBottom: "16px", color: "var(--tt-text-muted)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </div>
            <p>Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--tt-text-muted)",
          }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "56px", height: "56px", borderRadius: "16px", background: "var(--tt-surface-muted)", marginBottom: "16px", color: "var(--tt-text-muted)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16v12H4z" />
                <path d="m4 8 8 5 8-5" />
                <path d="M22 16h-6a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <p>No results found for "{query}"</p>
          </div>
        ) : (
          <div>
            <h2 style={{
              fontSize: "24px",
              fontWeight: 700,
              marginBottom: "24px",
              color: "var(--tt-text)",
            }}>
              Found {results.length} result{results.length === 1 ? "" : "s"}
            </h2>

            <div style={{
              display: "grid",
              gap: "16px",
            }}>
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.url}
                  style={{
                    display: "block",
                    padding: "20px",
                    background: "white",
                    border: "1px solid var(--tt-border)",
                    borderRadius: "12px",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                  }}>
                    <div style={{
                      minWidth: "32px",
                      width: "32px",
                      height: "32px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px",
                      background: "var(--tt-surface-muted)",
                      color: "var(--tt-text-muted)",
                    }}>
                      {renderTypeIcon(result.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        marginBottom: "8px",
                        color: "var(--tt-text)",
                      }}>
                        {result.title}
                      </h3>
                      <p style={{
                        fontSize: "14px",
                        color: "var(--tt-text-muted)",
                        lineHeight: 1.6,
                      }}>
                        {result.description}
                      </p>
                      <div style={{
                        fontSize: "12px",
                        color: "var(--tt-muted)",
                        marginTop: "8px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}>
                        {renderTypeIcon(result.type)}
                        <span>
                          {result.type === "city" && "City statistics"}
                          {result.type === "process" && "Process type"}
                          {result.type === "faq" && "Frequently asked"}
                          {result.type === "page" && "Page"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

