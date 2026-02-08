import { getServerSession } from "next-auth";
import { prisma } from "./prisma";

/**
 * Check if user's email is verified
 */
export async function isEmailVerified(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true }
  });
  
  return !!user?.emailVerified;
}

/**
 * Check if user has submitted a timeline
 */
export async function hasSubmittedTimeline(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hasSubmittedTimeline: true }
  });
  
  return !!user?.hasSubmittedTimeline;
}

/**
 * Check if user has full access to data (email verified + timeline submitted)
 */
export async function hasFullDataAccess(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true, hasSubmittedTimeline: true }
  });
  
  return !!(user?.emailVerified && user?.hasSubmittedTimeline);
}

/**
 * Mark timeline as submitted for a user
 */
export async function markTimelineSubmitted(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      hasSubmittedTimeline: true,
      timelineSubmittedAt: new Date()
    }
  });
}

/**
 * Get user verification status
 */
export async function getUserVerificationStatus(userId: string | null | undefined) {
  if (!userId) {
    return {
      emailVerified: false,
      hasSubmittedTimeline: false,
      hasFullAccess: false,
      timelineSubmittedAt: null as Date | null
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailVerified: true,
      hasSubmittedTimeline: true,
      timelineSubmittedAt: true
    }
  });

  return {
    emailVerified: !!user?.emailVerified,
    hasSubmittedTimeline: !!user?.hasSubmittedTimeline,
    hasFullAccess: !!(user?.emailVerified && user?.hasSubmittedTimeline),
    timelineSubmittedAt: user?.timelineSubmittedAt ?? null
  };
}
