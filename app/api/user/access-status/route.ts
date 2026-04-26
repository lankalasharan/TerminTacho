import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getUserVerificationStatus } from "@/lib/userVerification";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

function isAdminEmail(email: string): boolean {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .includes(email);
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const RECENT_SUBMISSION_MONTHS = 6;
    
    if (!session?.user?.email) {
      return NextResponse.json({
        isAuthenticated: false,
        emailVerified: false,
        hasSubmittedTimeline: false,
        submissionIsRecent: false,
        requiredSubmissionAgeMonths: RECENT_SUBMISSION_MONTHS,
        hasFullAccess: false,
        message: "Not authenticated"
      });
    }

    // Admins always get full access without submission requirements
    if (isAdminEmail(session.user.email)) {
      return NextResponse.json({
        isAuthenticated: true,
        emailVerified: true,
        hasSubmittedTimeline: true,
        submissionIsRecent: true,
        requiredSubmissionAgeMonths: RECENT_SUBMISSION_MONTHS,
        hasFullAccess: true,
      });
    }

    // Get user and their accounts from database
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        emailVerified: true,
        hasSubmittedTimeline: true,
        accounts: { select: { provider: true } }
      }
    });

    // If user has Google or Facebook account, treat as verified
    const hasOAuth = user?.accounts?.some(
      (acc: { provider: string }) => acc.provider === "google" || acc.provider === "facebook"
    );

    const status = await getUserVerificationStatus(user?.id);
    const emailVerified = hasOAuth ? true : status.emailVerified;
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - RECENT_SUBMISSION_MONTHS);
    const submissionIsRecent = status.timelineSubmittedAt
      ? new Date(status.timelineSubmittedAt) >= cutoffDate
      : false;
    const hasFullAccess = emailVerified && submissionIsRecent;

    return NextResponse.json({
      isAuthenticated: true,
      emailVerified,
      hasSubmittedTimeline: status.hasSubmittedTimeline,
      submissionIsRecent,
      requiredSubmissionAgeMonths: RECENT_SUBMISSION_MONTHS,
      hasFullAccess
    });
  } catch (error) {
    console.error("Error checking access status:", error);
    return NextResponse.json(
      { error: "Failed to check access status" },
      { status: 500 }
    );
  }
}
