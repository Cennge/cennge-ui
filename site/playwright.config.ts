import { defineConfig, devices } from "@playwright/test";

const PORT = 3210;

// The built site (out/, from `pnpm build`), served as a static host would: what visitors get.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? undefined : 8,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  // The library's five browser profiles (../playwright.config.ts).
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "chromium-mobile", use: { ...devices["Pixel 7"] } },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        headless: process.env.CENNGE_FIREFOX_HEADED !== "1",
        launchOptions: { firefoxUserPrefs: { "webgl.force-enabled": true } },
      },
    },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "webkit-mobile", use: { ...devices["iPhone 17"] } },
  ],
  webServer: {
    command: "node scripts/serve.mjs",
    env: { PORT: String(PORT) },
    url: `http://localhost:${PORT}/docs/introduction/`,
    reuseExistingServer: !process.env.CI,
  },
});
