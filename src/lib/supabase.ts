import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { validateEnv } from "./env";

const envMissing = validateEnv();
if (envMissing.length > 0) {
  console.error(
    `[Shootlink] Environment variables missing: ${envMissing.join(", ")}`
  );
}

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  return url;
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
  return key;
}

/**
 * Supabase client untuk digunakan di API Routes (server-side).
 * Menggunakan service role key jika tersedia (untuk operasi admin),
 * jatuh kembali ke anon key untuk operasi publik.
 */
export function createSupabaseServerClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = serviceRoleKey ?? getSupabaseAnonKey();

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Supabase client singleton untuk Client Components (lazy-initialized).
 */
let _supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_supabaseClient) {
    _supabaseClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  }
  return _supabaseClient;
}
