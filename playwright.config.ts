import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["list"],
  ],
  webServer: {
    command: "npm run dev -- -p 3000",
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    env: {
      BASE_URL: "http://localhost:3000",
    },
  },
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
      },
    },
  ],
});
