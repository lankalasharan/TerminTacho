"use client";

import Link from "next/link";
import { useState } from "react";

export default function MenuBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .menu-panel {
            width: 280px !important;
            right: ${isOpen ? 0 : "-280px"} !important;
          }
        }
        @media (max-width: 480px) {
          .menu-panel {
            width: 100% !important;
            right: ${isOpen ? 0 : "-100%"} !important;
          }
          .hamburger-btn {
            padding: 6px !important;
          }
          .menu-panel > div {
            padding: 16px !important;
          }
          .menu-link {
            padding: 10px 12px !important;
            font-size: 15px !important;
          }
        }
      `}</style>
      {/* Hamburger Button */}
      <button
        className="hamburger-btn"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "#f3f4f6",
          border: "1px solid #e5e7eb",
          cursor: "pointer",
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          zIndex: 2000,
          minWidth: "44px",
          minHeight: "44px",
          alignItems: "center",
          justifyContent: "center",
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
        aria-label="Menu"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )}
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1998,
            animation: "fadeIn 0.3s ease",
          }}
        />
      )}

      {/* Menu Panel */}
      <div className="menu-panel" style={{
        position: "fixed",
        top: 0,
        right: isOpen ? 0 : "-320px",
        width: "320px",
        height: "100vh",
        background: "white",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
        zIndex: 1999,
        transition: "right 0.3s ease",
        overflowY: "auto",
      }}>
        <div style={{ padding: "24px" }}>
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "32px",
              cursor: "pointer",
              color: "#9ca3af",
              marginBottom: "24px",
              padding: "0",
              width: "44px",
              height: "44px",
            }}
          >
            ×
          </button>

          {/* Navigation Links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="menu-link"
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#1a1a1a",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
                display: "block",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              🏠 Home
            </Link>

            <Link
              href="/timelines"
              onClick={() => setIsOpen(false)}
              className="menu-link"
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#1a1a1a",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
                display: "block",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              📊 Browse Timelines
            </Link>

            <Link
              href="/submit"
              onClick={() => setIsOpen(false)}
              className="menu-link"
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#1a1a1a",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
                display: "block",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              ✍️ Submit Timeline
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="menu-link"
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#1a1a1a",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
                display: "block",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              📧 Contact
            </Link>

            <Link
              href="/faq"
              onClick={() => setIsOpen(false)}
              className="menu-link"
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#1a1a1a",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
                display: "block",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              ❓ FAQ
            </Link>

            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className="menu-link"
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#1a1a1a",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              🔍 Search
            </Link>

            <Link
              href="/leaderboard"
              onClick={() => setIsOpen(false)}
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "#1a1a1a",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              🏆 Leaderboard
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 700,
                color: "#667eea",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f0f4ff"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              👤 My Dashboard
            </Link>

            <div style={{
              height: "1px",
              background: "#e5e7eb",
              margin: "16px 0",
            }} />

            <Link
              href="/privacy"
              onClick={() => setIsOpen(false)}
              style={{
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#6b7280",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              🔒 Privacy Policy
            </Link>

            <Link
              href="/terms"
              onClick={() => setIsOpen(false)}
              style={{
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#6b7280",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              📜 Terms of Service
            </Link>

            <Link
              href="/cookies"
              onClick={() => setIsOpen(false)}
              style={{
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#6b7280",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              🍪 Cookie Policy
            </Link>

            <Link
              href="/imprint"
              onClick={() => setIsOpen(false)}
              style={{
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#6b7280",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              ⚖️ Imprint
            </Link>
          </nav>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
