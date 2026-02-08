import { prisma } from "./prisma";

/**
 * Extract IP address from request
 */
export function getClientIp(request: Request): string | null {
  // Check headers in order of preference
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp;
  }

  // Fallback - this won't work in serverless but good to have
  const socket = (request as any).socket;
  if (socket?.remoteAddress) {
    return socket.remoteAddress;
  }

  return null;
}

/**
 * Check if IP has created too many accounts (fraud detection)
 */
export async function checkIpAbusePattern(
  ipAddress: string | null,
  options: {
    maxAccountsPerIp?: number;
    timeWindowHours?: number;
  } = {}
): Promise<{
  isAbusive: boolean;
  accountCount: number;
  message?: string;
}> {
  const { maxAccountsPerIp = 5, timeWindowHours = 24 } = options;

  if (!ipAddress) {
    return { isAbusive: false, accountCount: 0 };
  }

  const cutoffTime = new Date(new Date().getTime() - timeWindowHours * 60 * 60 * 1000);

  const accountCount = await prisma.user.count({
    where: {
      lastIpAddress: ipAddress,
      createdAt: {
        gte: cutoffTime,
      },
    },
  });

  if (accountCount >= maxAccountsPerIp) {
    return {
      isAbusive: true,
      accountCount,
      message: `Too many accounts created from this IP address (${accountCount}/${maxAccountsPerIp})`,
    };
  }

  return { isAbusive: false, accountCount };
}

/**
 * Check if IP is submitting suspicious patterns
 */
export async function checkIpSubmissionPatterns(
  ipAddress: string | null,
  options: {
    maxSubmissionsPerHour?: number;
  } = {}
): Promise<{
  isSuspicious: boolean;
  submissionCount: number;
  message?: string;
}> {
  const { maxSubmissionsPerHour = 20 } = options;

  if (!ipAddress) {
    return { isSuspicious: false, submissionCount: 0 };
  }

  const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000);

  const submissionCount = await prisma.report.count({
    where: {
      ipAddress,
      createdAt: {
        gte: oneHourAgo,
      },
    },
  });

  if (submissionCount > maxSubmissionsPerHour) {
    return {
      isSuspicious: true,
      submissionCount,
      message: `Suspicious submission pattern from IP: ${submissionCount} in last hour`,
    };
  }

  return { isSuspicious: false, submissionCount };
}

/**
 * Track IP address for user
 */
export async function trackIpAddress(userId: string, ipAddress: string | null): Promise<void> {
  if (!ipAddress) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      lastIpAddress: ipAddress,
    },
  });
}

/**
 * Get all accounts created from same IP
 */
export async function getAccountsFromIp(ipAddress: string) {
  return prisma.user.findMany({
    where: {
      lastIpAddress: ipAddress,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });
}

/**
 * Detect coordinated attack (multiple accounts from same IP submitting to same office)
 */
export async function detectCoordinatedAttack(
  officeId: string,
  timeWindowHours: number = 24
): Promise<{
  isAttack: boolean;
  suspiciousIps: Array<{
    ip: string;
    submissionCount: number;
    accounts: number;
  }>;
}> {
  const cutoffTime = new Date(new Date().getTime() - timeWindowHours * 60 * 60 * 1000);

  const recentSubmissions = await prisma.report.findMany({
    where: {
      officeId,
      createdAt: {
        gte: cutoffTime,
      },
    },
    select: {
      ipAddress: true,
      userId: true,
    },
  });

  if (recentSubmissions.length === 0) {
    return { isAttack: false, suspiciousIps: [] };
  }

  // Group by IP
  const ipMap = new Map<
    string,
    {
      submissions: number;
      users: Set<string | null>;
    }
  >();

  recentSubmissions.forEach(({ ipAddress, userId }) => {
    if (!ipAddress) return;

    if (!ipMap.has(ipAddress)) {
      ipMap.set(ipAddress, {
        submissions: 0,
        users: new Set(),
      });
    }

    const data = ipMap.get(ipAddress)!;
    data.submissions++;
    if (userId) data.users.add(userId);
  });

  // Flag IPs with multiple accounts OR multiple submissions in short time
  const suspiciousIps = Array.from(ipMap.entries())
    .filter(([_, data]) => data.users.size >= 3 || data.submissions >= 10)
    .map(([ip, data]) => ({
      ip,
      submissionCount: data.submissions,
      accounts: data.users.size,
    }))
    .sort((a, b) => b.submissionCount - a.submissionCount);

  return {
    isAttack: suspiciousIps.length > 0,
    suspiciousIps,
  };
}
