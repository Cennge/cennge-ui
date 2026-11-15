import type { Page } from "@playwright/test";
import { expect, expectAccessible, openFixture, test } from "./test";

const delta = (page: Page, label: string) => page.locator('[data-slot="stat-tile"]').filter({ hasText: label }).locator('[data-slot="stat-tile-delta"]');

test.beforeEach(async ({ page }) => {
  await openFixture(page, "stat-tile");
});

test("the change is coloured by which way is good, and its sign says the same in text", async ({ page }) => {
  await expect(delta(page, "Commits this week")).toHaveAttribute("data-tone", "good");
  await expect(delta(page, "Button, gzip")).toHaveAttribute("data-tone", "good");
  await expect(delta(page, "Button, gzip")).toHaveText("−0.3 KB, better");
  await expect(delta(page, "Open issues")).toContainText(", worse");
  await expect(delta(page, "Open issues")).toHaveAttribute("data-tone", "bad");
  await expect(delta(page, "Stars")).toHaveAttribute("data-tone", "neutral");
});

test("tiles fit a phone without scrolling the page sideways; the chart spans its tile", async ({ page }) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  const runs = page.locator('[data-slot="stat-tile"]').filter({ hasText: "CI runs" });
  const chart = (await runs.getByRole("img").boundingBox())!;
  const box = (await runs.boundingBox())!;
  expect(chart.width).toBeGreaterThan(box.width * 0.7);
});

for (const theme of ["dark", "light"] as const) {
  test(`no axe violations in ${theme}`, async ({ page }) => {
    await openFixture(page, "stat-tile", theme);
    await expectAccessible(page);
  });
}
