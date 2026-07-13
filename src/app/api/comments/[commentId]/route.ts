import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { user } = await verifySession(authHeader).catch(() => {
      throw new Error("unauthorized");
    });

    const { commentId } = await params;

    if (!uuidRegex.test(commentId)) {
      return NextResponse.json(
        { error: "Format ID komentar tidak valid" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: comment } = await supabase
      .from("comments")
      .select("id, user_id")
      .eq("id", commentId)
      .single();

    if (!comment) {
      return NextResponse.json(
        { error: "Komentar tidak ditemukan" },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("Error deleting comment:", deleteError);
      return NextResponse.json(
        { error: "Gagal menghapus komentar" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Komentar berhasil dihapus" },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Unexpected error deleting comment:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
