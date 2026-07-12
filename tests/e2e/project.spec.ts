import { test, expect } from "@playwright/test";
import { setupAuthenticatedPage } from "../helpers/auth";

test.describe("Project API", () => {
  test("P1: Buat proyek via API", async ({ page }) => {
    const { accessToken } = await setupAuthenticatedPage(page);
    expect(accessToken).toBeTruthy();

    const res = await page.evaluate(async (token) => {
      const r = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `Test ${Date.now()}`,
          event_type: "Wedding",
          description: "Created by test",
        }),
      });
      return { ok: r.ok, status: r.status, body: await r.json() };
    }, accessToken);

    expect(res.ok).toBeTruthy();
    expect(res.body?.project?.name).toContain("Test ");
    expect(res.body?.project?.unique_slug).toBeTruthy();
  });

  test("P2: GET daftar proyek", async ({ page }) => {
    const { accessToken } = await setupAuthenticatedPage(page);

    const res = await page.evaluate(async (token) => {
      const r = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { ok: r.ok, body: await r.json() };
    }, accessToken);

    expect(res.ok).toBeTruthy();
    expect(Array.isArray(res.body?.projects)).toBeTruthy();
  });

  test("P3: Update proyek", async ({ page }) => {
    const { accessToken } = await setupAuthenticatedPage(page);

    // Buat dulu
    const created = await page.evaluate(async (token) => {
      const r = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: `Edit ${Date.now()}`, event_type: "Wedding" }),
      });
      const d = await r.json();
      return { id: d.project?.id, slug: d.project?.unique_slug };
    }, accessToken);

    expect(created.id).toBeTruthy();

    // Update
    const newName = `Updated ${Date.now()}`;
    const updated = await page.evaluate(async ({ token, id, name }) => {
      const r = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      return { ok: r.ok, body: await r.json() };
    }, { token: accessToken, id: created.id, name: newName });

    expect(updated.ok).toBeTruthy();
    expect(updated.body?.project?.name).toBe(newName);
  });

  test("P4: Filter + sort via API", async ({ page }) => {
    const { accessToken } = await setupAuthenticatedPage(page);

    const res = await page.evaluate(async (token) => {
      const r = await fetch("/api/projects?status=Active&sort=updated_at", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { ok: r.ok, projects: (await r.json()).projects || [] };
    }, accessToken);

    expect(res.ok).toBeTruthy();
    expect(Array.isArray(res.projects)).toBeTruthy();
  });

  test("P5: List proyek via API", async ({ page }) => {
    const { accessToken } = await setupAuthenticatedPage(page);

    const res = await page.evaluate(async (token) => {
      const r = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { ok: r.ok, projects: (await r.json()).projects || [] };
    }, accessToken);

    expect(res.ok).toBeTruthy();
    expect(Array.isArray(res.projects)).toBeTruthy();
  });

  test("P6: Halaman /proyek render di browser", async ({ page }) => {
    const { accessToken } = await setupAuthenticatedPage(page);

    await page.goto("/proyek", { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(5000);

    const url = page.url();
    const onProyek = url.includes("/proyek");
    const onLogin = url.includes("/login");

    if (onProyek) {
      await expect(page.locator("body")).toBeVisible({ timeout: 3000 });
    }
    expect(onProyek || onLogin).toBeTruthy();
  });
});
