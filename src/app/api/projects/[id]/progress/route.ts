import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";

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
    const authHeader = request.headers.get("Authorization");
    const { user } = await verifySession(authHeader).catch(() => {
      throw new Error("unauthorized");
    });

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

    // Verifikasi kepemilikan proyek sebelum update
    const { data: existing, error: ownerCheckError } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (ownerCheckError || !existing) {
      return NextResponse.json(
        { error: "Proyek tidak ditemukan" },
        { status: 404 }
      );
    }

    if (existing.user_id !== user.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke proyek ini" },
        { status: 403 }
      );
    }

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
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Unexpected error updating progress:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
