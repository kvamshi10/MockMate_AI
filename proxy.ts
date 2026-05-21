import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ==========================================
 * SECURE EDGE ROUTE GUARD (PROXY)
 * ==========================================
 * This file intercepts ALL navigation requests *before* they hit the server.
 * It strictly enforces your Route Protections at the absolute perimeter!
 */

// Routes that REQUIRE authentication
const PROTECTED_ROUTES = ['/dashboard', '/interview', '/feedback']; 

// The public authentication funnel
const AUTH_ROUTES = ['/sign-in', '/sign-up', '/finishSignUp'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // 1. Unpack the invisible Secure Session Cookie
    // (Actual signature validation happens in Server Actions/API Routes on the Node layer)
    const sessionCookie = request.cookies.get('session');

    // 2. Allow system and public static paths
    if (pathname.startsWith('/_next') || pathname.startsWith('/avatars') || pathname.startsWith('/api') || pathname.startsWith('/images')) {
        return NextResponse.next();
    }

    // 3. Are they trying to access a secure route WITHOUT being logged in? BOUNCE THEM TO LOGIN.
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    
    if (isProtectedRoute && !sessionCookie) {
        const loginUrl = new URL('/sign-in', request.url);
        // Optional: append callbackUrl so they return here after signing in
        loginUrl.searchParams.set('callbackUrl', pathname + request.nextUrl.search);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Are they returning to Login pages while ALREADY authenticated? BOUNCE THEM TO DASHBOARD.
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
    if (isAuthRoute && sessionCookie) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 5. Cleared all security checks. Proceed to page render!
    return NextResponse.next();
}

/**
 * OPTIMIZER: Configures exactly which route paths trigger this guard.
 * We ignore static assets (`.png`, `.css`) so we don't waste Next.js Edge performance!
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|avatars|images).*)',
  ],
}
