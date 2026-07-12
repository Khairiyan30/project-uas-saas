import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

/**
 * GET /api/gallery/[slug]
 *
 * Endpoint publik untuk mengambil data galeri proyek berdasarkan unique_slug.
 * Klien mengakses galeri tanpa login via URL ini.
 *
 * Mengembalikan detail proyek + daftar foto.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Validasi slug minimal
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
      .select("id, name, event_type, description, progress_status, unique_slug, created_at, cover_photo_url")
      .eq("unique_slug", slug.trim())
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Galeri tidak ditemukan" },
        { status: 404 }
      );
    }

    // Ambil daftar foto di proyek
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

    return NextResponse.json(
      {
        project,
        photos: photos ?? [],
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
