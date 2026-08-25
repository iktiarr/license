import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Next.js 16: "middleware" is now called "proxy"
export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isAuthPage = nextUrl.pathname.startsWith('/login');
  const isApiAuth = nextUrl.pathname.startsWith('/api/auth');
  const isLicenseApi = nextUrl.pathname.startsWith('/api/license');
  const isPairingApi = nextUrl.pathname.startsWith('/api/pairing');
  const isGuardJs = nextUrl.pathname === '/guard.js';
  const isErrorLottie = nextUrl.pathname === '/error.lottie';

  // Always allow auth API, license API, pairing API, and static assets (public endpoints)
  if (isApiAuth || isLicenseApi || isPairingApi || isGuardJs || isErrorLottie) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from login
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    if (nextUrl.pathname !== '/' && nextUrl.pathname !== '') {
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|guard.js|error.lottie|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
