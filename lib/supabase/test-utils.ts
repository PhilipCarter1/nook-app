import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { mockUsers, mockProperties, mockMaintenanceTickets } from '@/lib/mockData';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { PostgrestQueryBuilder } from '@supabase/postgrest-js';

const createMockUser = (user: typeof mockUsers[0]): User => ({
  ...user,
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
});

type EmailPasswordCredentials = {
  email: string;
  password: string;
};

// Create a test Supabase client that uses mock data
export function createTestSupabaseClient() {
  const supabase = createClientComponentClient<Database>();

  // Mock the auth methods
  supabase.auth.getUser = async () => ({
    data: { user: createMockUser(mockUsers[0]) },
    error: null,
  });

  supabase.auth.signInWithPassword = async (credentials: EmailPasswordCredentials) => {
    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user) {
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid credentials', status: 400, name: 'AuthError' } as AuthError,
      };
    }

    const session: Session = {
      access_token: 'test-token',
      refresh_token: 'test-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: createMockUser(user),
    };

    return {
      data: { user: createMockUser(user), session },
      error: null,
    };
  };

  supabase.auth.signOut = async () => ({
    error: null,
  });

  // Mock the database methods
  const mockTable = (table: string) => {
    const mockData = {
      users: mockUsers,
      properties: mockProperties,
      maintenance_tickets: mockMaintenanceTickets,
    }[table];

    const queryBuilder = {
      select: () => ({
        eq: (column: string, value: any) => ({
          single: () => ({
            data: mockData?.find((item: any) => item[column as keyof typeof item] === value),
            error: null,
          }),
          data: mockData?.filter((item: any) => item[column as keyof typeof item] === value),
          error: null,
        }),
        data: mockData,
        error: null,
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => ({
            data: { ...data, id: 'new-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            error: null,
          }),
        }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: () => ({
              data: { ...data, id: value, updated_at: new Date().toISOString() },
              error: null,
            }),
          }),
        }),
      }),
      url: '',
      headers: {},
      upsert: () => queryBuilder,
      delete: () => queryBuilder,
    } as unknown as PostgrestQueryBuilder<any, any, any, unknown>;

    return queryBuilder;
  };

  supabase.from = mockTable;

  return supabase;
}

// Helper function to wait for a specified time
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to simulate network delay
export const withDelay = <T>(fn: () => Promise<T>, ms: number = 1000) => async () => {
  await wait(ms);
  return fn();
}; 