import { NextRequest } from 'next/server';

// Rate limit configuration
const RATE_LIMIT_REQUESTS = 10; // 10 requests
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes in milliseconds

// In-memory storage fallback (for development/testing)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

export class RateLimiter {
  private static generateKey(req: NextRequest): string {
    // Use IP address + user agent for better identification
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               req.headers.get('cf-connecting-ip') || 
               'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }

  static async checkLimit(req: NextRequest): Promise<RateLimitResult> {
    const key = this.generateKey(req);
    const now = Date.now();

    // Get current rate limit data
    let rateLimitData = rateLimitStore.get(key);

    // Initialize if first request or window expired
    if (!rateLimitData || now > rateLimitData.resetTime) {
      rateLimitData = {
        count: 0,
        resetTime: now + RATE_LIMIT_WINDOW
      };
    }

    // Check if limit exceeded
    if (rateLimitData.count >= RATE_LIMIT_REQUESTS) {
      const timeUntilReset = Math.ceil((rateLimitData.resetTime - now) / 1000 / 60);
      return {
        success: false,
        remaining: 0,
        resetTime: rateLimitData.resetTime,
        message: `Rate limit exceeded. You can ask ${RATE_LIMIT_REQUESTS} questions every 5 minutes. Try again in ${timeUntilReset} minutes.`
      };
    }

    // Increment counter
    rateLimitData.count++;
    rateLimitStore.set(key, rateLimitData);

    return {
      success: true,
      remaining: RATE_LIMIT_REQUESTS - rateLimitData.count,
      resetTime: rateLimitData.resetTime
    };
  }

  static async getRemaining(req: NextRequest): Promise<{ remaining: number; resetTime: number }> {
    const key = this.generateKey(req);
    const now = Date.now();
    const rateLimitData = rateLimitStore.get(key);

    if (!rateLimitData || now > rateLimitData.resetTime) {
      return { remaining: RATE_LIMIT_REQUESTS, resetTime: now + RATE_LIMIT_WINDOW };
    }

    return {
      remaining: Math.max(0, RATE_LIMIT_REQUESTS - rateLimitData.count),
      resetTime: rateLimitData.resetTime
    };
  }
}

// Redis implementation for production (optional)
export class RedisRateLimiter {
  // This would be implemented with actual Redis client
  // For now, we'll use the in-memory version
  static async checkLimit(req: NextRequest): Promise<RateLimitResult> {
    return RateLimiter.checkLimit(req);
  }
}
