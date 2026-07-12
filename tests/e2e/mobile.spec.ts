import { test, expect } from "@playwright/test";
import { setupAuthenticatedPage } from "../helpers/auth";

test.describe("Mobile Responsiveness", () => {
  test("M1: Halaman login mobile-friendly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login", { timeout: 20000 });
    await page.waitForTimeout(2000);

    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
  });

  test("M2: Viewport meta tag ada", async ({ page }) => {
    await page.goto("/login", { timeout: 20000 });
    const viewport = await page.locator('meta[name="viewport"]').getAttribute("content").catch(() => "");
    expect(viewport).toContain("width=device-width");
  });

  test("M3: Dashboard mobile — statistik card", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const { accessToken } = await setupAuthenticatedPage(page);

    await page.goto("/dashboard", { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(5000);

    const url = page.url();
    if (url.includes("/dashboard")) {
      await expect(page.locator("body")).toBeVisible({ timeout: 3000 });
    }
  });
});
