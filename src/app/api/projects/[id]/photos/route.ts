import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";
import { canAccessProject } from "@/lib/authz";

/**
 * GET /api/projects/[id]/photos
 * Mengambil daftar foto untuk sebuah proyek tertentu.
 * Akses: Owner atau assigned client (accepted).
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

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Format ID proyek tidak valid" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const access = await canAccessProject(supabase, id, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke proyek ini" },
        { status: 403 }
      );
    }

    const { data: photos, error } = await supabase
      .from("photos")
      .select("id, project_id, url_original, url_edited, filename, is_favorite, created_at")
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
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Unexpected error fetching photos:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/photos
 * Mengunggah file foto baru ke proyek (Supabase Storage & database).
 */
export async function POST(
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

    // Verifikasi kepemilikan proyek
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (projectError || !project) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan dalam form data" },
        { status: 400 }
      );
    }

    // Buat nama file unik di storage
    const fileExt = file.name.split(".").pop();
    const uniqueFileName = `${id}/${crypto.randomUUID()}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload file ke storage bucket 'photos'
    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(uniqueFileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: `Gagal mengunggah file ke storage: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Ambil URL publik file
    const { data: { publicUrl } } = supabase.storage
      .from("photos")
      .getPublicUrl(uniqueFileName);

    // Simpan metadata foto ke tabel 'photos'
    const { data: photo, error: dbError } = await supabase
      .from("photos")
      .insert({
        project_id: id,
        url_original: publicUrl,
        filename: file.name,
        is_favorite: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert photo error:", dbError);
      return NextResponse.json(
        { error: "Gagal menyimpan metadata foto ke database" },
        { status: 500 }
      );
    }

    // Jika ini foto pertama dalam proyek, set otomatis sebagai cover
    const { count, error: countError } = await supabase
      .from("photos")
      .select("id", { count: "exact", head: true })
      .eq("project_id", id);

    if (!countError && count === 1) {
      await supabase
        .from("projects")
        .update({ cover_photo_url: publicUrl })
        .eq("id", id);
    }

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Unexpected error uploading photo:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
