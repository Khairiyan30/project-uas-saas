import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";

/**
 * PATCH /api/projects/[id]/cover
 *
 * Mengatur foto profil/cover proyek.
 * Body: { url_original: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { user } = await verifySession(authHeader).catch(() => {
      throw new Error("unauthorized");
    });

    const { id } = await params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Format ID proyek tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { url_original } = body;

    if (!url_original || typeof url_original !== "string") {
      return NextResponse.json(
        { error: "URL foto cover wajib diisi" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: project, error: fetchError } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !project) {
      return NextResponse.json(
        { error: "Proyek tidak ditemukan" },
        { status: 404 }
      );
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke proyek ini" },
        { status: 403 }
      );
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update({ cover_photo_url: url_original })
      .eq("id", id);

    if (updateError) {
      console.error("Error setting cover photo:", updateError);
      return NextResponse.json(
        { error: "Gagal mengubah foto profil proyek" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Foto profil proyek berhasil diperbarui", cover_photo_url: url_original },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Unexpected error setting cover:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
