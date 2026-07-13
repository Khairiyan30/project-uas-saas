# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: project.spec.ts >> Project API >> P1: Buat proyek via API
- Location: tests\e2e\project.spec.ts:5:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - text: 
    - complementary [ref=e3]:
      - generic [ref=e4]:
        - img "Shootlink Logo" [ref=e6]
        - generic [ref=e7]: Shootlink
      - navigation [ref=e8]:
        - link "Dasbor" [ref=e9] [cursor=pointer]:
          - /url: /dashboard
          - text: Dasbor
        - link "Proyek" [ref=e13] [cursor=pointer]:
          - /url: /proyek
          - text: Proyek
        - link "Pengaturan" [ref=e16] [cursor=pointer]:
          - /url: /settings
          - text: Pengaturan
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: PT
          - generic [ref=e22]:
            - paragraph [ref=e23]: Playwright Tester
            - paragraph [ref=e24]: pw_test_1783946044602@shootlink-test.com
        - button " Keluar" [ref=e25]:
          - generic [ref=e27]: 
          - text: Keluar
    - generic [ref=e29]:
      - generic [ref=e30]:
        - heading "Selamat Datang, Playwright" [level=2] [ref=e31]
        - paragraph [ref=e32]: Berikut ringkasan aktivitas studio Anda hari ini.
      - generic [ref=e33]:
        - generic [ref=e35]:
          - generic [ref=e37]: 
          - generic [ref=e38]:
            - paragraph [ref=e39]: Total Proyek
            - paragraph [ref=e40]: "3"
        - generic [ref=e42]:
          - generic [ref=e44]: 
          - generic [ref=e45]:
            - paragraph [ref=e46]: Proyek Aktif
            - paragraph [ref=e47]: "3"
        - generic [ref=e52]:
          - paragraph [ref=e53]: Total Foto
          - paragraph [ref=e54]: "1"
        - generic [ref=e56]:
          - generic [ref=e58]: 
          - generic [ref=e59]:
            - paragraph [ref=e60]: Foto Favorit
            - paragraph [ref=e61]: "0"
      - generic [ref=e62]:
        - generic [ref=e63]:
          - generic [ref=e64]:
            - heading "Proyek Butuh Perhatian" [level=3] [ref=e65]
            - paragraph [ref=e66]: Proyek aktif yang perlu ditindaklanjuti segera.
          - link "Lihat semua proyek" [ref=e67] [cursor=pointer]:
            - /url: /proyek
            - text: Lihat Semua
            - generic [ref=e68]: →
        - generic [ref=e69]:
          - generic [ref=e70]:
            - generic [ref=e71]:
              - generic [ref=e73]: 
              - generic [ref=e74]:
                - paragraph [ref=e75]: PublicGallery 1783946069849
                - paragraph [ref=e76]: Wedding
            - generic [ref=e77]:
              - generic [ref=e79]:
                - generic [ref=e80]: Progress
                - generic [ref=e81]: 10%
              - generic [ref=e84]: Persiapan
              - link "" [ref=e85] [cursor=pointer]:
                - /url: /publicgallery-1783946069849-svri0
                - generic [ref=e86]: 
          - generic [ref=e87]:
            - generic [ref=e88]:
              - generic [ref=e90]: 
              - generic [ref=e91]:
                - paragraph [ref=e92]: GalleryGetTest 1783946060811
                - paragraph [ref=e93]: Wedding
            - generic [ref=e94]:
              - generic [ref=e96]:
                - generic [ref=e97]: Progress
                - generic [ref=e98]: 10%
              - generic [ref=e101]: Persiapan
              - link "" [ref=e102] [cursor=pointer]:
                - /url: /gallerygettest-1783946060811-0cujp
                - generic [ref=e103]: 
          - generic [ref=e104]:
            - generic [ref=e105]:
              - generic [ref=e107]: 
              - generic [ref=e108]:
                - paragraph [ref=e109]: GalleryTest 1783946051310
                - paragraph [ref=e110]: Wedding
            - generic [ref=e111]:
              - generic [ref=e113]:
                - generic [ref=e114]: Progress
                - generic [ref=e115]: 10%
              - generic [ref=e118]: Persiapan
              - link "" [ref=e119] [cursor=pointer]:
                - /url: /gallerytest-1783946051310-30diw
                - generic [ref=e120]: 
  - alert [ref=e121]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { setupAuthenticatedPage } from "../helpers/auth";
  3   | 
  4   | test.describe("Project API", () => {
  5   |   test("P1: Buat proyek via API", async ({ page }) => {
  6   |     const { accessToken } = await setupAuthenticatedPage(page);
  7   |     expect(accessToken).toBeTruthy();
  8   | 
  9   |     // Baca token langsung dari localStorage untuk memastikan token terbaru
  10  |     const liveToken = await page.evaluate(() => localStorage.getItem("sb-access-token") || "");
  11  |     const token = liveToken || accessToken;
  12  | 
  13  |     // Internal retry: kadang evaluate pertama gagal karena page belum stabil
  14  |     let res: { ok: boolean; status: number; body: any } | null = null;
  15  |     for (let attempt = 0; attempt < 3; attempt++) {
  16  |       const t = await page.evaluate(() => localStorage.getItem("sb-access-token") || "").catch(() => token);
  17  |       res = await page.evaluate(async (tk) => {
  18  |         const r = await fetch("/api/projects", {
  19  |           method: "POST",
  20  |           headers: {
  21  |             "Content-Type": "application/json",
  22  |             Authorization: `Bearer ${tk}`,
  23  |           },
  24  |           body: JSON.stringify({
  25  |             name: `Test ${Date.now()}`,
  26  |             event_type: "Wedding",
  27  |             description: "Created by test",
  28  |           }),
  29  |         });
  30  |         return { ok: r.ok, status: r.status, body: await r.json() };
  31  |       }, t || token);
  32  |       if (res.ok) break;
  33  |       await page.waitForTimeout(3000);
  34  |     }
  35  | 
> 36  |     expect(res!.ok).toBeTruthy();
      |                     ^ Error: expect(received).toBeTruthy()
  37  |     expect(res!.body?.project?.name).toContain("Test ");
  38  |     expect(res!.body?.project?.unique_slug).toBeTruthy();
  39  |   });
  40  | 
  41  |   test("P2: GET daftar proyek", async ({ page }) => {
  42  |     const { accessToken } = await setupAuthenticatedPage(page);
  43  | 
  44  |     const res = await page.evaluate(async (token) => {
  45  |       const r = await fetch("/api/projects", {
  46  |         headers: { Authorization: `Bearer ${token}` },
  47  |       });
  48  |       return { ok: r.ok, body: await r.json() };
  49  |     }, accessToken);
  50  | 
  51  |     expect(res.ok).toBeTruthy();
  52  |     expect(Array.isArray(res.body?.projects)).toBeTruthy();
  53  |   });
  54  | 
  55  |   test("P3: Update proyek", async ({ page }) => {
  56  |     const { accessToken } = await setupAuthenticatedPage(page);
  57  | 
  58  |     // Buat dulu
  59  |     const created = await page.evaluate(async (token) => {
  60  |       const r = await fetch("/api/projects", {
  61  |         method: "POST",
  62  |         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  63  |         body: JSON.stringify({ name: `Edit ${Date.now()}`, event_type: "Wedding" }),
  64  |       });
  65  |       const d = await r.json();
  66  |       return { id: d.project?.id, slug: d.project?.unique_slug };
  67  |     }, accessToken);
  68  | 
  69  |     expect(created.id).toBeTruthy();
  70  | 
  71  |     // Update
  72  |     const newName = `Updated ${Date.now()}`;
  73  |     const updated = await page.evaluate(async ({ token, id, name }) => {
  74  |       const r = await fetch(`/api/projects/${id}`, {
  75  |         method: "PUT",
  76  |         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  77  |         body: JSON.stringify({ name }),
  78  |       });
  79  |       return { ok: r.ok, body: await r.json() };
  80  |     }, { token: accessToken, id: created.id, name: newName });
  81  | 
  82  |     expect(updated.ok).toBeTruthy();
  83  |     expect(updated.body?.project?.name).toBe(newName);
  84  |   });
  85  | 
  86  |   test("P4: Filter + sort via API", async ({ page }) => {
  87  |     const { accessToken } = await setupAuthenticatedPage(page);
  88  | 
  89  |     const res = await page.evaluate(async (token) => {
  90  |       const r = await fetch("/api/projects?status=Active&sort=updated_at", {
  91  |         headers: { Authorization: `Bearer ${token}` },
  92  |       });
  93  |       return { ok: r.ok, projects: (await r.json()).projects || [] };
  94  |     }, accessToken);
  95  | 
  96  |     expect(res.ok).toBeTruthy();
  97  |     expect(Array.isArray(res.projects)).toBeTruthy();
  98  |   });
  99  | 
  100 |   test("P5: List proyek via API", async ({ page }) => {
  101 |     const { accessToken } = await setupAuthenticatedPage(page);
  102 | 
  103 |     const res = await page.evaluate(async (token) => {
  104 |       const r = await fetch("/api/projects", {
  105 |         headers: { Authorization: `Bearer ${token}` },
  106 |       });
  107 |       return { ok: r.ok, projects: (await r.json()).projects || [] };
  108 |     }, accessToken);
  109 | 
  110 |     expect(res.ok).toBeTruthy();
  111 |     expect(Array.isArray(res.projects)).toBeTruthy();
  112 |   });
  113 | 
  114 |   test("P6: Halaman /proyek render di browser", async ({ page }) => {
  115 |     await setupAuthenticatedPage(page);
  116 | 
  117 |     await page.goto("/proyek", { waitUntil: "networkidle", timeout: 30000 });
  118 |     await page.waitForTimeout(5000);
  119 | 
  120 |     const url = page.url();
  121 |     const onProyek = url.includes("/proyek");
  122 |     const onLogin = url.includes("/login");
  123 | 
  124 |     if (onProyek) {
  125 |       const mainContent = page.locator("main");
  126 |       const visible = await mainContent.isVisible({ timeout: 10000 }).catch(() => false);
  127 |       const hasContent = await page.getByText("Proyek").or(page.getByText("Buat Proyek")).isVisible().catch(() => false);
  128 |       expect(visible || hasContent).toBeTruthy();
  129 |     }
  130 |     expect(onProyek || onLogin).toBeTruthy();
  131 |   });
  132 | });
  133 | 
```