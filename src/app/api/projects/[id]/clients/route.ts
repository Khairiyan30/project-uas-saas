import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";
import { isProjectOwner } from "@/lib/authz";

/**
 * POST /api/projects/[id]/clients
 *
 * Invite seorang client ke proyek.
 * Hanya project owner yang bisa invite.
 * Client akan menerima magic link untuk login.
 *
 * Body: { email: string }
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

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Format ID proyek tidak valid" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Verifikasi owner
    const owner = await isProjectOwner(supabase, id, user.id);
    if (!owner) {
      return NextResponse.json(
        { error: "Hanya pemilik proyek yang dapat mengundang client" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email tidak valid" },
        { status: 400 }
      );
    }

    // Cari atau buat profile client
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("email", email.trim())
      .single();

    let clientId: string;

    if (existingProfile) {
      clientId = existingProfile.id;
      // Update role jadi client jika masih photographer
      if (existingProfile.role === "photographer") {
        await supabase
          .from("profiles")
          .update({ role: "client" })
          .eq("id", clientId);
      }
    } else {
      // Buat user baru via Supabase Auth admin
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!serviceKey) {
        return NextResponse.json(
          { error: "Konfigurasi server tidak lengkap" },
          { status: 500 }
        );
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
        email: email.trim(),
        email_confirm: true,
        user_metadata: { full_name: email.trim().split("@")[0] },
      });

      if (createError) {
        console.error("Failed to create user:", createError);
        return NextResponse.json(
          { error: "Gagal membuat akun client" },
          { status: 500 }
        );
      }

      if (!newUser.user) {
        return NextResponse.json(
          { error: "Gagal membuat akun client" },
          { status: 500 }
        );
      }

      clientId = newUser.user.id;

      // Set role client
      await supabase
        .from("profiles")
        .update({ role: "client" })
        .eq("id", clientId);
    }

    // Cek apakah sudah pernah di-invite
    const { data: existingInvite } = await supabase
      .from("project_clients")
      .select("accepted_at")
      .eq("project_id", id)
      .eq("client_id", clientId)
      .single();

    if (existingInvite?.accepted_at) {
      return NextResponse.json(
        { message: "Client sudah memiliki akses ke proyek ini" },
        { status: 200 }
      );
    }

    if (existingInvite && !existingInvite.accepted_at) {
      return NextResponse.json(
        { message: "Undangan sudah dikirim sebelumnya. Client menunggu akses." },
        { status: 200 }
      );
    }

    // Insert ke project_clients
    const { error: insertError } = await supabase
      .from("project_clients")
      .insert({
        project_id: id,
        client_id: clientId,
      });

    if (insertError) {
      console.error("Failed to insert project_client:", insertError);
      return NextResponse.json(
        { error: "Gagal mengundang client" },
        { status: 500 }
      );
    }

    // Generate magic link
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`;

      await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: email.trim(),
        options: { redirectTo },
      });
    }
    return NextResponse.json(
      { message: "Undangan berhasil dikirim. Client akan menerima email." },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Error inviting client:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/projects/[id]/clients
 *
 * Daftar client yang diundang ke proyek.
 * Hanya project owner yang bisa melihat.
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

    const supabase = createSupabaseServerClient();

    const owner = await isProjectOwner(supabase, id, user.id);
    if (!owner) {
      return NextResponse.json(
        { error: "Hanya pemilik proyek yang dapat melihat daftar client" },
        { status: 403 }
      );
    }

    const { data: clients, error } = await supabase
      .from("project_clients")
      .select("project_id, client_id, invited_at, accepted_at, client:client_id(id, email, full_name, avatar_url)")
      .eq("project_id", id)
      .order("invited_at", { ascending: false });

    if (error) {
      console.error("Error fetching clients:", error);
      return NextResponse.json(
        { error: "Gagal mengambil daftar client" },
        { status: 500 }
      );
    }

    return NextResponse.json({ clients }, { status: 200 });
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
