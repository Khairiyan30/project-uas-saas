import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifySession, unauthorizedResponse } from "@/lib/session";

function getSupabase(useServiceRole = false) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase env vars not configured");
  return createClient(url, key);
}

/**
 * GET /api/auth/me — ambil data profil pengguna saat ini.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { user } = await verifySession(authHeader).catch(() => {
      throw new Error("unauthorized");
    });

    const supabase = getSupabase();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, created_at")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: "Profil tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: profile }, { status: 200 });
  } catch (error: any) {
    if (error.message === "unauthorized") {
      return unauthorizedResponse();
    }
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
    const { user } = await verifySession(authHeader).catch(() => {
      throw new Error("unauthorized");
    });

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

    const supabase = getSupabase(true);

    const { data: updated, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
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
    if (error.message === "unauthorized") {
      return unauthorizedResponse();
    }
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
