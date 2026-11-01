import { defineConfig, devices } from "@playwright/test";

// scripts/check-next.mjs builds the app outside the repository and points NEXT_APP_DIR at it.
const app = process.env.NEXT_APP_DIR;
if (!app) throw new Error("Run `pnpm check:next`: it builds the Next.js app and sets NEXT_APP_DIR.");

// The browsers look at the server's pages from far off its time zone, and with a third locale (the page
// itself is ru-RU, the server defaults to its own). Whatever reads the clock, the time zone or the default
// locale while rendering then differs between server and browser, and hydration says so. Production looks
// from 14 hours east, development from 11 hours west: every run sees both slips, a date kept as midnight
// UTC turning into the day before, and a late hour turning into the next day. And at any hour one of the
// two is on another day than the server. (One zone picked by the hour missed the first slip until the
// morning, UTC.)
const timezones = { prod: "Pacific/Kiritimati", dev: "Pacific/Niue" } as const;

// Production shows that `next build` works and the page hydrates; development adds React's own checks,
// which also report mismatched attributes.
const servers = [
  { mode: "prod", port: 3210, command: "npm run start" },
  { mode: "dev", port: 3211, command: "npm run dev" },
] as const;

const browsers = [
  { name: "chromium", use: devices["Desktop Chrome"] },
  { name: "chromium-mobile", use: devices["Pixel 7"] },
  // WebGL for the map: see the firefox project in ../../playwright.config.ts.
  {
    name: "firefox",
    use: {
      ...devices["Desktop Firefox"],
      headless: process.env.CENNGE_FIREFOX_HEADED !== "1",
      launchOptions: { firefoxUserPrefs: { "webgl.force-enabled": true } },
    },
  },
  { name: "webkit", use: devices["Desktop Safari"] },
  { name: "webkit-mobile", use: devices["iPhone 17"] },
];

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: { trace: "retain-on-failure", locale: "de-DE" },
  projects: servers.flatMap((server) =>
    browsers.map((browser) => ({
      name: `${server.mode}-${browser.name}`,
      use: { ...browser.use, baseURL: `http://localhost:${server.port}`, timezoneId: timezones[server.mode] },
    })),
  ),
  webServer: servers.map((server) => ({
    command: `${server.command} -- --port ${server.port}`,
    cwd: app,
    // For the dev server, the first request also compiles the page.
    url: `http://localhost:${server.port}`,
    timeout: 180_000,
    env: { NEXT_TELEMETRY_DISABLED: "1" },
  })),
});
