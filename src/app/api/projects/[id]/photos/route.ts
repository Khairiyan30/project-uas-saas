import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

/**
 * GET /api/projects/[id]/photos
 *
 * Mengambil daftar foto untuk sebuah proyek tertentu.
 * Foto diurutkan berdasarkan waktu pembuatan (terbaru dulu).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validasi format UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Format ID proyek tidak valid" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: photos, error } = await supabase
      .from("photos")
      .select(
        "id, project_id, url_original, url_edited, filename, is_favorite, created_at"
      )
      .eq("project_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching photos:", error);
      return NextResponse.json(
        { error: "Gagal mengambil daftar foto" },
        { status: 500 }
      );
    }

    return NextResponse.json({ photos }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error fetching photos:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
