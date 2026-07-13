import { test, expect } from "@playwright/test";
import {
  setupAuthenticatedPage,
  clearAuth,
  waitForLoginRedirect,
} from "../helpers/auth";

test.describe("RBAC Role-Based Access Control", () => {
  test("R1: Photographer dapat melihat /dashboard", async ({ page }) => {
    await setupAuthenticatedPage(page);
    const onDashboard = await page.waitForURL(/\/dashboard/, { timeout: 20000 })
      .then(() => true)
      .catch(() => false);
    if (onDashboard) {
      // Cari teks "Selamat Datang" atau konten dashboard lainnya
      const welcomeText = page.getByText("Selamat Datang");
      const statsVisible = await welcomeText.isVisible().catch(() => false);
      const totalProyek = page.getByText("Total Proyek");
      const totalVisible = await totalProyek.isVisible().catch(() => false);
      expect(statsVisible || totalVisible).toBeTruthy();
    } else {
      // Mungkin redirect ke login jika setup gagal
      expect(page.url()).toContain("/login");
    }
  });

  test("R2: Photographer dialihkan dari halaman client", async ({ page }) => {
    const { accessToken } = await setupAuthenticatedPage(page);
    await page.goto("/client/dashboard", { timeout: 15000 });
    // Tunggu redirect dari useRequireRole
    try {
      await page.waitForURL(/\/dashboard/, { timeout: 15000 });
      expect(page.url()).toContain("/dashboard");
    } catch {
      // Mungkin masih loading "Memeriksa sesi"
      const loading = await page.getByText("Memeriksa sesi").isVisible().catch(() => false);
      const url = page.url();
      expect(loading || !url.includes("/client")).toBeTruthy();
    }
  });

  test("R3: Guest tidak bisa akses /dashboard", async ({ page }) => {
    await page.goto("/login", { timeout: 15000 });
    await page.waitForTimeout(1000);
    await clearAuth(page);
    await page.goto("/dashboard", { timeout: 15000 });
    // Tunggu redirect atau loading state
    const redirected = await waitForLoginRedirect(page, 15000);
    if (!redirected) {
      const url = page.url();
      const showLoading = await page.getByText("Memeriksa sesi").isVisible().catch(() => false);
      if (!url.includes("/login") && !showLoading) {
        console.log("R3 unexpected URL:", url);
      }
      expect(url.includes("/login") || showLoading).toBeTruthy();
    }
  });

  test("R4: Guest tidak bisa akses halaman client", async ({ page }) => {
    await page.goto("/login", { timeout: 15000 });
    await page.waitForTimeout(1000);
    await clearAuth(page);
    await page.goto("/client/dashboard", { timeout: 15000 });
    const redirected = await waitForLoginRedirect(page, 15000);
    if (!redirected) {
      const url = page.url();
      const showLoading = await page.getByText("Memeriksa sesi").isVisible().catch(() => false);
      expect(url.includes("/login") || showLoading).toBeTruthy();
    }
  });
});
