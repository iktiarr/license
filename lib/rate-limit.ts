/**
 * In-memory sliding window Rate Limiter for Next.js API Routes
 * Prevents brute force, credential stuffing, and DDoS attacks on sensitive endpoints.
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const trackers = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of trackers.entries()) {
      if (record.resetAt <= now) {
        trackers.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit: number;      // Maximum requests allowed within windowMs
  windowMs: number;   // Time window in milliseconds
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 60, windowMs: 60 * 1000 }
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = trackers.get(identifier);

  if (!record || record.resetAt <= now) {
    trackers.set(identifier, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: now + options.windowMs,
    };
  }

  if (record.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    reset: record.resetAt,
  };
}
