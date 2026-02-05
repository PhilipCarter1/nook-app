import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

/**
 * Create a Supabase client for Server Components
 * This client has access to the user's session
 * Safe to use in API routes and Server Components
 */
export function createServerClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
}

/**
 * Create a service role client for admin operations
 * WARNING: This has full database access - use only for admin operations
 * NEVER expose to browser or client-side code
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

/**
 * Get the current authenticated user (server-side)
 */
export async function getServerUser() {
  try {
    const supabase = createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Get the current user's profile with role info (server-side)
 */
export async function getServerUserWithProfile() {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) return user;

    return { ...user, ...profile };
  } catch (error) {
    return null;
  }
}

/**
 * Require authentication - throws if user is not authenticated
 */
export async function requireAuth() {
  const user = await getServerUser();
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  const userWithProfile = await getServerUserWithProfile();
  
  if (!userWithProfile) {
    throw new Error('Not authenticated');
  }

  if ('role' in userWithProfile && userWithProfile.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return userWithProfile;
}

/**
 * Require specific role
 */
export async function requireRole(requiredRole: string | string[]) {
  const userWithProfile = await getServerUserWithProfile();
  
  if (!userWithProfile) {
    throw new Error('Not authenticated');
  }

  const userRole = 'role' in userWithProfile ? userWithProfile.role : null;
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!userRole || !roles.includes(userRole)) {
    throw new Error(`Role required: ${roles.join(' or ')}`);
  }

  return userWithProfile;
}
