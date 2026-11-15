import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
// Fails every test on a console error or warning, hydration mismatches included.
import { expect, serveMapTilesOffline, test } from "../../e2e/test";
import { nav, pages } from "../lib/nav";

type Theme = "dark" | "light";

async function open(page: Page, path: string, theme: Theme = "dark") {
  await serveMapTilesOffline(page);
  // The starting theme, once per tab: a choice made during the test survives its reloads.
  await page.addInitScript((value) => {
    if (sessionStorage.getItem("theme-seeded")) return;
    localStorage.setItem("cennge-theme", value);
    sessionStorage.setItem("theme-seeded", "1");
  }, theme);
  const response = await page.goto(path);
  expect(response?.status(), `${path} should exist`).toBe(200);
  // Hydrated: the theme switch knows the stored theme only in the browser. Below lg it sits in the
  // sidebar (a closed drawer on phones), so the header's hidden copy is the one always in the page.
  await expect(page.getByRole("radio", { name: theme === "dark" ? "Dark" : "Light", includeHidden: true }).first()).toHaveAttribute(
    "aria-checked",
    "true",
  );
}

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1440) < 768;

test.describe("every page", () => {
  for (const entry of pages) {
    const path = `/docs/${entry.slug}/`;

    test(`${entry.title}: renders, names itself, fits the screen`, async ({ page }) => {
      await open(page, path);
      await expect(page).toHaveTitle(`${entry.title} · cennge-ui`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(entry.title);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, "nothing scrolls the page sideways").toBeLessThanOrEqual(0);
      // React reports some hydration mismatches a moment after the commit.
      await page.waitForTimeout(300);
    });

    for (const theme of ["dark", "light"] as const) {
      test(`${entry.title}: axe in ${theme}`, async ({ page }) => {
        test.slow();
        await open(page, path, theme);
        const { violations } = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          // MapLibre's canvas is not ours to label; the map region around it is.
          .exclude(".maplibregl-canvas")
          .analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
      });
    }
  }
});

test("the landing page renders without a console error", async ({ page }) => {
  await open(page, "/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, "nothing scrolls the page sideways").toBeLessThanOrEqual(0);
});

test("every link inside the site leads to a page", async ({ request, browserName, isMobile }) => {
  test.skip(browserName !== "chromium" || isMobile, "reads the exported HTML: one browser project is enough");
  // From the exported HTML rather than in a browser: every link is in it, and WebKit reports a link
  // prefetch cut short by the next page as an error.
  const seen = new Set<string>(["/"]);
  for (const path of ["/", ...pages.map((entry) => `/docs/${entry.slug}/`)]) {
    const html = await (await request.get(path)).text();
    for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="(\/[^"#]*)/g)) seen.add(href!);
  }
  expect(seen.size, "the pages link to one another").toBeGreaterThan(pages.length);
  for (const href of seen) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
  }
});

test("search: Ctrl+K, a few letters, Enter opens the page", async ({ page }) => {
  await open(page, "/docs/introduction/");
  if (isPhone(page)) await page.getByRole("button", { name: "Search the docs" }).click();
  else await page.keyboard.press("Control+k");
  const field = page.getByRole("combobox", { name: "Search the docs" });
  await expect(field).toBeFocused();
  await field.fill("autocompl");
  await expect(page.getByRole("option", { name: /Combobox/ })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/docs\/combobox\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Combobox");
});

test("the theme: chosen once, there from the first paint after a reload", async ({ page }) => {
  await open(page, "/docs/button/");
  if (isPhone(page)) await page.getByRole("button", { name: "Open the docs menu" }).click();
  await page.getByRole("radio", { name: "Light" }).first().click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.addInitScript(() => {
    new MutationObserver((_records, observer) => {
      if (!document.body) return;
      (window as { classAtBody?: string }).classAtBody = document.documentElement.className;
      observer.disconnect();
    }).observe(document, { childList: true, subtree: true });
  });
  await page.reload();
  expect(await page.evaluate(() => (window as { classAtBody?: string }).classAtBody)).not.toContain("dark");
});

test("the accent repaints primary everywhere and survives a reload", async ({ page }) => {
  await open(page, "/docs/button/");
  const primary = page.locator("figure").first().getByRole("button", { name: "Install cennge-ui" });
  const before = await primary.evaluate((node) => getComputedStyle(node).backgroundColor);
  if (isPhone(page)) await page.getByRole("button", { name: "Open the docs menu" }).click();
  await page.getByRole("radio", { name: "Blue accent" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("data-accent", "blue");
  if (isPhone(page)) await page.keyboard.press("Escape");
  await expect.poll(() => primary.evaluate((node) => getComputedStyle(node).backgroundColor)).not.toBe(before);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-accent", "blue");
});

test("on a phone the menu is a drawer that closes once a page is chosen", async ({ page }) => {
  test.skip(!isPhone(page), "phones only");
  await open(page, "/docs/introduction/");
  await page.getByRole("button", { name: "Open the docs menu" }).click();
  const drawer = page.getByRole("dialog", { name: "Documentation" });
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: "Overlays" }).click();
  await drawer.getByRole("link", { name: "Dialog", exact: true }).click();
  await expect(page).toHaveURL(/\/docs\/dialog\/$/);
  await expect(drawer).toBeHidden();
});

test("the sidebar marks the page you are on and opens its family", async ({ page }) => {
  test.skip(isPhone(page), "the column is a drawer on phones");
  await open(page, "/docs/tooltip/");
  const docs = page.getByRole("navigation", { name: "Docs" });
  await expect(docs.getByRole("button", { name: "Overlays" })).toHaveAttribute("aria-expanded", "true");
  await expect(docs.getByRole("link", { name: "Tooltip" })).toHaveAttribute("aria-current", "page");
});

test("a code block copies its code", async ({ page, browserName, context }) => {
  test.skip(browserName !== "chromium", "clipboard permissions are a Chromium feature in Playwright");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await open(page, "/docs/combobox/");
  const block = page.locator('[data-slot="code-block"]').filter({ hasText: "RepositoryPicker" });
  await block.getByRole("button", { name: "Copy code" }).click();
  await expect(block.getByRole("button", { name: "Copied" })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("export default function RepositoryPicker");
});

test("an address with no page answers 404 with the site's own page", async ({ request }) => {
  // Fetched rather than opened: the browser logs every 404 document as a console error.
  const response = await request.get("/docs/no-such-component/");
  expect(response.status()).toBe(404);
  const html = await response.text();
  expect(html).toContain("<title>Not in the docs · cennge-ui</title>");
  expect(html).toContain("Search the docs");
});

test("no slug repeats and no family is empty", async () => {
  // The sidebar, search and previous/next links all rely on it.
  const slugs = pages.map((entry) => entry.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
  for (const family of nav) expect(family.pages.length).toBeGreaterThan(0);
});
