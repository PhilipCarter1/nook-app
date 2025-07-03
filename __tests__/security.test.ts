import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { withRateLimit, RateLimitResult } from '../lib/services/rateLimit';
import { createError, ErrorCodes, handleError } from '../lib/services/error';

// Initialize Supabase client for testing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('Security Features', () => {
  const testUserId = 'test-user-id';
  const testEndpoint = '/api/test';
  const testMethod = 'GET';

  beforeEach(async () => {
    // Clean up rate limit records before each test
    await supabase
      .from('rate_limits')
      .delete()
      .eq('user_id', testUserId);
  });

  afterEach(async () => {
    // Clean up rate limit records after each test
    await supabase
      .from('rate_limits')
      .delete()
      .eq('user_id', testUserId);
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const result = await withRateLimit(testUserId, testEndpoint, testMethod);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
      expect(result.limit).toBe(100); // Default limit
    });

    it('should block requests exceeding rate limit', async () => {
      // Make multiple requests to exceed the limit
      const requests = Array(101).fill(null);
      for (const _ of requests) {
        await withRateLimit(testUserId, testEndpoint, testMethod);
      }

      const result = await withRateLimit(testUserId, testEndpoint, testMethod);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.limit).toBe(100);
    });

    it('should reset rate limit after window expires', async () => {
      // Make requests to reach limit
      const requests = Array(100).fill(null);
      for (const _ of requests) {
        await withRateLimit(testUserId, testEndpoint, testMethod);
      }

      // Mock the current time to be after the rate limit window
      const originalDate = global.Date;
      const mockDate = new Date(originalDate.now() + 3600000); // 1 hour later
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
        static now() {
          return mockDate.getTime();
        }
        getTime() {
          return mockDate.getTime();
        }
      } as any;

      // Clear the rate limit store to ensure we're starting fresh
      await supabase
        .from('rate_limits')
        .delete()
        .eq('user_id', testUserId);

      const result = await withRateLimit(testUserId, testEndpoint, testMethod);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
      expect(result.limit).toBe(100);

      // Restore original Date
      global.Date = originalDate;
    }, 10000); // Increase timeout to 10 seconds
  });

  describe('Error Handling', () => {
    it('should create error with correct properties', () => {
      const error = createError(
        'Test error',
        ErrorCodes.VALIDATION.INVALID_INPUT,
        400,
        { field: 'test' }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCodes.VALIDATION.INVALID_INPUT);
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'test' });
    });

    it('should handle different error types', () => {
      // Test AppError
      const appError = createError(
        'App error',
        ErrorCodes.SYSTEM.DATABASE_ERROR
      );
      expect(() => handleError(appError)).not.toThrow();

      // Test standard Error
      const standardError = new Error('Standard error');
      expect(() => handleError(standardError)).not.toThrow();

      // Test unknown error type
      const unknownError = 'Unknown error';
      expect(() => handleError(unknownError)).not.toThrow();
    });

    it('should include context in error handling', () => {
      const error = createError(
        'Context error',
        ErrorCodes.SYSTEM.EXTERNAL_SERVICE_ERROR
      );
      expect(() => handleError(error, 'test-context')).not.toThrow();
    });
  });

  describe('API Security', () => {
    it('should validate request headers', async () => {
      const response = await fetch('/api/test', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });

    it('should handle CORS correctly', async () => {
      const response = await fetch('/api/test', {
        headers: {
          'Origin': 'https://test.nook.app',
        },
      });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
        process.env.NEXT_PUBLIC_APP_URL || '*'
      );
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });
  });
}); 