import type { Page } from "@playwright/test";
import { expect, expectAccessible, openFixture, settleAnimations, test } from "./test";

const chart = (page: Page, name: string) => page.getByRole("figure", { name });

test.beforeEach(async ({ page }) => {
  await openFixture(page, "chart-references");
  await settleAnimations(page);
});

test("a goal line crosses the plot over the bars, at its value, labelled", async ({ page }) => {
  const commits = chart(page, "Commits a day to cennge-ui");
  await commits.scrollIntoViewIfNeeded();
  const line = (await commits.locator('[data-slot="chart-reference-line"]').boundingBox())!;
  const plot = (await commits.locator('[data-slot="chart-plot"]').boundingBox())!;
  // WebKit measures a dashed line to its last dash.
  expect(line.width).toBeGreaterThan(plot.width - 10);
  // Goal 6 on an axis from 0 to 10: four tenths down from the top.
  expect(Math.abs(line.y + line.height / 2 - (plot.y + plot.height * 0.4))).toBeLessThan(3);
  await expect(commits.locator('[data-slot="chart-reference-label"]')).toHaveText("Goal 6");
  await expect(commits.getByText("Goal 6: 6")).toBeAttached();
});

test("a band shades its range in every engine; raw readings are dots under the trend", async ({ page }) => {
  const builds = chart(page, "Build time of cennge-ui, seconds");
  await builds.scrollIntoViewIfNeeded();
  const band = (await builds.locator('[data-slot="chart-reference-band"]').boundingBox())!;
  expect(band.height).toBeGreaterThan(20);
  await expect(builds.locator('[data-slot="chart-dots"] circle')).toHaveCount(14);
  await expect(builds.getByText("Target: 30 to 45")).toBeAttached();
});

test("on a horizontal chart the goal runs up the plot", async ({ page }) => {
  const sizes = chart(page, "Bundle size by component, KB gzip");
  await sizes.scrollIntoViewIfNeeded();
  const line = (await sizes.locator('[data-slot="chart-reference-line"]').boundingBox())!;
  const plot = (await sizes.locator('[data-slot="chart-plot"]').boundingBox())!;
  expect(line.height).toBeGreaterThan(plot.height - 10);
});

for (const theme of ["dark", "light"] as const) {
  test(`no axe violations in ${theme}`, async ({ page }) => {
    await openFixture(page, "chart-references", theme);
    await expectAccessible(page);
  });
}
