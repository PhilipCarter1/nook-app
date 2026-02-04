import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { log } from '@/lib/logger';

/**
 * OAuth Callback Handler
 * 
 * This route handles the OAuth callback after successful authentication.
 * It exchanges the auth code for a session and redirects the user to
 * the appropriate dashboard based on their role.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  try {
    if (code) {
      const supabase = createRouteHandlerClient({ cookies });
      
      // Exchange the auth code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        log.error('Auth callback: Failed to exchange code for session', exchangeError as Error);
        return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
      }

      // Get the authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        log.error('Auth callback: Failed to get user', userError as Error);
        return NextResponse.redirect(new URL('/login?error=no_user', requestUrl.origin));
      }

      log.info('Auth callback: User authenticated', { email: user.email });

      // Fetch user profile and role
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('role, first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        log.warn('Auth callback: User not in users table, redirecting to role selection', { userId: user.id });
        // User exists in auth but not in public.users - redirect to role selection
        return NextResponse.redirect(new URL('/role-select', requestUrl.origin));
      }

      if (!userData?.role) {
        log.warn('Auth callback: User has no role, redirecting to role selection');
        return NextResponse.redirect(new URL('/role-select', requestUrl.origin));
      }

      // Redirect to role-specific dashboard
      const dashboardPath = getRoleDashboardPath(userData.role);
      log.info('Auth callback: User redirect', { role: userData.role, path: dashboardPath });
      
      return NextResponse.redirect(new URL(dashboardPath, requestUrl.origin));
    }
  } catch (error) {
    log.error('Auth callback: Unexpected error', error as Error);
    return NextResponse.redirect(new URL('/login?error=unexpected', requestUrl.origin));
  }

  // If no code provided, redirect to login
  log.warn('Auth callback: No code provided, redirecting to login');
  return NextResponse.redirect(new URL('/login?error=no_code', requestUrl.origin));
}

/**
 * Maps user role to their dashboard path
 * @param role - User's role from the database
 * @returns - Path to the appropriate dashboard
 */
function getRoleDashboardPath(role: string): string {
  switch (role.toLowerCase()) {
    case 'admin':
      return '/admin/dashboard';
    case 'landlord':
      return '/dashboard/landlord';
    case 'tenant':
      return '/dashboard/tenant';
    case 'property_manager':
    case 'manager':
      return '/dashboard/manager';
    case 'super':
    case 'superintendent':
      return '/super/dashboard';
    default:
      // Unknown role - send to generic dashboard
      log.warn('Auth callback: Unknown role', { role });
      return '/dashboard';
  }
} 