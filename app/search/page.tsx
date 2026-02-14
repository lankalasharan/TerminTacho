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
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔎</div>
            <p>Enter at least 2 characters to search</p>
          </div>
        ) : loading ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--tt-muted)",
          }}>
            <div style={{ fontSize: "32px", marginBottom: "16px" }}>⏳</div>
            <p>Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--tt-text-muted)",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
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
                      fontSize: "24px",
                      minWidth: "32px",
                    }}>
                      {result.type === "city" && "📍"}
                      {result.type === "process" && "📋"}
                      {result.type === "faq" && "❓"}
                      {result.type === "page" && "📄"}
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
                      }}>
                        {result.type === "city" && "📊 City Statistics"}
                        {result.type === "process" && "📋 Process Type"}
                        {result.type === "faq" && "❓ Frequently Asked"}
                        {result.type === "page" && "📄 Page"}
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

