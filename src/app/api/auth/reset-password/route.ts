import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase env vars not configured");
  return createClient(url, anonKey);
}

/**
 * POST /api/auth/reset-password
 *
 * Mengirim tautan reset password ke email pengguna.
 * Endpoint publik — tidak memerlukan auth token.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email wajib diisi" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAuth();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${request.nextUrl.origin}/reset-password`,
    });

    if (error) {
      console.error("Reset password error:", error.message);
    }

    // Selalu return success — tidak bocorkan apakah email terdaftar (security best practice)
    return NextResponse.json(
      {
        message:
          "Jika email terdaftar, tautan reset password telah dikirim. Silakan periksa kotak masuk Anda.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in reset-password:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
