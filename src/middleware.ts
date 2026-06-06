import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the route is an admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for a mock auth cookie
    const authCookie = request.cookies.get('mock_auth_role');
    
    // If no cookie is present or role is not admin, redirect to login
    if (!authCookie || authCookie.value.toLowerCase() !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
