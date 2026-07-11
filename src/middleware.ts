import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware — layer pertahanan pertama untuk proteksi rute.
 *
 * Catatan: karena menggunakan stub auth (localStorage), proteksi halaman
 * ditangani oleh `useRequireAuth` hook di masing-masing halaman (client-side).
 * Middleware ini hanya bertugas meneruskan request ke API routes dan halaman.
 *
 * Saat Supabase Auth sudah terintegrasi penuh (cookie-based session),
 * middleware ini akan diaktifkan untuk cek cookie sb-access-token.
 */
export function middleware(request: NextRequest) {
  // Untuk saat ini, semua request diteruskan.
  // Auth untuk halaman ditangani oleh useRequireAuth hook (client-side).
  // Auth untuk API routes ditangani oleh verifySession per route (server-side).
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
