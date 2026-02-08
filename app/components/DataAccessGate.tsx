"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface AccessGateProps {
  children: React.ReactNode;
  fallbackMessage?: string;
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
        hasFullAccess: false
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
          hasFullAccess: false
        });
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [session]);

  if (loading) {
    return (
      <div style={{
        padding: "40px 20px",
        textAlign: "center",
        maxWidth: "600px",
        margin: "0 auto"
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Full access - show content
  if (accessStatus?.hasFullAccess) {
    return <>{children}</>;
  }

  // Not authenticated - ask to sign in
  if (!accessStatus?.isAuthenticated) {
    return (
      <div style={{
        padding: "40px 20px",
        textAlign: "center",
        maxWidth: "600px",
        margin: "0 auto"
      }}>
        <div style={{
          background: "#f3f4f6",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          padding: "32px 24px"
        }}>
          <h2 style={{ 
            fontSize: "24px", 
            fontWeight: 700, 
            marginBottom: "12px",
            color: "#1f2937"
          }}>
            🔒 Data Access Restricted
          </h2>
          <p style={{
            fontSize: "16px",
            color: "#4b5563",
            marginBottom: "24px",
            lineHeight: "1.6"
          }}>
            {fallbackMessage || "To access real processing time data, you need to verify your email and submit your timeline."}
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link 
              href="/api/auth/signin"
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Sign In / Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Missing email verification
  if (!accessStatus?.emailVerified) {
    return (
      <div style={{
        padding: "40px 20px",
        textAlign: "center",
        maxWidth: "600px",
        margin: "0 auto"
      }}>
        <div style={{
          background: "#fef3c7",
          border: "1px solid #fbbf24",
          borderRadius: "8px",
          padding: "32px 24px"
        }}>
          <h2 style={{ 
            fontSize: "24px", 
            fontWeight: 700, 
            marginBottom: "12px",
            color: "#b45309"
          }}>
            ✉️ Verify Your Email
          </h2>
          <p style={{
            fontSize: "16px",
            color: "#78350f",
            marginBottom: "24px",
            lineHeight: "1.6"
          }}>
            We've sent a verification link to your email. Please click it to verify your account before accessing the data.
          </p>
          <div style={{ 
            padding: "16px", 
            background: "white", 
            borderRadius: "6px",
            marginBottom: "24px",
            fontSize: "14px",
            color: "#666"
          }}>
            If you didn't receive an email, check your spam folder or <Link href="/api/auth/signin" style={{ color: "#667eea", textDecoration: "none", fontWeight: 600 }}>sign in again</Link>.
          </div>
          <p style={{
            fontSize: "14px",
            color: "#666",
            marginTop: "16px"
          }}>
            Progress: ✅ Email verification pending • ⏳ Timeline submission pending
          </p>
        </div>
      </div>
    );
  }

  // Missing timeline submission
  if (!accessStatus?.hasSubmittedTimeline) {
    return (
      <div style={{
        padding: "40px 20px",
        textAlign: "center",
        maxWidth: "600px",
        margin: "0 auto"
      }}>
        <div style={{
          background: "#dbeafe",
          border: "1px solid #3b82f6",
          borderRadius: "8px",
          padding: "32px 24px"
        }}>
          <h2 style={{ 
            fontSize: "24px", 
            fontWeight: 700, 
            marginBottom: "12px",
            color: "#1e40af"
          }}>
            📝 Submit Your Timeline
          </h2>
          <p style={{
            fontSize: "16px",
            color: "#1e3a8a",
            marginBottom: "24px",
            lineHeight: "1.6"
          }}>
            Great! Your email is verified. Now submit at least one timeline to unlock access to all processing time data. It helps the community and gives you access!
          </p>
          <Link 
            href="/submit"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Submit Timeline Now
          </Link>
          <p style={{
            fontSize: "14px",
            color: "#666",
            marginTop: "24px"
          }}>
            Progress: ✅ Email verified • ⏳ Timeline submission pending
          </p>
        </div>
      </div>
    );
  }

  // Timeline submission is too old
  if (!accessStatus?.submissionIsRecent) {
    return (
      <div style={{
        padding: "40px 20px",
        textAlign: "center",
        maxWidth: "600px",
        margin: "0 auto"
      }}>
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          padding: "32px 24px"
        }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: 700,
            marginBottom: "12px",
            color: "#991b1b"
          }}>
            ⏳ Update Your Timeline
          </h2>
          <p style={{
            fontSize: "16px",
            color: "#7f1d1d",
            marginBottom: "24px",
            lineHeight: "1.6"
          }}>
            Your last submission is older than {accessStatus?.requiredSubmissionAgeMonths || 6} months.
            Please submit a new timeline to keep access to the latest data.
          </p>
          <Link
            href="/submit"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "14px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Submit New Timeline
          </Link>
          <p style={{
            fontSize: "14px",
            color: "#7f1d1d",
            marginTop: "24px"
          }}>
            Progress: ✅ Email verified • ✅ Timeline submitted • ⏳ Update required
          </p>
        </div>
      </div>
    );
  }

  // Fallback - shouldn't reach here but just in case
  return <>{children}</>;
}
