import { NextRequest } from 'next/server';
import { RateLimiter } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  try {
    const rateLimitInfo = await RateLimiter.getRemaining(req);
    
    return new Response(JSON.stringify({
      remaining: rateLimitInfo.remaining,
      resetTime: rateLimitInfo.resetTime
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': rateLimitInfo.remaining.toString(),
        'X-RateLimit-Reset': rateLimitInfo.resetTime.toString()
      }
    });
  } catch (error) {
    console.error('Rate limit status error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get rate limit status',
      remaining: 10,
      resetTime: Date.now() + 5 * 60 * 1000
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}