import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RoleRoutes, RoleDashboards, Role, DEFAULT_REDIRECT } from '@/constants/roles';

// Add the protected routes that require specific roles
const protectedRoutes = [
  ...RoleRoutes[Role.ADMIN],
  ...RoleRoutes[Role.TUTOR],
  ...RoleRoutes[Role.INSTITUTION],
  ...RoleRoutes[Role.STUDENT],
];

// Add public routes that should be accessible without authentication
const publicRoutes = ['/login', '/forgot-password', '/unauthorized', '/api/auth/login'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

    const token = request.cookies.get('token')?.value;
    const role = request.cookies.get('mock_auth_role')?.value;

    // If it's a public route, let the React <PublicRoute> component handle the logic
    if (publicRoutes.some(route => pathname.startsWith(route)) || pathname === '/') {
      return NextResponse.next();
    }

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Not authenticated
    if (!token || !role) {
      const loginUrl = new URL(DEFAULT_REDIRECT, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role mapping logic
    const userRoleRoutes = RoleRoutes[role] || [];
    const hasPermission = userRoleRoutes.some(route => pathname.startsWith(route));

    // Authenticated but unauthorized for this specific route
    if (!hasPermission) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
