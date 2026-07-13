import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware: Role-based route protection.
 *
 * Catatan: Auth state saat ini disimpan di localStorage (client-side),
 * sehingga middleware tidak bisa memverifikasi sesi server-side.
 *
 * Middleware ini menangani:
 * 1. Redirect /dashboard/* dan /client/* jika tidak ada sesi
 *    (Fallback: client-side useRequireAuth hook akan redirect jika middleware tidak mendeteksi)
 *
 * TODO: Upgrade ke @supabase/ssr untuk cookie-based auth agar
 * middleware bisa melakukan role-based redirect server-side.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/proyek") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/client");

  // Public routes only for unauthenticated users
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  // Skip middleware for API routes, static files, public gallery
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".") ||
    !isProtectedRoute
  ) {
    return NextResponse.next();
  }

  // Look for Supabase auth cookie (set by @supabase/ssr if used)
  const hasSessionCookie = request.cookies.has("sb-access-token") ||
    request.cookies.has("sb-refresh-token");

  // Jika tidak ada cookie, izinkan request — client-side hook akan handle redirect
  if (!hasSessionCookie) {
    return NextResponse.next();
  }

  // Jika ada cookie tapi user akses halaman auth, redirect ke dashboard
  if (isAuthRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
};
