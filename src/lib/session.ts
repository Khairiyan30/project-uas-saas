import { createClient } from "@supabase/supabase-js";

/**
 * Verifikasi token session dari header Authorization.
 * Digunakan di API routes untuk proteksi endpoint.
 *
 * Returns { user, role } jika valid, throw error jika tidak.
 */
export async function verifySession(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: no token provided");
  }

  const token = authHeader.replace("Bearer ", "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase env vars not configured");
  }

  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    throw new Error("Unauthorized: invalid or expired token");
  }

  // Fetch role from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  return { user: data.user, role: profile?.role || "photographer" };
}

/**
 * Helper untuk membuat error response unauthorized.
 */
export function unauthorizedResponse() {
  return Response.json(
    { error: "Unauthorized: silakan login terlebih dahulu" },
    { status: 401 }
  );
}
