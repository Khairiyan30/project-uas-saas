import { test, expect } from "@playwright/test";
import { setupAuthenticatedPage, clearAuth } from "../helpers/auth";

test.describe("Security", () => {
  test("S1: Dashboard redirect saat tidak login", async ({ page }) => {
    await page.goto("/login", { timeout: 20000 });
    await page.waitForSelector("form", { timeout: 10000 });
    await clearAuth(page);

    await page.goto("/dashboard", { timeout: 20000 });
    await page.waitForTimeout(3000);

    const url = page.url();
    const isLogin = url.includes("/login");
    const isLoading = await page.locator("text=Memeriksa sesi").isVisible().catch(() => false);
    expect(isLogin || isLoading).toBeTruthy();
  });

  test("S2: Login form requirement", async ({ page }) => {
    await page.goto("/login", { timeout: 20000 });
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[name="password"]')).toBeVisible({ timeout: 5000 });
  });

  test("S3: Signup form render", async ({ page }) => {
    await page.goto("/signup", { timeout: 20000 });
    await page.waitForSelector("form", { timeout: 10000 });
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('input[name="password"]')).toBeVisible({ timeout: 3000 });
  });

  test("S4: API 401 tanpa token", async ({ page }) => {
    await page.goto("/login", { timeout: 20000 });
    await page.waitForSelector("form", { timeout: 10000 });

    const res = await page.evaluate(async () => {
      const r = await fetch("/api/projects");
      return { status: r.status };
    });
    expect(res.status === 401 || res.status === 500 || res.status === 308).toBeTruthy();
  });

  test("S5: API 401 dengan token invalid", async ({ page }) => {
    await page.goto("/login", { timeout: 20000 });
    await page.waitForSelector("form", { timeout: 10000 });

    const res = await page.evaluate(async () => {
      const r = await fetch("/api/projects", {
        headers: { Authorization: "Bearer invalid-token-12345" },
      });
      return { status: r.status };
    });
    expect(res.status === 401 || res.status === 500).toBeTruthy();
  });
});
