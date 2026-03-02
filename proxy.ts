import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: response.headers });
    }
    
    return response;
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/sign-up",
    "/forgot-password",
    "/verify-otp",
  ];

  // Static files and assets - these should be excluded from proxy
  const staticFilePatterns = [
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$/,
    /^\/_next\//,
    /^\/images\//,
    /^\/favicon\.ico$/,
  ];

  // Check if the current path is a static file
  const isStaticFile = staticFilePatterns.some((pattern) =>
    pattern instanceof RegExp
      ? pattern.test(pathname)
      : pathname.startsWith(pattern)
  );

  if (isStaticFile) {
    return NextResponse.next();
  }

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // Special handling for login page - redirect authenticated users away
  if (pathname === "/login" || pathname === "/(auth)/login") {
    const session = request.cookies.get("__session");
    
    if (session) {
      // User is authenticated, redirect to admin
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check for authentication
  // Firebase auth uses session cookies, so we'll check for the session
  const session = request.cookies.get("__session");

  // If no session and trying to access protected route, redirect to login
  if (
    !session &&
    (pathname.startsWith("/admin") || pathname.startsWith("/settings"))
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images folder
     * - API routes (they handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|api/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
