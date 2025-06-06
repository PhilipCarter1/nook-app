import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/features',
    '/privacy',
    '/terms',
    '/contact',
    '/demo',
  ];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith(`${route}/`)
  );

  // If the user is not logged in and trying to access a protected route
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If the user is logged in and trying to access auth pages, allow it
  // This enables switching between different user accounts
  if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return res;
  }

  // If the user is logged in and trying to access a public route that's not auth-related
  if (session && isPublicRoute && !['/login', '/signup'].includes(request.nextUrl.pathname)) {
    // Redirect to the appropriate dashboard based on user role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData) {
        switch (userData.role) {
          case 'admin':
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
          case 'landlord':
            return NextResponse.redirect(new URL('/landlord/dashboard', request.url));
          case 'tenant':
            return NextResponse.redirect(new URL('/tenant/dashboard', request.url));
        }
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 