import { defineConfig, devices } from "@playwright/test";

const PORT = 5199;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  // Five browser profiles share one dev server; more parallel browsers mostly add contention.
  workers: process.env.CI ? undefined : 8,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  // Three engines. Mobile profiles add touch, a small viewport and a mobile user agent,
  // which catches hover-only interactions and horizontal overflow.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "chromium-mobile", use: { ...devices["Pixel 7"] } },
    // The map needs WebGL. Headless Firefox turns it off without a GPU, and on Linux has no GL at all:
    // CI runs it in a window on a virtual display (CENNGE_FIREFOX_HEADED, see ci.yml).
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        headless: process.env.CENNGE_FIREFOX_HEADED !== "1",
        launchOptions: { firefoxUserPrefs: { "webgl.force-enabled": true } },
      },
    },
    // Playwright's WebKit build: Safari's engine, though not Safari itself (fonts and OS integration differ).
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "webkit-mobile", use: { ...devices["iPhone 17"] } },
  ],
  webServer: {
    command: `pnpm exec vite --port ${PORT} --strictPort`,
    env: { CENNGE_E2E: "1" },
    url: `http://localhost:${PORT}/fixture.html`,
    reuseExistingServer: !process.env.CI,
  },
});
