import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase env vars not configured");
  return createClient(url, anonKey);
}

/**
 * POST /api/auth/login
 *
 * Login menggunakan email dan password via Supabase Auth.
 * Mengembalikan session token yang bisa digunakan untuk request selanjutnya.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan kata sandi wajib diisi" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAuth();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      if (error.message.includes("Invalid login credentials")) {
        return NextResponse.json(
          { error: "Email atau kata sandi salah" },
          { status: 401 }
        );
      }
      if (error.message.includes("Email not confirmed")) {
        return NextResponse.json(
          {
            error:
              "Email belum diverifikasi. Periksa kotak masuk atau nonaktifkan konfirmasi email di pengaturan Supabase.",
          },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: "Gagal masuk", details: error.message },
        { status: 401 }
      );
    }

    const { session, user } = data;

    return NextResponse.json(
      {
        message: "Login berhasil",
        session: {
          access_token: session?.access_token,
          refresh_token: session?.refresh_token,
          expires_at: session?.expires_at,
        },
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in login:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
