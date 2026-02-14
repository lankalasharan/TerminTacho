"use client";

import Link from "next/link";
import { useState } from "react";

export default function Logo() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      href="/"
      className="logo-link"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transform: isHovered ? "scale(1.05)" : "scale(1)",
        opacity: isHovered ? "0.9" : "1",
        transition: "all 0.2s ease",
        background: "transparent",
        minHeight: "44px",
      }}
    >
      <span
        className="logo-text"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "var(--font-logo), var(--font-display), sans-serif",
          fontWeight: 700,
          letterSpacing: "0.04em",
          fontSize: "18px",
          color: "var(--tt-text)",
        }}
      >
        <span
          className="logo-mark"
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            background: "var(--tt-primary)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
          }}
          aria-hidden="true"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ display: "block" }}
            aria-hidden="true"
          >
            <path d="M5 14a7 7 0 0 1 14 0" />
            <path d="M12 14l4-4" />
            <circle cx="12" cy="14" r="1.2" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <span className="logo-wordmark">
          <span style={{ color: "var(--tt-text)" }}>Termin</span>
          <span style={{ color: "var(--tt-primary-strong)" }}>Tacho</span>
        </span>
      </span>
    </Link>
  );
}
