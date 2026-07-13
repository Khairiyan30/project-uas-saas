import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";

type PhotoStatus = "pending" | "approved" | "rejected";
const VALID_STATUSES: PhotoStatus[] = ["pending", "approved", "rejected"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> }
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { user } = await verifySession(authHeader).catch(() => {
      throw new Error("unauthorized");
    });

    const { photoId } = await params;

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(photoId)) {
      return NextResponse.json(
        { error: "Format ID foto tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status: newStatus } = body;

    if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: "Status harus salah satu: pending, approved, atau rejected" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: photo } = await supabase
      .from("photos")
      .select("id")
      .eq("id", photoId)
      .single();

    if (!photo) {
      return NextResponse.json(
        { error: "Foto tidak ditemukan" },
        { status: 404 }
      );
    }

    const { error: rpcError } = await supabase.rpc("update_photo_status", {
      photo_id: photoId,
      new_status: newStatus,
    });

    if (rpcError) {
      console.error("Error updating photo status:", rpcError);
      return NextResponse.json(
        { error: "Gagal memperbarui status foto" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { photo: { id: photoId, status: newStatus } },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Unexpected error updating photo approval:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
