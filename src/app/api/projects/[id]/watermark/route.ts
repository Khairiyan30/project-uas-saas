import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_POSITIONS = ["bottom-right", "bottom-left", "top-right", "top-left", "center"];

async function verifyOwner(id: string, userId: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  return !!data;
}

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
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: "Format ID proyek tidak valid" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    if (!(await verifyOwner(id, user.id))) {
      return NextResponse.json({ error: "Anda bukan pemilik proyek ini" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File watermark tidak ditemukan" }, { status: 400 });
    }

    const allowedTypes = ["image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format watermark harus PNG, WebP, atau SVG" },
        { status: 400 }
      );
    }

    if (file.size > 512 * 1024) {
      return NextResponse.json(
        { error: "File watermark maksimal 512KB" },
        { status: 400 }
      );
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `watermarks/${id}/watermark.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "Gagal mengupload watermark" },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from("photos")
      .getPublicUrl(fileName);

    await supabase
      .from("projects")
      .update({ watermark_url: publicUrl })
      .eq("id", id);

    return NextResponse.json(
      { message: "Watermark berhasil diupload", watermark_url: publicUrl },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Error uploading watermark:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

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
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: "Format ID proyek tidak valid" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    if (!(await verifyOwner(id, user.id))) {
      return NextResponse.json({ error: "Anda bukan pemilik proyek ini" }, { status: 403 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (body.position !== undefined) {
      if (!VALID_POSITIONS.includes(body.position)) {
        return NextResponse.json(
          { error: "Posisi harus: bottom-right, bottom-left, top-right, top-left, atau center" },
          { status: 400 }
        );
      }
      updateData.watermark_position = body.position;
    }

    if (body.opacity !== undefined) {
      const opacity = Number(body.opacity);
      if (isNaN(opacity) || opacity < 0.1 || opacity > 1.0) {
        return NextResponse.json({ error: "Opacity harus antara 0.1 - 1.0" }, { status: 400 });
      }
      updateData.watermark_opacity = opacity;
    }

    if (body.size !== undefined) {
      const size = Number(body.size);
      if (isNaN(size) || size < 5 || size > 50) {
        return NextResponse.json({ error: "Size harus antara 5 - 50" }, { status: 400 });
      }
      updateData.watermark_size = size;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Tidak ada data yang diupdate" }, { status: 400 });
    }

    const { error } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", id);

    if (error) {
      console.error("Error updating watermark config:", error);
      return NextResponse.json({ error: "Gagal mengupdate konfigurasi watermark" }, { status: 500 });
    }

    return NextResponse.json({ message: "Konfigurasi watermark diperbarui" }, { status: 200 });
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Error updating watermark:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

export async function DELETE(
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
      return NextResponse.json({ error: "Format ID proyek tidak valid" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    if (!(await verifyOwner(id, user.id))) {
      return NextResponse.json({ error: "Anda bukan pemilik proyek ini" }, { status: 403 });
    }

    await supabase
      .from("projects")
      .update({
        watermark_url: null,
        watermark_position: "bottom-right",
        watermark_opacity: 0.5,
        watermark_size: 15,
      })
      .eq("id", id);

    return NextResponse.json({ message: "Watermark berhasil dihapus" }, { status: 200 });
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Error deleting watermark:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
