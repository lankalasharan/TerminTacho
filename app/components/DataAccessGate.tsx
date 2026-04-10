"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface AccessGateProps {
  children: React.ReactNode;
  fallbackMessage?: string;
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
  icon: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  sub?: string;
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
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>{icon}</div>
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

export default function DataAccessGate({ children, fallbackMessage }: AccessGateProps) {
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
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Full access — show content normally
  if (accessStatus?.hasFullAccess) {
    return <>{children}</>;
  }

  // Not authenticated
  if (!accessStatus?.isAuthenticated) {
    return (
      <BlurOverlay
        icon="🔒"
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
        icon="✉️"
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
        icon="📝"
        title="Submit to Unlock"
        body="Share your own processing timeline to unlock this city's full data. It helps the whole community — and takes just 2 minutes."
        cta={{ label: "Submit My Timeline →", href: "/submit" }}
        sub="✅ Email verified · ⏳ Timeline pending"
      >
        {children}
      </BlurOverlay>
    );
  }

  // Timeline too old
  if (!accessStatus?.submissionIsRecent) {
    return (
      <BlurOverlay
        icon="⏳"
        title="Update Your Timeline"
        body={`Your last submission is older than ${accessStatus?.requiredSubmissionAgeMonths || 6} months. Submit a new one to keep your access to the latest data.`}
        cta={{ label: "Submit New Timeline →", href: "/submit" }}
        sub="✅ Email verified · ✅ Timeline submitted · ⏳ Update needed"
      >
        {children}
      </BlurOverlay>
    );
  }

  // Fallback
  return <>{children}</>;
}


