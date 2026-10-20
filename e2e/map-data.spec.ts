import type { Page } from "@playwright/test";
import { expect, expectAccessible, openFixture, test, type Theme } from "./test";

type Global = "regionMap" | "storeMap";

async function open(page: Page, theme: Theme = "dark") {
  await openFixture(page, "map-data", theme);
  for (const map of await page.locator('[data-slot="map"]').all()) {
    await expect(map).toHaveAttribute("data-state", "ready", { timeout: 20_000 });
  }
}

const onMap = <T,>(page: Page, map: Global, code: string) =>
  page.evaluate(([name, run]) => new Function("map", run)((window as unknown as Record<string, unknown>)[name]) as T, [map, code] as const);

/** Where a point of a map is on the page. */
const pointOnPage = (page: Page, map: Global, lngLat: [number, number]) =>
  onMap<{ x: number; y: number }>(
    page,
    map,
    `const box = map.getContainer().getBoundingClientRect(); const p = map.project([${lngLat}]); return { x: box.left + p.x, y: box.top + p.y };`,
  );

const token = (page: Page, name: string) =>
  page.evaluate((property) => getComputedStyle(document.querySelector('[data-slot="map"]')!).getPropertyValue(property).trim(), name);

test("a choropleth: shades along the colour's scale, darkest to lightest on a dark map", async ({ page }) => {
  await open(page, "dark");
  const fill = await onMap<unknown[]>(
    page,
    "regionMap",
    'return map.getPaintProperty(map.getStyle().layers.find((l) => l.id.endsWith("-fill")).id, "fill-color")',
  );
  // ["case", has a number, ["interpolate", …, 1000, low, 3500, middle, 6000, high], transparent]
  const ramp = fill[2] as unknown[];
  expect(ramp.slice(3)).toEqual([
    1000,
    await token(page, "--cennge-primary-800"),
    3500,
    await token(page, "--cennge-primary-500"),
    6000,
    await token(page, "--cennge-primary-300"),
  ]);
  const legend = page.getByRole("group", { name: "Downloads" });
  await expect(legend).toContainText("1,000");
  await expect(legend).toContainText("6,000");
});

test("hover a region: highlighted, with its tooltip at the pointer; a click reports it", async ({ page, isMobile }) => {
  await open(page);
  // The regions are drawn a moment after the map is ready.
  await expect
    .poll(() => onMap<number>(page, "regionMap", "return map.queryRenderedFeatures(map.project([34.5, 54.5])).length"))
    .toBeGreaterThan(0);
  const region6 = await pointOnPage(page, "regionMap", [34.5, 54.5]);
  const tooltip = page.getByRole("tooltip").filter({ hasText: "Region 6: 6000" });
  if (isMobile) {
    // No hover on a phone: a tap shows the tooltip, a tap elsewhere hides it.
    await page.touchscreen.tap(region6.x, region6.y);
    await expect(tooltip).toBeVisible();
    await expect(page.getByTestId("picked")).toHaveText("picked Region 6");
    const empty = await pointOnPage(page, "regionMap", [5, 50]);
    await page.touchscreen.tap(empty.x, empty.y);
    await expect(tooltip).toBeHidden();
    return;
  }
  await page.mouse.move(region6.x, region6.y);
  await expect(tooltip).toBeVisible();
  const box = (await tooltip.boundingBox())!;
  expect(Math.abs(box.x + box.width / 2 - region6.x)).toBeLessThan(2);
  expect(box.y + box.height).toBeLessThan(region6.y);
  const hovered = () =>
    onMap<boolean>(page, "regionMap", 'const id = map.getStyle().layers.find((l) => l.id.endsWith("-fill")).source; return map.getFeatureState({ source: id, id: 5 }).hover === true');
  await expect.poll(hovered).toBe(true);
  await page.mouse.click(region6.x, region6.y);
  await expect(page.getByTestId("picked")).toHaveText("picked Region 6");
  // Off the regions: no tooltip, no highlight.
  const empty = await pointOnPage(page, "regionMap", [5, 50]);
  await page.mouse.move(empty.x, empty.y);
  await expect(tooltip).toBeHidden();
  await expect.poll(hovered).toBe(false);
});

test("arcs: one curve per pair, bowed between its ends", async ({ page }) => {
  await open(page);
  const read = () =>
    onMap<number[][][]>(
      page,
      "regionMap",
      'const source = map.getStyle().layers.find((l) => l.id.includes("arc")).source; return map.querySourceFeatures(source).map((f) => f.geometry.coordinates)',
    );
  await expect.poll(async () => (await read()).length).toBeGreaterThanOrEqual(3);
  const curves = await read();
  const first = curves.find((points) => Math.abs(points.at(-1)![0]! - 24.5) < 0.01 && Math.abs(points.at(-1)![1]! - 44.5) < 0.01)!;
  expect(first).toBeTruthy();
  // East along a parallel, bowed north (to the left of the way): by a tenth of its length at the middle.
  expect(Math.max(...first.map(([, lat]) => lat!))).toBeCloseTo(45.5, 1);
});

test("clusters: groups name their size, a click zooms in until the stores stand alone", async ({ page }) => {
  await open(page);
  const stores = page.getByRole("region", { name: "Stores" });
  const groups = stores.getByRole("button", { name: /^\d+ stores$/ });
  await expect(groups).toHaveCount(3);
  const sizes = await groups.evaluateAll((nodes) => nodes.map((node) => Number(node.getAttribute("aria-label")!.split(" ")[0])));
  expect(sizes.reduce((sum, size) => sum + size, 0)).toBe(500);
  // Only what is in view is in the page.
  expect(await stores.locator('[data-slot="map-marker"]').count()).toBeLessThan(10);

  const zoom = () => onMap<number>(page, "storeMap", "return map.getZoom()");
  for (let step = 0; step < 12; step++) {
    if ((await stores.getByRole("button", { name: /^Store \d+$/ }).count()) > 0) break;
    const before = await zoom();
    // The group nearest the middle of the map, so it stays in view as the map zooms.
    const box = (await stores.boundingBox())!;
    const target = await groups.evaluateAll(
      (nodes, middle) =>
        nodes
          .map((node, index) => {
            const r = node.getBoundingClientRect();
            return { index, distance: Math.hypot(r.x + r.width / 2 - middle.x, r.y + r.height / 2 - middle.y) };
          })
          .sort((a, b) => a.distance - b.distance)[0]!.index,
      { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    );
    await groups.nth(target).click();
    await expect.poll(zoom).toBeGreaterThan(before);
    await page.waitForTimeout(400);
  }
  // Settled: the markers in view are read again once a move ends.
  await expect.poll(() => onMap<boolean>(page, "storeMap", "return map.isMoving()")).toBe(false);
  await page.waitForTimeout(300);
  const name = (await stores.getByRole("button", { name: /^Store \d+$/ }).first().getAttribute("aria-label"))!;
  const store = stores.getByRole("button", { name, exact: true });
  await expect(store).toBeVisible();
  // Stores of a town overlap at the last zoom: the keyboard picks exactly this one.
  await store.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("store")).toHaveText(`store ${name}`);
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await open(page, theme);
    await expectAccessible(page);
  });
}
