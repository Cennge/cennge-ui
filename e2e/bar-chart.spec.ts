import { expect, expectAccessible, openFixture, settleAnimations, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const chart = (page: Page, name: string) => page.getByRole("figure", { name });
const plot = (figure: Locator) => figure.locator('[data-slot="chart-plot"]');
/** The bars of one series, in the order of the data. */
const bars = (figure: Locator, series: number) => figure.locator('[data-slot="chart-marks"] > g > g').nth(series).locator("path");
const box = async (locator: Locator) => (await locator.boundingBox())!;

test.beforeEach(async ({ page }) => {
  await openFixture(page, "bar-chart");
  // The bars grow in as the charts appear.
  await settleAnimations(page);
});

test("each bar stands on the baseline and reaches its value on the axis", async ({ page }) => {
  const downloads = chart(page, "Monthly npm downloads");
  await expect(bars(downloads, 0)).toHaveCount(12);
  await expect(bars(downloads, 1)).toHaveCount(12);
  const area = await box(plot(downloads));
  // The axis runs 0 to 1.5K; December's cennge-ui bar is 1280.
  const december = await box(bars(downloads, 0).nth(11));
  expect(december.y + december.height).toBeCloseTo(area.y + area.height, 0);
  expect(december.y).toBeCloseTo(area.y + area.height * (1 - 1280 / 1500), 0);
  // At most 24px wide, the pair side by side with a gap between.
  const pair = await box(bars(downloads, 1).nth(11));
  expect(december.width).toBeLessThanOrEqual(24.5);
  expect(pair.x - (december.x + december.width)).toBeCloseTo(2, 0);
});

test("a negative value hangs below zero", async ({ page }) => {
  const stars = chart(page, "Stars gained per week");
  const area = await box(plot(stars));
  // The axis runs -10 to 30: zero is a quarter of the way up.
  const zero = area.y + area.height * (30 / 40);
  const fifth = await box(bars(stars, 0).nth(4));
  expect(fifth.y).toBeCloseTo(zero, 0);
  expect(fifth.y + fifth.height).toBeCloseTo(zero + area.height * (7 / 40), 0);
});

test("stacked bars: the parts follow the series, with the surface showing between them", async ({ page }) => {
  const issues = chart(page, "Issues by repository");
  const area = await box(plot(issues));
  const unit = area.width / 80;
  // spredo-crypto-screener: 52 closed, then 14 open.
  const closed = await box(bars(issues, 0).nth(0));
  const open = await box(bars(issues, 1).nth(0));
  expect(closed.x).toBeCloseTo(area.x, 0);
  expect(closed.x + closed.width).toBeCloseTo(area.x + 52 * unit, 0);
  expect(open.x - (closed.x + closed.width)).toBeCloseTo(2, 0);
  expect(open.x + open.width).toBeCloseTo(area.x + 66 * unit, 0);
});

test("hover reads every series at a month and lights its band; leaving hides it", async ({ page, isMobile }) => {
  test.skip(isMobile, "touch screens have no hover");
  const downloads = chart(page, "Monthly npm downloads");
  const area = await box(plot(downloads));
  await page.mouse.move(area.x + area.width * (9.5 / 12), area.y + area.height / 2);
  const tooltip = downloads.locator('[data-slot="chart-tooltip"]');
  await expect(tooltip).toHaveText("Octcennge-ui960payload-cache410");
  await expect(downloads.locator('[data-slot="chart-marks"] > rect')).toHaveCount(1);
  await page.mouse.move(area.x + area.width + 40, area.y - 40);
  await expect(tooltip).toHaveCount(0);
});

test("a tap shows the readout until a tap elsewhere", async ({ page, isMobile }) => {
  test.skip(!isMobile, "taps are for touch screens");
  const issues = chart(page, "Issues by repository");
  const area = await box(plot(issues));
  await page.touchscreen.tap(area.x + 10, area.y + area.height * (2.5 / 5));
  const tooltip = issues.locator('[data-slot="chart-tooltip"]');
  await expect(tooltip).toHaveText("ai-niche-scoutClosed18Open21");
  // The readout stays inside the chart.
  const readout = await box(tooltip);
  expect(readout.x + readout.width).toBeLessThanOrEqual(area.x + area.width + 1);
  await page.touchscreen.tap(5, 5);
  await expect(tooltip).toHaveCount(0);
});

test("the keyboard: Tab shows the first month, arrows move, End and Escape; a screen reader hears each", async ({ page }) => {
  const downloads = chart(page, "Monthly npm downloads");
  await page.keyboard.press("Tab");
  await expect(plot(downloads)).toBeFocused();
  const tooltip = downloads.locator('[data-slot="chart-tooltip"]');
  await expect(tooltip).toContainText("Jan");
  await page.keyboard.press("ArrowRight");
  await expect(tooltip).toContainText("Feb");
  await expect(downloads.locator('[aria-live="polite"]')).toHaveText("Feb: cennge-ui 410, payload-cache 230");
  await page.keyboard.press("End");
  await expect(tooltip).toContainText("Dec");
  await page.keyboard.press("Escape");
  await expect(tooltip).toHaveCount(0);
  // The plot names the chart and says how to read it.
  await expect(plot(downloads)).toHaveAccessibleName("Monthly npm downloads");
  await expect(plot(downloads)).toHaveAccessibleDescription("Arrow keys move between the values.");
});

test("screen readers get every value as a table", async ({ page }) => {
  const table = page.getByRole("table", { name: "Monthly npm downloads" });
  await expect(table.getByRole("row")).toHaveCount(13);
  await expect(table.getByRole("columnheader")).toHaveText(["Month", "cennge-ui", "payload-cache"]);
  await expect(table.getByRole("row", { name: /^Dec/ })).toHaveText("Dec1,280520");
});

test("axis labels never overlap: on a narrow chart some are left out", async ({ page }) => {
  for (const name of ["Monthly npm downloads", "Issues by repository"]) {
    const figure = chart(page, name);
    const labels = await figure.locator("[aria-hidden=true] > span").evaluateAll((spans) =>
      spans.map((span) => span.getBoundingClientRect().toJSON() as DOMRect).filter((rect) => rect.width > 0),
    );
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        const [a, b] = [labels[i]!, labels[j]!];
        const overlaps = a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
        expect(overlaps, `${name}: labels ${i} and ${j} overlap`).toBe(false);
      }
    }
  }
  // Nothing sticks out of the page sideways.
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("the bars take the palette's colours, and follow the accent", async ({ page }) => {
  const first = bars(chart(page, "Monthly npm downloads"), 0).first();
  const slot = (n: number) =>
    page.evaluate((n) => {
      const probe = document.createElement("i");
      probe.style.color = `var(--cennge-chart-${n})`;
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    }, n);
  const orange = await slot(1);
  expect(await first.evaluate((path) => getComputedStyle(path).fill)).toBe(orange);
  await page.evaluate(() => (document.documentElement.dataset.accent = "blue"));
  await expect.poll(() => first.evaluate((path) => getComputedStyle(path).fill)).not.toBe(orange);
  expect(await first.evaluate((path) => getComputedStyle(path).fill)).toBe(await slot(1));
});

test("a chart without data says so, with nothing to focus", async ({ page }) => {
  const releases = chart(page, "Releases");
  await expect(releases).toContainText("No data");
  await expect(plot(releases)).toHaveCount(0);
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme, also with a readout shown`, async ({ page }) => {
    await openFixture(page, "bar-chart", theme);
    await expectAccessible(page);
    await page.keyboard.press("Tab");
    await expect(page.locator('[data-slot="chart-tooltip"]')).toBeVisible();
    await expectAccessible(page);
  });
}
