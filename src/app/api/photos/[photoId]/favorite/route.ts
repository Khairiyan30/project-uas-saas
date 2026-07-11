import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

/**
 * PATCH /api/photos/[photoId]/favorite
 *
 * Toggle status favorit sebuah foto. Endpoint publik (klien tanpa login
 * bisa mengaksesnya sesuai requirement PRD).
 *
 * Menggunakan RPC function `toggle_favorite(photo_id, value)` yang
 * didefinisikan di migration SQL. Ini lebih aman daripada memberi
 * izin UPDATE langsung ke publik.
 *
 * Body: { is_favorite?: boolean }  — jika tidak dikirim, otomatis toggle.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params;

    // Validasi format UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(photoId)) {
      return NextResponse.json(
        { error: "Format ID foto tidak valid" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Ambil status saat ini
    const { data: current, error: fetchError } = await supabase
      .from("photos")
      .select("id, is_favorite")
      .eq("id", photoId)
      .single();

    if (fetchError || !current) {
      return NextResponse.json(
        { error: "Foto tidak ditemukan" },
        { status: 404 }
      );
    }

    // Tentukan status baru — dari body atau toggle
    let newStatus: boolean = !current.is_favorite;
    try {
      const body = await request.json();
      if (typeof body.is_favorite === "boolean") {
        newStatus = body.is_favorite;
      }
    } catch {
      // Body kosong / tidak valid → pakai toggle
    }

    // Gunakan RPC toggle_favorite yang lebih aman
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
  } catch (error) {
    console.error("Unexpected error toggling favorite:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
