import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Next.js 16: "middleware" is now called "proxy"
// Convention: export `proxy` function (not `middleware`) from proxy.ts
export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage = nextUrl.pathname.startsWith('/login');
  const isApiAuth = nextUrl.pathname.startsWith('/api/auth');
  const isLicenseApi = nextUrl.pathname.startsWith('/api/license');

  // Always allow auth API and license API (public endpoints)
  if (isApiAuth || isLicenseApi) return NextResponse.next();

  // Redirect authenticated users away from login
  if (isAuthPage) {
    if (isLoggedIn) return NextResponse.redirect(new URL('/', nextUrl));
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
