// Removed static import of '@upstash/redis' to avoid build errors when the package is not installed.

// Only use Redis in production, require dynamically

if (process.env.NODE_ENV === 'production') {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
  }
}

// Legacy rateLimit function (not used in preview)
export async function rateLimit(identifier: string, limit: number, window: number) {
  if (process.env.NODE_ENV !== 'production') {
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: Date.now() + window,
    };
  }
  const { Redis } = require('@upstash/redis');
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  const key = `rate-limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - window;
  const requests = await redis.zrangebyscore(key, windowStart, now);
  const requestCount = requests.length;
  if (requestCount >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: windowStart + window,
    };
  }
  await redis.zadd(key, { score: now, member: now.toString() });
  await redis.expire(key, Math.ceil(window / 1000));
  return {
    success: true,
    limit,
    remaining: limit - requestCount - 1,
    reset: windowStart + window,
  };
}

// Mock rate limiting for preview
export async function checkRateLimit(ip: string) {
  if (process.env.NODE_ENV !== 'production') {
    return {
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 3600000
    };
  }
  // Real implementation for production
  const { Redis } = require('@upstash/redis');
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  const key = `rate-limit:${ip}`;
  const limit = 100; // requests
  const window = 3600; // 1 hour in seconds
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, window);
  }
  const remaining = Math.max(0, limit - current);
  const reset = await redis.ttl(key);
  return {
    success: current <= limit,
    limit,
    remaining,
    reset: Date.now() + (reset * 1000),
  };
} 