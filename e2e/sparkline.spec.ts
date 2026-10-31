import { expect, expectAccessible, openFixture, test } from "./test";

test.beforeEach(async ({ page }) => {
  await openFixture(page, "sparkline");
});

test("a named picture: the trend across its box, the latest value as a dot at the right end", async ({ page }) => {
  const rising = page.getByRole("img", { name: "Downloads over 12 weeks, up by half" });
  const box = (await rising.boundingBox())!;
  const line = (await rising.locator("path").boundingBox())!;
  // Edge to edge, and inside the box top to bottom with room for the stroke.
  expect(Math.abs(line.x - box.x)).toBeLessThanOrEqual(1.5);
  expect(Math.abs(line.x + line.width - (box.x + box.width))).toBeLessThanOrEqual(1.5);
  expect(line.y).toBeGreaterThanOrEqual(box.y);
  expect(line.y + line.height).toBeLessThanOrEqual(box.y + box.height);
  // 72 is the highest value: the dot is at the right end and near the top.
  const dot = (await rising.locator('[data-slot="sparkline-last"]').boundingBox())!;
  expect(dot.x + dot.width / 2).toBeCloseTo(box.x + box.width, 0);
  expect(dot.y + dot.height / 2).toBeCloseTo(box.y + box.height * 0.1, 0);
  // Round, though the box it sits in is stretched.
  expect(dot.width).toBeCloseTo(dot.height, 1);
});

test("a gap breaks the line; the area variant washes under it", async ({ page }) => {
  await expect(page.getByRole("img", { name: "Errors a day, with a gap" }).locator("path")).toHaveCount(2);
  await expect(page.getByRole("img", { name: "Open issues over 12 weeks, down" }).locator("path")).toHaveCount(2);
});

for (const theme of ["dark", "light"] as const) {
  test(`passes axe in the ${theme} theme`, async ({ page }) => {
    await openFixture(page, "sparkline", theme);
    await expectAccessible(page);
  });
}
