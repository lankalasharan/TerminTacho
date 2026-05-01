"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface AccessGateProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  /** If true, shows a soft contribute CTA below content instead of blurring */
  softGate?: boolean;
}

function BlurOverlay({
  children,
  icon,
  title,
  body,
  cta,
  sub,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: { label: string; href: string };
  sub?: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative" }}>
      {/* Blurred background content — gives users a teaser */}
      <div
        style={{ filter: "blur(5px)", pointerEvents: "none", userSelect: "none", opacity: 0.55 }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Overlay CTA card */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          padding: "20px",
          background: "rgba(249,250,251,0.4)",
          backdropFilter: "blur(2px)",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "40px 32px",
            textAlign: "center",
            maxWidth: "440px",
            width: "100%",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>{icon}</div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "12px", color: "#1f2937" }}>
            {title}
          </h2>
          <p style={{ fontSize: "15px", color: "#4b5563", marginBottom: "28px", lineHeight: "1.6" }}>
            {body}
          </p>
          <Link
            href={cta.href}
            style={{
              display: "inline-block",
              padding: "14px 28px",
              background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
              color: "white",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "15px",
            }}
          >
            {cta.label}
          </Link>
          {sub && (
            <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "16px" }}>{sub}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DataAccessGate({ children, fallbackMessage, softGate }: AccessGateProps) {
  const { data: session } = useSession();
  const [accessStatus, setAccessStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setAccessStatus({
        isAuthenticated: false,
        emailVerified: false,
        hasSubmittedTimeline: false,
        submissionIsRecent: false,
        requiredSubmissionAgeMonths: 6,
        hasFullAccess: false,
      });
      setLoading(false);
      return;
    }

    async function checkAccess() {
      try {
        const res = await fetch("/api/user/access-status");
        const data = await res.json();
        setAccessStatus(data);
      } catch (error) {
        console.error("Failed to check access status:", error);
        setAccessStatus({
          isAuthenticated: true,
          emailVerified: false,
          hasSubmittedTimeline: false,
          submissionIsRecent: false,
          requiredSubmissionAgeMonths: 6,
          hasFullAccess: false,
        });
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [session]);

  if (loading) {
    return <>{children}</>;
  }

  // Full access — show content normally
  if (accessStatus?.hasFullAccess) {
    return <>{children}</>;
  }

  // Soft gate mode: show content + a gentle CTA below, no blur
  if (softGate) {
    return (
      <>
        {children}
        <div
          style={{
            margin: "32px 0 0",
            padding: "24px 28px",
            borderRadius: "14px",
            border: "1px dashed #d1d5db",
            background: "#f9fafb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>
              Want to see the latest reports?
            </p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>
              {fallbackMessage || "Add your own timeline to unlock the most recent community data for this city."}
            </p>
          </div>
          <Link
            href="/submit"
            style={{
              display: "inline-block",
              padding: "10px 20px",
              background: "linear-gradient(135deg, var(--tt-primary-strong) 0%, var(--tt-primary) 100%)",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "14px",
              whiteSpace: "nowrap",
            }}
          >
            Add my timeline →
          </Link>
        </div>
      </>
    );
  }

  // Not authenticated
  if (!accessStatus?.isAuthenticated) {
    return (
      <BlurOverlay
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        }
        title="Unlock Real Processing Times"
        body={
          fallbackMessage ||
          "Sign in and share your own experience to unlock detailed city-specific data. Completely free and anonymous."
        }
        cta={{ label: "Sign In / Create Account →", href: "/api/auth/signin" }}
        sub="Free · Anonymous · Takes 2 minutes"
      >
        {children}
      </BlurOverlay>
    );
  }

  // Email not verified
  if (!accessStatus?.emailVerified) {
    return (
      <BlurOverlay
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="3"/>
            <path d="m4 7 8 6 8-6"/>
          </svg>
        }
        title="Verify Your Email"
        body="We sent a verification link to your email. Click it to unlock access to all processing time data."
        cta={{ label: "Resend / Sign In Again →", href: "/api/auth/signin" }}
        sub="Check your spam folder if you can't find the email."
      >
        {children}
      </BlurOverlay>
    );
  }

  // No timeline submitted
  if (!accessStatus?.hasSubmittedTimeline) {
    return (
      <BlurOverlay
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        }
        title="Submit to Unlock"
        body="Share your own processing timeline to unlock this city's full data. It helps the whole community — and takes just 2 minutes."
        cta={{ label: "Submit My Timeline →", href: "/submit" }}
        sub={
          <span style={{ display: "inline-flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Email verified
            </span>
            <span style={{ color: "#d1d5db" }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
              Timeline pending
            </span>
          </span>
        }
      >
        {children}
      </BlurOverlay>
    );
  }

  // Timeline too old
  if (!accessStatus?.submissionIsRecent) {
    return (
      <BlurOverlay
        icon={
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 3"/>
          </svg>
        }
        title="Update Your Timeline"
        body={`Your last submission is older than ${accessStatus?.requiredSubmissionAgeMonths || 6} months. Submit a new one to keep your access to the latest data.`}
        cta={{ label: "Submit New Timeline →", href: "/submit" }}
        sub={
          <span style={{ display: "inline-flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Email verified
            </span>
            <span style={{ color: "#d1d5db" }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              Timeline submitted
            </span>
            <span style={{ color: "#d1d5db" }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
              Update needed
            </span>
          </span>
        }
      >
        {children}
      </BlurOverlay>
    );
  }

  // Fallback
  return <>{children}</>;
}


