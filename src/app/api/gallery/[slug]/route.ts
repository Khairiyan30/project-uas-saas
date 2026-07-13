import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession } from "@/lib/session";
import { canAccessProject } from "@/lib/authz";

/**
 * GET /api/gallery/[slug]
 *
 * Endpoint publik untuk mengambil data galeri proyek berdasarkan unique_slug.
 * Mengembalikan detail proyek, daftar foto, dan status akses user.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== "string" || slug.trim().length < 3) {
      return NextResponse.json(
        { error: "Slug tidak valid" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Ambil data proyek
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id, name, event_type, description, progress_status, unique_slug, created_at, cover_photo_url, watermark_url, watermark_position, watermark_opacity, watermark_size")
      .eq("unique_slug", slug.trim())
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Galeri tidak ditemukan" },
        { status: 404 }
      );
    }

    // Ambil daftar foto
    const { data: photos, error: photosError } = await supabase
      .from("photos")
      .select("id, project_id, url_original, url_edited, filename, is_favorite, created_at")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });

    if (photosError) {
      console.error("Error fetching photos:", photosError);
      return NextResponse.json(
        { error: "Gagal mengambil daftar foto" },
        { status: 500 }
      );
    }

    // Cek akses user (jika login)
    let isOwner = false;
    let isClient = false;

    try {
      const authHeader = request.headers.get("Authorization");
      if (authHeader) {
        const { user } = await verifySession(authHeader);
        const access = await canAccessProject(supabase, project.id, user.id);
        isOwner = access.isOwner;
        isClient = access.isClient;
      }
    } catch {
      // Tidak login → anon
    }

    return NextResponse.json(
      {
        project,
        photos: photos ?? [],
        isOwner,
        isClient,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error fetching gallery:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
