import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";
import { canAccessProject } from "@/lib/authz";

/**
 * PATCH /api/photos/[photoId]/favorite
 *
 * Toggle status favorit sebuah foto.
 * Hanya owner atau assigned client yang bisa toggle.
 *
 * Body: { is_favorite?: boolean } — jika tidak dikirim, otomatis toggle.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { user } = await verifySession(authHeader).catch(() => {
      throw new Error("unauthorized");
    });

    const { photoId } = await params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(photoId)) {
      return NextResponse.json(
        { error: "Format ID foto tidak valid" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Ambil info foto + project_id
    const { data: current, error: fetchError } = await supabase
      .from("photos")
      .select("id, project_id, is_favorite")
      .eq("id", photoId)
      .single();

    if (fetchError || !current) {
      return NextResponse.json(
        { error: "Foto tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check akses: owner atau assigned client
    const access = await canAccessProject(supabase, current.project_id, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke foto ini" },
        { status: 403 }
      );
    }

    let newStatus: boolean = !current.is_favorite;
    try {
      const body = await request.json();
      if (typeof body.is_favorite === "boolean") {
        newStatus = body.is_favorite;
      }
    } catch {
      // Body kosong → toggle
    }

    const { error: updateError } = await supabase.rpc("toggle_favorite", {
      photo_id: photoId,
      value: newStatus,
    });

    if (updateError) {
      console.error("Error toggling favorite:", updateError);
      return NextResponse.json(
        { error: "Gagal memperbarui status favorit" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { photo: { id: photoId, is_favorite: newStatus } },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Unexpected error toggling favorite:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
