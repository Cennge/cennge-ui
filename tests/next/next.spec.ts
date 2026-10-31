import type { Page } from "@playwright/test";
// Fails every test on a console error or warning, hydration mismatches included.
import { expect, serveMapTilesOffline, test } from "../../e2e/test";

async function open(page: Page) {
  // The playground's map draws OpenFreeMap's tiles.
  await serveMapTilesOffline(page);
  await page.goto("/");
  await expect(page.locator("html[data-hydrated]")).toBeAttached({ timeout: 30_000 });
}

test("the server renders the components, not just the browser", async ({ request }) => {
  const html = await (await request.get("/")).text();
  // From the Server Component, and from client components rendered on the server.
  expect(html).toContain("Rendered by a Server Component");
  expect(html).toContain("Песочница компонентов");
  expect(html).toContain('role="grid"');
  // The map holds its place on the server; MapLibre comes in the browser.
  expect(html).toContain('data-slot="map" data-state="loading"');
});

test("hydrates without a single error or warning", async ({ page }) => {
  await open(page);
  // React reports some mismatches a moment after the commit.
  await page.waitForTimeout(1000);
});

test("the map: MapLibre and its worker, served from public/, draw it after hydration", async ({ page }) => {
  await open(page);
  const map = page.getByRole("region", { name: "Офисы и маршрут доставки" });
  await map.scrollIntoViewIfNeeded();
  await expect(map).toHaveAttribute("data-state", "ready", { timeout: 30_000 });
  await expect(map.getByRole("button", { name: "Манхэттен" })).toBeVisible();
});

test("the package's classes and tokens reach the page", async ({ page }) => {
  await open(page);
  const download = page.getByRole("button", { name: "Download" });
  await expect(download).toHaveCSS("background-color", /^rgb\(/);
  expect(await download.evaluate((node) => getComputedStyle(node).getPropertyValue("--cennge-primary"))).not.toBe("");
});

test("a chart: the server sends its legend, axes and table; the bars come once the plot is measured", async ({ page, request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain("<caption>Скачивания с npm по месяцам</caption>");
  expect(html).toContain(">payload-cache<");
  await open(page);
  const chart = page.getByRole("figure", { name: "Скачивания с npm по месяцам" });
  await chart.scrollIntoViewIfNeeded();
  await expect(chart.locator('[data-slot="chart-marks"] path')).toHaveCount(24);
});

/** Notes the class on <html> at the moment the body begins: what the first paint shows. */
async function watchFirstPaint(page: Page) {
  // Init scripts run before even <html> exists: watch the document for the body to appear.
  await page.addInitScript(() => {
    new MutationObserver((_records, observer) => {
      if (!document.body) return;
      (window as { classAtBody?: string }).classAtBody = document.documentElement.className;
      observer.disconnect();
    }).observe(document, { childList: true, subtree: true });
  });
}
const classAtBody = (page: Page) => page.evaluate(() => (window as { classAtBody?: string }).classAtBody);

test.describe("the theme (ThemeScript, useTheme, ThemeSwitch)", () => {
  test("the stored theme is on <html> before the body exists: no flash, and no hydration warning", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("cennge-theme", "light"));
    await watchFirstPaint(page);
    await open(page);
    expect(await classAtBody(page)).not.toContain("dark");
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    // Once hydrated, the switch shows the choice the server could not know.
    await expect(page.getByRole("radio", { name: "Светлая" })).toHaveAttribute("aria-checked", "true");
    await page.waitForTimeout(1000);
  });

  test("the server sends the switch with nothing chosen, so the first render matches it", async ({ request }) => {
    const html = await (await request.get("/")).text();
    expect(html).toContain('aria-label="Тема"');
    const items = html.match(/<button[^>]*aria-label="(Светлая|Тёмная|Как в системе)"[^>]*>/g) ?? [];
    expect(items).toHaveLength(3);
    for (const item of items) expect(item).not.toContain('aria-checked="true"');
  });

  test("a choice shows at once, and after a reload from the first paint", async ({ page }) => {
    await watchFirstPaint(page);
    await open(page);
    // Nothing stored: the default, dark.
    expect(await classAtBody(page)).toContain("dark");
    await page.getByRole("radio", { name: "Светлая" }).click();
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html[data-hydrated]")).toBeAttached({ timeout: 30_000 });
    expect(await classAtBody(page)).not.toContain("dark");
  });

  test("'as in the system' follows the device, also when it changes", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.addInitScript(() => localStorage.setItem("cennge-theme", "system"));
    await open(page);
    await expect(page.locator("html")).not.toHaveClass(/dark/);
    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.getByRole("radio", { name: "Как в системе" })).toHaveAttribute("aria-checked", "true");
  });
});

test("a server action: its error under the field, then a toast from the layout's Toaster", async ({ page }) => {
  await open(page);
  const form = page.getByRole("form", { name: "Server action" });
  const field = form.getByLabel("GitHub repository");

  await field.fill("left-pad");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(form.getByText('No repository named "left-pad"')).toBeVisible();
  await expect(field).toBeFocused();
  await expect(field).toHaveValue("left-pad");

  await field.fill("payload-cache");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(page.locator("[data-slot=toast]", { hasText: "Saved payload-cache" })).toBeVisible();
});
