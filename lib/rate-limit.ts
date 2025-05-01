import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set');
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function rateLimit(identifier: string, limit: number, window: number) {
  const key = `rate-limit:${identifier}`;
  const now = Date.now();
  const windowStart = now - window;

  // Get all requests in the current window
  const requests = await redis.zrangebyscore(key, windowStart, now);
  
  // Count requests in the current window
  const requestCount = requests.length;

  if (requestCount >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: windowStart + window,
    };
  }

  // Add current request to the set
  await redis.zadd(key, { score: now, member: now.toString() });
  
  // Set expiry on the key
  await redis.expire(key, Math.ceil(window / 1000));

  return {
    success: true,
    limit,
    remaining: limit - requestCount - 1,
    reset: windowStart + window,
  };
}

export const checkRateLimit = async (identifier: string) => {
  // 100 requests per minute
  return rateLimit(identifier, 100, 60 * 1000);
}; 