import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

/**
 * PATCH /api/projects/[id]/progress
 *
 * Memperbarui status progres proyek.
 */
export async function PATCH(
  request: NextRequest,
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

    const body = await request.json();
    const { progress_status } = body;

    if (!progress_status || typeof progress_status !== "string") {
      return NextResponse.json(
        { error: "Status progres tidak valid" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: project, error } = await supabase
      .from("projects")
      .update({ progress_status: progress_status.trim() })
      .eq("id", id)
      .select("id, progress_status")
      .single();

    if (error) {
      console.error("Error updating progress:", error);
      return NextResponse.json(
        { error: "Gagal memperbarui status progres" },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: "Proyek tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error updating progress:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
