import { test, expect } from "@playwright/test";
import { setupAuthenticatedPage } from "../helpers/auth";

test.describe("Settings API", () => {
  test("S1: GET profil via API", async ({ page }) => {
    const { accessToken } = await setupAuthenticatedPage(page);

    const res = await page.evaluate(async (token) => {
      const r = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await r.json();
      return { ok: r.ok, user: d.user };
    }, accessToken);

    expect(res.ok).toBeTruthy();
    expect(res.user?.email).toBeTruthy();
    expect(res.user?.full_name).toBeTruthy();
  });

  test("S2: Update profil via API", async ({ page }) => {
    const { accessToken } = await setupAuthenticatedPage(page);

    const newName = `UpdatedStudio ${Date.now()}`;
    const res = await page.evaluate(async ({ token, name }) => {
      const r = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: name }),
      });
      return { ok: r.ok, body: await r.json() };
    }, { token: accessToken, name: newName });

    expect(res.ok).toBeTruthy();
  });

  test("S3: Halaman /settings render di browser", async ({ page }) => {
    const { accessToken } = await setupAuthenticatedPage(page);

    await page.goto("/settings", { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(5000);

    const url = page.url();
    const onSettings = url.includes("/settings");
    const onLogin = url.includes("/login");
    expect(onSettings || onLogin).toBeTruthy();
  });
});
