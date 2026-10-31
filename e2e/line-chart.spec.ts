import { expect, expectAccessible, openFixture, settleAnimations, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const chart = (page: Page, name: string) => page.getByRole("figure", { name });
const plot = (figure: Locator) => figure.locator('[data-slot="chart-plot"]');
/** The lines of one series: one path per stretch without a gap. */
const lines = (figure: Locator, series: number) => figure.locator('[data-slot="chart-marks"] > g > g').nth(series).locator("path[fill=none]");
const box = async (locator: Locator) => (await locator.boundingBox())!;

test.beforeEach(async ({ page }) => {
  await openFixture(page, "line-chart");
  // The lines draw in from the left as the charts appear.
  await settleAnimations(page);
});

test("a line runs through every value, edge to edge; a missing value breaks it", async ({ page }) => {
  const requests = chart(page, "Requests a day");
  await expect(lines(requests, 0)).toHaveCount(1);
  // cennge.dev has no data for Oct 13 to 15: two stretches.
  await expect(lines(requests, 1)).toHaveCount(2);
  const area = await box(plot(requests));
  // The box of a line takes in half its 2px stroke.
  const api = await box(lines(requests, 0));
  expect(Math.abs(api.x - area.x)).toBeLessThanOrEqual(1.5);
  expect(Math.abs(api.x + api.width - (area.x + area.width))).toBeLessThanOrEqual(1.5);
});

test("hover puts a crosshair on the nearest day and reads both series; a gap reads as a dash", async ({ page, isMobile }) => {
  test.skip(isMobile, "touch screens have no hover");
  const requests = chart(page, "Requests a day");
  const area = await box(plot(requests));
  const tooltip = requests.locator('[data-slot="chart-tooltip"]');
  // Day 19 of 30 sits at 18/29 of the width; the pointer a little off it still finds it.
  await page.mouse.move(area.x + area.width * (18 / 29) + 4, area.y + area.height / 2);
  await expect(tooltip).toHaveText("Oct 19api.cennge.dev6,160cennge.dev3,680");
  const crosshair = requests.locator('[data-slot="chart-crosshair"]');
  await expect(crosshair.locator("circle")).toHaveCount(2);
  const line = await box(crosshair.locator("line"));
  expect(Math.abs(line.x + line.width / 2 - (area.x + area.width * (18 / 29)))).toBeLessThan(1);
  await page.mouse.move(area.x + area.width * (13 / 29), area.y + area.height / 2);
  // A Sunday, so lower.
  await expect(tooltip).toHaveText("Oct 14api.cennge.dev4,660cennge.dev–");
  await expect(crosshair.locator("circle")).toHaveCount(1);
});

test("a tap reads a place until a tap elsewhere; the readout stays inside the chart", async ({ page, isMobile }) => {
  test.skip(!isMobile, "taps are for touch screens");
  const requests = chart(page, "Requests a day");
  const area = await box(plot(requests));
  await page.touchscreen.tap(area.x + area.width - 2, area.y + area.height / 2);
  const tooltip = requests.locator('[data-slot="chart-tooltip"]');
  await expect(tooltip).toContainText("Oct 30");
  const readout = await box(tooltip);
  expect(readout.x).toBeGreaterThanOrEqual(area.x - 1);
  expect(readout.x + readout.width).toBeLessThanOrEqual(area.x + area.width + 1);
  await page.touchscreen.tap(5, 5);
  await expect(tooltip).toHaveCount(0);
});

test("the keyboard walks the days, and a screen reader hears each", async ({ page }) => {
  const requests = chart(page, "Requests a day");
  await page.keyboard.press("Tab");
  await expect(plot(requests)).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(requests.locator('[aria-live="polite"]')).toHaveText("Oct 3: api.cennge.dev 4,240, cennge.dev 2,720");
  await page.keyboard.press("End");
  await expect(requests.locator('[data-slot="chart-tooltip"]')).toContainText("Oct 30");
});

test("stacked areas: each part fills down to the one below, and the top is their sum", async ({ page }) => {
  const runs = chart(page, "CI runs a week");
  const area = await box(plot(runs));
  // Failed is on top: at W6, 66 + 2 + 2 = 70 of an axis to 80.
  const failed = await box(lines(runs, 2));
  const flaky = await box(lines(runs, 1));
  expect(failed.y + failed.height).toBeGreaterThan(area.y + area.height * (1 - 70 / 80) - 1);
  // The parts stack: the flaky line runs below the failed one.
  expect(flaky.y).toBeGreaterThan(failed.y);
  const fills = runs.locator('[data-slot="chart-marks"] path[fill^="url("]');
  await expect(fills).toHaveCount(3);
  // The table gives each part, not the sums.
  await expect(page.getByRole("table", { name: "CI runs a week" }).getByRole("row", { name: /^W6/ })).toHaveText("W66622");
});

test("startAtZero off fits the axis to the data", async ({ page }) => {
  const latency = chart(page, "Latency, 95th percentile");
  const ticks = await latency.locator('[aria-hidden="true"] > span').allTextContents();
  expect(ticks).toContain("175");
  expect(ticks).not.toContain("0");
  await expect(latency.locator('[data-slot="chart-marks"] circle')).toHaveCount(6);
  await expect(page.getByRole("table", { name: "Latency, 95th percentile" }).getByRole("row", { name: /^12:00/ })).toHaveText("12:00301 ms");
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme, also with the crosshair shown`, async ({ page }) => {
    await openFixture(page, "line-chart", theme);
    await expectAccessible(page);
    await page.keyboard.press("Tab");
    await expect(page.locator('[data-slot="chart-tooltip"]')).toBeVisible();
    await expectAccessible(page);
  });
}
