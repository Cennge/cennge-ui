import { expect, expectAccessible, openFixture, settleAnimations, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const chart = (page: Page, name: string) => page.getByRole("figure", { name });
const ring = (figure: Locator) => figure.locator('[data-slot="chart-plot"]');
const parts = (figure: Locator) => figure.locator("svg path");
const middle = (figure: Locator) => figure.locator('[data-slot="donut-value"]');

/** A point over the ring, at an angle clockwise from 12 o'clock, `at` of the way out from the middle. */
async function over(figure: Locator, degrees: number, at = 0.83) {
  // On a phone the lower charts start below the fold.
  await ring(figure).scrollIntoViewIfNeeded();
  const box = (await ring(figure).boundingBox())!;
  const angle = (degrees * Math.PI) / 180;
  return { x: box.x + (box.width / 2) * (1 + at * Math.sin(angle)), y: box.y + (box.height / 2) * (1 - at * Math.cos(angle)) };
}

test.beforeEach(async ({ page }) => {
  await openFixture(page, "donut-chart");
  await settleAnimations(page);
});

test("one part per positive value, its angle its share; a part of zero is left out of the ring", async ({ page }) => {
  await expect(parts(chart(page, "Languages in spredo-crypto-screener"))).toHaveCount(5);
  await expect(parts(chart(page, "Visits by source"))).toHaveCount(4);
  await expect(parts(chart(page, "Open issues by label"))).toHaveCount(2);
  // The legend still lists it, at nought.
  await expect(chart(page, "Open issues by label").locator('[data-slot="chart-legend"] li').nth(1)).toHaveText("question00%");
});

test("the middle holds the total; hover shows a part there and lights its legend row", async ({ page, isMobile }) => {
  test.skip(isMobile, "touch screens have no hover");
  const languages = chart(page, "Languages in spredo-crypto-screener");
  await expect(middle(languages)).toHaveText("664,000");
  // Python runs from 62% to 83% of the way round: about 260°.
  const point = await over(languages, 260);
  await page.mouse.move(point.x, point.y);
  await expect(middle(languages)).toHaveText("139,000");
  await expect(languages.locator('[data-slot="chart-legend"] li[data-active]')).toHaveText("Python139,00020.9%");
  // The hole is not a part.
  const hole = await over(languages, 0, 0);
  await page.mouse.move(hole.x, hole.y);
  await expect(middle(languages)).toHaveText("664,000");
});

test("a tap picks a part until a tap elsewhere", async ({ page, isMobile }) => {
  test.skip(!isMobile, "taps are for touch screens");
  const labels = chart(page, "Open issues by label");
  // bug, 9 of 23: the first 141° of the ring.
  const point = await over(labels, 60);
  await page.touchscreen.tap(point.x, point.y);
  await expect(middle(labels)).toHaveText("9");
  await page.touchscreen.tap(5, 5);
  await expect(middle(labels)).toHaveText("23");
});

test("the keyboard goes round the parts in the ring, skipping one of zero", async ({ page }) => {
  const labels = chart(page, "Open issues by label");
  // Focus from the keyboard shows the first part at once.
  await ring(labels).focus();
  await expect(middle(labels)).toHaveText("9");
  await page.keyboard.press("ArrowRight");
  // question (0) is not in the ring: enhancement comes next.
  await expect(middle(labels)).toHaveText("14");
  await expect(labels.locator('[aria-live="polite"]')).toHaveText("enhancement: 14 (60.9%)");
  await page.keyboard.press("Escape");
  await expect(middle(labels)).toHaveText("23");
});

test("a pie has no hole: its middle belongs to a part", async ({ page, isMobile }) => {
  test.skip(isMobile, "touch screens have no hover");
  const visits = chart(page, "Visits by source");
  await expect(middle(visits)).toHaveCount(0);
  const point = await over(visits, 90, 0.2);
  await page.mouse.move(point.x, point.y);
  await expect(visits.locator('[data-slot="chart-legend"] li[data-active]')).toHaveText("GitHub5,20047.3%");
});

test("screen readers get each part's value and share, and the total", async ({ page }) => {
  const table = page.getByRole("table", { name: "Languages in spredo-crypto-screener" });
  await expect(table.getByRole("columnheader")).toHaveText(["Language", "Bytes", "Share"]);
  await expect(table.getByRole("row", { name: /^Rust/ })).toHaveText("Rust61,0009.2%");
  await expect(table.getByRole("row", { name: /^Total/ })).toHaveText("Total664,000100%");
});

test("with nothing to divide, it says so and offers nothing to focus", async ({ page }) => {
  const countries = chart(page, "Downloads by country");
  await expect(countries).toContainText("No data");
  await expect(ring(countries)).toHaveCount(0);
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme, also with a part picked`, async ({ page }) => {
    await openFixture(page, "donut-chart", theme);
    await expectAccessible(page);
    await ring(chart(page, "Languages in spredo-crypto-screener")).focus();
    await page.keyboard.press("ArrowRight");
    await expectAccessible(page);
  });
}
