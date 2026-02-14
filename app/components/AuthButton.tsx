"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  if (session) {
    const displayName = session.user?.name || session.user?.email || "User";
    const avatarUrl = session.user?.image || "";
    const initials = displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setIsOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className="auth-trigger"
          style={{
            height: "44px",
            padding: "4px 10px 4px 4px",
            borderRadius: "999px",
            border: "2px solid var(--tt-border)",
            background: "var(--tt-surface)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--tt-primary-strong)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(28, 144, 216,0.25)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--tt-border)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "999px",
              overflow: "hidden",
              border: "1px solid var(--tt-border)",
              background: "var(--tt-primary-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                width={36}
                height={36}
                style={{ borderRadius: "999px", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--tt-primary-strong)" }}>
                {initials}
              </span>
            )}
          </div>
          <div className="auth-meta" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--tt-text)",
                maxWidth: "120px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {displayName}
            </span>
            <span style={{ fontSize: "11px", color: "var(--tt-text-muted)" }}>Signed in</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{ marginLeft: "2px" }}>
            <path d="M5 7l5 5 5-5" stroke="var(--tt-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {isOpen && (
          <div
            role="menu"
            style={{
              position: "absolute",
              top: "54px",
              right: 0,
              minWidth: "260px",
              background: "var(--tt-surface)",
              border: "1px solid var(--tt-border)",
              borderRadius: "14px",
              boxShadow: "0 16px 32px rgba(0,0,0,0.14)",
              padding: "10px",
              zIndex: 50,
            }}
          >
            <div
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: "var(--tt-surface-soft)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "999px",
                  overflow: "hidden",
                  border: "1px solid var(--tt-border)",
                  background: "var(--tt-primary-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    width={40}
                    height={40}
                    style={{ borderRadius: "999px", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--tt-primary-strong)" }}>
                    {initials}
                  </span>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--tt-text)", fontSize: "14px" }}>
                  {displayName}
                </div>
                {session.user?.email && (
                  <div style={{ fontSize: "12px", color: "var(--tt-text-muted)" }}>
                    {session.user.email}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gap: "6px" }}>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  color: "var(--tt-text)",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--tt-surface-muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z" stroke="var(--tt-primary-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/submit"
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  color: "var(--tt-text)",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--tt-surface-muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="var(--tt-primary-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Submit Timeline
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  color: "var(--tt-text)",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--tt-surface-muted)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" stroke="var(--tt-primary-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Contact Support
              </Link>
            </div>

            <div style={{ height: "1px", background: "var(--tt-border)", margin: "10px 0" }} />

            <button
              onClick={() => signOut()}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid var(--tt-border)",
                background: "var(--tt-surface)",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--tt-surface-muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--tt-surface)";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 17l5-5-5-5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12H9" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="auth-signin"
      style={{
        padding: "10px 18px",
        background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        minHeight: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 8px rgba(28, 144, 216, 0.2)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 16px rgba(28, 144, 216, 0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(28, 144, 216, 0.2)";
      }}
    >
      Sign In
    </button>
  );
}


