import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase env vars not configured");
  return createClient(url, anonKey);
}

/**
 * POST /api/auth/update-password
 *
 * Memperbarui kata sandi user setelah reset password.
 * Membutuhkan session token (dari hash URL setelah klik tautan reset email).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, access_token: bodyToken } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal 6 karakter" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAuth();

    // Prioritaskan token dari header, lalu dari body (hash URL reset-password)
    const authHeader = request.headers.get("Authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : bodyToken;

    if (accessToken) {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: "",
      });
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("Update password error:", error.message);
      return NextResponse.json(
        { error: "Gagal memperbarui kata sandi", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Kata sandi berhasil diperbarui" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error updating password:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
