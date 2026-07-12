import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";

/**
 * DELETE /api/photos/[photoId]
 * menghapus foto dari database dan file fisiknya dari Supabase Storage.
 * Hanya boleh diakses oleh pemilik proyek (fotografer).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { user } = await verifySession(authHeader).catch(() => {
      throw new Error("unauthorized");
    });

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

    // 1. Ambil data foto & verifikasi kepemilikan proyek
    const { data: photo, error: fetchError } = await supabase
      .from("photos")
      .select("id, project_id, url_original, url_edited")
      .eq("id", photoId)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json(
        { error: "Foto tidak ditemukan" },
        { status: 404 }
      );
    }

    // Ambil data proyek untuk verifikasi owner
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id")
      .eq("id", photo.project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Proyek pemilik foto tidak ditemukan" },
        { status: 404 }
      );
    }

    if (project.user_id !== user.id) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses untuk menghapus foto di proyek ini" },
        { status: 403 }
      );
    }

    // 2. Hapus file fisik dari Supabase Storage
    // Ekstrak path file dari URL original (format: project_id/file_name)
    const storagePath = photo.url_original.split("/storage/v1/object/public/photos/")[1];
    
    if (storagePath) {
      const { error: storageDeleteError } = await supabase.storage
        .from("photos")
        .remove([storagePath]);

      if (storageDeleteError) {
        console.error("Storage delete error:", storageDeleteError);
        // Tetap lanjutkan delete DB jika file di storage sudah hilang
      }
    }

    // Hapus juga file edited jika ada
    if (photo.url_edited) {
      const editedStoragePath = photo.url_edited.split("/storage/v1/object/public/photos/")[1];
      if (editedStoragePath) {
        await supabase.storage.from("photos").remove([editedStoragePath]);
      }
    }

    // 3. Hapus baris dari tabel 'photos'
    const { error: dbDeleteError } = await supabase
      .from("photos")
      .delete()
      .eq("id", photoId);

    if (dbDeleteError) {
      console.error("Database delete photo error:", dbDeleteError);
      return NextResponse.json(
        { error: "Gagal menghapus metadata foto dari database" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Foto berhasil dihapus" },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Unexpected error in delete photo:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
