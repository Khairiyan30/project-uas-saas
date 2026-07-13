import { Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");

const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim() || "";
const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim() || "";
const serviceKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)?.[1]?.trim() || "";
const jwtSecret = envContent.match(/SUPABASE_JWT_SECRET=(.+)/)?.[1]?.trim() || "";

const TEST_BASE_EMAIL = "pw_test_";
const TEST_PASSWORD = "TestPass123!";

export function generateTestEmail(): string {
  return `${TEST_BASE_EMAIL}${Date.now()}@shootlink-test.com`;
}

export function getTestPassword(): string {
  return TEST_PASSWORD;
}

let tokenCache: { email: string; accessToken: string; refreshToken: string } | null = null;

/**
 * Reset cache — panggil setelah test yang menginvalidasi session (misal A3 logout).
 */
export function resetTokenCache() {
  tokenCache = null;
}

/**
 * Buat user + dapatkan access token via Supabase Admin.
 * Menggunakan cache untuk menghindari rate limit Supabase.
 */
export async function createTestUser(): Promise<{
  email: string;
  accessToken: string;
  refreshToken: string;
}> {
  if (tokenCache) return tokenCache;

  const email = generateTestEmail();
  const password = TEST_PASSWORD;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: "Playwright Tester" } },
  });

  if (signUpError) throw new Error(`Signup: ${signUpError.message}`);

  let accessToken = signUpData.session?.access_token;
  let refreshToken = signUpData.session?.refresh_token;

  if (!accessToken && serviceKey) {
    const adminClient = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    if (signUpData.user?.id) {
      await adminClient.auth.admin.updateUserById(signUpData.user.id, {
        email_confirm: true,
      });
    }
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) throw new Error(`Login: ${loginError.message}`);
    accessToken = loginData.session?.access_token;
    refreshToken = loginData.session?.refresh_token;
  }

  if (!accessToken) throw new Error("No access token");

  tokenCache = { email, accessToken, refreshToken: refreshToken || "" };
  return tokenCache;
}

export function getAccessToken(page: Page): Promise<string> {
  return page.evaluate(() => localStorage.getItem("sb-access-token") || "");
}

/**
 * Inject token ke localStorage browser + setup auth state.
 */
export async function setupAuthenticatedPage(page: Page): Promise<{
  email: string;
  accessToken: string;
}> {
  const { email, accessToken, refreshToken } = await createTestUser();

  // Inject token ke browser
  await page.goto("/login", { timeout: 15000 });
  await page.waitForTimeout(1000);
  await page.evaluate(
    ({ token, refresh }) => {
      localStorage.setItem("sb-access-token", token);
      if (refresh) localStorage.setItem("sb-refresh-token", refresh);
    },
    { token: accessToken, refresh: refreshToken }
  );

  // Navigate ke dashboard
  await page.goto("/dashboard", { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(5000);

  // Fallback ke UI login jika redirect atau masih loading
  let finalToken = accessToken;
  if (page.url().includes("/login")) {
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    try {
      await page.waitForURL(/\/dashboard/, { timeout: 20000 });
      // Ambil token baru dari localStorage (hasil UI login)
      finalToken = await page.evaluate(() => localStorage.getItem("sb-access-token") || "");
    } catch {
      // Mungkin login manual berhasil tapi navbar redirect
    }
  }

  return { email, accessToken: finalToken };
}

export async function clearAuth(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem("sb-access-token");
    localStorage.removeItem("sb-refresh-token");
    localStorage.removeItem("supabase.auth.token");
  });
}

export async function waitForLoginRedirect(page: Page, timeout = 10000) {
  try {
    await page.waitForURL(/\/login/, { timeout });
    return true;
  } catch {
    return false;
  }
}
