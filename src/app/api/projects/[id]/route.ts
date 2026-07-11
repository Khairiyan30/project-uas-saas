import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";

/**
 * GET /api/projects/[id]
 *
 * Mengambil detail proyek termasuk unique_slug untuk galeri publik.
 */
export async function GET(
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

    const supabase = createSupabaseServerClient();

    const { data: project, error } = await supabase
      .from("projects")
      .select(
        "id, user_id, name, event_type, description, progress_status, unique_slug, created_at"
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      return NextResponse.json(
        { error: "Gagal mengambil detail proyek" },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: "Proyek tidak ditemukan" },
        { status: 404 }
      );
    }

    // Pastikan user yang login adalah pemilik proyek
    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke proyek ini" },
        { status: 403 }
      );
    }

    return NextResponse.json({ project }, { status: 200 });
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Unexpected error fetching project:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]
 *
 * Memperbarui detail proyek: nama, jenis acara, dan deskripsi.
 */
export async function PUT(
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
    const { name, event_type, description } = body;

    // Validasi field yang dikirim
    if (!name && !event_type && description === undefined) {
      return NextResponse.json(
        { error: "Tidak ada data yang dikirim untuk diperbarui" },
        { status: 400 }
      );
    }

    // Bangun object update hanya dari field yang ada
    const updateData: Record<string, string> = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Nama proyek tidak valid" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }
    if (event_type !== undefined) {
      if (typeof event_type !== "string" || event_type.trim().length === 0) {
        return NextResponse.json(
          { error: "Jenis acara tidak valid" },
          { status: 400 }
        );
      }
      updateData.event_type = event_type.trim();
    }
    if (description !== undefined) {
      if (typeof description !== "string") {
        return NextResponse.json(
          { error: "Deskripsi tidak valid" },
          { status: 400 }
        );
      }
      updateData.description = description.trim();
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
      .update(updateData)
      .eq("id", id)
      .select("id, name, event_type, description, progress_status, unique_slug, created_at")
      .single();

    if (error) {
      console.error("Error updating project:", error);
      return NextResponse.json(
        { error: "Gagal memperbarui detail proyek" },
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
    console.error("Unexpected error updating project:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
