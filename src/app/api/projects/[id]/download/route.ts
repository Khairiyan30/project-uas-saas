import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";
import { canAccessProject } from "@/lib/authz";
import { PassThrough } from "stream";
import { ZipArchive } from "archiver";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    const { data: project } = await supabase
      .from("projects")
      .select("name")
      .eq("id", id)
      .single();

    if (!project) {
      return NextResponse.json(
        { error: "Proyek tidak ditemukan" },
        { status: 404 }
      );
    }

    const query = supabase
      .from("photos")
      .select("filename, url_original")
      .eq("project_id", id);

    const { data: photos, error: photosError } = await query.order("created_at", {
      ascending: true,
    });

    if (photosError) {
      console.error("Error fetching photos for download:", photosError);
      return NextResponse.json(
        { error: "Gagal mengambil daftar foto" },
        { status: 500 }
      );
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada foto untuk diunduh" },
        { status: 404 }
      );
    }

    if (photos.length > 100) {
      return NextResponse.json(
        { error: "Terlalu banyak foto untuk diunduh sekaligus (maks 100)" },
        { status: 400 }
      );
    }

    const sanitizedName = project.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const archive = new ZipArchive({ zlib: { level: 5 } });
    const passthrough = new PassThrough();

    archive.pipe(passthrough);

    archive.on("error", (err: Error) => {
      console.error("Archiver error:", err);
      passthrough.destroy(err);
    });

    (async () => {
      for (const photo of photos) {
        try {
          const response = await fetch(photo.url_original, {
            signal: AbortSignal.timeout(30000),
          });
          if (!response.ok) {
            console.warn(`Failed to download ${photo.filename}: ${response.status}`);
            continue;
          }
          const buffer = Buffer.from(await response.arrayBuffer());
          archive.append(buffer, { name: photo.filename || `foto-${Date.now()}.jpg` });
        } catch (err) {
          console.warn(`Error downloading ${photo.filename}:`, err);
        }
      }
      archive.finalize();
    })();

    const headers = new Headers({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${sanitizedName}-foto.zip"`,
      "Cache-Control": "no-store",
      "Transfer-Encoding": "chunked",
    });

    return new Response(passthrough as unknown as ReadableStream, { headers });
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Error downloading project:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
