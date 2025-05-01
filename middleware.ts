import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If there's no session and the user is trying to access a protected route,
  // redirect to the login page
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there's a session, get the user's role
  if (session) {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    // Redirect based on role and route
    if (user?.role) {
      const role = user.role;
      const path = request.nextUrl.pathname;

      // Admin can access everything
      if (role === 'admin') {
        return res;
      }

      // Landlord routes
      if (role === 'landlord' && !isLandlordRoute(path)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Tenant routes
      if (role === 'tenant' && !isTenantRoute(path)) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return res;
}

function isProtectedRoute(path: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/properties',
    '/maintenance',
    '/payments',
    '/documents',
    '/settings',
  ];
  return protectedRoutes.some(route => path.startsWith(route));
}

function isLandlordRoute(path: string): boolean {
  const landlordRoutes = [
    '/dashboard',
    '/properties',
    '/maintenance',
    '/payments',
    '/documents',
    '/settings',
  ];
  return landlordRoutes.some(route => path.startsWith(route));
}

function isTenantRoute(path: string): boolean {
  const tenantRoutes = [
    '/dashboard',
    '/maintenance',
    '/payments',
    '/documents',
    '/settings',
  ];
  return tenantRoutes.some(route => path.startsWith(route));
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
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 