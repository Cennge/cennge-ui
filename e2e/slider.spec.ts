import { expect, expectAccessible, openFixture, test } from "./test";
import type { Locator, Page } from "@playwright/test";

const thumb = (page: Page, name: string) => page.getByRole("slider", { name });
/** The whole slider (label, track, marks) around a thumb. */
const sliderOf = (handle: Locator) => handle.locator('xpath=ancestor::div[.//*[@data-slot="mark" or @data-slot="tick"]][1]');

async function centreX(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("no box");
  return box.x + box.width / 2;
}

/** Click on a phone is a tap. */
async function press(locator: Locator, isMobile: boolean) {
  if (isMobile) await locator.tap();
  else await locator.click();
}

test.beforeEach(async ({ page }) => {
  await openFixture(page, "slider");
});

test("a click or tap on a label moves the thumb there", async ({ page, isMobile }) => {
  const coverage = thumb(page, "Coverage threshold");
  await press(page.getByText("75%"), isMobile);
  await expect(page.getByTestId("coverage")).toHaveText("75");
  await expect(coverage).toHaveAttribute("aria-valuenow", "75");
  await expect(coverage).toBeFocused();
  await press(page.getByText("0%", { exact: true }), isMobile);
  await expect(page.getByTestId("coverage")).toHaveText("0");
});

test("in a range, the label moves the nearest thumb", async ({ page, isMobile }) => {
  await press(page.getByText("06:00"), isMobile);
  await expect(page.getByTestId("window")).toHaveText("6–18");
  await press(page.getByText("24:00"), isMobile);
  await expect(page.getByTestId("window")).toHaveText("6–24");
  await expect(thumb(page, "Deploy window Maximum")).toBeFocused();
});

test("restrictToMarks: the keyboard goes mark to mark", async ({ page }) => {
  const jobs = thumb(page, "Parallel jobs");
  await jobs.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("parallel")).toHaveText("8");
  await page.keyboard.press("ArrowUp");
  await expect(page.getByTestId("parallel")).toHaveText("16");
  await page.keyboard.press("ArrowRight"); // already at the last mark
  await expect(page.getByTestId("parallel")).toHaveText("16");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByTestId("parallel")).toHaveText("2");
  await page.keyboard.press("Home");
  await expect(page.getByTestId("parallel")).toHaveText("1");
  await page.keyboard.press("PageUp"); // ten marks up, stopping at the last one
  await expect(page.getByTestId("parallel")).toHaveText("16");
  await expect(jobs).toHaveAttribute("aria-valuenow", "16");
});

test("restrictToMarks: dragging lands on the nearest mark", async ({ page }) => {
  const jobs = thumb(page, "Parallel jobs");
  const ticks = sliderOf(jobs).locator('[data-slot="tick"]');
  const start = await jobs.boundingBox();
  if (!start) throw new Error("no box");
  // From 4 to just short of 8: the thumb snaps to 8 and sits on its dot.
  const target = (await centreX(ticks.nth(3))) - 6;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  await page.mouse.move(target, start.y + start.height / 2, { steps: 8 });
  await expect(page.getByTestId("parallel")).toHaveText("8");
  await page.mouse.up();
  expect(Math.abs((await centreX(jobs)) - (await centreX(ticks.nth(3))))).toBeLessThan(1);
});

test("a dot sits under the thumb's centre at every mark, in every size", async ({ page }) => {
  const check = async (name: string, values: string[], step: () => Promise<void>) => {
    const handle = thumb(page, name);
    const ticks = sliderOf(handle).locator('[data-slot="tick"]');
    await handle.focus();
    await page.keyboard.press("Home");
    for (let i = 0; i < values.length; i++) {
      if (i > 0) await step();
      await expect(handle).toHaveAttribute("aria-valuenow", values[i]!);
      expect(Math.abs((await centreX(handle)) - (await centreX(ticks.nth(i))))).toBeLessThan(1);
    }
  };
  await check("Coverage threshold", ["0", "25", "50", "75", "100"], async () => {
    for (let i = 0; i < 25; i++) await page.keyboard.press("ArrowRight");
  });
  await check("Log level", ["0", "1", "2", "3"], () => page.keyboard.press("ArrowRight"));
  await check("Small", ["0", "50", "100"], async () => {
    for (let i = 0; i < 5; i++) await page.keyboard.press("PageUp");
  });
});

