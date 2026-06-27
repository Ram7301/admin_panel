import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/***************************  NEXTAUTH MIDDLEWARE  ***************************/

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const token = request.nextauth.token;
    const pathname = request.nextUrl.pathname;

    // Redirect authenticated users away from auth pages
    if ((pathname === '/auth/login' || pathname === '/auth/register') && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Check if user is authorized to access route
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Protect admin/dashboard routes - must have token
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/(admin)') || pathname.startsWith('/driver-payments') || pathname.startsWith('/users')) {
          return !!token;
        }

        // Allow all other routes (including /auth/login, /auth/register)
        return true;
      }
    },
    pages: {
      signIn: '/auth/login'
    }
  }
);

// Specify which routes to run middleware on
export const config = {
  matcher: [
    // Protect admin routes
    '/dashboard/:path*',
    '/(admin)/:path*',
    '/driver-payments/:path*',
    '/users/:path*',
    // Allow auth pages
    '/auth/:path*'
  ]
};