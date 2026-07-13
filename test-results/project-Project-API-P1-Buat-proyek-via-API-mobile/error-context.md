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
    - button "Buka menu" [ref=e3]:
      - generic [ref=e4]: 
    - complementary [ref=e5]:
      - generic [ref=e6]:
        - img "Shootlink Logo" [ref=e8]
        - generic [ref=e9]: Shootlink
      - navigation [ref=e10]:
        - link "Dasbor" [ref=e11]:
          - /url: /dashboard
          - text: Dasbor
        - link "Proyek" [ref=e15]:
          - /url: /proyek
          - text: Proyek
        - link "Pengaturan" [ref=e18]:
          - /url: /settings
          - text: Pengaturan
      - generic [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]: PT
          - generic [ref=e24]:
            - paragraph [ref=e25]: Playwright Tester
            - paragraph [ref=e26]: pw_test_1783946238024@shootlink-test.com
        - button " Keluar" [ref=e27]:
          - generic [ref=e29]: 
          - text: Keluar
    - generic [ref=e31]:
      - generic [ref=e32]:
        - heading "Selamat Datang, Playwright" [level=2] [ref=e33]
        - paragraph [ref=e34]: Berikut ringkasan aktivitas studio Anda hari ini.
      - generic [ref=e35]:
        - generic [ref=e37]:
          - generic [ref=e39]: 
          - generic [ref=e40]:
            - paragraph [ref=e41]: Total Proyek
            - paragraph [ref=e42]: "3"
        - generic [ref=e44]:
          - generic [ref=e46]: 
          - generic [ref=e47]:
            - paragraph [ref=e48]: Proyek Aktif
            - paragraph [ref=e49]: "3"
        - generic [ref=e54]:
          - paragraph [ref=e55]: Total Foto
          - paragraph [ref=e56]: "1"
        - generic [ref=e58]:
          - generic [ref=e60]: 
          - generic [ref=e61]:
            - paragraph [ref=e62]: Foto Favorit
            - paragraph [ref=e63]: "0"
      - generic [ref=e64]:
        - generic [ref=e65]:
          - generic [ref=e66]:
            - heading "Proyek Butuh Perhatian" [level=3] [ref=e67]
            - paragraph [ref=e68]: Proyek aktif yang perlu ditindaklanjuti segera.
          - link "Lihat semua proyek" [ref=e69]:
            - /url: /proyek
            - text: Lihat Semua
            - generic [ref=e70]: →
        - generic [ref=e71]:
          - generic [ref=e72]:
            - generic [ref=e73]:
              - generic [ref=e75]: 
              - generic [ref=e76]:
                - paragraph [ref=e77]: PublicGallery 1783946263961
                - paragraph [ref=e78]: Wedding
            - generic [ref=e79]:
              - generic [ref=e81]:
                - generic [ref=e82]: Progress
                - generic [ref=e83]: 10%
              - generic [ref=e86]: Persiapan
              - link "" [ref=e87]:
                - /url: /publicgallery-1783946263961-2q8rv
                - generic [ref=e88]: 
          - generic [ref=e89]:
            - generic [ref=e90]:
              - generic [ref=e92]: 
              - generic [ref=e93]:
                - paragraph [ref=e94]: GalleryGetTest 1783946254761
                - paragraph [ref=e95]: Wedding
            - generic [ref=e96]:
              - generic [ref=e98]:
                - generic [ref=e99]: Progress
                - generic [ref=e100]: 10%
              - generic [ref=e103]: Persiapan
              - link "" [ref=e104]:
                - /url: /gallerygettest-1783946254761-slj7v
                - generic [ref=e105]: 
          - generic [ref=e106]:
            - generic [ref=e107]:
              - generic [ref=e109]: 
              - generic [ref=e110]:
                - paragraph [ref=e111]: GalleryTest 1783946244834
                - paragraph [ref=e112]: Wedding
            - generic [ref=e113]:
              - generic [ref=e115]:
                - generic [ref=e116]: Progress
                - generic [ref=e117]: 10%
              - generic [ref=e120]: Persiapan
              - link "" [ref=e121]:
                - /url: /gallerytest-1783946244834-qv1ps
                - generic [ref=e122]: 
  - alert [ref=e123]
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