import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only initialize if env vars are present (fallback to no-op in dev)
const ratelimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 requests per minute
      prefix: '@upstash/ratelimit',
    })
  : null;

export function getClientIp(request: Request): string {
  // Cloudflare (most reliable when behind CF)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp && isValidIp(cfIp)) return cfIp;

  // Vercel / trusted reverse proxy
  const realIp = request.headers.get('x-real-ip');
  if (realIp && isValidIp(realIp)) return realIp;

  // Fallback: first IP in x-forwarded-for (client IP is leftmost)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const ips = forwarded.split(',').map(ip => ip.trim());
    const firstIp = ips[0];
    if (isValidIp(firstIp)) return firstIp;
  }

  return 'unknown';
}

function isValidIp(ip: string): boolean {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip) || 
         /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(ip);
}

// In-memory rate limit fallback when Upstash is not configured
const memoryStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup expired entries every 60 seconds to prevent unbounded growth
if (typeof global !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (now > entry.resetAt) {
        memoryStore.delete(key);
      }
    }
  }, 60_000);
}

// Warn in development if Upstash is not configured
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn('Rate limit: Using in-memory store (not production-safe). Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for production.');
}

function memoryLimiter(identifier: string, maxRequests: number, windowMs: number) {
  const now = Date.now();
  const entry = memoryStore.get(identifier);
  
  if (!entry || now > entry.resetAt) {
    memoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { 
      success: true, 
      limit: maxRequests, 
      remaining: maxRequests - 1, 
      reset: now + windowMs 
    };
  }
  
  entry.count++;
  if (entry.count > maxRequests) {
    return { 
      success: false, 
      limit: maxRequests, 
      remaining: 0, 
      reset: entry.resetAt 
    };
  }
  
  return { 
    success: true, 
    limit: maxRequests, 
    remaining: maxRequests - entry.count, 
    reset: entry.resetAt 
  };
}

export async function checkRateLimit(request: Request) {
  const ip = getClientIp(request);
  const identifier = `bybit-import:${ip}`;
  
  if (!ratelimit) {
    return memoryLimiter(identifier, 10, 60_000);
  }

  const result = await ratelimit.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
