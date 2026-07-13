import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const checks: Record<string, string> = {};

  // 1. Environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  checks.env = supabaseUrl && supabaseKey ? "ok" : "missing";

  // 2. Supabase connectivity
  let dbStatus = "unknown";
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error } = await supabase.from("profiles").select("count", { count: "exact", head: true });
      dbStatus = error ? `error: ${error.message}` : "connected";
    } catch (e: any) {
      dbStatus = `error: ${e.message}`;
    }
  }
  checks.database = dbStatus;

  // 3. Stripe
  checks.stripe = process.env.STRIPE_SECRET_KEY ? "configured" : "not configured";

  // 4. Sentry
  checks.sentry = process.env.NEXT_PUBLIC_SENTRY_DSN ? "configured" : "not configured";

  const allOk = Object.values(checks).every((v) => v === "ok" || v === "connected" || v === "configured");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
