import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Buat Supabase client yang mengenali user yang sedang login (authenticated).
 * Ini penting agar RLS policy seperti `auth.uid() = id` bisa bekerja.
 */
function createAuthedSupabase(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase env vars not configured");

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

/**
 * GET /api/auth/me — ambil data profil pengguna saat ini.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createAuthedSupabase(token);

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Token tidak valid atau sudah expired" },
        { status: 401 }
      );
    }

    const user = authData.user;

    let { data: profile, error } = await supabase
      .from("profiles")
        .select("id, email, full_name, avatar_url, role, created_at")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      // Fallback: Jika profile tidak ditemukan, buatkan otomatis
      const fallbackName =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User";

      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: fallbackName,
          avatar_url: null,
        })
      .select("id, email, full_name, avatar_url, role, created_at")
        .single();

      if (insertError) {
        console.error("Failed to auto-create profile:", insertError);
        return NextResponse.json(
          { error: "Profil tidak ditemukan dan gagal dibuat", details: insertError.message },
          { status: 404 }
        );
      }

      profile = newProfile;
    }

    // Ambil data subscription
    let plan = "free";
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", user.id)
      .single();

    if (sub && sub.status === "active") {
      plan = sub.plan;
    }

    return NextResponse.json({
      user: {
        ...profile,
        plan,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/me — perbarui profil pengguna (nama, avatar).
 */
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createAuthedSupabase(token);

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Token tidak valid atau sudah expired" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name, avatar_url } = body;

    const updateData: Record<string, string> = {};
    if (full_name !== undefined) {
      if (typeof full_name !== "string" || full_name.trim().length < 2) {
        return NextResponse.json(
          { error: "Nama lengkap tidak valid" },
          { status: 400 }
        );
      }
      updateData.full_name = full_name.trim();
    }
    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data yang dikirim untuk diperbarui" },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", authData.user.id)
      .select("id, email, full_name, avatar_url")
      .single();

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json(
        { error: "Gagal memperbarui profil" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
