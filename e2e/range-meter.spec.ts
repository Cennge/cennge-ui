import { expect, expectAccessible, openFixture, test } from "./test";

test.beforeEach(async ({ page }) => {
  await openFixture(page, "range-meter");
});

test("each meter is named by its label and says where it stands, in words", async ({ page }) => {
  await expect(page.getByRole("meter", { name: "Test coverage" })).toHaveAttribute("aria-valuetext", "72%, goal 80%, 8% to go");
  await expect(page.getByRole("meter", { name: "Build time" })).toHaveAttribute("aria-valuetext", "48 s, goal 30–60 s, In range");
  await expect(page.getByRole("meter", { name: "CI minutes this month" })).toHaveAttribute(
    "aria-valuetext",
    "2,136 min, goal 2,000 min, 136 min over",
  );
  await expect(page.getByText("136 min over")).toBeVisible();
  await expect(page.getByText("8% to go")).toBeVisible();
});

test("the bar shows the goal: ticks at its ends, the range banded, the part past the ceiling striped", async ({ page }) => {
  const build = page.locator('[data-slot="range-meter"]').nth(1);
  const ticks = await build.locator('[data-slot="range-meter-tick"]').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().x));
  expect(ticks).toHaveLength(2);
  expect(ticks[1]! - ticks[0]!).toBeGreaterThan(50);
  const over = page.locator('[data-slot="range-meter"][data-status="over"]');
  const excess = (await over.locator('[data-slot="range-meter-excess"]').boundingBox())!;
  expect(excess.width).toBeGreaterThan(4);
  const tick = (await over.locator('[data-slot="range-meter-tick"]').boundingBox())!;
  // The stripes begin at the ceiling.
  expect(Math.abs(excess.x - (tick.x + tick.width / 2))).toBeLessThan(2);
});

for (const theme of ["dark", "light"] as const) {
  test(`no axe violations in ${theme}`, async ({ page }) => {
    await openFixture(page, "range-meter", theme);
    await expectAccessible(page);
  });
}
