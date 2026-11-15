import { expect, expectAccessible, openFixture, test } from "./test";

test.beforeEach(async ({ page }) => {
  await openFixture(page, "progress-ring");
});

test("each ring is a meter that says how far it got, past the goal included", async ({ page }) => {
  await expect(page.getByRole("meter", { name: "Commits this week" })).toHaveAttribute("aria-valuetext", "34 of 40");
  const goals = page.getByRole("group", { name: "Goals this week" });
  await expect(goals.getByRole("meter")).toHaveCount(3);
  const reviews = goals.getByRole("meter", { name: "Reviews" });
  await expect(reviews).toHaveAttribute("aria-valuetext", "9 of 6, 3 over");
  await expect(reviews).toHaveAttribute("aria-valuenow", "6");
  await expect(page.getByRole("meter", { name: "CI minutes" })).toHaveAttribute("aria-valuetext", "180 minutes left");
});

test("a ring past its goal laps with a shadowed end; one at nothing has no indicator", async ({ page }) => {
  const goals = page.getByRole("group", { name: "Goals this week" });
  await expect(goals.locator('[data-slot="progress-ring-overlap"]')).toHaveCount(1);
  const empty = page.locator('[data-slot="progress-ring"]').nth(2);
  await expect(empty.locator('[data-slot="progress-ring-indicator"]')).toHaveCount(0);
  await expect(empty.locator('[data-slot="progress-ring-track"]')).toHaveCount(1);
});

test("the middle sits inside the ring, and the rings fit a phone", async ({ page }) => {
  const ring = page.locator('[data-slot="progress-ring"]').first();
  const box = (await ring.boundingBox())!;
  expect(Math.round(box.width)).toBe(128);
  const middle = (await ring.locator('[data-slot="progress-ring-content"]').boundingBox())!;
  expect(middle.x).toBeGreaterThan(box.x);
  expect(middle.x + middle.width).toBeLessThan(box.x + box.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

test("with reduced motion the rings are drawn at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.getByTestId("fixture-ready")).toBeAttached();
  const running = await page.evaluate(
    () => document.getAnimations().filter((animation) => (animation.effect as KeyframeEffect | null)?.target instanceof SVGElement).length,
  );
  expect(running).toBe(0);
});

for (const theme of ["dark", "light"] as const) {
  test(`no axe violations in ${theme}`, async ({ page }) => {
    await openFixture(page, "progress-ring", theme);
    await expectAccessible(page);
  });
}
