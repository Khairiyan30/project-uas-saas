import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase env vars not configured");
  return createClient(url, anonKey);
}

/**
 * POST /api/auth/logout
 *
 * Logout — hapus session user.
 * Membutuhkan header Authorization: Bearer <access_token>.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Tidak ada session aktif" },
        { status: 200 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = getSupabaseAuth();

    // Set session untuk user dan sign out
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: "",
    });
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
    }

    return NextResponse.json({ message: "Berhasil keluar" }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in logout:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
