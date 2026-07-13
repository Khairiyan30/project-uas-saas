import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const { photoId } = await params;

    if (!uuidRegex.test(photoId)) {
      return NextResponse.json(
        { error: "Format ID foto tidak valid" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: comments, error } = await supabase
      .from("comments")
      .select("id, photo_id, user_id, content, created_at, updated_at, user:user_id(id, full_name, avatar_url, role)")
      .eq("photo_id", photoId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      return NextResponse.json(
        { error: "Gagal mengambil komentar" },
        { status: 500 }
      );
    }

    return NextResponse.json({ comments: comments ?? [] }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error fetching comments:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { user } = await verifySession(authHeader).catch(() => {
      throw new Error("unauthorized");
    });

    const { photoId } = await params;

    if (!uuidRegex.test(photoId)) {
      return NextResponse.json(
        { error: "Format ID foto tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Komentar tidak boleh kosong" },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: "Komentar maksimal 1000 karakter" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: comment, error: insertError } = await supabase
      .from("comments")
      .insert({
        photo_id: photoId,
        user_id: user.id,
        content: content.trim(),
      })
      .select("id, photo_id, user_id, content, created_at, updated_at")
      .single();

    if (insertError) {
      console.error("Error creating comment:", insertError);
      return NextResponse.json(
        { error: "Gagal menambahkan komentar" },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Unexpected error creating comment:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
