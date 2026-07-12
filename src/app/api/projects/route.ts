import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";

/**
 * GET /api/projects
 *
 * Mengambil daftar semua proyek milik user yang sedang login.
 * Termasuk total foto dan jumlah favorit per proyek.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { user } = await verifySession(authHeader).catch(() => {
      throw new Error("unauthorized");
    });

    const supabase = createSupabaseServerClient();

    const { data: projects, error } = await supabase
      .from("projects")
      .select("id, name, event_type, description, progress_status, unique_slug, created_at, cover_photo_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return NextResponse.json(
        { error: "Gagal mengambil daftar proyek" },
        { status: 500 }
      );
    }

    // Ambil aggregate counts foto per proyek (total + favorit)
    const projectIds = (projects ?? []).map((p) => p.id);
    const photoCountMap: Record<string, number> = {};
    const favCountMap: Record<string, number> = {};

    if (projectIds.length > 0) {
      const { data: allPhotos } = await supabase
        .from("photos")
        .select("project_id, is_favorite")
        .in("project_id", projectIds);

      for (const photo of allPhotos ?? []) {
        if (!photoCountMap[photo.project_id]) photoCountMap[photo.project_id] = 0;
        photoCountMap[photo.project_id]++;
        if (photo.is_favorite) {
          if (!favCountMap[photo.project_id]) favCountMap[photo.project_id] = 0;
          favCountMap[photo.project_id]++;
        }
      }
    }

    const result = (projects ?? []).map((p) => ({
      ...p,
      photo_count: photoCountMap[p.id] ?? 0,
      favorite_count: favCountMap[p.id] ?? 0,
    }));

    return NextResponse.json({ projects: result }, { status: 200 });
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 *
 * Membuat proyek baru untuk user yang sedang login.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { user } = await verifySession(authHeader).catch(() => {
      throw new Error("unauthorized");
    });

    const body = await request.json();
    const { name, event_type, description } = body;

    if (!name || !event_type) {
      return NextResponse.json(
        { error: "Nama proyek dan jenis acara wajib diisi" },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

    const supabase = createSupabaseServerClient();

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: name.trim(),
        event_type: event_type.trim(),
        description: description?.trim() || "",
        progress_status: "Persiapan",
        unique_slug: uniqueSlug,
      })
      .select("id, name, event_type, description, progress_status, unique_slug, created_at")
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return NextResponse.json(
        { error: "Gagal membuat proyek baru" },
        { status: 500 }
      );
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
