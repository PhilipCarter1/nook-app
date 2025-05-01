import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

export async function middleware(request: NextRequest) {
  // Get the IP address
  const ip = request.ip ?? '127.0.0.1';
  
  // Check rate limit
  const rateLimitResult = await checkRateLimit(ip);
  
  if (!rateLimitResult.success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
      },
    });
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());
  
  // Add security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.stripe.com https://*.resend.com https://*.upstash.io;"
  );

  const supabase = createMiddlewareClient({ req: request, res: response });

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
        return response;
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

  return response;
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