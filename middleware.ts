/**
 * Next.js middleware for handling authentication and routing.
 * 
 * This middleware checks for user authentication using NextAuth JWT token.
 * It redirects unauthenticated users from protected routes to login,
 * and authenticated users from auth pages to the chat dashboard.
 * Special handling for /ping endpoint for health checks and /api/auth for NextAuth routes.
 * 
 * @file middleware.ts
 * @author Witely AI Team
 */

import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isDevelopmentEnvironment } from "./lib/constants";

/**
 * Determines if the pathname requires authentication.
 * Protected routes: /chat and /dashboard.
 * 
 * @param pathname - The pathname to check.
 * @returns boolean - True if authentication is required.
 */
function requiresAuth(pathname: string): boolean {
  return pathname.startsWith("/chat") || pathname.startsWith("/dashboard");
}

/**
 * Determines if the pathname is an authentication route.
 * Auth routes: /login and /register.
 * 
 * @param pathname - The pathname to check.
 * @returns boolean - True if it's an auth route.
 */
function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith("/login") || pathname.startsWith("/register");
}

/**
 * Middleware handler for incoming requests.
 * 
 * @param request - The NextRequest object containing the incoming request details.
 * @returns Promise&lt;NextResponse&gt; - The response to send back, either next(), redirect, or custom response.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (token && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  if (!token && requiresAuth(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Removed redundant check for exact /login and /register as it's covered by isAuthRoute

  return NextResponse.next();
}

/**
 * Configuration for the middleware matcher.
 * Specifies which paths the middleware should run on, excluding static files and metadata.
 */
export const config = {
  matcher: [
    "/",
    "/chat/:id",
    "/api/:path*",
    "/login",
    "/register",

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
