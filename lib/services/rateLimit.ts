import { createClient } from '@supabase/supabase-js';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 100,
  windowMs: 3600000, // 1 hour
};

const ENDPOINT_CONFIGS: Record<string, RateLimitConfig> = {
  'POST /api/maintenance/tickets': {
    maxRequests: 20,
    windowMs: 3600000,
  },
  'POST /api/maintenance/comments': {
    maxRequests: 50,
    windowMs: 3600000,
  },
  'POST /api/maintenance/media': {
    maxRequests: 10,
    windowMs: 3600000,
  },
  'POST /api/auth/login': {
    maxRequests: 5,
    windowMs: 900000, // 15 minutes
  },
  'POST /api/auth/register': {
    maxRequests: 3,
    windowMs: 3600000,
  },
  'POST /api/payments': {
    maxRequests: 30,
    windowMs: 3600000,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function checkRateLimit(
  userId: string,
  endpoint: string,
  method: string
): Promise<RateLimitResult> {
  const key = `${method} ${endpoint}`;
  const config = ENDPOINT_CONFIGS[key] || DEFAULT_CONFIG;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const { data: requests, error } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('user_id', userId)
    .eq('endpoint', key)
    .gte('created_at', new Date(windowStart).toISOString());

  if (error) {
    console.error('Error checking rate limit:', error);
    return {
      allowed: true,
      remaining: config.maxRequests,
      reset: now + config.windowMs,
      limit: config.maxRequests,
    };
  }

  const requestCount = requests?.length || 0;
  const remaining = Math.max(0, config.maxRequests - requestCount);
  const reset = now + config.windowMs;

  return {
    allowed: remaining > 0,
    remaining,
    reset,
    limit: config.maxRequests,
  };
}

export async function recordRequest(
  userId: string,
  endpoint: string,
  method: string
): Promise<void> {
  const key = `${method} ${endpoint}`;
  const { error } = await supabase.from('rate_limits').insert({
    user_id: userId,
    endpoint: key,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error recording request:', error);
  }
}

export async function cleanupRateLimits(): Promise<void> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from('rate_limits')
    .delete()
    .lt('created_at', oneDayAgo);

  if (error) {
    console.error('Error cleaning up rate limits:', error);
  }
}

export async function withRateLimit(
  userId: string,
  endpoint: string,
  method: string
): Promise<RateLimitResult> {
  const result = await checkRateLimit(userId, endpoint, method);
  if (result.allowed) {
    await recordRequest(userId, endpoint, method);
  }
  return result;
} 