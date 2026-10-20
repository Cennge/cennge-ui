import AxeBuilder from "@axe-core/playwright";
import { expect, test as base, type Page } from "@playwright/test";

/*
 * Notices the browser itself writes into the page console about its privacy features.
 * Page code does not cause them, so they say nothing about the components. Keep this list narrow.
 */
const browserNotices = [
  // Firefox bounce-tracking protection reacts to the many navigations of a test run.
  /has been classified as a bounce tracker/,
  // Firefox notes any element moved on scroll; a custom scrollbar's thumb (ScrollArea) is exactly that.
  /appears to use a scroll-linked positioning effect/,
  // Chromium's software WebGL (no GPU in headless) on reading the map's pixels back.
  /GL Driver Message \(OpenGL, Performance, GL_CLOSE_PATH_NV, High\): GPU stall due to ReadPixels/,
];

/** OpenFreeMap's styles as served offline (see serveMapTilesOffline). */
const offlineMapStyle = (dark: boolean) =>
  JSON.stringify({
    version: 8,
    sources: {
      // A source that only credits, so the attribution has something to show.
      credits: { type: "geojson", data: { type: "FeatureCollection", features: [] }, attribution: '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap</a>' },
    },
    layers: [{ id: "background", type: "background", paint: { "background-color": dark ? "#1b1e24" : "#e4e7ec" } }],
  });

/**
 * Every test fails if the page logs an error or warning (React key warnings, Radix
 * "missing Title" warnings, uncaught exceptions). Use this `test` instead of Playwright's.
 */
export const test = base.extend<{ consoleGuard: void }>({
  consoleGuard: [
    async ({ page }, use) => {
      const problems: string[] = [];
      page.on("console", (message) => {
        if (message.type() !== "error" && message.type() !== "warning") return;
        if (browserNotices.some((notice) => notice.test(message.text()))) return;
        problems.push(`${message.type()}: ${message.text()}`);
      });
      page.on("pageerror", (error) => problems.push(`uncaught: ${error.message}`));
      await use();
      expect(problems, "the browser console should stay clean").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/**
 * The map's default tiles (OpenFreeMap) answered offline, for pages that show a map with them: tests
 * neither wait on nor depend on the network. Only there: in Firefox any page.route also slows other
 * loads, and fonts reloaded during an axe run were aborted with a console error.
 */
export async function serveMapTilesOffline(page: Page) {
  await page.route("https://tiles.openfreemap.org/**", (route) =>
    route.fulfill({ contentType: "application/json", body: offlineMapStyle(route.request().url().endsWith("/dark")) }),
  );
}

export type Theme = "dark" | "light";

/** Open playground/fixtures/<name>.tsx on the fixture page. */
export async function openFixture(page: Page, name: string, theme: Theme = "dark") {
  await page.goto(`/fixture.html?name=${name}&theme=${theme}`);
  // Waiting for the page, not asserting behaviour: the Vite dev server compiles modules on demand,
  // and several WebKit instances loading at once can take well over the default 5 s.
  await expect(page.getByTestId("fixture-ready")).toBeAttached({ timeout: 30_000 });
}

/**
 * Wait until every finite CSS transition and animation has finished, so checks see the settled UI
 * rather than in-between colours (e.g. right after switching the theme). Endless ones (spinners,
 * shimmer) are ignored. getAnimations() flushes styles, so transitions that just started are included.
 */
export async function settleAnimations(page: Page) {
  await page.evaluate(async () => {
    const finite = document.getAnimations().filter((animation) => {
      const end = animation.effect?.getComputedTiming().endTime;
      return typeof end === "number" && Number.isFinite(end);
    });
    await Promise.race([
      Promise.all(finite.map((animation) => animation.finished.catch(() => undefined))),
      new Promise((resolve) => setTimeout(resolve, 3000)),
    ]);
  });
}

/**
 * axe-core against WCAG 2.2 A/AA, on the settled page. Reports rule, impact and the first offending nodes.
 *
 * `modal: true` while a modal overlay (Dialog, Drawer, Select, modal menus) is open: Radix hides the
 * rest of the page with aria-hidden and makes it unreachable (focus trap + outside pointer events off).
 * axe still sees focusable elements inside the aria-hidden part and reports aria-hidden-focus, so that
 * one rule is skipped. Specs that pass `modal` must also prove the background is unreachable.
 */
export async function expectAccessible(
  page: Page,
  options: { include?: string; exclude?: string[]; modal?: boolean } = {},
) {
  await settleAnimations(page);
  // Anything still running (e.g. a headless engine whose animation clock does not advance) is cut
  // short: cancelling a transition jumps straight to its end value, in every engine.
  const freeze = await page.addStyleTag({
    content: "*, *::before, *::after { transition: none !important; }",
  });
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]);
  if (options.modal) builder = builder.disableRules(["aria-hidden-focus"]);
  if (options.include) builder = builder.include(options.include);
  for (const selector of options.exclude ?? []) builder = builder.exclude(selector);
  const { violations } = await builder.analyze();
  await freeze.evaluate((node) => (node as Element).remove());
  const report = violations.map(
    (v) =>
      `${v.id} [${v.impact}] ${v.help}\n` +
      v.nodes
        .slice(0, 4)
        .map((node) => `    ${node.target.join(" ")} — ${node.failureSummary?.split("\n").slice(1, 2).join(" ").trim()}`)
        .join("\n"),
  );
  expect(report, "axe found accessibility violations").toEqual([]);
}
