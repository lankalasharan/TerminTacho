// Simple in-memory rate limiter for Next.js API routes
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  limit: number = 5, // 5 requests
  windowMs: number = 60000 // per minute
): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up old entries
  if (record && now > record.resetTime) {
    rateLimitMap.delete(identifier);
  }

  const currentRecord = rateLimitMap.get(identifier);

  if (!currentRecord) {
    // First request
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: limit - 1 };
  }

  if (currentRecord.count >= limit) {
    // Rate limit exceeded
    return { success: false, remaining: 0 };
  }

  // Increment count
  currentRecord.count += 1;
  rateLimitMap.set(identifier, currentRecord);

  return { success: true, remaining: limit - currentRecord.count };
}

// Helper to get client IP
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return "unknown";
}
