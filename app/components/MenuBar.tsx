"use client";

import Link from "next/link";
import { useState } from "react";

export default function MenuBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          zIndex: 2000,
        }}
        aria-label="Menu"
      >
        <div style={{
          width: "28px",
          height: "3px",
          background: "#667eea",
          borderRadius: "2px",
          transition: "all 0.3s",
          transform: isOpen ? "rotate(45deg) translateY(9px)" : "none",
        }} />
        <div style={{
          width: "28px",
          height: "3px",
          background: "#667eea",
          borderRadius: "2px",
          transition: "all 0.3s",
          opacity: isOpen ? 0 : 1,
        }} />
        <div style={{
          width: "28px",
          height: "3px",
          background: "#667eea",
          borderRadius: "2px",
          transition: "all 0.3s",
          transform: isOpen ? "rotate(-45deg) translateY(-9px)" : "none",
        }} />
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
      <div style={{
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
            }}
          >
            ×
          </button>

          {/* Navigation Links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Link
              href="/"
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
              🏠 Home
            </Link>

            <Link
              href="/timelines"
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
              📊 Browse Timelines
            </Link>

            <Link
              href="/submit"
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
              ✍️ Submit Timeline
            </Link>

            <Link
              href="/contact"
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
              📧 Contact
            </Link>

            <Link
              href="/faq"
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
              ❓ FAQ
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
