import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);

    // Check if user already has a role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      // If user has a role, redirect to dashboard
      if (userData?.role) {
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
      }
    }
  }

  // If no role is set, redirect to role selection
  return NextResponse.redirect(new URL('/role-select', requestUrl.origin));
} 