test("labels are centred under their dots; long first and last ones stay inside the slider", async ({ page }) => {
  await page.evaluate(() => document.fonts.ready); // label widths depend on the font
  const level = thumb(page, "Log level");
  const slider = sliderOf(level);
  const box = await slider.boundingBox();
  if (!box) throw new Error("no box");
  const error = await slider.locator('[data-slot="mark"]', { hasText: "Error" }).boundingBox();
  const debug = await slider.locator('[data-slot="mark"]', { hasText: "Debug" }).boundingBox();
  if (!error || !debug) throw new Error("no label box");
  expect(error.x).toBeGreaterThanOrEqual(box.x - 0.5);
  expect(debug.x + debug.width).toBeLessThanOrEqual(box.x + box.width + 0.5);
  const ticks = slider.locator('[data-slot="tick"]');
  const warning = slider.locator('[data-slot="mark"]', { hasText: "Warning" });
  expect(Math.abs((await centreX(warning)) - (await centreX(ticks.nth(1))))).toBeLessThan(1);
  // An edge label is centred when it fits in the half thumb before the edge, and flush with the edge
  // when it does not; which one depends on the font, so either is right. Middle labels are centred.
  const coverage = sliderOf(thumb(page, "Coverage threshold"));
  const coverageBox = await coverage.boundingBox();
  const coverageTicks = coverage.locator('[data-slot="tick"]');
  const zero = coverage.getByText("0%", { exact: true });
  const zeroBox = await zero.boundingBox();
  if (!coverageBox || !zeroBox) throw new Error("no box");
  const centred = Math.abs((await centreX(zero)) - (await centreX(coverageTicks.first()))) < 1;
  const flush = Math.abs(zeroBox.x - coverageBox.x) < 0.5;
  expect(centred || flush, JSON.stringify({ zeroBox, coverageBox })).toBe(true);
  expect(Math.abs((await centreX(coverage.getByText("50%"))) - (await centreX(coverageTicks.nth(2))))).toBeLessThan(1);
  // Nothing pushes the page sideways on a phone.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("labels name the values when every value has one", async ({ page }) => {
  const level = thumb(page, "Log level");
  await expect(level).toHaveAttribute("aria-valuetext", "Warning");
  await level.focus();
  await page.keyboard.press("ArrowRight");
  await expect(level).toHaveAttribute("aria-valuetext", "Info");
  await expect(sliderOf(level).locator("output")).toHaveText("Info");
  await expect(thumb(page, "Coverage threshold")).toHaveAttribute("aria-valuetext", "40");
});

test("dots on the filled part of the track follow the value", async ({ page }) => {
  const ticks = sliderOf(thumb(page, "Deploy window Maximum")).locator('[data-slot="tick"]');
  // 9–18: only 12 and 18 are inside.
  await expect(ticks.and(page.locator("[data-in-range]"))).toHaveCount(2);
  const inside = await ticks.nth(2).evaluate((node) => getComputedStyle(node).backgroundColor);
  const outside = await ticks.nth(0).evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(inside).not.toBe(outside);
});

test("a disabled slider ignores clicks on its labels", async ({ page, isMobile }) => {
  await press(page.getByText("60 d"), isMobile);
  await expect(page.getByRole("slider", { name: "Retention (disabled)" })).toHaveAttribute("aria-valuenow", "30");
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "slider", theme);
    await thumb(page, "Parallel jobs").focus();
    await expectAccessible(page);
  });
}
