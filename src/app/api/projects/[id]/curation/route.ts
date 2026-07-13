import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";
import { isProjectOwner } from "@/lib/authz";

function uuidRegex() {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

    if (!uuidRegex().test(id)) {
      return NextResponse.json(
        { error: "Format ID proyek tidak valid" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const isClient = await isProjectOwner(supabase, id, user.id).then(
      (owner) => !owner
    );

    if (!isClient) {
      return NextResponse.json(
        { error: "Hanya client yang bisa finalisasi kurasi" },
        { status: 403 }
      );
    }

    const { error: rpcError } = await supabase.rpc("finalize_curation", {
      project_id: id,
    });

    if (rpcError) {
      console.error("Error finalizing curation:", rpcError);
      return NextResponse.json(
        { error: "Gagal finalisasi kurasi" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Kurasi berhasil difinalisasi. Semua foto pending disetujui." },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Unexpected error finalizing curation:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
