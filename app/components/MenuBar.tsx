"use client";

import Link from "next/link";
import { useState } from "react";

export default function MenuBar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuZIndex = 10060;
  const overlayZIndex = 10050;
  const buttonZIndex = 10070;
  const iconStyle = {
    width: 18,
    height: 18,
    display: "block",
  } as const;

  function MenuIcon({ name }: { name: string }) {
    switch (name) {
      case "home":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19.5z" />
            <path d="M9 21v-6h6v6" />
          </svg>
        );
      case "map":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        );
      case "chart":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <path d="M4 19h16" />
            <path d="M6 15l4-4 3 3 5-6" />
          </svg>
        );
      case "pencil":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <path d="M4 20h4l10-10-4-4L4 16v4z" />
            <path d="M14 6l4 4" />
          </svg>
        );
      case "mail":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        );
      case "help":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.9.4-1.5 1-1.5 2.2" />
            <path d="M12 17h.01" />
          </svg>
        );
      case "search":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        );
      case "blog":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5" />
            <path d="M9 13h6" />
            <path d="M9 17h4" />
          </svg>
        );
      case "trophy":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <path d="M8 4h8v3a4 4 0 0 1-8 0z" />
            <path d="M6 4H5a2 2 0 0 0 2 4" />
            <path d="M18 4h1a2 2 0 0 1-2 4" />
            <path d="M12 11v4" />
            <path d="M8 19h8" />
          </svg>
        );
      case "user":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M4 20a8 8 0 0 1 16 0" />
          </svg>
        );
      case "lock":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V8a4 4 0 0 1 8 0v2" />
          </svg>
        );
      case "file":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5" />
            <path d="M9 12h6" />
            <path d="M9 16h4" />
          </svg>
        );
      case "cookie":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <circle cx="12" cy="12" r="8" />
            <path d="M8 9h.01" />
            <path d="M12 7h.01" />
            <path d="M15 12h.01" />
            <path d="M9 15h.01" />
          </svg>
        );
      case "scale":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={iconStyle} aria-hidden="true">
            <path d="M12 3v4" />
            <path d="M5 7h14" />
            <path d="M7 7l-3 5h6z" />
            <path d="M17 7l3 5h-6z" />
            <path d="M12 11v8" />
            <path d="M8 19h8" />
          </svg>
        );
      default:
        return null;
    }
  }

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
          background: "var(--tt-surface-muted)",
          border: "1px solid var(--tt-border)",
          cursor: "pointer",
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          zIndex: buttonZIndex,
          minWidth: "44px",
          minHeight: "44px",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          transition: "all 0.2s ease",
          color: "var(--tt-text-muted)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--tt-border)";
          e.currentTarget.style.color = "var(--tt-text-strong)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--tt-surface-muted)";
          e.currentTarget.style.color = "var(--tt-text-muted)";
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
            zIndex: overlayZIndex,
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
        background: "var(--tt-surface)",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.15)",
        zIndex: menuZIndex,
        transition: "right 0.3s ease",
        overflowY: "auto",
        pointerEvents: isOpen ? "auto" : "none",
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
              color: "var(--tt-muted)",
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
                color: "var(--tt-text)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
                display: "block",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="home" />
                <span>Home</span>
              </span>
            </Link>

            <Link
              href="/?map=1"
              onClick={() => setIsOpen(false)}
              className="menu-link"
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--tt-text)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
                display: "block",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="map" />
                <span>Search in Map</span>
              </span>
            </Link>

            <Link
              href="/timelines"
              onClick={() => setIsOpen(false)}
              className="menu-link"
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--tt-text)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
                display: "block",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="chart" />
                <span>Browse Timelines</span>
              </span>
            </Link>

            <Link
              href="/submit"
              onClick={() => setIsOpen(false)}
              className="menu-link"
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--tt-text)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
                display: "block",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="pencil" />
                <span>Submit Timeline</span>
              </span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="menu-link"
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--tt-text)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
                display: "block",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="mail" />
                <span>Contact</span>
              </span>
            </Link>

            <Link
              href="/faq"
              onClick={() => setIsOpen(false)}
              className="menu-link"
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--tt-text)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
                display: "block",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="help" />
                <span>FAQ</span>
              </span>
            </Link>

            <Link
              href="/search"
              onClick={() => setIsOpen(false)}
              className="menu-link"
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--tt-text)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="search" />
                <span>Search</span>
              </span>
            </Link>

            <Link
              href="/blog"
              onClick={() => setIsOpen(false)}
              className="menu-link"
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--tt-text)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
                display: "block",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="blog" />
                <span>Blog</span>
              </span>
            </Link>

            <Link
              href="/leaderboard"
              onClick={() => setIsOpen(false)}
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 600,
                color: "var(--tt-text)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="trophy" />
                <span>Leaderboard</span>
              </span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              style={{
                padding: "12px 16px",
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--tt-primary-strong)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f0f4ff"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="user" />
                <span>My Dashboard</span>
              </span>
            </Link>

            <div style={{
              height: "1px",
              background: "var(--tt-border)",
              margin: "16px 0",
            }} />

            <Link
              href="/privacy"
              onClick={() => setIsOpen(false)}
              style={{
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--tt-text-muted)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="lock" />
                <span>Privacy Policy</span>
              </span>
            </Link>

            <Link
              href="/terms"
              onClick={() => setIsOpen(false)}
              style={{
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--tt-text-muted)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="file" />
                <span>Terms of Service</span>
              </span>
            </Link>

            <Link
              href="/cookies"
              onClick={() => setIsOpen(false)}
              style={{
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--tt-text-muted)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="cookie" />
                <span>Cookie Policy</span>
              </span>
            </Link>

            <Link
              href="/imprint"
              onClick={() => setIsOpen(false)}
              style={{
                padding: "12px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--tt-text-muted)",
                textDecoration: "none",
                borderRadius: "8px",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--tt-surface-muted)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MenuIcon name="scale" />
                <span>Imprint</span>
              </span>
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

