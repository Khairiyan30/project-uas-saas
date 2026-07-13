import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { verifySession, unauthorizedResponse } from "@/lib/session";

/**
 * GET /api/projects
 *
 * Mengambil daftar proyek milik user yang sedang login.
 * - Photographer: proyek sendiri
 * - Client: proyek yang di-assign (via project_clients)
 *
 * Termasuk total foto dan jumlah favorit per proyek.
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { user, role } = await verifySession(authHeader).catch(() => {
      throw new Error("unauthorized");
    });

    const supabase = createSupabaseServerClient();

    let projectIds: string[] = [];

    if (role === "client") {
      // Client: ambil project dari project_clients
      const { data: assignments } = await supabase
        .from("project_clients")
        .select("project_id")
        .eq("client_id", user.id)
        .not("accepted_at", "is", null);

      if (assignments && assignments.length > 0) {
        projectIds = assignments.map((a) => a.project_id);

        const { data: projects, error } = await supabase
          .from("projects")
          .select("id, user_id, name, event_type, description, progress_status, unique_slug, created_at, cover_photo_url")
          .in("id", projectIds)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching client projects:", error);
          return NextResponse.json(
            { error: "Gagal mengambil daftar proyek" },
            { status: 500 }
          );
        }

        const photoCountMap: Record<string, number> = {};
        const favCountMap: Record<string, number> = {};

        const { data: allPhotos } = await supabase
          .from("photos")
          .select("project_id, is_favorite")
          .in("project_id", projectIds);

        for (const photo of allPhotos ?? []) {
          if (!photoCountMap[photo.project_id]) photoCountMap[photo.project_id] = 0;
          photoCountMap[photo.project_id]++;
          if (photo.is_favorite) {
            if (!favCountMap[photo.project_id]) favCountMap[photo.project_id] = 0;
            favCountMap[photo.project_id]++;
          }
        }

        const result = (projects ?? []).map((p) => ({
          ...p,
          photo_count: photoCountMap[p.id] ?? 0,
          favorite_count: favCountMap[p.id] ?? 0,
        }));

        return NextResponse.json({ projects: result }, { status: 200 });
      }
    } else {
      // Photographer: ambil project sendiri
      const { data: projects, error } = await supabase
        .from("projects")
        .select("id, name, event_type, description, progress_status, unique_slug, created_at, cover_photo_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json(
          { error: "Gagal mengambil daftar proyek" },
          { status: 500 }
        );
      }

      const projectIds = (projects ?? []).map((p) => p.id);
      const photoCountMap: Record<string, number> = {};
      const favCountMap: Record<string, number> = {};

      if (projectIds.length > 0) {
        const { data: allPhotos } = await supabase
          .from("photos")
          .select("project_id, is_favorite")
          .in("project_id", projectIds);

        for (const photo of allPhotos ?? []) {
          if (!photoCountMap[photo.project_id]) photoCountMap[photo.project_id] = 0;
          photoCountMap[photo.project_id]++;
          if (photo.is_favorite) {
            if (!favCountMap[photo.project_id]) favCountMap[photo.project_id] = 0;
            favCountMap[photo.project_id]++;
          }
        }
      }

      const result = (projects ?? []).map((p) => ({
        ...p,
        photo_count: photoCountMap[p.id] ?? 0,
        favorite_count: favCountMap[p.id] ?? 0,
      }));

      return NextResponse.json({ projects: result }, { status: 200 });
    }

    return NextResponse.json({ projects: [] }, { status: 200 });
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 *
 * Membuat proyek baru untuk user yang sedang login.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const { user } = await verifySession(authHeader).catch(() => {
      throw new Error("unauthorized");
    });

    const body = await request.json();
    const { name, event_type, description } = body;

    if (!name || !event_type) {
      return NextResponse.json(
        { error: "Nama proyek dan jenis acara wajib diisi" },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;

    const supabase = createSupabaseServerClient();

    // Check plan limits
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("user_id", user.id)
      .single();

    const currentPlan = sub?.plan || "free";
    const { data: planLimit } = await supabase
      .from("plan_limits")
      .select("max_projects")
      .eq("plan", currentPlan)
      .single();

    if (planLimit) {
      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (count !== null && count >= planLimit.max_projects) {
        return NextResponse.json(
          { error: `Batas proyek ${currentPlan} tercapai (maks ${planLimit.max_projects}). Upgrade paket Anda untuk membuat proyek baru.` },
          { status: 403 }
        );
      }
    }

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: name.trim(),
        event_type: event_type.trim(),
        description: description?.trim() || "",
        progress_status: "Persiapan",
        unique_slug: uniqueSlug,
      })
      .select("id, name, event_type, description, progress_status, unique_slug, created_at")
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return NextResponse.json(
        { error: "Gagal membuat proyek baru" },
        { status: 500 }
      );
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    if (error.message === "unauthorized") return unauthorizedResponse();
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
