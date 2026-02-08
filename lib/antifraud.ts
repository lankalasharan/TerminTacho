import { prisma } from "./prisma";

/**
 * Calculate confidence score based on account age
 * Newer accounts have lower confidence, 30 days+ have full confidence
 */
export function calculateConfidenceScore(accountCreatedAt: Date): number {
  const ageInDays = Math.floor(
    (new Date().getTime() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Confidence curve:
  // 0 days: 0.3 (new account - low trust)
  // 3 days: 0.4
  // 7 days: 0.6 (one week - moderate)
  // 14 days: 0.8 (two weeks - good)
  // 30+ days: 1.0 (fully trusted)

  if (ageInDays < 1) return 0.3;
  if (ageInDays < 3) return 0.3 + (ageInDays / 3) * 0.1;
  if (ageInDays < 7) return 0.4 + ((ageInDays - 3) / 4) * 0.2;
  if (ageInDays < 14) return 0.6 + ((ageInDays - 7) / 7) * 0.2;
  if (ageInDays < 30) return 0.8 + ((ageInDays - 14) / 16) * 0.2;
  return 1.0;
}

/**
 * Check if user can submit a review (rate limiting - 1 per day)
 */
export async function canSubmitReview(userId: string): Promise<{
  allowed: boolean;
  message?: string;
  hoursUntilNext?: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return { allowed: false, message: "User not found" };
  }

  // Get the user's last review submission time
  const lastReview = await prisma.review.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (!lastReview) {
    return { allowed: true };
  }

  const now = new Date();
  const lastReviewTime = new Date(lastReview.createdAt);
  const hoursSinceLastReview = (now.getTime() - lastReviewTime.getTime()) / (1000 * 60 * 60);

  if (hoursSinceLastReview < 24) {
    const hoursUntilNext = Math.ceil(24 - hoursSinceLastReview);
    return {
      allowed: false,
      message: `You can submit another review in ${hoursUntilNext} hours`,
      hoursUntilNext,
    };
  }

  return { allowed: true };
}

/**
 * Check if user has already submitted a report for this case/process
 */
export async function isDuplicateSubmission(
  userId: string | undefined,
  caseNumber: string | undefined,
  processTypeId: string
): Promise<{
  isDuplicate: boolean;
  message?: string;
}> {
  if (!userId || !caseNumber) {
    return { isDuplicate: false };
  }

  const existing = await prisma.report.findUnique({
    where: {
      userId_caseNumber_processTypeId: {
        userId,
        caseNumber,
        processTypeId,
      },
    },
  });

  if (existing) {
    return {
      isDuplicate: true,
      message: "You have already submitted a report for this case and process type",
    };
  }

  return { isDuplicate: false };
}

/**
 * Check rate limiting for submissions (max N submissions in time period)
 */
export async function checkSubmissionRateLimit(
  userId: string | undefined,
  options: {
    maxSubmissions?: number; // Default: 5
    timeWindowHours?: number; // Default: 24
  } = {}
): Promise<{
  allowed: boolean;
  message?: string;
  remaining?: number;
}> {
  const { maxSubmissions = 5, timeWindowHours = 24 } = options;

  if (!userId) {
    return { allowed: true };
  }

  const cutoffTime = new Date(new Date().getTime() - timeWindowHours * 60 * 60 * 1000);

  const recentSubmissions = await prisma.report.count({
    where: {
      userId,
      createdAt: {
        gte: cutoffTime,
      },
    },
  });

  if (recentSubmissions >= maxSubmissions) {
    return {
      allowed: false,
      message: `You've reached the limit of ${maxSubmissions} submissions per ${timeWindowHours} hours. Try again later.`,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    remaining: maxSubmissions - recentSubmissions,
  };
}

/**
 * Get account age in days
 */
export async function getAccountAgeDays(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });

  if (!user) return 0;

  return Math.floor(
    (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/**
 * Get user's submission history and trust score
 */
export async function getUserTrustMetrics(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });

  if (!user) {
    return null;
  }

  const [reportCount, reviewCount, helpfulCount] = await Promise.all([
    prisma.report.count({ where: { userId } }),
    prisma.review.count({ where: { userId } }),
    prisma.report.aggregate({
      where: { userId },
      _sum: { helpful: true },
    }),
  ]);

  const accountAgeDays = Math.floor(
    (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
  const confidenceScore = calculateConfidenceScore(user.createdAt);

  return {
    accountAgeDays,
    totalSubmissions: reportCount + reviewCount,
    reportCount,
    reviewCount,
    helpfulVotes: helpfulCount._sum.helpful || 0,
    confidenceScore,
    trustLevel:
      confidenceScore >= 0.85
        ? "trusted"
        : confidenceScore >= 0.7
          ? "verified"
          : confidenceScore >= 0.5
            ? "moderate"
            : "new",
  };
}
