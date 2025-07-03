import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://test.nook.app');

// Create a store to maintain state for rate limiting tests
const rateLimitStore = new Map<string, any[]>();

interface MockQueryBuilder {
  data: any[];
  endpoint?: string;
  select: () => MockQueryBuilder;
  insert: (data: any) => MockQueryBuilder;
  delete: () => MockQueryBuilder;
  eq: (field: string, value: string) => MockQueryBuilder;
  gte: (field: string, value: string) => MockQueryBuilder;
  then: (callback: (result: any) => void) => Promise<any>;
}

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null,
      }),
    },
    from: vi.fn((table) => {
      const queryBuilder: MockQueryBuilder = {
        data: [],
        endpoint: table,
        select: function() { return this; },
        insert: function(data) {
          const key = `${data.user_id}-${this.endpoint}`;
          const requests = rateLimitStore.get(key) || [];
          requests.push({
            ...data,
            created_at: new Date().toISOString()
          });
          rateLimitStore.set(key, requests);
          return this;
        },
        delete: function() {
          rateLimitStore.clear();
          return this;
        },
        eq: function(field, value) {
          if (field === 'user_id') {
            const key = `${value}-${this.endpoint}`;
            this.data = rateLimitStore.get(key) || [];
          }
          return this;
        },
        gte: function(field, value) {
          if (field === 'created_at') {
            const cutoff = new Date(value).getTime();
            this.data = this.data.filter((req: any) => {
              const requestTime = new Date(req.created_at).getTime();
              return requestTime >= cutoff;
            });
          }
          return this;
        },
        then: function(callback) {
          // Filter out old requests before returning data
          const now = new Date().getTime();
          const windowStart = now - 3600000; // 1 hour window
          this.data = this.data.filter((req: any) => {
            const requestTime = new Date(req.created_at).getTime();
            return requestTime >= windowStart;
          });
          callback({ data: this.data, error: null });
          return Promise.resolve({ data: this.data, error: null });
        }
      };
      return queryBuilder;
    }),
  })),
}));

// Mock fetch
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    headers: new Headers({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Access-Control-Allow-Origin': 'https://test.nook.app',
      'Access-Control-Allow-Credentials': 'true',
    }),
  })
);

// Mock console.error to keep test output clean
vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock toast notifications
vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
})); 