import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase env vars not configured");
  return createClient(url, anonKey);
}

/**
 * POST /api/auth/signup
 *
 * Registrasi akun fotografer baru via Supabase Auth (signUp).
 * Trigger `on_auth_user_created` (lihat SQL migration) akan otomatis
  * menambahkan baris baru di tabel public.profiles.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, kata sandi, dan nama lengkap wajib diisi" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${request.nextUrl.origin}/login`,
      },
    });

    if (error) {
      console.error("Signup error:", error.message);
      if (error.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Email sudah terdaftar" },
          { status: 409 }
        );
      }
      if (
        error.message.includes("rate limit") ||
        error.message.includes("over_email_send_rate")
      ) {
        return NextResponse.json(
          {
            error:
              "Terlalu banyak percobaan. Coba lagi dalam beberapa saat atau gunakan email lain.",
          },
          { status: 429 }
        );
      }
      if (error.message.includes("is invalid")) {
        return NextResponse.json(
          { error: "Alamat email tidak valid. Periksa kembali email Anda." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Gagal membuat akun", details: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Gagal membuat akun" },
        { status: 500 }
      );
    }

    // Jika konfirmasi email mati, session langsung tersedia → auto-login
    const { session } = data;
    if (session) {
      return NextResponse.json(
        {
          message: "Akun berhasil dibuat",
          session: {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          },
          user: { id: data.user.id, email: data.user.email },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        message:
          "Akun berhasil dibuat. Silakan cek email untuk verifikasi, lalu login.",
        user: { id: data.user.id, email: data.user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected error in signup:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
